import { Component, OnInit, inject, signal } from '@angular/core';
import { SidebarComponent } from '../../shared/layout/sidebar.component';
import { MediaService, WatchHistoryItem } from '../../core/media.service';
import { DatePipe, CommonModule } from '@angular/common';

interface SeasonGroup {
  seasonNumber: number;
  expanded?: boolean;
  episodes: WatchHistoryItem[];
}

interface GroupedHistory {
  type: 'MOVIE' | 'TV';
  id: string; // unique identifier
  mediaTitle: string;
  mediaId: string;
  watchedAt?: string; // for MOVIE
  seasons?: SeasonGroup[]; // for TV
  expanded?: boolean; // for TV
}

@Component({
  selector: 'app-history',
  standalone: true,
  imports: [SidebarComponent, DatePipe, CommonModule],
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
          } @else if (groupedHistory().length === 0) {
            <div class="empty-state">Your history is empty. Go add some media!</div>
          } @else {
            <div class="history-list">
              @for (group of groupedHistory(); track group.id) {
                <div class="history-item-container">
                  <!-- Main Row -->
                  <div class="history-row" (click)="toggleGroup(group)" [class.clickable]="group.type === 'TV'">
                    <div class="title-col">
                      @if (group.type === 'TV') {
                        <span class="chevron" [class.rotated]="group.expanded">▶</span>
                      }
                      <span class="font-medium text-white">{{ group.mediaTitle }}</span>
                    </div>
                    <div class="type-col">
                      <span class="badge" [class.badge-purple]="group.type === 'MOVIE'" [class.badge-blue]="group.type === 'TV'">
                        {{ group.type }}
                      </span>
                    </div>
                    <div class="date-col text-muted">
                      {{ group.type === 'MOVIE' ? (group.watchedAt | date:'medium') : (group.seasons?.length + ' Seasons Watched') }}
                    </div>
                    <div class="action-col">
                      @if (group.type === 'MOVIE') {
                        <button class="remove-btn" (click)="$event.stopPropagation(); removeMovie(group.id)">Remove</button>
                      }
                    </div>
                  </div>
                  
                  <!-- Seasons (Accordion) -->
                  @if (group.type === 'TV' && group.expanded) {
                    <div class="seasons-container">
                      @for (season of group.seasons; track season.seasonNumber) {
                        <div class="season-row" (click)="toggleSeason(season)">
                          <div class="season-title">
                            <span class="chevron" [class.rotated]="season.expanded">▶</span>
                            <span class="text-white">Season {{ season.seasonNumber }}</span>
                          </div>
                          <div class="text-muted text-sm">{{ season.episodes.length }} episodes</div>
                        </div>

                        <!-- Episodes (Accordion) -->
                        @if (season.expanded) {
                          <div class="episodes-container">
                            @for (ep of season.episodes; track ep.id) {
                              <div class="episode-row">
                                <div class="episode-title">
                                  {{ ep.episodeNumber }} - {{ ep.episodeTitle ? ep.episodeTitle : 'Episode' }}
                                </div>
                                <div class="episode-date text-muted">{{ ep.watchedAt | date:'medium' }}</div>
                                <button class="remove-btn-sm" (click)="removeEpisode(ep.id)">Remove</button>
                              </div>
                            }
                          </div>
                        }
                      }
                    </div>
                  }
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
    h1 { font-size: 2rem; font-weight: 700; color: #fff; margin-bottom: 8px; }
    .subtitle { color: var(--text-muted); }
    
    .table-section {
      background: var(--bg-card);
      border: 1px solid var(--border-light);
      border-radius: 12px;
      overflow: hidden;
    }
    
    .history-list {
      display: flex;
      flex-direction: column;
    }

    .history-item-container {
      border-bottom: 1px solid var(--border-light);
    }
    .history-item-container:last-child {
      border-bottom: none;
    }
    
    .history-row {
      display: grid;
      grid-template-columns: 2fr 1fr 2fr 1fr;
      align-items: center;
      padding: 16px 24px;
      transition: background 0.2s;
    }
    
    .history-row:hover { background: rgba(255, 255, 255, 0.02); }
    .history-row.clickable { cursor: pointer; }

    .seasons-container {
      background: rgba(0, 0, 0, 0.15);
      border-top: 1px solid rgba(255, 255, 255, 0.05);
    }

    .season-row {
      display: flex;
      justify-content: space-between;
      padding: 12px 24px 12px 48px;
      cursor: pointer;
      transition: background 0.2s;
      border-bottom: 1px solid rgba(255, 255, 255, 0.02);
    }
    .season-row:hover { background: rgba(255, 255, 255, 0.05); }

    .episodes-container {
      background: rgba(0, 0, 0, 0.2);
    }

    .episode-row {
      display: grid;
      grid-template-columns: 2fr 2fr auto;
      padding: 10px 24px 10px 72px;
      align-items: center;
      border-bottom: 1px solid rgba(255, 255, 255, 0.02);
    }
    .episode-row:hover { background: rgba(255, 255, 255, 0.05); }
    
    .chevron {
      display: inline-block;
      margin-right: 8px;
      font-size: 0.8rem;
      transition: transform 0.2s;
      color: var(--text-muted);
    }
    .chevron.rotated { transform: rotate(90deg); }
    
    .font-medium { font-weight: 500; }
    .text-white { color: #fff; }
    .text-muted { color: var(--text-muted); font-size: 0.9rem; }
    .text-sm { font-size: 0.8rem; }
    
    .badge {
      font-size: 0.7rem;
      font-weight: 700;
      padding: 4px 8px;
      border-radius: 4px;
      letter-spacing: 0.5px;
    }
    .badge-purple { background: rgba(124, 58, 237, 0.2); color: #c4b5fd; }
    .badge-blue { background: rgba(59, 130, 246, 0.2); color: #93c5fd; }
    
    .remove-btn, .remove-btn-sm {
      padding: 6px 12px;
      background: rgba(239, 68, 68, 0.1);
      border: 1px solid rgba(239, 68, 68, 0.2);
      border-radius: 4px;
      color: #ef4444;
      font-size: 0.85rem;
      cursor: pointer;
      transition: 0.2s;
    }
    .remove-btn-sm { padding: 4px 8px; font-size: 0.75rem; }
    
    .remove-btn:hover, .remove-btn-sm:hover { background: rgba(239, 68, 68, 0.2); }
    
    .loading-state, .empty-state {
      padding: 40px;
      text-align: center;
      color: var(--text-muted);
    }
  `]
})
export class HistoryComponent implements OnInit {
  private mediaService = inject(MediaService);
  
  groupedHistory = signal<GroupedHistory[]>([]);
  isLoading = signal(true);

  ngOnInit() {
    this.fetchHistory();
  }

  fetchHistory() {
    this.isLoading.set(true);
    this.mediaService.getHistory().subscribe(data => {
      this.processHistory(data);
      this.isLoading.set(false);
    });
  }

  processHistory(data: WatchHistoryItem[]) {
    const groups: GroupedHistory[] = [];
    const tvMap = new Map<string, GroupedHistory>();

    for (const item of data) {
      if (item.mediaType === 'TV') {
        if (!tvMap.has(item.mediaId)) {
          const tvGroup: GroupedHistory = {
            type: 'TV',
            id: item.mediaId,
            mediaTitle: item.mediaTitle,
            mediaId: item.mediaId,
            seasons: [],
            expanded: false
          };
          tvMap.set(item.mediaId, tvGroup);
          groups.push(tvGroup);
        }
        
        const tvGroup = tvMap.get(item.mediaId)!;
        
        // Skip adding an episode if it's a series-level record
        if (!item.seasonNumber && !item.episodeNumber) {
          continue;
        }
        
        let season = tvGroup.seasons!.find(s => s.seasonNumber === item.seasonNumber);
        
        if (!season) {
          season = { seasonNumber: item.seasonNumber || 0, episodes: [], expanded: false };
          tvGroup.seasons!.push(season);
        }
        
        season.episodes.push(item);
      } else {
        groups.push({
          type: 'MOVIE',
          id: item.id,
          mediaTitle: item.mediaTitle,
          mediaId: item.mediaId,
          watchedAt: item.watchedAt
        });
      }
    }

    // Sort
    for (const group of tvMap.values()) {
      group.seasons!.sort((a, b) => a.seasonNumber - b.seasonNumber);
      for (const season of group.seasons!) {
        season.episodes.sort((a, b) => (a.episodeNumber || 0) - (b.episodeNumber || 0));
      }
    }

    this.groupedHistory.set(groups);
  }

  toggleGroup(group: GroupedHistory) {
    if (group.type === 'TV') {
      group.expanded = !group.expanded;
    }
  }

  toggleSeason(season: SeasonGroup) {
    season.expanded = !season.expanded;
  }

  removeMovie(historyId: string) {
    this.mediaService.removeHistoryItem(historyId).subscribe(() => {
      this.fetchHistory();
    });
  }

  removeEpisode(historyId: string) {
    this.mediaService.removeHistoryItem(historyId).subscribe(() => {
      this.fetchHistory();
    });
  }
}
