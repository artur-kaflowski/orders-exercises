# Orders Management System

A full-stack application for managing orders, built with Spring Boot, ES6, lit-element, and lion components.

## Project Structure

The project consists of two main parts:

1. **Backend**: A Spring Boot application with REST API endpoints for managing orders
2. **Frontend**: A modern web application built with ES6, lit-element, and lion components

## Prerequisites

- Java 17 or higher
- Node.js 16 or higher
- npm 8 or higher
- PostgreSQL database

## Getting Started

### Clone the repository

```bash
git clone <repository-url>
cd orders_exercise
```

### Database Setup

1. Make sure PostgreSQL is running
2. Create a database named `orders_exercises_service_db`
3. Update the database configuration in `src/main/resources/application.properties` if needed

### Build and Run

The project uses Gradle as the build tool, which will automatically build both the backend and frontend.

```bash
# Build the project
./gradlew build

# Run the application
./gradlew bootRun
```

The application will be available at http://localhost:8080

## Development

### Backend Development

The backend is a Spring Boot application with the following components:

- **Controllers**: REST API endpoints in `src/main/java/com/example/orders_exercise/controller`
- **Services**: Business logic in `src/main/java/com/example/orders_exercise/service`
- **Repositories**: Data access in `src/main/java/com/example/orders_exercise/repository`
- **Entities**: Domain models in `src/main/java/com/example/orders_exercise/entity`
- **DTOs**: Data transfer objects in `src/main/java/com/example/orders_exercise/dto`

### Frontend Development

The frontend is built with modern web technologies:

- **ES6**: Modern JavaScript
- **lit-element**: Web components library
- **lion**: UI components library

To work on the frontend separately:

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

The frontend development server will be available at http://localhost:8081 and will proxy API requests to the backend.

## Testing

The project includes integration tests written in Groovy with Spock framework.

```bash
# Run tests
./gradlew test
```

## Building for Production

```bash
./gradlew build
```

This will create a self-contained JAR file in the `build/libs` directory that can be deployed to any environment.

## Docker

A Docker Compose file is provided for local development:

```bash
# Start the Docker containers
docker-compose -f docker-compose-local.yml up -d
```

This will start PostgreSQL and Kafka containers for local development.
