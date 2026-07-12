package com.media.tracker.service;

import org.springframework.web.multipart.MultipartFile;
import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.util.UUID;
import com.media.tracker.model.entity.Media;
import com.media.tracker.model.entity.WatchHistory;
import com.media.tracker.service.TmdbSyncService;

public interface ImportService {

    class ImportCache {
        public Map<String, Media> mediaMap = new HashMap<>();
        public Map<String, TmdbSyncService.TmdbResult> tvdbIdMap = new HashMap<>();
        public Map<String, Map<Integer, String>> seasonEpisodesMap = new HashMap<>();
        public Map<String, TmdbSyncService.TmdbResult> movieSearchMap = new HashMap<>();
        public Map<UUID, List<WatchHistory>> userHistoryMap = new HashMap<>();
    }

    class ImportProgress {
        public int processed;
        public int total;
        public boolean isRunning;
        public String statusMessage;
    }

    ImportProgress getProgress(String username);

    void importCsv(MultipartFile file, String username, String template) throws Exception;

    List<Object[]> getBatches(String username);

    void rollbackBatch(String batchId, String username);
}
