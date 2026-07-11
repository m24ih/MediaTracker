package com.media.tracker.repository;

import com.media.tracker.model.entity.WatchHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface WatchHistoryRepository extends JpaRepository<WatchHistory, UUID> {

    @Query("SELECT w FROM WatchHistory w JOIN FETCH w.media WHERE w.user.id = :userId ORDER BY w.watchedAt DESC")
    List<WatchHistory> findByUserIdOrderByWatchedAtDesc(@Param("userId") UUID userId);

    @Query("SELECT COUNT(w) FROM WatchHistory w WHERE w.user.id = :userId AND w.media.type = :type")
    long countByUserIdAndMediaType(@Param("userId") UUID userId, @Param("type") String type);

    boolean existsByUserIdAndMediaId(UUID userId, UUID mediaId);
    
    Optional<WatchHistory> findByUserIdAndMediaId(UUID userId, UUID mediaId);
}
