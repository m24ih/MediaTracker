package com.media.tracker.service.serviceImpl;

import com.media.tracker.model.entity.Episode;
import com.media.tracker.model.entity.Media;
import com.media.tracker.model.entity.User;
import com.media.tracker.model.entity.WatchHistory;
import com.media.tracker.repository.EpisodeRepository;
import com.media.tracker.repository.MediaRepository;
import com.media.tracker.repository.WatchHistoryRepository;
import com.media.tracker.service.ImportService.ImportCache;
import com.media.tracker.service.TmdbSyncService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.web.client.RestTemplate;

import java.time.Instant;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

public abstract class AbstractImporter {

    protected final Logger log = LoggerFactory.getLogger(getClass());

    protected final MediaRepository mediaRepository;
    protected final WatchHistoryRepository watchHistoryRepository;
    protected final EpisodeRepository episodeRepository;
    protected final RestTemplate restTemplate;
    protected final String apiKey;
    protected final String baseUrl;

    public AbstractImporter(MediaRepository mediaRepository, WatchHistoryRepository watchHistoryRepository,
                            EpisodeRepository episodeRepository, RestTemplate restTemplate,
                            String apiKey, String baseUrl) {
        this.mediaRepository = mediaRepository;
        this.watchHistoryRepository = watchHistoryRepository;
        this.episodeRepository = episodeRepository;
        this.restTemplate = restTemplate;
        this.apiKey = apiKey;
        this.baseUrl = baseUrl;
    }

    public abstract boolean supports(String template);

    public abstract int processRow(String[] line, Map<String, Integer> headerMap, User user, String batchId, ImportCache cache);

    protected TmdbSyncService.TmdbResult searchTmdbMovie(String movieName, ImportCache cache) {
        if (cache.movieSearchMap.containsKey(movieName)) {
            return cache.movieSearchMap.get(movieName);
        }
        try {
            String url = baseUrl + "/search/movie?query=" + java.net.URLEncoder.encode(movieName, "UTF-8");
            HttpHeaders headers = new HttpHeaders();
            headers.set("Authorization", "Bearer " + apiKey);
            headers.set("accept", "application/json");

            HttpEntity<String> entity = new HttpEntity<>(headers);
            ResponseEntity<TmdbSearchResponse> response = restTemplate.exchange(url, HttpMethod.GET, entity, TmdbSearchResponse.class);
            
            if (response.getBody() != null && response.getBody().results != null && !response.getBody().results.isEmpty()) {
                TmdbSyncService.TmdbResult result = response.getBody().results.get(0);
                cache.movieSearchMap.put(movieName, result);
                return result;
            }
        } catch (Exception e) {
            log.warn("Failed to search TMDB for movie {}", movieName, e);
        }
        cache.movieSearchMap.put(movieName, null);
        return null;
    }

    protected TmdbSyncService.TmdbResult findTmdbIdByTvdbId(String tvdbId, ImportCache cache) {
        if (cache.tvdbIdMap.containsKey(tvdbId)) {
            return cache.tvdbIdMap.get(tvdbId);
        }
        try {
            String url = baseUrl + "/find/" + tvdbId + "?external_source=tvdb_id";
            HttpHeaders headers = new HttpHeaders();
            headers.set("Authorization", "Bearer " + apiKey);
            headers.set("accept", "application/json");

            HttpEntity<String> entity = new HttpEntity<>(headers);
            ResponseEntity<TmdbFindResponse> response = restTemplate.exchange(url, HttpMethod.GET, entity, TmdbFindResponse.class);
            
            if (response.getBody() != null && response.getBody().tv_results != null && !response.getBody().tv_results.isEmpty()) {
                TmdbSyncService.TmdbResult result = response.getBody().tv_results.get(0);
                cache.tvdbIdMap.put(tvdbId, result);
                return result;
            }
        } catch (Exception e) {
            log.warn("Failed to find TVDB id {} in TMDB", tvdbId, e);
        }
        cache.tvdbIdMap.put(tvdbId, null);
        return null;
    }
    
