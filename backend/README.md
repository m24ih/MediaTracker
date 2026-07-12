# MediaTracker Backend

The backend of MediaTracker is a robust, modular REST API built using **Java 17** and **Spring Boot 3**. It handles the synchronization of watch history, TMDB metadata fetching, and intelligent duplicate prevention.

## 🏗️ Architecture & Patterns

- **Strategy Pattern for Imports:** The `ImportService` utilizes a strategy pattern with an `AbstractImporter` base class. 
  - Subclasses like `TvTimeImporter` and `YamtrackImporter` handle the logic specific to each platform's CSV structure.
  - Adding a new service (like Trakt or Letterboxd) only requires adding a new `*Importer` class that implements the base interface, leaving core logic untouched.
- **Local Episode Caching:** To avoid rate-limiting from TMDB and speed up the user experience, fetched episode lists (per season) are persistently saved into a local `episodes` database table. Future imports instantly resolve data directly from the local DB.
- **Deduplication:** A single media item (TV Show/Movie) and its specific episode are cached in an `ImportCache`. If the exact episode matches an existing history record with an identical timestamp (or within a timezone offset variance), it is safely skipped as a duplicate.

## 🛠️ Setup & Installation

### 1. Prerequisites
- **Java 17+** (Ensure your `JAVA_HOME` is set correctly)
- **Maven** (A Maven wrapper `./mvnw` is included in the project)
- A **PostgreSQL** or **H2** database (configured via `application.yml`)

### 2. Configuration & API Keys
Before running the application, you must provide your TMDB API credentials.
Navigate to `src/main/resources/application.yml` (or `application.properties`) and add the following lines:

```yaml
tmdb:
  api:
    key: "YOUR_TMDB_API_KEY_HERE"
    base-url: "https://api.themoviedb.org/3"
```
*Note: You can get a free TMDB API key by registering at [The Movie Database](https://www.themoviedb.org/).*

If you are using PostgreSQL, update your datasource configurations:
```yaml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/mediatracker
    username: your_db_username
    password: your_db_password
  jpa:
    hibernate:
      ddl-auto: update
```

### 3. Running the Application

You can start the Spring Boot server directly via Maven wrapper:

```bash
cd backend
./mvnw spring-boot:run
```
Alternatively, compile it into a jar and run it:
```bash
./mvnw clean package
java -jar target/backend-0.0.1-SNAPSHOT.jar
```

The backend server will run on `http://localhost:8080` (or whichever port is defined in your properties).

## 🗄️ Database Entities

- `User`: Handles authentication and ownership of watch history.
- `Media`: Represents a Movie or TV Show fetched from TMDB.
- `Episode`: Represents a cached TV episode. Linked to a `Media` entity.
- `WatchHistory`: The user's specific watch record, tracking date, platform source, and exact episode watched.

## 📡 Key Endpoints

- `POST /api/v1/import/csv` - Uploads a CSV to import watch history. Expects `file`, `username`, and `template` (e.g., `yamtrack`, `tvtime-v2`). Runs asynchronously.
- `GET /api/v1/import/status` - Polling endpoint for the frontend to render the progress bar during large imports.
