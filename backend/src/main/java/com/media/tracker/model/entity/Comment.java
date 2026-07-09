package com.media.tracker.model.entity;

import jakarta.persistence.*;
import java.util.UUID;

@Entity
@Table(name = "comments")
public class Comment {
    @Id @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "media_id", nullable = false)
    private Media media;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String content;

    @Column(columnDefinition = "ltree", nullable = false)
    private String path;

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public Media getMedia() { return media; }
    public void setMedia(Media media) { this.media = media; }
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }
    public String getPath() { return path; }
    public void setPath(String path) { this.path = path; }
}