    protected String fetchEpisodeNameFromTmdb(Media media, int season, int episode, ImportCache cache) {
        String cacheKey = media.getExternalId() + "_S" + season;
        
        if (cache.seasonEpisodesMap.containsKey(cacheKey)) {
            return cache.seasonEpisodesMap.get(cacheKey).get(episode);
        }

        List<Episode> dbEpisodes = episodeRepository.findByMediaIdAndSeasonNumber(media.getId(), season);
        if (!dbEpisodes.isEmpty()) {
            Map<Integer, String> epMap = new HashMap<>();
            for (Episode e : dbEpisodes) {
                epMap.put(e.getEpisodeNumber(), e.getTitle());
            }
            cache.seasonEpisodesMap.put(cacheKey, epMap);
            return epMap.get(episode);
        }

        try {
            String url = baseUrl + "/tv/" + media.getExternalId() + "/season/" + season;
            HttpHeaders headers = new HttpHeaders();
            headers.set("Authorization", "Bearer " + apiKey);
            headers.set("accept", "application/json");

            HttpEntity<String> entity = new HttpEntity<>(headers);
            ResponseEntity<TmdbSeasonResponse> response = restTemplate.exchange(url, HttpMethod.GET, entity, TmdbSeasonResponse.class);
            
            Map<Integer, String> epMap = new HashMap<>();
            if (response.getBody() != null && response.getBody().episodes != null) {
                for (TmdbEpisodeResponse ep : response.getBody().episodes) {
                    epMap.put(ep.episode_number, ep.name);
                    
                    Episode dbEp = new Episode();
                    dbEp.setMedia(media);
                    dbEp.setSeasonNumber(season);
                    dbEp.setEpisodeNumber(ep.episode_number);
                    dbEp.setTitle(ep.name);
                    episodeRepository.save(dbEp);
                }
            }
            cache.seasonEpisodesMap.put(cacheKey, epMap);
        } catch (Exception e) {
            log.warn("Failed to fetch season details for tv {} S{}", media.getExternalId(), season);
            cache.seasonEpisodesMap.put(cacheKey, new HashMap<>());
        }
        return cache.seasonEpisodesMap.get(cacheKey).get(episode);
    }

    protected boolean processAndSaveRow(String tmdbExternalId, String type, String defaultTitle, User user, String batchId, Integer season, Integer episode, Instant watchedAt, ImportCache cache) {
        String mediaKey = tmdbExternalId + "_" + type;
        if (!cache.mediaMap.containsKey(mediaKey)) {
            Optional<Media> existing = mediaRepository.findByExternalIdAndType(tmdbExternalId, type);
            if (existing.isPresent()) {
                cache.mediaMap.put(mediaKey, existing.get());
            } else {
                Media fetched = fetchMediaDetailsFromTmdb(tmdbExternalId, type, defaultTitle);
                if (fetched != null) {
                    cache.mediaMap.put(mediaKey, fetched);
                } else {
                    return false;
                }
            }
        }
        
        Media media = cache.mediaMap.get(mediaKey);
        String episodeTitle = null;
        if ("TV".equals(type) && season != null && episode != null) {
            episodeTitle = fetchEpisodeNameFromTmdb(media, season, episode, cache);
        }
        
        return saveWatchHistory(media, user, batchId, season, episode, watchedAt, episodeTitle, cache);
    }
    
