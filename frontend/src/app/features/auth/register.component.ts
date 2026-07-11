import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, RouterLink],
  template: `
    <div class="auth-container">
      <div class="auth-card">
        <div class="logo">
          <span class="icon">▶</span>
          <span class="text-white">Media</span><span class="text-purple">Tracker</span>
        </div>
        
        <h2 class="title">Create Account</h2>
        <p class="subtitle">Join to start building your watchlist.</p>
        
        <form (ngSubmit)="onSubmit()" #registerForm="ngForm">
          <div class="form-group">
            <label for="username">Username</label>
            <input 
              type="text" 
              id="username" 
              name="username" 
              [(ngModel)]="username" 
              required
              class="form-control"
              placeholder="Choose a username"
            >
          </div>
          
          <div class="form-group">
            <label for="password">Password</label>
            <input 
              type="password" 
              id="password" 
              name="password" 
              [(ngModel)]="password" 
              required
              minlength="6"
              class="form-control"
              placeholder="Create a password"
            >
          </div>
          
          @if (errorMsg()) {
            <div class="error-msg">{{ errorMsg() }}</div>
          }
          
          <button type="submit" class="submit-btn" [disabled]="!registerForm.valid || isLoading()">
            @if (isLoading()) {
              <span class="spinner"></span>
            } @else {
              <span>Sign Up</span>
            }
          </button>
        </form>
        
        <div class="auth-links">
          <p>Already have an account? <a routerLink="/login">Sign In</a></p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    /* Reusing exact same styles as login for consistency */
    .auth-container {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--bg-main);
      background-image: radial-gradient(circle at top right, rgba(124, 58, 237, 0.1), transparent 40%),
                        radial-gradient(circle at bottom left, rgba(59, 130, 246, 0.1), transparent 40%);
    }
    
    .auth-card {
      width: 100%;
      max-width: 400px;
      padding: 40px;
      background: rgba(30, 30, 48, 0.8);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      border: 1px solid var(--border-light);
      border-radius: 16px;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
    }
    
    .logo {
      font-size: 1.5rem;
      font-weight: 700;
      text-align: center;
      margin-bottom: 32px;
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 8px;
    }
    
    .icon { color: var(--accent-purple); }
    .text-white { color: #fff; }
    .text-purple { color: var(--accent-purple); }
    
    .title {
      font-size: 1.5rem;
      font-weight: 600;
      color: #fff;
      margin-bottom: 8px;
      text-align: center;
    }
    
    .subtitle {
      color: var(--text-muted);
      font-size: 0.9rem;
      text-align: center;
      margin-bottom: 32px;
    }
    
    .form-group {
      margin-bottom: 20px;
    }
    
    label {
      display: block;
      margin-bottom: 8px;
      font-size: 0.85rem;
      font-weight: 500;
      color: var(--text-muted);
    }
    
    .form-control {
      width: 100%;
      padding: 12px 16px;
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 8px;
      color: #fff;
      font-size: 1rem;
      transition: all 0.2s ease;
    }
    
    .form-control:focus {
      outline: none;
      border-color: var(--accent-purple);
      background: rgba(255, 255, 255, 0.08);
    }
    
    .error-msg {
      padding: 12px;
      background: rgba(239, 68, 68, 0.1);
      border: 1px solid rgba(239, 68, 68, 0.3);
      color: #ef4444;
      border-radius: 8px;
      font-size: 0.85rem;
      margin-bottom: 20px;
      text-align: center;
    }
    
    .submit-btn {
      width: 100%;
      padding: 14px;
      background: linear-gradient(to right, var(--accent-purple), var(--accent-blue));
      border: none;
      border-radius: 8px;
      color: #fff;
      font-weight: 600;
      font-size: 1rem;
      cursor: pointer;
      transition: transform 0.2s ease, box-shadow 0.2s ease;
      display: flex;
      justify-content: center;
      align-items: center;
    }
    
    .submit-btn:hover:not(:disabled) {
      transform: scale(1.02);
      box-shadow: 0 10px 15px -3px rgba(124, 58, 237, 0.3);
    }
    
    .submit-btn:disabled {
      opacity: 0.7;
      cursor: not-allowed;
    }
    
    .auth-links {
      margin-top: 24px;
      text-align: center;
      font-size: 0.9rem;
      color: var(--text-muted);
    }
    
    .auth-links a {
      color: var(--accent-blue);
      text-decoration: none;
      transition: color 0.2s;
    }
    
    .auth-links a:hover {
      color: #60a5fa;
      text-decoration: underline;
    }
  `]
})
export class RegisterComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  username = '';
  password = '';
  
  isLoading = signal(false);
  errorMsg = signal<string | null>(null);

  onSubmit() {
    this.isLoading.set(true);
    this.errorMsg.set(null);
    
    this.authService.register(this.username, this.password).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.isLoading.set(false);
        this.errorMsg.set(err.error?.message || 'Registration failed. Username may be taken.');
      }
    });
  }
}
