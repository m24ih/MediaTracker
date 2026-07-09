import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CommentNode } from '../../core/models';

/**
 * Recursive standalone component that renders a LTree comment hierarchy.
 *
 * Each instance renders its own `comments` list and, for any node that has
 * children, re-renders itself recursively. Angular's Change Detection handles
 * this efficiently because each recursive call is a separate component instance
 * operating on a sub-array reference — no full-tree re-renders on partial updates.
 *
 * Uses Angular 17+ built-in control flow (@for / @if) instead of *ngFor / *ngIf
 * directives for better tree-shaking and template type safety.
 */
@Component({
  selector: 'app-comment-tree',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="comment-list">
      @for (node of comments; track node.id) {
        <div class="comment-node">
          <div class="comment-header">
            <strong class="comment-author">{{ node.user?.username ?? 'Unknown User' }}</strong>
            <span class="comment-meta">
              {{ node.createdAt | date:'dd MMM yyyy, HH:mm' }}
              <span class="comment-path">({{ node.path }})</span>
            </span>
          </div>

          <p class="comment-body">{{ node.content }}</p>

          <!-- Recursive call: only rendered when there are children, preventing
               an infinite component chain for leaf nodes. -->
          @if (node.children && node.children.length > 0) {
            <div class="comment-children">
              <app-comment-tree [comments]="node.children" />
            </div>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .comment-node {
      margin-left: 20px;
      border-left: 2px solid #e0e0e0;
      padding-left: 12px;
      margin-bottom: 12px;
    }

    .comment-header {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 4px;
    }

    .comment-author {
      font-size: 0.9rem;
      color: #333;
    }

    .comment-meta {
      font-size: 0.75rem;
      color: #888;
    }

    .comment-path {
      font-family: monospace;
      font-size: 0.7rem;
      color: #bbb;
    }

    .comment-body {
      margin: 0;
      font-size: 0.9rem;
      color: #444;
      line-height: 1.5;
    }

    .comment-children {
      margin-top: 8px;
    }
  `]
})
export class CommentTreeComponent {
  @Input() comments: CommentNode[] = [];
}