    protected boolean processAndSaveTmdbResult(TmdbSyncService.TmdbResult result, String type, User user, String batchId, Integer season, Integer episode, Instant watchedAt, ImportCache cache) {
        String tmdbExternalId = String.valueOf(result.id);
        String mediaKey = tmdbExternalId + "_" + type;
        
        if (!cache.mediaMap.containsKey(mediaKey)) {
            Optional<Media> existing = mediaRepository.findByExternalIdAndType(tmdbExternalId, type);
            if (existing.isPresent()) {
                cache.mediaMap.put(mediaKey, existing.get());
            } else {
                Media media = new Media();
                media.setExternalId(tmdbExternalId);
                media.setTitle(result.title != null ? result.title : result.name);
                media.setType(type);
                if (result.poster_path != null) {
                    media.setPosterUrl("https://image.tmdb.org/t/p/w500" + result.poster_path);
                }
                cache.mediaMap.put(mediaKey, mediaRepository.save(media));
            }
        }
        
        Media media = cache.mediaMap.get(mediaKey);
        String episodeTitle = null;
        if ("TV".equals(type) && season != null && episode != null) {
            episodeTitle = fetchEpisodeNameFromTmdb(media, season, episode, cache);
        }
        
        return saveWatchHistory(media, user, batchId, season, episode, watchedAt, episodeTitle, cache);
    }

    protected boolean saveWatchHistory(Media media, User user, String batchId, Integer season, Integer episode, Instant watchedAt, String episodeTitle, ImportCache cache) {
        List<WatchHistory> histories = cache.userHistoryMap.getOrDefault(media.getId(), new ArrayList<>());
        
        for (WatchHistory h : histories) {
            boolean sameEpisode = (season == null ? h.getSeasonNumber() == null : season.equals(h.getSeasonNumber()))
                               && (episode == null ? h.getEpisodeNumber() == null : episode.equals(h.getEpisodeNumber()));
            if (sameEpisode) {
                if (h.getWatchedAt() != null && watchedAt != null) {
                    long diff = Math.abs(h.getWatchedAt().getEpochSecond() - watchedAt.getEpochSecond());
                    if (diff < 86400 * 2) { 
                        return false; 
                    }
                } else if (watchedAt == null || h.getWatchedAt() == null) {
                    return false; 
                }
            }
        }
        
        WatchHistory wh = new WatchHistory();
        wh.setUser(user);
        wh.setMedia(media);
        wh.setStatus("COMPLETED");
        wh.setWatchedAt(watchedAt != null ? watchedAt : Instant.now());
        wh.setImportBatchId(batchId);
        wh.setSeasonNumber(season);
        wh.setEpisodeNumber(episode);
        wh.setEpisodeTitle(episodeTitle);
        watchHistoryRepository.save(wh);
        
        histories.add(wh);
        cache.userHistoryMap.put(media.getId(), histories);
        return true;
    }

    protected Media fetchMediaDetailsFromTmdb(String tmdbExternalId, String type, String defaultTitle) {
        try {
            String searchType = type.equals("TV") ? "tv" : "movie";
            String url = baseUrl + "/" + searchType + "/" + tmdbExternalId;

            HttpHeaders headers = new HttpHeaders();
            headers.set("Authorization", "Bearer " + apiKey);
            headers.set("accept", "application/json");

            HttpEntity<String> entity = new HttpEntity<>(headers);
            ResponseEntity<TmdbSyncService.TmdbResult> response = restTemplate.exchange(url, HttpMethod.GET, entity, TmdbSyncService.TmdbResult.class);
            
            TmdbSyncService.TmdbResult result = response.getBody();
            if (result != null) {
                Media media = new Media();
                media.setExternalId(tmdbExternalId);
                media.setTitle(result.title != null ? result.title : (result.name != null ? result.name : defaultTitle));
                media.setType(type);
                if (result.poster_path != null) {
                    media.setPosterUrl("https://image.tmdb.org/t/p/w500" + result.poster_path);
                }
                return mediaRepository.save(media);
            }
        } catch (Exception e) {
            log.warn("Failed to fetch media details for id {} from TMDB", tmdbExternalId, e);
        }
        return null;
    }

    public static class TmdbFindResponse {
        public List<TmdbSyncService.TmdbResult> tv_results;
        public List<TmdbSyncService.TmdbResult> movie_results;
    }
    
    public static class TmdbSeasonResponse {
        public List<TmdbEpisodeResponse> episodes;
    }

    public static class TmdbEpisodeResponse {
        public int episode_number;
        public String name;
    }

    public static class TmdbSearchResponse {
        public List<TmdbSyncService.TmdbResult> results;
    }
}
