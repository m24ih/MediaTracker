# Media Tracker

A full-stack application for tracking your favorite media, featuring a Spring Boot backend, PostgreSQL database, Redis cache, Kafka messaging, and a React frontend.

## Architecture

*   **Backend:** Spring Boot (Java 21) application.
*   **Frontend:** React with TypeScript and Vite, styled using TailwindCSS.
*   **Database:** PostgreSQL for persistent data storage.
*   **Cache:** Redis for caching and temporary data.
*   **Message Broker:** Kafka for event-driven messaging.

## Prerequisites

*   [Docker](https://docs.docker.com/get-docker/) and [Docker Compose](https://docs.docker.com/compose/install/) installed.
*   (Optional) Node.js and npm for running the frontend locally outside of Docker.
*   (Optional) JDK 21 and Maven for running the backend locally outside of Docker.

## Running the Application

The entire application stack can be run easily using Docker Compose.

1.  Make sure Docker is running on your machine.
2.  From the root directory of the project, run:

    ```bash
    docker compose up --build
    ```

3.  The services will start on the following ports:
    *   **Frontend:** http://localhost:5173
    *   **Backend API:** http://localhost:8080
    *   **PostgreSQL:** localhost:5432
    *   **Redis:** localhost:6379
    *   **Kafka:** localhost:9092

4.  To stop the application, run:

    ```bash
    docker compose down
    ```

## Local Development

### Frontend

To run the frontend locally (useful for faster feedback during UI development):

1.  Navigate to the `frontend` directory:
    ```bash
    cd frontend
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Start the development server:
    ```bash
    npm run dev
    ```

### Backend

To run the backend locally, you still need the database, Redis, and Kafka running.

1.  Start only the infrastructure services:
    ```bash
    docker compose up postgres redis kafka
    ```
2.  Navigate to the `backend` directory and run the Spring Boot app (requires Maven):
    ```bash
    cd backend
    ./mvnw spring-boot:run
    ```
