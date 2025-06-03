# Orders Management System

Application for managing orders, built with Spring Boot, ES6, lit-element, and lion components.

## Project Structure

The project consists of two main parts:

1. **Backend**: A Spring Boot application with REST API endpoints for managing orders
2. **Frontend**: A modern web application built with ES6, lit-element, and lion components

## Prerequisites

- Java 17 or higher
- Node.js 16 or higher
- npm 8 or higher
- PostgreSQL database
- Docker
- Kafka

## Getting Started

## Docker

A Docker Compose file is provided to run the entire application:

```bash
# Start the Docker containers
docker-compose -f docker-compose-local.yml up -d
```

This will:
1. Build and start the Spring Boot application with the frontend
2. Start PostgreSQL database
3. Start Kafka and Zookeeper

The application will be available at http://localhost:8080

You can view logs from the application container:

```bash
docker logs -f orders-exercise-service
```

To stop all containers:

```bash
docker-compose -f docker-compose-local.yml down
```


### Build and Run

The project uses Gradle as the build tool, which will automatically build both the backend and frontend.

```bash
# Build the project
./gradlew build

# Run the application
./gradlew bootRun
```

The server application will be available at http://localhost:8080


To work on the frontend separately:

```bash
# Install dependencies
npm install

# Start development server
npm start
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
