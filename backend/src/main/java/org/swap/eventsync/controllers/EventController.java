package org.swap.eventsync.controllers;

import org.swap.eventsync.model.*;
import org.swap.eventsync.service.EventService;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.NoSuchElementException;

@RestController
@RequestMapping("/events")
public class EventController {
    private final EventService service;

    public EventController(EventService service) { this.service = service; }

    @PostMapping
    public ResponseEntity<Event> create(@RequestBody Map<String,String> body) {
        String title = body.get("title");
        String description = body.get("description");
        Event created = service.createEvent(title, description);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @GetMapping
    public List<Event> list() {
        return service.listEvents();
    }

    @PostMapping("/{eventId}/feedback")
    public ResponseEntity<?> addFeedback(@PathVariable Long eventId, @RequestBody Map<String,String> body) {
        String text = body.get("text");
        if (text == null || text.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "text is required"));
        }
        try {
            var fb = service.addFeedback(eventId, text);
            return ResponseEntity.status(HttpStatus.CREATED).body(fb);
        } catch (NoSuchElementException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/{eventId}/summary")
    public ResponseEntity<?> summary(@PathVariable Long eventId) {
        try {
            Map<String,Object> summary = service.getSummary(eventId);
            return ResponseEntity.ok(summary);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", e.getMessage()));
        }
    }
}
