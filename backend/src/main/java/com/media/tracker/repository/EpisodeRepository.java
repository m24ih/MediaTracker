package com.media.tracker.repository;

import com.media.tracker.model.entity.Episode;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface EpisodeRepository extends JpaRepository<Episode, UUID> {
    List<Episode> findByMediaIdAndSeasonNumber(UUID mediaId, Integer seasonNumber);
    Optional<Episode> findByMediaIdAndSeasonNumberAndEpisodeNumber(UUID mediaId, Integer seasonNumber, Integer episodeNumber);
}
