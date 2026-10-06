package com.media.tracker.service;

import com.media.tracker.dto.MediaDto;
import com.media.tracker.dto.WatchHistoryDto;
import com.media.tracker.model.entity.Media;
import com.media.tracker.model.entity.User;
import com.media.tracker.model.entity.WatchHistory;
import com.media.tracker.repository.MediaRepository;
import com.media.tracker.repository.UserRepository;
import com.media.tracker.repository.WatchHistoryRepository;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
public class MediaService {

    private final MediaRepository mediaRepository;
    private final WatchHistoryRepository watchHistoryRepository;
    private final UserRepository userRepository;

    public MediaService(MediaRepository mediaRepository,
                        WatchHistoryRepository watchHistoryRepository,
                        UserRepository userRepository) {
        this.mediaRepository = mediaRepository;
        this.watchHistoryRepository = watchHistoryRepository;
        this.userRepository = userRepository;
    }

    public List<MediaDto> getAllMedia() {
        return mediaRepository.findAll().stream()
                .map(this::toDto)
                .toList();
    }

    public List<MediaDto> searchMedia(String query) {
        return mediaRepository.findByTitleContainingIgnoreCase(query).stream()
                .map(this::toDto)
                .toList();
    }

    public List<WatchHistoryDto> getHistoryForUser(String username) {
        User user = findUser(username);
        return watchHistoryRepository.findByUserIdOrderByWatchedAtDesc(user.getId()).stream()
                .map(this::toHistoryDto)
                .toList();
    }

    public Map<String, Long> getStatsForUser(String username) {
        User user = findUser(username);
        long movies = watchHistoryRepository.countByUserIdAndMediaType(user.getId(), "MOVIE");
        long tv = watchHistoryRepository.countByUserIdAndMediaType(user.getId(), "TV");
        return Map.of(
                "movies", movies,
                "tvEpisodes", tv,
                "total", movies + tv
        );
    }

    @Transactional
    public WatchHistoryDto addToWatchlist(String username, UUID mediaId) {
        User user = findUser(username);
        Media media = mediaRepository.findById(mediaId)
                .orElseThrow(() -> new IllegalArgumentException("Media not found: " + mediaId));

        if (watchHistoryRepository.existsByUserIdAndMediaId(user.getId(), mediaId)) {
            throw new IllegalStateException("Already in watchlist");
        }

        WatchHistory wh = new WatchHistory();
        wh.setUser(user);
        wh.setMedia(media);
        wh.setStatus("WATCHING");
        wh.setWatchedAt(Instant.now());
        WatchHistory saved = watchHistoryRepository.save(wh);
        return toHistoryDto(saved);
    }

    @Transactional
    public void removeFromWatchlist(String username, UUID mediaId) {
        User user = findUser(username);
        watchHistoryRepository.findByUserIdOrderByWatchedAtDesc(user.getId()).stream()
                .filter(wh -> wh.getMedia().getId().equals(mediaId))
                .forEach(watchHistoryRepository::delete);
    }

    @Transactional
    public void removeHistoryItem(String username, UUID historyId) {
        User user = findUser(username);
        watchHistoryRepository.findById(historyId).ifPresent(wh -> {
            if (wh.getUser().getId().equals(user.getId())) {
                watchHistoryRepository.delete(wh);
            }
        });
    }

    private User findUser(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + username));
    }

    private MediaDto toDto(Media m) {
        return new MediaDto(m.getId(), m.getTitle(), m.getExternalId(), m.getType(), m.getPosterUrl());
    }

    private WatchHistoryDto toHistoryDto(WatchHistory wh) {
        return new WatchHistoryDto(
                wh.getId(),
                wh.getMedia().getId(),
                wh.getMedia().getTitle(),
                wh.getMedia().getType(),
                wh.getMedia().getPosterUrl(),
                wh.getWatchedAt(),
                wh.getSeasonNumber(),
                wh.getEpisodeNumber(),
                wh.getEpisodeTitle()
        );
    }
}
