package com.media.tracker.repository;

import com.media.tracker.model.entity.Comment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.util.UUID;

public interface CommentRepository extends JpaRepository<Comment, UUID> {
    
    @Query(value = "SELECT * FROM comments WHERE path <@ cast(:parentPath as ltree) AND media_id = :mediaId ORDER BY path ASC", nativeQuery = true)
    List<Comment> findCommentTree(@Param("mediaId") UUID mediaId, @Param("parentPath") String parentPath);
}
