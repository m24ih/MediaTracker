package com.media.tracker.service.serviceImpl;

import com.media.tracker.model.entity.User;
import com.media.tracker.repository.EpisodeRepository;
import com.media.tracker.repository.MediaRepository;
import com.media.tracker.repository.WatchHistoryRepository;
import com.media.tracker.service.ImportService.ImportCache;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.time.Instant;
import java.util.Map;

@Component
public class YamtrackImporter extends AbstractImporter {

    public YamtrackImporter(MediaRepository mediaRepository, WatchHistoryRepository watchHistoryRepository,
                            EpisodeRepository episodeRepository, RestTemplate restTemplate,
                            @Value("${tmdb.api.key}") String apiKey, @Value("${tmdb.api.base-url}") String baseUrl) {
        super(mediaRepository, watchHistoryRepository, episodeRepository, restTemplate, apiKey, baseUrl);
    }

    @Override
    public boolean supports(String template) {
        return "yamtrack".equalsIgnoreCase(template);
    }

    @Override
    @Transactional
    public int processRow(String[] line, Map<String, Integer> headerMap, User user, String batchId, ImportCache cache) {
        if (!headerMap.containsKey("media_type") || !headerMap.containsKey("source") || !headerMap.containsKey("media_id")) return 0;
        
        if (headerMap.containsKey("status")) {
            String status = line[headerMap.get("status")];
            if (!"completed".equalsIgnoreCase(status)) {
                return 0; // Skip planning, dropped, paused, etc.
            }
        }
        
        String type = line[headerMap.get("media_type")];
        if (!"tv".equalsIgnoreCase(type) && !"movie".equalsIgnoreCase(type) && !"episode".equalsIgnoreCase(type)) {
            return 0;
        }
        String mediaType = ("tv".equalsIgnoreCase(type) || "episode".equalsIgnoreCase(type)) ? "TV" : "MOVIE";
        
        String source = line[headerMap.get("source")];
        if (!"tmdb".equalsIgnoreCase(source)) {
            return 0;
        }
        
        String externalId = line[headerMap.get("media_id")];
        String title = headerMap.containsKey("title") ? line[headerMap.get("title")] : "";

        Integer seasonNumber = null;
        Integer episodeNumber = null;
        if (headerMap.containsKey("season_number") && !line[headerMap.get("season_number")].isEmpty()) {
            try { seasonNumber = Integer.parseInt(line[headerMap.get("season_number")]); } catch(Exception e) {
                log.warn("Failed to parse season_number: {}", line[headerMap.get("season_number")], e);
            }
        }
        if (headerMap.containsKey("episode_number") && !line[headerMap.get("episode_number")].isEmpty()) {
            try { episodeNumber = Integer.parseInt(line[headerMap.get("episode_number")]); } catch(Exception e) {
                log.warn("Failed to parse episode_number: {}", line[headerMap.get("episode_number")], e);
            }
        }

        Instant watchedAt = null;
        Instant releaseDate = null;
        if (headerMap.containsKey("release_datetime") && !line[headerMap.get("release_datetime")].isEmpty()) {
            try {
                String dt = line[headerMap.get("release_datetime")].replace(" ", "T");
                releaseDate = Instant.parse(dt);
            } catch (Exception e) {
                log.warn("Failed to parse release_datetime: {}", line[headerMap.get("release_datetime")], e);
            }
        }

        if (headerMap.containsKey("end_date") && !line[headerMap.get("end_date")].isEmpty()) {
            try { 
                String dt = line[headerMap.get("end_date")].replace(" ", "T");
                Instant parsedEndDate = Instant.parse(dt);
                if (releaseDate == null || Math.abs(parsedEndDate.getEpochSecond() - releaseDate.getEpochSecond()) > 86400 * 7) {
                    watchedAt = parsedEndDate;
                }
            } catch(Exception e) {
                log.warn("Failed to parse end_date: {}", line[headerMap.get("end_date")], e);
            }
        } 
        
        if (watchedAt == null && headerMap.containsKey("progressed_at") && !line[headerMap.get("progressed_at")].isEmpty()) {
            try { 
                String dt = line[headerMap.get("progressed_at")].replace(" ", "T");
                watchedAt = Instant.parse(dt);
            } catch(Exception e) {
                log.warn("Failed to parse progressed_at: {}", line[headerMap.get("progressed_at")], e);
            }
        }
        
        if (watchedAt == null && headerMap.containsKey("created_at") && !line[headerMap.get("created_at")].isEmpty()) {
            try { 
                String dt = line[headerMap.get("created_at")].replace(" ", "T");
                watchedAt = Instant.parse(dt);
            } catch(Exception e) {
                log.warn("Failed to parse created_at: {}", line[headerMap.get("created_at")], e);
            }
        }
        
        if (watchedAt == null) {
            watchedAt = Instant.now();
        }
        
        return processAndSaveRow(externalId, mediaType, title, user, batchId, seasonNumber, episodeNumber, watchedAt, cache) ? 1 : 0;
    }
}
