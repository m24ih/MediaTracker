import { Component, OnInit, inject, signal } from '@angular/core';
import { SidebarComponent } from '../../shared/layout/sidebar.component';
import { MediaService, WatchHistoryItem } from '../../core/media.service';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-history',
  standalone: true,
  imports: [SidebarComponent, DatePipe],
  template: `
    <div class="layout">
      <app-sidebar />
      <div class="main-content">
        <header class="page-header">
          <h1>Watch History</h1>
          <p class="subtitle">A chronological record of what you've tracked.</p>
        </header>

        <section class="table-section">
          @if (isLoading()) {
            <div class="loading-state"><span class="spinner"></span></div>
          } @else if (history().length === 0) {
            <div class="empty-state">Your history is empty. Go add some media!</div>
          } @else {
            <table class="history-table">
              <thead>
                <tr>
                  <th>Media</th>
                  <th>Type</th>
                  <th>Date Watched</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                @for (item of history(); track item.id) {
                  <tr>
                    <td class="font-medium text-white">{{ item.mediaTitle }}</td>
                    <td>
                      <span class="badge" [class.badge-purple]="item.mediaType === 'MOVIE'" [class.badge-blue]="item.mediaType === 'TV'">
                        {{ item.mediaType }}
                      </span>
                    </td>
                    <td class="text-muted">{{ item.watchedAt | date:'medium' }}</td>
                    <td>
                      <button class="remove-btn" (click)="remove(item.mediaId)">Remove</button>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          }
        </section>
      </div>
    </div>
  `,
  styles: [`
    .page-header { margin-bottom: 32px; }
    h1 { font-size: 2rem; font-weight: 700; color: #fff; margin-bottom: 8px; }
    .subtitle { color: var(--text-muted); }
    
    .table-section {
      background: var(--bg-card);
      border: 1px solid var(--border-light);
      border-radius: 12px;
      overflow: hidden;
    }
    
    .history-table {
      width: 100%;
      border-collapse: collapse;
      text-align: left;
    }
    
    th, td {
      padding: 16px 24px;
      border-bottom: 1px solid var(--border-light);
    }
    
    th {
      font-weight: 600;
      color: var(--text-muted);
      font-size: 0.85rem;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      background: rgba(0, 0, 0, 0.2);
    }
    
    tr:last-child td {
      border-bottom: none;
    }
    
    tr:hover td {
      background: rgba(255, 255, 255, 0.02);
    }
    
    .font-medium { font-weight: 500; }
    .text-white { color: #fff; }
    .text-muted { color: var(--text-muted); font-size: 0.9rem; }
    
    .badge {
      font-size: 0.7rem;
      font-weight: 700;
      padding: 4px 8px;
      border-radius: 4px;
      letter-spacing: 0.5px;
    }
    .badge-purple { background: rgba(124, 58, 237, 0.2); color: #c4b5fd; }
    .badge-blue { background: rgba(59, 130, 246, 0.2); color: #93c5fd; }
    
    .remove-btn {
      padding: 6px 12px;
      background: rgba(239, 68, 68, 0.1);
      border: 1px solid rgba(239, 68, 68, 0.2);
      border-radius: 4px;
      color: #ef4444;
      font-size: 0.85rem;
      cursor: pointer;
      transition: 0.2s;
    }
    
    .remove-btn:hover {
      background: rgba(239, 68, 68, 0.2);
    }
    
    .loading-state, .empty-state {
      padding: 40px;
      text-align: center;
      color: var(--text-muted);
    }
  `]
})
export class HistoryComponent implements OnInit {
  private mediaService = inject(MediaService);
  
  history = signal<WatchHistoryItem[]>([]);
  isLoading = signal(true);

  ngOnInit() {
    this.fetchHistory();
  }

  fetchHistory() {
    this.isLoading.set(true);
    this.mediaService.getHistory().subscribe(data => {
      this.history.set(data);
      this.isLoading.set(false);
    });
  }

  remove(mediaId: string) {
    this.mediaService.removeFromWatchlist(mediaId).subscribe(() => {
      this.fetchHistory();
    });
  }
}
