package com.media.tracker.dto;

import java.util.UUID;

public record MediaDto(
    UUID id,
    String title,
    String externalId,
    String type
) {}
