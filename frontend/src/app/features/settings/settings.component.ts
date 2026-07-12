import { Component, signal, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from '../../shared/layout/sidebar.component';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, SidebarComponent, FormsModule],
  template: `
    <div class="layout">
      <app-sidebar />
      <div class="main-content">
        <header class="page-header">
          <h1>Settings</h1>
        </header>

        <div class="settings-container">
          <aside class="settings-sidebar">
            <nav class="settings-nav">
              <button [class.active]="activeTab() === 'profile'" (click)="activeTab.set('profile')">Profile</button>
              <button [class.active]="activeTab() === 'dashboard'" (click)="activeTab.set('dashboard')">Dashboard</button>
              <button [class.active]="activeTab() === 'security'" (click)="activeTab.set('security')">Login & Password</button>
              <button [class.active]="activeTab() === 'privacy'" (click)="activeTab.set('privacy')">Privacy</button>
              <button [class.active]="activeTab() === 'import'" (click)="activeTab.set('import')">Import</button>
              <button [class.active]="activeTab() === 'pro'" (click)="activeTab.set('pro')" class="pro-btn">PRO Settings</button>
            </nav>
          </aside>

          <section class="settings-content">
            
            @if (activeTab() === 'import') {
              <div class="tab-pane">
                <h2>Import your watch history</h2>
                <p class="subtitle">Import your watch history from external services like TV Time or Yamtrack.</p>
                
                <div class="import-grid">
                  <div class="import-card" (click)="triggerFileInput('tvtime-v2')">
                    <span class="icon">📺</span>
                    <h3>TV Time (Series)</h3>
                    <p>tracking-prod-records-v2.csv</p>
                  </div>
                  <div class="import-card" (click)="triggerFileInput('tvtime-movies')">
                    <span class="icon">🎬</span>
                    <h3>TV Time (Movies)</h3>
                    <p>tracking-prod-records.csv</p>
                  </div>
                  <div class="import-card" (click)="triggerFileInput('yamtrack')">
                    <span class="icon">📊</span>
                    <h3>Yamtrack</h3>
                    <p>Import Yamtrack CSV</p>
                  </div>
                </div>

                <input type="file" #fileInput style="display: none" accept=".csv" (change)="onFileSelected($event)">

                @if (isUploading()) {
                  <div class="upload-status mt-8">
                    <span class="spinner"></span>
                    <p>Uploading file and initiating import...</p>
                  </div>
                }

                @if (importStatus() && importStatus()?.isRunning) {
                  <div class="upload-status mt-8" style="flex-direction: column; align-items: flex-start; gap: 8px;">
                    <div style="display: flex; align-items: center; gap: 16px;">
                      <span class="spinner"></span>
                      <p>Importing data in background... ({{ importStatus()?.processed }} / {{ importStatus()?.total }})</p>
                    </div>
                    <div style="width: 100%; height: 6px; background: rgba(255,255,255,0.1); border-radius: 4px; overflow: hidden;">
                      <div style="height: 100%; background: var(--accent-purple); transition: 0.3s;" 
                           [style.width.%]="importStatus()?.total > 0 ? ((importStatus()?.processed / importStatus()?.total) * 100) : 0"></div>
                    </div>
                  </div>
                }
                
                @if (uploadResult()) {
                  <div class="upload-success mt-8">
                    <p>✅ {{ uploadResult() }}</p>
                    <button class="btn-primary mt-4" (click)="uploadResult.set(null)">Clear</button>
                  </div>
                }

                <div class="mt-8">
                  <h3>Import History</h3>
                  @if (batches().length === 0) {
                    <p class="text-muted">No import batches found.</p>
                  } @else {
                    <table class="batch-table mt-4">
                      <thead>
                        <tr>
                          <th>Batch ID</th>
                          <th>Items</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        @for (batch of batches(); track batch[0]) {
                          <tr>
                            <td>{{ batch[0] }}</td>
                            <td>{{ batch[1] }}</td>
                            <td>
                              <button class="btn-danger" (click)="rollbackBatch(batch[0])">Rollback</button>
                            </td>
                          </tr>
                        }
                      </tbody>
                    </table>
                  }
                </div>
              </div>
            } @else {
              <div class="tab-pane empty">
                <p>Content for {{ activeTab() }} goes here...</p>
              </div>
            }
          </section>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page-header { margin-bottom: 32px; }
    h1 { font-size: 2rem; font-weight: 700; color: #fff; }
    
    .settings-container { display: flex; gap: 32px; align-items: flex-start; }
    
    .settings-sidebar {
      width: 240px; background: var(--bg-card); border: 1px solid var(--border-light);
      border-radius: 12px; padding: 16px 0; flex-shrink: 0;
    }
    
    .settings-nav { display: flex; flex-direction: column; }
    .settings-nav button {
      background: transparent; border: none; color: var(--text-muted);
      text-align: left; padding: 12px 24px; font-size: 1rem; cursor: pointer; transition: 0.2s;
    }
    .settings-nav button:hover { background: rgba(255, 255, 255, 0.05); color: #fff; }
    .settings-nav button.active { background: rgba(124, 58, 237, 0.1); color: #c4b5fd; border-left: 3px solid var(--accent-purple); }
    .pro-btn { color: #f59e0b !important; font-weight: 600; }
    
    .settings-content {
      flex: 1; background: var(--bg-card); border: 1px solid var(--border-light);
      border-radius: 12px; padding: 32px; min-height: 500px;
    }
    
    h2 { font-size: 1.5rem; color: #fff; margin-bottom: 8px; }
    h3 { font-size: 1.25rem; color: #fff; }
    .subtitle { color: var(--text-muted); margin-bottom: 32px; }
    .text-muted { color: var(--text-muted); }
    .mt-4 { margin-top: 16px; }
    .mt-8 { margin-top: 32px; }
    
    .import-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 20px; }
    .import-card { border: 1px solid var(--border-light); border-radius: 8px; padding: 24px; text-align: center; cursor: pointer; transition: 0.2s; background: rgba(0, 0, 0, 0.2); }
    .import-card:hover { border-color: rgba(124, 58, 237, 0.4); background: rgba(124, 58, 237, 0.05); }
    .import-card .icon { font-size: 2.5rem; display: block; margin-bottom: 12px; }
    
    .btn-primary { padding: 10px 20px; background: var(--accent-purple); border: none; color: #fff; border-radius: 6px; cursor: pointer; font-weight: 600; }
    .btn-danger { padding: 6px 12px; background: #ef4444; border: none; color: #fff; border-radius: 4px; cursor: pointer; font-weight: 600; font-size: 0.85rem; }
    .btn-danger:hover { background: #dc2626; }
    
    .upload-status { display: flex; align-items: center; gap: 16px; padding: 16px; background: rgba(59, 130, 246, 0.1); border: 1px solid rgba(59, 130, 246, 0.3); border-radius: 8px; color: #93c5fd; }
    .upload-success { padding: 16px; background: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.3); border-radius: 8px; color: #6ee7b7; }
    
    .batch-table { width: 100%; border-collapse: collapse; margin-top: 16px; color: #f1f5f9; text-align: left; }
    .batch-table th, .batch-table td { padding: 12px; border-bottom: 1px solid rgba(255, 255, 255, 0.1); }
    .batch-table th { color: #94a3b8; font-weight: 500; }
    
    .empty { display: flex; justify-content: center; align-items: center; height: 300px; color: var(--text-muted); }
  `]
})
export class SettingsComponent implements OnInit, OnDestroy {
  activeTab = signal('import');
  
