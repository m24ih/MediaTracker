package com.media.tracker.model.entity;

import com.media.tracker.model.enums.RoleType;
import jakarta.persistence.*;
import java.util.UUID;

@Entity
@Table(name = "roles")
public class Role {
    @Id @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Enumerated(EnumType.STRING)
    @Column(unique = true, nullable = false)
    private RoleType name;

    public RoleType getName() { return name; }
    public void setName(RoleType name) { this.name = name; }
}
