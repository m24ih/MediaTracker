package com.media.tracker.dto;

public record WebhookPayload(
        String eventType,   // Örn: "PlaybackStart", "ItemAdded"
        String mediaType,   // Örn: "MOVIE", "TV_SHOW"
        String title,       // Örn: "Interstellar"
        String externalId,  // Örn: "tmdb-157336"
        String userApiKey   // İstek yapan kullanıcıyı doğrulamak için (DB'deki şifreli alanla eşleşecek)
) {}
