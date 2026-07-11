package com.media.tracker.model.entity;

import jakarta.persistence.*;
import java.util.UUID;

@Entity
@Table(name = "media")
public class Media {
    @Id @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private String title;

    @Column(name = "external_id", unique = true)
    private String externalId;

    private String type;

    @Column(name = "poster_url")
    private String posterUrl;

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getExternalId() { return externalId; }
    public void setExternalId(String externalId) { this.externalId = externalId; }
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
    public String getPosterUrl() { return posterUrl; }
    public void setPosterUrl(String posterUrl) { this.posterUrl = posterUrl; }
}
