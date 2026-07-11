import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface MediaItem {
  id: string;
  title: string;
  externalId: string;
  type: 'MOVIE' | 'TV' | string;
}

export interface WatchHistoryItem {
  id: string;
  mediaId: string;
  mediaTitle: string;
  mediaType: string;
  watchedAt: string;
}

export interface UserStats {
  movies: number;
  tvEpisodes: number;
  total: number;
}

@Injectable({
  providedIn: 'root'
})
export class MediaService {
  private apiUrl = '/api/v1/media';

  constructor(private http: HttpClient) {}

  getAllMedia(): Observable<MediaItem[]> {
    return this.http.get<MediaItem[]>(this.apiUrl);
  }

  searchMedia(q: string): Observable<MediaItem[]> {
    return this.http.get<MediaItem[]>(`${this.apiUrl}/search`, { params: { q } });
  }

  getHistory(): Observable<WatchHistoryItem[]> {
    return this.http.get<WatchHistoryItem[]>(`${this.apiUrl}/history`);
  }

  getStats(): Observable<UserStats> {
    return this.http.get<UserStats>(`${this.apiUrl}/stats`);
  }

  addToWatchlist(mediaId: string): Observable<WatchHistoryItem> {
    return this.http.post<WatchHistoryItem>(`${this.apiUrl}/${mediaId}/watchlist`, {});
  }

  removeFromWatchlist(mediaId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${mediaId}/watchlist`);
  }
}
