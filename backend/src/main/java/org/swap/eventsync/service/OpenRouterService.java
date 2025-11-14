package org.swap.eventsync.service;

import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;

/**
 * Handles AI summarization using OpenRouter API.
 * This service is responsible for combining feedback texts and creating a short factual summary of an event.
 */
@Service
public class OpenRouterService {

    @Value("${openrouter.api.key}")
    private String apiKey;

    @Value("${openrouter.model:mistralai/mistral-7b-instruct}")
    private String model;

    private static final String API_URL = "https://openrouter.ai/api/v1/chat/completions";

    private final RestTemplate restTemplate = new RestTemplate();

    /**
     * Generates a factual summary based on event feedbacks.
     * This method constructs a short report highlighting positive and negative aspects
     * from the given list of feedback messages.
     */
    public String summarizeFeedbacks(List<String> feedbacks, long positive, long neutral, long negative) {
        if (feedbacks == null || feedbacks.isEmpty()) {
            return "No feedback data available for summary.";
        }

        //Combine all feedbacks into a single text block
        String joinedFeedbacks = String.join("\n", feedbacks);

        //Constructs a concise factual instruction prompt
        String prompt = String.format(
                "You are analyzing feedback from an event.\n" +
                        "Feedback entries:\n%s\n\n" +
                        "Summarize this information into a short factual report, 3-4 sentences maximum.\n" +
                        "Include what people generally liked and what they disliked, based strictly on the feedback text.\n" +
                        "Avoid adding fictional details or assumptions.\n" +
                        "Stats: %d positive, %d neutral, %d negative feedbacks.",
                joinedFeedbacks, positive, neutral, negative
        );

        //Build the HTTP request body for OpenRouter
        Map<String, Object> body = Map.of(
                "model", model,
                "messages", List.of(
                        Map.of("role", "system", "content", "You are a neutral event feedback analyst."),
                        Map.of("role", "user", "content", prompt)
                ),
                "max_tokens", 300
        );

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("Authorization", "Bearer " + apiKey);
        headers.set("HTTP-Referer", "https://eventsync.local"); //Optional, it helps OpenRouter track app usage
        headers.set("X-Title", "EventSync Summary");

        HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, headers);

        try {
            ResponseEntity<Map> response = restTemplate.exchange(
                    API_URL, HttpMethod.POST, request, Map.class);

            //Extract the summary text from the response JSON
            Object choicesObj = response.getBody().get("choices");
            if (choicesObj instanceof List<?> choices && !choices.isEmpty()) {
                Object first = choices.get(0);
                if (first instanceof Map<?, ?> choice) {
                    Object msg = ((Map<?, ?>) choice.get("message")).get("content");
                    return msg != null ? msg.toString().trim() : "";
                }
            }

            return "Summary could not be generated.";

        } catch (Exception e) {
            System.out.println("Error calling OpenRouter API: " + e.getMessage());
            return "AI summarization failed.";
        }
    }
}
