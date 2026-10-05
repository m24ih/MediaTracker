package com.media.tracker.service.serviceImpl;

import com.media.tracker.model.entity.User;
import com.media.tracker.repository.EpisodeRepository;
import com.media.tracker.repository.MediaRepository;
import com.media.tracker.repository.WatchHistoryRepository;
import com.media.tracker.service.ImportService.ImportCache;
import com.media.tracker.service.TmdbSyncService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.time.Instant;
import java.util.Map;

@Component
public class TvTimeImporter extends AbstractImporter {

    public TvTimeImporter(MediaRepository mediaRepository, WatchHistoryRepository watchHistoryRepository,
                          EpisodeRepository episodeRepository, RestTemplate restTemplate,
                          @Value("${tmdb.api.key}") String apiKey, @Value("${tmdb.api.base-url}") String baseUrl) {
        super(mediaRepository, watchHistoryRepository, episodeRepository, restTemplate, apiKey, baseUrl);
    }

    @Override
    public boolean supports(String template) {
        return "tvtime".equalsIgnoreCase(template) || "tvtime-v2".equalsIgnoreCase(template) || "tvtime-movies".equalsIgnoreCase(template);
    }

    @Override
    @Transactional
    public int processRow(String[] line, Map<String, Integer> headerMap, User user, String batchId, ImportCache cache) {
        // Since TvTime splits series and movies into two different files with different headers,
        // we can detect which one it is by checking the headers.
        if (headerMap.containsKey("movie_name")) {
            return processMovieRow(line, headerMap, user, batchId, cache);
        } else if (headerMap.containsKey("s_id")) {
            return processSeriesRow(line, headerMap, user, batchId, cache);
        }
        return 0;
    }

    private int processSeriesRow(String[] line, Map<String, Integer> headerMap, User user, String batchId, ImportCache cache) {
        if (!headerMap.containsKey("s_id") || !headerMap.containsKey("series_name")) return 0;
        String tvdbId = line[headerMap.get("s_id")];
        
        if (tvdbId == null || tvdbId.isEmpty()) return 0;

        Integer seasonNumber = null;
        Integer episodeNumber = null;
        if (headerMap.containsKey("season_number") && !line[headerMap.get("season_number")].isEmpty()) {
            try { seasonNumber = Integer.parseInt(line[headerMap.get("season_number")]); } catch (Exception e) {
                log.warn("Failed to parse season_number: {}", line[headerMap.get("season_number")]);
            }
        }
        if (headerMap.containsKey("episode_number") && !line[headerMap.get("episode_number")].isEmpty()) {
            try { episodeNumber = Integer.parseInt(line[headerMap.get("episode_number")]); } catch (Exception e) {
                log.warn("Failed to parse episode_number: {}", line[headerMap.get("episode_number")]);
            }
        }

        Instant watchedAt = Instant.now();
        if (headerMap.containsKey("created_at") && !line[headerMap.get("created_at")].isEmpty()) {
            try { 
                java.time.format.DateTimeFormatter formatter = java.time.format.DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
                watchedAt = java.time.LocalDateTime.parse(line[headerMap.get("created_at")], formatter).atZone(java.time.ZoneOffset.UTC).toInstant();
            } catch (Exception e) {
                log.warn("Failed to parse created_at: {}", line[headerMap.get("created_at")]);
            }
        }
        
        TmdbSyncService.TmdbResult result = findTmdbIdByTvdbId(tvdbId, cache);
        if (result == null || result.id == null) {
            return 0;
        }
        
        return processAndSaveTmdbResult(result, "TV", user, batchId, seasonNumber, episodeNumber, watchedAt, cache) ? 1 : 0;
    }

    private int processMovieRow(String[] line, Map<String, Integer> headerMap, User user, String batchId, ImportCache cache) {
        if (!headerMap.containsKey("movie_name") || !headerMap.containsKey("type")) return 0;
        
        String type = line[headerMap.get("type")];
        if (!"watch".equalsIgnoreCase(type) && !"follow".equalsIgnoreCase(type)) {
            return 0;
        }
        
        String movieName = line[headerMap.get("movie_name")];
        if (movieName == null || movieName.isEmpty()) return 0;

        Instant watchedAt = Instant.now();
        if (headerMap.containsKey("created_at") && !line[headerMap.get("created_at")].isEmpty()) {
            try { 
                java.time.format.DateTimeFormatter formatter = java.time.format.DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
                watchedAt = java.time.LocalDateTime.parse(line[headerMap.get("created_at")], formatter).atZone(java.time.ZoneOffset.UTC).toInstant();
            } catch (Exception e) {
                log.warn("Failed to parse created_at: {}", line[headerMap.get("created_at")]);
            }
        }
        
        TmdbSyncService.TmdbResult result = searchTmdbMovie(movieName, cache);
        if (result == null || result.id == null) {
            log.warn("Could not find TMDB movie for: {}", movieName);
            return 0;
        }
        
        return processAndSaveTmdbResult(result, "MOVIE", user, batchId, null, null, watchedAt, cache) ? 1 : 0;
    }
}
