package org.swap.eventsync.service;

import org.swap.eventsync.model.Event;
import org.swap.eventsync.model.Feedback;
import org.swap.eventsync.repositories.EventRepository;
import org.swap.eventsync.repositories.FeedbackRepository;
import org.swap.eventsync.util.TokenUtils;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class EventService {

    private final EventRepository eventRepository;
    private final FeedbackRepository feedbackRepository;
    private final HuggingFaceService hf;
    private final OpenRouterService openRouterService;

    //Configurable limits loaded from application properties
    @Value("${eventsync.feedback.word-limit}")
    private int WORD_LIMIT;

    @Value("${eventsync.feedback.char-cap}")
    private int CHAR_CAP;

    @Value("${eventsync.feedback.token-cap}")
    private int TOKEN_CAP;

    public EventService(
            EventRepository eventRepository,
            FeedbackRepository feedbackRepository,
            HuggingFaceService hf,
            OpenRouterService openRouterService
    ) {
        this.eventRepository = eventRepository;
        this.feedbackRepository = feedbackRepository;
        this.hf = hf;
        this.openRouterService = openRouterService;
    }

    public Event createEvent(String title, String description) {
        Event e = Event.builder()
                .title(title)
                .description(description)
                .build();
        return eventRepository.save(e);
    }

    public List<Event> listEvents() {
        return eventRepository.findAll();
    }

    public Feedback addFeedback(Long eventId, String text) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new NoSuchElementException("Event not found"));

        // Clean + enforce safe limits
        String cleaned = sanitizeInput(text);
        String limited = applyAllLimits(cleaned);

        //Runs sentiment model (HF)
        Map<String, Object> analysis = hf.analyzeSentiment(limited);
        String mood = (String) analysis.getOrDefault("mood", "neutral");

        double pos = 0.0, neu = 0.0, neg = 0.0;
        Object rawScores = analysis.get("scores");

        //Scoring logic (mood)
        if (rawScores instanceof List<?> list) {
            for (Object o : list) {
                if (o instanceof Map<?, ?> m) {
                    Object lObj = m.get("label");
                    Object sObj = m.get("score");
                    if (lObj != null && sObj != null) {
                        String label = lObj.toString().toLowerCase();
                        double score = Double.parseDouble(sObj.toString());
                        if (label.contains("pos") || label.equals("label_2")) pos = score;
                        else if (label.contains("neu") || label.equals("label_1")) neu = score;
                        else if (label.contains("neg") || label.equals("label_0")) neg = score;
                    }
                }
            }
        } else if (rawScores instanceof Map<?, ?> map) {
            pos = parseDoubleSafe(map.get("positive"));
            neu = parseDoubleSafe(map.get("neutral"));
            neg = parseDoubleSafe(map.get("negative"));
        }

        Feedback fb = Feedback.builder()
                .event(event)
                .text(limited)
                .mood(mood)
                .positiveScore(pos)
                .neutralScore(neu)
                .negativeScore(neg)
                .timestamp(LocalDateTime.now())
                .build();

        event.getFeedbacks().add(fb);
        feedbackRepository.save(fb);
        eventRepository.save(event);

        return fb;
    }

    private double parseDoubleSafe(Object o) {
        if (o == null) return 0.0;
        try { return Double.parseDouble(o.toString()); }
        catch (Exception ignored) { return 0.0; }
    }

    public Map<String, Object> getSummary(Long eventId) {
        List<Feedback> feedbacks = feedbackRepository.findByEventId(eventId);

        long total = feedbacks.size();
        long positive = feedbacks.stream().filter(f -> "positive".equalsIgnoreCase(f.getMood())).count();
        long neutral = feedbacks.stream().filter(f -> "neutral".equalsIgnoreCase(f.getMood())).count();
        long negative = feedbacks.stream().filter(f -> "negative".equalsIgnoreCase(f.getMood())).count();

        //Build summary using OpenRouter
        String overallSummary = feedbacks.isEmpty()
                ? ""
                : openRouterService.summarizeFeedbacks(
                feedbacks.stream().map(Feedback::getText).toList(),
                positive, neutral, negative
        );

        Map<String, Object> result = new HashMap<>();
        result.put("total", total);
        result.put("positive", positive);
        result.put("neutral", neutral);
        result.put("negative", negative);
        result.put("summary", overallSummary);

        result.put("examples", feedbacks.stream().limit(10).map(f -> Map.of(
                "text", f.getText(),
                "mood", f.getMood(),
                "positiveScore", f.getPositiveScore(),
                "neutralScore", f.getNeutralScore(),
                "negativeScore", f.getNegativeScore()
        )).collect(Collectors.toList()));

        return result;
    }

    //Input limiting system (word + character + token guards!)
    private String sanitizeInput(String text) {
        if (text == null) return "";
        return text.replaceAll("\\p{Cntrl}", " ").replaceAll("\\s+", " ").trim();
    }

    private String applyAllLimits(String text) {
        //Word limit
        String wordLimited = trimToWordLimit(text, WORD_LIMIT);

        //Character limit
        if (wordLimited.length() > CHAR_CAP) {
            wordLimited = wordLimited.substring(0, CHAR_CAP);
        }

        //Token limit
        int estimated = TokenUtils.estimateTokens(wordLimited);
        if (estimated > TOKEN_CAP) {
            wordLimited = TokenUtils.trimToTokenLimit(wordLimited, TOKEN_CAP);
        }

        return wordLimited;
    }

    private String trimToWordLimit(String text, int limit) {
        String[] words = text.split("\\s+");
        if (words.length <= limit) return text;
        return String.join(" ", Arrays.copyOfRange(words, 0, limit));
    }
}
