package com.media.tracker.controller;

import com.media.tracker.dto.WebhookPayload;
import com.media.tracker.kafka.producer.WebhookEventProducer;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/webhooks")
public class WebhookController {

    private final WebhookEventProducer producer;

    public WebhookController(WebhookEventProducer producer) {
        this.producer = producer;
    }

    @PostMapping("/ingest")
    public ResponseEntity<Void> ingestWebhook(@RequestBody WebhookPayload payload) {
        producer.publishEvent(payload);
        return ResponseEntity.accepted().build();
    }
}
