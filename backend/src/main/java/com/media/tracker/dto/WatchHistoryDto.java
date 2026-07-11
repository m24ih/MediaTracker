package com.media.tracker.dto;

import java.time.Instant;
import java.util.UUID;

public record WatchHistoryDto(
    UUID id,
    UUID mediaId,
    String mediaTitle,
    String mediaType,
    Instant watchedAt
) {}
