package com.media.tracker.kafka.consumer;

import com.media.tracker.config.KafkaTopicConfig;
import com.media.tracker.dto.WebhookPayload;
import com.media.tracker.service.MediaSyncService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;

@Service
public class MediaEventConsumer {

    private static final Logger log = LoggerFactory.getLogger(MediaEventConsumer.class);
    private final MediaSyncService mediaSyncService;

    public MediaEventConsumer(MediaSyncService mediaSyncService) {
        this.mediaSyncService = mediaSyncService;
    }

    @KafkaListener(topics = KafkaTopicConfig.MEDIA_EVENTS_TOPIC, groupId = "media-group")
    public void consumeEvent(WebhookPayload payload) {
        log.info("Received Kafka event for media: {}", payload.title());
        try {
            mediaSyncService.processMediaEvent(payload);
        } catch (Exception e) {
            log.error("Failed to process media event from Kafka. Payload: {}", payload, e);
            // Burada kurumsal mimarilerde Dead Letter Queue (DLQ) mekanizması tetiklenir.
        }
    }
}
