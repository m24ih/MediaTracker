package com.media.tracker.repository;

import com.media.tracker.model.entity.WatchHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import java.util.UUID;

public interface WatchHistoryRepository extends JpaRepository<WatchHistory, UUID> {
    Optional<WatchHistory> findByUserIdAndMediaId(UUID userId, UUID mediaId);
}