  selectedTemplate = '';
  isUploading = signal(false);
  uploadResult = signal<string | null>(null);
  batches = signal<any[]>([]);
  
  importStatus = signal<any>(null);
  private statusInterval: any;

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.loadBatches();
    this.checkInitialStatus();
  }

  ngOnDestroy() {
    if (this.statusInterval) clearInterval(this.statusInterval);
  }

  checkInitialStatus() {
    this.http.get<any>('/api/v1/import/status').subscribe(res => {
      if (res && res.isRunning) {
        this.importStatus.set(res);
        this.startPollingStatus();
      }
    });
  }

  startPollingStatus() {
    if (this.statusInterval) clearInterval(this.statusInterval);
    this.statusInterval = setInterval(() => {
      this.http.get<any>('/api/v1/import/status').subscribe({
        next: (res) => {
          this.importStatus.set(res);
          if (res && res.isRunning === false) {
            clearInterval(this.statusInterval);
            this.loadBatches();
            if (res.processed > 0) {
              this.uploadResult.set('Import finished! Processed ' + res.processed + ' records.');
            }
          }
        },
        error: () => {
          clearInterval(this.statusInterval);
        }
      });
    }, 1500);
  }

  loadBatches() {
    this.http.get<any[]>('/api/v1/import/batches').subscribe({
      next: (res) => this.batches.set(res),
      error: (err) => console.error('Failed to load batches', err)
    });
  }

  triggerFileInput(template: string) {
    this.selectedTemplate = template;
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    if (fileInput) fileInput.click();
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      this.uploadFile(file, this.selectedTemplate);
      input.value = '';
    }
  }

  uploadFile(file: File, template: string) {
    this.isUploading.set(true);
    this.uploadResult.set(null);
    this.importStatus.set(null);
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('template', template);

    this.http.post('/api/v1/import/csv', formData, { responseType: 'text' }).subscribe({
      next: (res) => {
        this.isUploading.set(false);
        // Start tracking background import
        this.startPollingStatus();
      },
      error: (err) => {
        this.isUploading.set(false);
        this.uploadResult.set('Error uploading file: ' + err.message);
      }
    });
  }

  rollbackBatch(batchId: string) {
    if (!confirm('Are you sure you want to rollback this import? All watch history items created in this batch will be removed.')) return;
    
    this.http.delete('/api/v1/import/batches/' + batchId, { responseType: 'text' }).subscribe({
      next: () => {
        this.uploadResult.set('Batch rolled back successfully.');
        this.loadBatches();
      },
      error: (err) => {
        alert('Failed to rollback batch: ' + err.message);
      }
    });
  }
}
