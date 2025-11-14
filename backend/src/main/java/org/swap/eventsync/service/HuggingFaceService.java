package org.swap.eventsync.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.*;

/**
 * Handles sentiment analysis using Hugging Face API.
 * Uses CardiffNLP's RoBERTa model for text "mood" scores detection.
 */
@Service
public class HuggingFaceService {

    @Value("${hf.api.token}")
    private String hfToken;

    @Value("${hf.sentiment.model:cardiffnlp/twitter-roberta-base-sentiment}")
    private String sentimentModel;

    private final RestTemplate restTemplate = new RestTemplate();

    private static final String BASE_URL = "https://router.huggingface.co/hf-inference/models/";

    //Analyze sentiment of a single text entry
    public Map<String, Object> analyzeSentiment(String text) {
        String url = BASE_URL + sentimentModel;

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setAccept(List.of(MediaType.APPLICATION_JSON));
        headers.setBearerAuth(hfToken);

        Map<String, Object> parameters = new HashMap<>();
        parameters.put("truncation", true);

        Map<String, Object> options = new HashMap<>();
        options.put("wait_for_model", true);

        Map<String, Object> body = new HashMap<>();
        body.put("inputs", text);
        body.put("parameters", parameters);
        body.put("options", options);

        HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, headers);

        try {
            ResponseEntity<Object> response = restTemplate.exchange(url, HttpMethod.POST, request, Object.class);
            Object responseBody = response.getBody();

            //Handle nested format
            List<?> results = null;
            if (responseBody instanceof List<?> list && !list.isEmpty()) {
                Object first = list.get(0);
                if (first instanceof List<?> innerList) results = innerList;
                else results = list;
            }

            if (results == null) {
                System.out.println("Unexpected sentiment response: " + responseBody);
                return Map.of("mood", "neutral", "scores", Map.of());
            }

            Map<String, Double> scores = new HashMap<>();
            for (Object item : results) {
                if (item instanceof Map<?, ?> map) {
                    Object labelObj = map.get("label");
                    Object scoreObj = map.get("score");
                    if (labelObj != null && scoreObj != null) {
                        String label = labelObj.toString().toLowerCase();
                        double score = Double.parseDouble(scoreObj.toString());
                        if (label.contains("pos") || label.equals("label_2")) scores.put("positive", score);
                        else if (label.contains("neu") || label.equals("label_1")) scores.put("neutral", score);
                        else if (label.contains("neg") || label.equals("label_0")) scores.put("negative", score);
                    }
                }
            }

            String mood = scores.entrySet().stream()
                    .max(Map.Entry.comparingByValue())
                    .map(Map.Entry::getKey)
                    .orElse("neutral");

            return Map.of("mood", mood, "scores", scores);

        } catch (Exception e) {
            System.out.println("HuggingFace sentiment call failed: " + e.getMessage());
            return Map.of("mood", "neutral", "scores", Map.of());
        }
    }
}
