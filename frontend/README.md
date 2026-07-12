# MediaTracker Frontend

The frontend of MediaTracker is a modern Single Page Application (SPA) built with **Angular 17+** (using the new Standalone Components paradigm and `@for`/`@if` control flow syntax). It provides a sleek, dark-themed interface specifically designed for an immersive media tracking experience.

## 🎨 UI/UX & Design

- **Dark Mode First:** The application relies on a premium dark mode design system (`#0f0f1a` backgrounds, `#1e1e30` card surfaces) coupled with neon purple/blue gradients (`#7c3aed` to `#3b82f6`).
- **Glassmorphism:** Navigation sidebars and interactive cards utilize subtle transparency and backdrop-filters to provide a modern "frosted glass" aesthetic.
- **Smart Grouping:** The History view automatically groups TV shows into nested, expandable accordions (Show -> Season -> Episodes) while keeping Movies as flat records.

## 🛠️ Setup & Installation

### 1. Prerequisites
- **Node.js** (v18.0.0 or higher recommended)
- **NPM** (v9+ recommended)
- **Angular CLI** (`npm install -g @angular/cli`)

### 2. Installation
Navigate into the `frontend` directory and install the required npm dependencies:
```bash
cd frontend
npm install
```

### 3. API Proxy Configuration
By default, the Angular development server expects the backend to be running on `http://localhost:8080`. 
The API proxy is configured so that any requests going to `/api/v1/*` are automatically forwarded to the backend. You do not need to configure CORS for local development.

### 4. Running the Development Server
Run the following command to spin up the local development environment:
```bash
ng serve
```
Your application will be accessible at `http://localhost:4200/`. The page will automatically reload if you make changes to any source files.

## 📁 Project Structure

- `src/app/core`: Core singleton services (`AuthService`, `MediaService`, `ImportService`) and guards.
- `src/app/features`: Standalone routed components, organized by domain:
  - `auth`: Login/Register screens.
  - `dashboard`: Quick stats and latest history grid.
  - `discover`: TMDB-powered media search.
  - `history`: Timeline of all watched items with accordion collapsing for TV shows.
  - `settings`: CSV Import handling with real-time polling progress bars.
- `src/app/shared/layout`: Layout components like the main Sidebar.
- `src/styles.scss`: Global CSS resets, fonts (Inter), custom CSS properties, and shared animations.

## 🚀 Building for Production

To compile the application for production deployment, run:
```bash
ng build --configuration production
```
The build artifacts will be stored in the `dist/` directory, ready to be served by Nginx, Apache, or any static hosting provider.
