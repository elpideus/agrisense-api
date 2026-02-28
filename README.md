# Agrisense API

Agrisense API is the backend service for the Agrisense application, built with NestJS and Prisma, integrating with Supabase for data management and authentication.

## Prerequisites

- Docker and Docker Compose
- Node.js (for local development without Docker)

## Running the Application with Docker

The application is fully containerized. The root `docker-compose.yml` orchestrates both this API and the Supabase project.

1. **Start the services**:
   Run the following command from the root workspace directory (where the `docker-compose.yml` is located):
   ```bash
   docker compose up -d
   ```

2. **Database Seeding**:
   The API container includes a conditional seeding script. When the environment variable `SEED=true` is provided (which is set by default in the `docker-compose.yml`), the container will automatically run the mock database seed script the first time it spins up before starting the main NestJS server.

   You can also manually trigger a seed via:
   ```bash
   docker compose exec api npm run db:seed
   ```

3. **Accessing the API**:
   The API will be accessible at `http://localhost:3000`.

   *Note: For security reasons, the Supabase PostgreSQL database, Kong API Gateway, and Supavisor connection pooler do not expose any ports to the host machine. They are only accessible internally via the Docker bridge network to protect the data.*

## Local Development

If you wish to run the app without Docker:
1. Install dependencies: `npm install`
2. Start the development server: `npm run start:dev`
3. Ensure `.env` is configured correctly with `DATABASE_URL` pointing to an accessible PostgreSQL instance.
