# MediaTracker

MediaTracker is a modern, dark-themed web application designed to help you keep track of the movies and TV shows you've watched. With seamless integrations to popular tracking services, you can easily migrate your watch history and maintain a unified library without duplicate entries.

## 🚀 Features

- **Watch History Tracking:** Keep a detailed, chronological record of your watched movies and TV series.
- **Advanced Import System:**
  - **TV Time Support:** Import both series (`tracking-prod-records-v2.csv`) and movies (`tracking-prod-records.csv`) effortlessly.
  - **Yamtrack Support:** Migrate your Yamtrack history. The system intelligently detects and fixes incorrect Yamtrack date exports (e.g., using a movie's release date instead of the watch date).
- **Smart Duplicate Prevention:** Prevents multiple imports of the same episode or movie by comparing existing database records.
- **Local TMDB Caching:** To minimize dependency on the TMDB API, all fetched episode details are stored in a local database. Once a season's metadata is fetched, it is served directly from your local database in future requests, drastically improving speed and reducing API calls.
- **Modern UI:** Built with Angular, featuring a sleek, responsive dark mode interface with glassmorphism elements.

## 🛠️ Technology Stack

- **Backend:** Java, Spring Boot, Spring Data JPA
- **Frontend:** Angular 17+, TypeScript, SCSS
- **Database:** PostgreSQL / H2 (Configurable)
- **External APIs:** TMDB (The Movie Database) API

## 📂 Project Structure

- `/backend`: Contains the Spring Boot Java application.
  - Features a **Strategy Pattern** for the Import System (`ImportService`), allowing easy addition of new platforms like Letterboxd or Trakt in the future.
- `/frontend`: Contains the Angular standalone UI application.

## 📖 Documentation

For detailed technical setup and architecture, please refer to the specific module documentations:
- [Backend Documentation](./backend/README.md)
- [Frontend Documentation](./frontend/README.md)

## 📌 Usage Guidelines

- **Importing TV Time:** Navigate to Settings > Import. For series, upload `tracking-prod-records-v2.csv`. For movies, upload `tracking-prod-records.csv`.
- **Importing Yamtrack:** Navigate to Settings > Import and upload your Yamtrack CSV. Incomplete records (e.g., "Planning", "Dropped") are ignored by default to keep your history clean.

## 📜 License

This project is open-source and available for personal use and modifications.
