import { Component, OnInit, inject, signal } from '@angular/core';
import { SidebarComponent } from '../../shared/layout/sidebar.component';
import { MediaService, MediaItem, UserStats, WatchHistoryItem } from '../../core/media.service';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [SidebarComponent, DatePipe],
  template: `
    <div class="layout">
      <app-sidebar />
      <div class="main-content">
        <header class="page-header">
          <h1>Dashboard</h1>
        </header>

        <!-- Stats Section -->
        <section class="stats-grid">
          <div class="stat-card">
            <span class="stat-value">{{ stats()?.movies || 0 }}</span>
            <span class="stat-label">Movies Watched</span>
          </div>
          <div class="stat-card">
            <span class="stat-value">{{ stats()?.tvEpisodes || 0 }}</span>
            <span class="stat-label">TV Episodes</span>
          </div>
          <div class="stat-card highlight">
            <span class="stat-value">{{ stats()?.total || 0 }}</span>
            <span class="stat-label">Total Watched</span>
          </div>
        </section>

        <!-- Recent Activity -->
        <section class="recent-section mt-8">
          <h2 class="section-title">Recent Activity</h2>
          
          @if (isLoadingHistory()) {
            <div class="loading-state"><span class="spinner"></span></div>
          } @else if (recentHistory().length === 0) {
            <div class="empty-state">No recent watch history found.</div>
          } @else {
            <div class="horizontal-scroll">
              @for (item of recentHistory(); track item.id) {
                <div class="activity-card">
                  <div class="card-bg">
                    @if (item.mediaPosterUrl) {
                      <img [src]="item.mediaPosterUrl" [alt]="item.mediaTitle" class="poster-img-bg">
                    }
                  </div>
                  <div class="content">
                    <span class="badge" [class.badge-purple]="item.mediaType === 'MOVIE'" [class.badge-blue]="item.mediaType === 'TV'">
                      {{ item.mediaType }}
                    </span>
                    <h3 class="title">{{ item.mediaTitle }}</h3>
                    <p class="date">Watched on {{ item.watchedAt | date:'MMM d, y' }}</p>
                  </div>
                </div>
              }
            </div>
          }
        </section>

        <!-- All Media Grid -->
        <section class="media-section mt-8">
          <h2 class="section-title">All Media</h2>
          
          @if (isLoadingMedia()) {
            <div class="loading-state"><span class="spinner"></span></div>
          } @else {
            <div class="media-grid">
              @for (media of allMedia(); track media.id) {
                <div class="media-card">
                  <div class="card-header" [class.header-movie]="media.type === 'MOVIE'" [class.header-tv]="media.type === 'TV'">
                    @if (media.posterUrl) {
                      <img [src]="media.posterUrl" [alt]="media.title" class="poster-img">
                    }
                  </div>
                  <div class="card-body">
                    <span class="badge" [class.badge-purple]="media.type === 'MOVIE'" [class.badge-blue]="media.type === 'TV'">
                      {{ media.type }}
                    </span>
                    <h3 class="media-title">{{ media.title }}</h3>
                    <p class="external-id">ID: {{ media.externalId || 'N/A' }}</p>
                    <button class="add-btn" (click)="addToWatchlist(media.id)">+ Watchlist</button>
                  </div>
                </div>
              }
            </div>
          }
        </section>
      </div>
    </div>
  `,
  styles: [`
    .page-header { margin-bottom: 32px; }
    h1 { font-size: 2rem; font-weight: 700; color: #fff; }
    .section-title { font-size: 1.25rem; font-weight: 600; color: #fff; margin-bottom: 16px; }
    .mt-8 { margin-top: 32px; }
    
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 24px;
    }
    
    .stat-card {
      background: var(--bg-card);
      border: 1px solid var(--border-light);
      border-radius: 12px;
      padding: 24px;
      display: flex;
      align-items: center;
      gap: 16px;
    }
    
    .stat-card.highlight {
      background: linear-gradient(135deg, rgba(124, 58, 237, 0.2), rgba(59, 130, 246, 0.2));
      border-color: rgba(124, 58, 237, 0.3);
    }
    
    .stat-value {
      font-size: 2.5rem;
      font-weight: 700;
      color: #fff;
    }
    
    .stat-label { color: var(--text-muted); font-size: 0.95rem; font-weight: 500; }
    
    /* Horizontal activity scroll */
    .horizontal-scroll {
      display: flex;
      gap: 16px;
      overflow-x: auto;
      padding-bottom: 16px;
    }
    
    .activity-card {
      position: relative;
      min-width: 260px;
      height: 140px;
      border-radius: 12px;
      overflow: hidden;
      border: 1px solid var(--border-light);
    }
    
    .activity-card .card-bg {
      position: absolute;
      top: 0; left: 0; right: 0; bottom: 0;
      background: linear-gradient(135deg, var(--accent-purple), var(--accent-blue));
      opacity: 0.15;
    }
    
    .activity-card .content {
      position: relative;
      padding: 16px;
      height: 100%;
      display: flex;
      flex-direction: column;
      justify-content: flex-end;
    }
    
    .activity-card .title { font-size: 1.1rem; color: #fff; margin: 8px 0 4px 0; }
    .activity-card .date { font-size: 0.8rem; color: var(--text-muted); margin: 0; }
    
    /* Grid */
    .media-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
      gap: 20px;
    }
    
    .media-card {
      background: var(--bg-card);
      border: 1px solid var(--border-light);
      border-radius: 12px;
      overflow: hidden;
      transition: transform 0.2s, box-shadow 0.2s;
    }
    
    .media-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 10px 20px -5px rgba(0, 0, 0, 0.5);
      border-color: rgba(124, 58, 237, 0.4);
    }
    
    .card-header { height: 330px; position: relative; overflow: hidden; }
    .header-movie { background: linear-gradient(to bottom, #4c1d95, #2e1065); }
    .header-tv { background: linear-gradient(to bottom, #1e3a8a, #172554); }
    
    .poster-img { width: 100%; height: 100%; object-fit: cover; }
    .poster-img-bg { width: 100%; height: 100%; object-fit: cover; opacity: 0.4; }
    
    .card-body { padding: 16px; }
    .media-title { font-size: 1rem; font-weight: 600; color: #fff; margin: 12px 0 4px 0; }
    .external-id { font-size: 0.8rem; color: var(--text-muted); margin-bottom: 16px; }
    
    .badge {
      font-size: 0.7rem;
      font-weight: 700;
      padding: 4px 8px;
      border-radius: 4px;
      letter-spacing: 0.5px;
    }
    .badge-purple { background: rgba(124, 58, 237, 0.2); color: #c4b5fd; }
    .badge-blue { background: rgba(59, 130, 246, 0.2); color: #93c5fd; }
    
    .add-btn {
      width: 100%;
      padding: 8px;
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 6px;
      color: #fff;
      cursor: pointer;
      transition: 0.2s;
    }
    
    .add-btn:hover { background: rgba(255, 255, 255, 0.1); }
    
    .loading-state, .empty-state {
      padding: 40px;
      text-align: center;
      color: var(--text-muted);
    }
  `]
})
export class DashboardComponent implements OnInit {
  private mediaService = inject(MediaService);

  stats = signal<UserStats | null>(null);
  recentHistory = signal<WatchHistoryItem[]>([]);
  allMedia = signal<MediaItem[]>([]);
  
  isLoadingHistory = signal(true);
  isLoadingMedia = signal(true);

  ngOnInit() {
    this.mediaService.getStats().subscribe(data => this.stats.set(data));
    
    this.mediaService.getHistory().subscribe(data => {
      // Just take top 5 for dashboard
      this.recentHistory.set(data.slice(0, 5));
      this.isLoadingHistory.set(false);
    });

    this.mediaService.getAllMedia().subscribe(data => {
      this.allMedia.set(data);
      this.isLoadingMedia.set(false);
    });
  }

  addToWatchlist(id: string) {
    this.mediaService.addToWatchlist(id).subscribe(() => {
      // Refresh history & stats
      this.ngOnInit();
    });
  }
}
