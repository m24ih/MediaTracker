import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  template: `
    <aside class="sidebar">
      <div class="logo">
        <span class="icon">▶</span>
        <span class="text-white">Media</span><span class="text-purple">Tracker</span>
      </div>
      
      <nav class="nav-menu">
        <a routerLink="/dashboard" routerLinkActive="active" class="nav-item">
          <span class="nav-icon">⊞</span> Dashboard
        </a>
        <a routerLink="/discover" routerLinkActive="active" class="nav-item">
          <span class="nav-icon">◓</span> Discover
        </a>
        <a routerLink="/history" routerLinkActive="active" class="nav-item">
          <span class="nav-icon">⏱</span> History
        </a>
      </nav>

      <div class="bottom-section">
        <div class="user-info">
          <span class="avatar"></span>
          <span class="username">{{ username }}</span>
        </div>
        <button class="logout-btn" (click)="logout()">Logout</button>
      </div>
    </aside>
  `,
  styles: [`
    .sidebar {
      position: fixed;
      top: 0;
      left: 0;
      width: 240px;
      height: 100vh;
      background-color: var(--bg-sidebar);
      border-right: 1px solid var(--border-light);
      display: flex;
      flex-direction: column;
      padding: 24px 0;
    }
    
    .logo {
      font-size: 1.25rem;
      font-weight: 700;
      padding: 0 24px;
      margin-bottom: 40px;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    
    .icon { color: var(--accent-purple); font-size: 1.5rem; }
    .text-white { color: #fff; }
    .text-purple { color: var(--accent-purple); }
    
    .nav-menu {
      display: flex;
      flex-direction: column;
      gap: 8px;
      padding: 0 16px;
      flex: 1;
    }
    
    .nav-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 16px;
      border-radius: 8px;
      color: var(--text-muted);
      text-decoration: none;
      font-weight: 500;
      transition: all 0.2s ease;
      border-left: 3px solid transparent;
    }
    
    .nav-item:hover {
      background-color: rgba(255, 255, 255, 0.03);
      color: var(--text-primary);
    }
    
    .nav-item.active {
      background-color: rgba(124, 58, 237, 0.15);
      color: var(--text-primary);
      border-left-color: var(--accent-purple);
    }
    
    .nav-icon { font-size: 1.2rem; }
    
    .bottom-section {
      padding: 0 24px;
    }
    
    .user-info {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 16px;
    }
    
    .avatar {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: linear-gradient(135deg, var(--accent-purple), var(--accent-blue));
    }
    
    .username {
      font-weight: 600;
      font-size: 0.9rem;
      color: var(--text-primary);
    }
    
    .logout-btn {
      width: 100%;
      padding: 10px;
      background: transparent;
      border: 1px solid var(--border-light);
      border-radius: 6px;
      color: var(--text-muted);
      cursor: pointer;
      transition: 0.2s ease;
    }
    
    .logout-btn:hover {
      background: rgba(255, 255, 255, 0.05);
      color: #fff;
    }
  `]
})
export class SidebarComponent {
  private auth = inject(AuthService);
  private router = inject(Router);

  username = this.auth.getUsername();

  logout() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
