package com.media.tracker.repository;

import com.media.tracker.model.entity.Media;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import java.util.UUID;

public interface MediaRepository extends JpaRepository<Media, UUID> {
    Optional<Media> findByExternalId(String externalId);
}
