package com.media.tracker.service;

import com.media.tracker.dto.WebhookPayload;
import com.media.tracker.model.entity.Media;
import com.media.tracker.model.entity.User;
import com.media.tracker.model.entity.WatchHistory;
import com.media.tracker.repository.MediaRepository;
import com.media.tracker.repository.UserRepository;
import com.media.tracker.repository.WatchHistoryRepository;
import com.media.tracker.util.converter.AesEncryptorConverter;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class MediaSyncService {

    private static final Logger log = LoggerFactory.getLogger(MediaSyncService.class);

    private final MediaRepository mediaRepository;
    private final UserRepository userRepository;
    private final WatchHistoryRepository watchHistoryRepository;
    private final AesEncryptorConverter encryptor;

    public MediaSyncService(MediaRepository mediaRepository, UserRepository userRepository, WatchHistoryRepository watchHistoryRepository) {
        this.mediaRepository = mediaRepository;
        this.userRepository = userRepository;
        this.watchHistoryRepository = watchHistoryRepository;
        this.encryptor = new AesEncryptorConverter();
    }

    @Transactional
    public void processMediaEvent(WebhookPayload payload) {
        // Gelen düz metin API Key'i DB'de şifreli durduğu için, aramadan önce şifreliyoruz (AES ECB mode deterministiktir)
        String encryptedApiKey = encryptor.convertToDatabaseColumn(payload.userApiKey());

        // Şifreli key ile kullanıcıyı bul (Repository'de manuel iterasyon yerine stream kullanıyoruz)
        User user = userRepository.findAll().stream()
                .filter(u -> encryptedApiKey.equals(encryptor.convertToDatabaseColumn(u.getExternalApiKey())))
                .findFirst()
                .orElse(null);

        if (user == null) {
            log.warn("Webhook rejected: Invalid user API Key for payload: {}", payload.title());
            return;
        }

        // Medyayı bul veya yeni oluştur
        Media media = mediaRepository.findByExternalId(payload.externalId()).orElseGet(() -> {
            Media newMedia = new Media();
            newMedia.setExternalId(payload.externalId());
            newMedia.setTitle(payload.title());
            newMedia.setType(payload.mediaType());
            return mediaRepository.save(newMedia);
        });

        // İzleme geçmişini güncelle (Upsert)
        WatchHistory history = watchHistoryRepository.findByUserIdAndMediaId(user.getId(), media.getId())
                .orElseGet(() -> {
                    WatchHistory newHistory = new WatchHistory();
                    newHistory.setUser(user);
                    newHistory.setMedia(media);
                    return newHistory;
                });

        history.setStatus("PlaybackStart".equals(payload.eventType()) ? "WATCHING" : "COMPLETED");
        watchHistoryRepository.save(history);

        log.info("Media sync completed for user: {} on media: {}", user.getUsername(), media.getTitle());
    }
}
