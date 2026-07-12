package com.media.tracker.service.serviceImpl;

import com.media.tracker.model.entity.User;
import com.media.tracker.model.entity.WatchHistory;
import com.media.tracker.repository.UserRepository;
import com.media.tracker.repository.WatchHistoryRepository;
import com.media.tracker.service.ImportService;
import com.opencsv.CSVReader;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStreamReader;
import java.io.Reader;
import java.time.Instant;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.CompletableFuture;
import java.util.stream.Collectors;

@Service
public class ImportServiceImpl implements ImportService {

    private static final Logger log = LoggerFactory.getLogger(ImportServiceImpl.class);

    private final UserRepository userRepository;
    private final WatchHistoryRepository watchHistoryRepository;
    private final List<AbstractImporter> importers;
    private final Map<String, ImportProgress> userProgress = new java.util.concurrent.ConcurrentHashMap<>();

    public ImportServiceImpl(UserRepository userRepository, WatchHistoryRepository watchHistoryRepository, List<AbstractImporter> importers) {
        this.userRepository = userRepository;
        this.watchHistoryRepository = watchHistoryRepository;
        this.importers = importers;
    }

    @Override
    public ImportProgress getProgress(String username) {
        return userProgress.getOrDefault(username, new ImportProgress());
    }

    @Override
    public void importCsv(MultipartFile file, String username, String template) throws Exception {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        AbstractImporter importer = importers.stream()
                .filter(imp -> imp.supports(template))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Unsupported template: " + template));

        String batchId = template + "_" + Instant.now().toString();

        List<String[]> rows;
        try (Reader reader = new InputStreamReader(file.getInputStream());
             CSVReader csvReader = new CSVReader(reader)) {
            rows = csvReader.readAll();
        }

        if (rows.isEmpty()) return;

        String[] header = rows.remove(0);
        Map<String, Integer> headerMap = new HashMap<>();
        for (int i = 0; i < header.length; i++) {
            headerMap.put(header[i].trim(), i);
        }

        ImportProgress progress = new ImportProgress();
        progress.total = rows.size();
        progress.processed = 0;
        progress.isRunning = true;
        progress.statusMessage = "Importing...";
        userProgress.put(username, progress);

        CompletableFuture.runAsync(() -> {
            log.info("Starting background import for {}, batch: {}", username, batchId);
            int count = 0;
            ImportCache cache = new ImportCache();
            
            // Pre-load user history to avoid DB hits during deduplication
            List<WatchHistory> allUserHistory = watchHistoryRepository.findByUserId(user.getId());
            cache.userHistoryMap.putAll(allUserHistory.stream().collect(Collectors.groupingBy(wh -> wh.getMedia().getId())));

            for (String[] line : rows) {
                try {
                    count += importer.processRow(line, headerMap, user, batchId, cache);
                } catch (Exception e) {
                    log.error("Error processing row", e);
                }
                progress.processed++;
            }
            progress.isRunning = false;
            progress.statusMessage = "Completed";
            log.info("Finished background import for {}, batch: {}. Processed {} records.", username, batchId, count);
        });
    }

    @Override
    public List<Object[]> getBatches(String username) {
        User user = userRepository.findByUsername(username).orElseThrow();
        return watchHistoryRepository.findImportBatchesByUserId(user.getId());
    }

    @Override
    @org.springframework.transaction.annotation.Transactional
    public void rollbackBatch(String batchId, String username) {
        User user = userRepository.findByUsername(username).orElseThrow();
        watchHistoryRepository.deleteByImportBatchIdAndUserId(batchId, user.getId());
    }
}
