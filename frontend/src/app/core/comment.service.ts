import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { CommentNode } from './models';

@Injectable({
  providedIn: 'root'
})
export class CommentService {
  // Dev: proxy.conf.json yönlendiriyor → /api/v1 → localhost:8080/api/v1
  private readonly apiUrl = '/api/v1/comments';

  constructor(private http: HttpClient) {}

  getCommentsForMedia(mediaId: string): Observable<CommentNode[]> {
    return this.http
      .get<CommentNode[]>(`${this.apiUrl}/media/${mediaId}`)
      .pipe(map(flat => this.buildTree(flat)));
  }

  /**
   * Converts a flat list of LTree-backed CommentNode records into a
   * hierarchical tree in O(N) time using a path-indexed lookup table.
   *
   * Algorithm:
   *   1. Build a lookup map: path → CommentNode (and init children array)
   *   2. For each node, derive the parent path by dropping the last segment.
   *      - Single-segment path  → root node → push to top-level array
   *      - Multi-segment path   → look up parent in map, push as child
   *
   * Example paths from PostgreSQL LTree:
   *   "root"               → top-level comment
   *   "root.abc123"        → reply to root
   *   "root.abc123.def456" → reply to abc123
   */
  private buildTree(comments: CommentNode[]): CommentNode[] {
    const tree: CommentNode[] = [];
    const lookup: Record<string, CommentNode> = {};

    // Pass 1: index all nodes
    comments.forEach(comment => {
      comment.children = [];
      lookup[comment.path] = comment;
    });

    // Pass 2: wire parent ↔ child relationships
    comments.forEach(comment => {
      const parts = comment.path.split('.');
      if (parts.length === 1) {
        // Root-level comment
        tree.push(comment);
      } else {
        parts.pop(); // remove own segment → parent path
        const parentPath = parts.join('.');
        const parent = lookup[parentPath];
        if (parent) {
          parent.children!.push(comment);
        } else {
          // Orphan guard: treat as root if parent is missing
          tree.push(comment);
        }
      }
    });

    return tree;
  }
}
