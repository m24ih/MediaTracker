package com.media.tracker.config;

import org.apache.kafka.clients.admin.NewTopic;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.kafka.config.TopicBuilder;

@Configuration
public class KafkaTopicConfig {

    public static final String MEDIA_EVENTS_TOPIC = "media-watch-events";

    @Bean
    public NewTopic mediaEventsTopic() {
        return TopicBuilder.name(MEDIA_EVENTS_TOPIC)
                .partitions(1)
                .replicas(1)
                .build();
    }
}
