import { Component, inject, signal } from '@angular/core';
import { SidebarComponent } from '../../shared/layout/sidebar.component';
import { MediaService, MediaItem } from '../../core/media.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-discover',
  standalone: true,
  imports: [SidebarComponent, FormsModule],
  template: `
    <div class="layout">
      <app-sidebar />
      <div class="main-content">
        <header class="page-header">
          <h1>Discover</h1>
          
          <div class="search-bar">
            <span class="search-icon">🔍</span>
            <input 
              type="text" 
              [(ngModel)]="searchQuery" 
              (keyup)="onSearch()"
              placeholder="Search for movies, TV shows..."
              class="search-input"
            >
          </div>
        </header>

        <section class="media-section">
          @if (isLoading()) {
            <div class="loading-state"><span class="spinner"></span></div>
          } @else if (results().length === 0) {
            <div class="empty-state">
              <span class="empty-icon">🎬</span>
              <p>No media found. Try a different search term.</p>
            </div>
          } @else {
            <div class="media-grid">
              @for (media of results(); track media.id) {
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
    h1 { font-size: 2rem; font-weight: 700; color: #fff; margin-bottom: 24px; }
    
    .search-bar {
      position: relative;
      max-width: 600px;
    }
    
    .search-icon {
      position: absolute;
      left: 16px;
      top: 50%;
      transform: translateY(-50%);
      opacity: 0.5;
    }
    
    .search-input {
      width: 100%;
      padding: 16px 16px 16px 48px;
      background: var(--bg-card);
      border: 1px solid var(--border-light);
      border-radius: 12px;
      color: #fff;
      font-size: 1.1rem;
      transition: 0.2s ease;
    }
    
    .search-input:focus {
      outline: none;
      border-color: var(--accent-blue);
      box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
    }
    
    /* Reusing Grid Styles */
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
      border-color: rgba(59, 130, 246, 0.4);
    }
    
    .card-header { height: 330px; position: relative; overflow: hidden; }
    .header-movie { background: linear-gradient(to bottom, #4c1d95, #2e1065); }
    .header-tv { background: linear-gradient(to bottom, #1e3a8a, #172554); }
    
    .poster-img { width: 100%; height: 100%; object-fit: cover; }
    
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
    
    .loading-state { padding: 40px; text-align: center; }
    .empty-state { 
      padding: 80px 20px; 
      text-align: center; 
      color: var(--text-muted);
    }
    .empty-icon { font-size: 3rem; display: block; margin-bottom: 16px; opacity: 0.5; }
  `]
})
export class DiscoverComponent {
  private mediaService = inject(MediaService);

  searchQuery = '';
  results = signal<MediaItem[]>([]);
  isLoading = signal(true);
  
  private searchTimeout: any;

  constructor() {
    this.fetchAll();
  }

  fetchAll() {
    this.isLoading.set(true);
    this.mediaService.getAllMedia().subscribe(data => {
      this.results.set(data);
      this.isLoading.set(false);
    });
  }

  onSearch() {
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }
    
    if (!this.searchQuery.trim()) {
      this.fetchAll();
      return;
    }

    // Debounce
    this.searchTimeout = setTimeout(() => {
      this.isLoading.set(true);
      this.mediaService.searchMedia(this.searchQuery).subscribe(data => {
        this.results.set(data);
        this.isLoading.set(false);
      });
    }, 400);
  }

  addToWatchlist(id: string) {
    this.mediaService.addToWatchlist(id).subscribe();
  }
}
