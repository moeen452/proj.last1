# STARTUP MANAGEMENT — Backend

This repository contains the backend API for a startup discovery and community app.
It is built with Node.js, Express, and Prisma, and supports the main app features described in the mobile app documentation.

## Application Overview

The backend provides the following core capabilities:

- Authentication and user management
- Startup discovery and search
- Startup details and profile pages
- Favorites and followings
- Notifications management
- Hub content: events, trainings, jobs
- Profile settings and user data
- Interactive workflows: investments, consultation bookings, event/job/training registration
- Support messages and inquiries

## Main Features

1. **Auth**
   - User login and registration
   - JWT or token-based authentication

2. **Explore / Startups**
   - Paginated startup listings
   - Featured startups
   - Categories and search filtering
   - Startup details by slug or ID

3. **Favorites / Following**
   - Follow startup
   - Add/remove favorites
   - Retrieve current user's favorite startups

4. **Notifications**
   - Get user-specific notifications
   - Mark notifications as read
   - Delete notifications

5. **Hub**
   - List events, trainings, jobs
   - Register for events and trainings
   - Apply for jobs

6. **Interactive Actions**
   - Invest in startups
   - Book consultation slots
   - Register applications in hub workflows

## Project Structure

- `src/app.js` — main Express application
- `src/server.js` — server startup entry point
- `src/modules/` — application modules grouped by domain
- `src/common/` — shared middleware and utilities
- `prisma/` — database schema and migrations
- `APP_DOCUMENTATION.md` — app contract and feature documentation

## How to Run

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set environment variables in `.env` (example):
   ```env
   PORT=3000
   NODE_ENV=development
   FRONTEND_URL=http://localhost:3000
   DATABASE_URL="file:./prisma/dev.db"
   ```

3. Run database migrations:
   ```bash
   npx prisma migrate dev
   ```

4. Start the server in development mode:
   ```bash
   npm run dev
   ```

## Notes

- The backend is already wired to `/api/v1/auth` and `/api/v1/audience` routes.
- Error handling is centralized in `src/app.js`.
- The project uses Prisma ORM and supports future extensions like Bull queues, events, and socket integrations.

## Push and Repository

This project has been uploaded to the remote repository configured at `origin`.
Changes include the backend implementation, documentation, and API wiring.
