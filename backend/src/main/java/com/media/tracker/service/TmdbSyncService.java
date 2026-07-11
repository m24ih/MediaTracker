package com.media.tracker.service;

import com.media.tracker.model.entity.Media;
import com.media.tracker.repository.MediaRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class TmdbSyncService {

    private static final Logger log = LoggerFactory.getLogger(TmdbSyncService.class);

    private final MediaRepository mediaRepository;
    private final RestTemplate restTemplate;

    @Value("${tmdb.api.key}")
    private String apiKey;

    @Value("${tmdb.api.base-url}")
    private String baseUrl;

    public TmdbSyncService(MediaRepository mediaRepository, RestTemplate restTemplate) {
        this.mediaRepository = mediaRepository;
        this.restTemplate = restTemplate;
    }

    // Her gece saat 03:00'da çalışır
    @Scheduled(cron = "0 0 3 * * ?")
    public void syncPopularMedia() {
        log.info("Starting scheduled TMDB sync...");
        syncMovies();
        syncTvShows();
        log.info("TMDB sync completed.");
    }

    @Transactional
    public void syncMovies() {
        String url = baseUrl + "/movie/popular?language=en-US&page=1";
        TmdbResponse response = fetchFromTmdb(url);
        
        if (response != null && response.results != null) {
            for (TmdbResult result : response.results) {
                saveOrUpdateMedia(String.valueOf(result.id), result.title, "MOVIE", result.poster_path);
            }
            log.info("Synced {} popular movies from TMDB", response.results.size());
        }
    }

    @Transactional
    public void syncTvShows() {
        String url = baseUrl + "/tv/popular?language=en-US&page=1";
        TmdbResponse response = fetchFromTmdb(url);
        
        if (response != null && response.results != null) {
            for (TmdbResult result : response.results) {
                // TV shows use "name" instead of "title" in TMDB API
                String title = result.title != null ? result.title : result.name;
                saveOrUpdateMedia(String.valueOf(result.id), title, "TV", result.poster_path);
            }
            log.info("Synced {} popular TV shows from TMDB", response.results.size());
        }
    }

    private void saveOrUpdateMedia(String externalId, String title, String type, String posterPath) {
        Media media = mediaRepository.findByExternalId(externalId).orElseGet(() -> {
            Media m = new Media();
            m.setExternalId(externalId);
            return m;
        });
        media.setTitle(title);
        media.setType(type);
        if (posterPath != null) {
            media.setPosterUrl("https://image.tmdb.org/t/p/w500" + posterPath);
        }
        mediaRepository.save(media);
    }

    private TmdbResponse fetchFromTmdb(String url) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.set("Authorization", "Bearer " + apiKey);
            headers.set("accept", "application/json");

            HttpEntity<String> entity = new HttpEntity<>(headers);
            ResponseEntity<TmdbResponse> response = restTemplate.exchange(url, HttpMethod.GET, entity, TmdbResponse.class);
            return response.getBody();
        } catch (Exception e) {
            log.error("Error fetching data from TMDB url: " + url, e);
            return null;
        }
    }

    // Inner classes for JSON mapping
    public static class TmdbResponse {
        public List<TmdbResult> results;
    }

    public static class TmdbResult {
        public Long id;
        public String title;
        public String name; // For TV shows
        public String poster_path;
    }
}
