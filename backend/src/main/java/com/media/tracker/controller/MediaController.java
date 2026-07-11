package com.media.tracker.controller;

import com.media.tracker.dto.MediaDto;
import com.media.tracker.dto.WatchHistoryDto;
import com.media.tracker.service.MediaService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/media")
public class MediaController {

    private final MediaService mediaService;

    public MediaController(MediaService mediaService) {
        this.mediaService = mediaService;
    }

    /** GET /api/v1/media — full catalog */
    @GetMapping
    public ResponseEntity<List<MediaDto>> getAllMedia() {
        return ResponseEntity.ok(mediaService.getAllMedia());
    }

    /** GET /api/v1/media/search?q=... */
    @GetMapping("/search")
    public ResponseEntity<List<MediaDto>> search(@RequestParam("q") String query) {
        return ResponseEntity.ok(mediaService.searchMedia(query));
    }

    /** GET /api/v1/media/history — current user's watch history */
    @GetMapping("/history")
    public ResponseEntity<List<WatchHistoryDto>> getHistory(Principal principal) {
        return ResponseEntity.ok(mediaService.getHistoryForUser(principal.getName()));
    }

    /** GET /api/v1/media/stats */
    @GetMapping("/stats")
    public ResponseEntity<Map<String, Long>> getStats(Principal principal) {
        return ResponseEntity.ok(mediaService.getStatsForUser(principal.getName()));
    }

    /** POST /api/v1/media/{id}/watchlist — add to watchlist */
    @PostMapping("/{id}/watchlist")
    public ResponseEntity<WatchHistoryDto> addToWatchlist(@PathVariable UUID id, Principal principal) {
        return ResponseEntity.ok(mediaService.addToWatchlist(principal.getName(), id));
    }

    /** DELETE /api/v1/media/{id}/watchlist — remove from watchlist */
    @DeleteMapping("/{id}/watchlist")
    public ResponseEntity<Void> removeFromWatchlist(@PathVariable UUID id, Principal principal) {
        mediaService.removeFromWatchlist(principal.getName(), id);
        return ResponseEntity.noContent().build();
    }
}
