package com.media.tracker.kafka.producer;

import com.media.tracker.config.KafkaTopicConfig;
import com.media.tracker.dto.WebhookPayload;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

@Service
public class WebhookEventProducer {

    private static final Logger log = LoggerFactory.getLogger(WebhookEventProducer.class);
    private final KafkaTemplate<String, Object> kafkaTemplate;

    public WebhookEventProducer(KafkaTemplate<String, Object> kafkaTemplate) {
        this.kafkaTemplate = kafkaTemplate;
    }

    public void publishEvent(WebhookPayload payload) {
        // externalId'yi partition key olarak kullanıyoruz (Aynı medyaya ait eventler sırayla işlensin diye)
        kafkaTemplate.send(KafkaTopicConfig.MEDIA_EVENTS_TOPIC, payload.externalId(), payload);
        log.info("Webhook event pushed to Kafka topic: {} for media: {}", KafkaTopicConfig.MEDIA_EVENTS_TOPIC, payload.title());
    }
}
