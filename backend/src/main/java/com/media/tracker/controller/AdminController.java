package com.media.tracker.controller;

import com.media.tracker.service.TmdbSyncService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/admin")
public class AdminController {

    private final TmdbSyncService tmdbSyncService;

    public AdminController(TmdbSyncService tmdbSyncService) {
        this.tmdbSyncService = tmdbSyncService;
    }

    @PostMapping("/sync-tmdb")
    public ResponseEntity<String> syncTmdbManually() {
        // Runs the sync process immediately instead of waiting for the cron schedule
        tmdbSyncService.syncMovies();
        tmdbSyncService.syncTvShows();
        return ResponseEntity.ok("TMDB sync triggered successfully.");
    }
}
