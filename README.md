# Recruitment and Workforce Management Platform

A MERN application for managing job listings, candidate applications, applicant progress, interviews, and recruiter/admin activity.

## 1. Project Overview

The platform connects candidates with published jobs and gives recruiters and administrators tools to manage hiring workflows. The frontend and backend are maintained in separate `client/` and `server/` projects.

## 2. Features

- Register and sign in with role-aware access.
- Create, edit, publish, close, and manage jobs.
- Search and filter jobs, with pagination.
- Apply to published jobs and view personal applications.
- Search and filter applicants by candidate name/email and application status; review paginated results and details.
- Track application status: `APPLIED`, `SHORTLISTED`, `REJECTED`, or `HIRED`.
- Schedule and manage interviews; candidates can view their interviews.
- View recruiter-specific or platform-wide dashboard statistics.

## 3. Tech Stack

- **Frontend:** React, Vite, React Router, Axios, Tailwind CSS
- **Backend:** Node.js, Express
- **Database:** MongoDB, Mongoose
- **Authentication:** bcryptjs password hashing and JWTs in HTTP-only cookies
- **Validation:** express-validator and Mongoose schema validation

## 4. User Roles and Permissions

- **CANDIDATE:** Browse published jobs, apply once per job, view personal applications and interviews.
- **RECRUITER:** Create jobs and manage their own jobs and their applicants; schedule and manage interviews for those jobs; view their own dashboard statistics.
- **ADMIN:** Manage all jobs, applications, and interviews; view platform-wide dashboard statistics.

Public registration always creates a `CANDIDATE` account. Privileged roles are not selectable during registration.

## 5. Main Application Workflow

1. A candidate registers and signs in.
2. Recruiters or admins create job listings, which start as drafts, then publish them.
3. Candidates search published jobs and submit applications.
4. Recruiters or admins review applicants, update application statuses, and view applicant details.
5. Recruiters or admins schedule interviews. Candidates can view interviews associated with their applications.
6. Recruiters and admins review hiring activity on their respective dashboards.

## 6. Authentication and Authorization

The API hashes passwords with bcryptjs and issues JWTs in HTTP-only cookies. Axios sends cookies with requests; the client does not store JWTs in local storage. On startup, the client checks `/api/auth/me` to restore the current user. Backend `protect` and role authorization middleware secure protected endpoints, with recruiter ownership enforced for job-related operations.

## 7. Database Models

- **User:** name, unique email, hashed password, role (`ADMIN`, `RECRUITER`, `CANDIDATE`), timestamps.
- **Job:** title, description, department, location, employment type, experience required, salary range, skills, status (`DRAFT`, `PUBLISHED`, `CLOSED`), creator reference, timestamps.
- **Application:** job and candidate references, optional cover letter, status (`APPLIED`, `SHORTLISTED`, `REJECTED`, `HIRED`), timestamps. A unique compound index prevents duplicate applications to the same job.
- **Interview:** application and scheduler references, date/time, duration, mode (`ONLINE`, `IN_PERSON`), meeting link or location, notes, status (`SCHEDULED`, `COMPLETED`, `CANCELLED`), timestamps.

## 8. Main REST API Endpoints

All endpoints are prefixed with `/api`. Protected endpoints require the authentication cookie.

| Area | Endpoint | Purpose |
|---|---|---|
| Authentication | `POST /auth/register`, `POST /auth/login`, `POST /auth/logout`, `GET /auth/me` | Account registration and session management |
| Jobs | `GET /jobs`, `GET /jobs/:id` | Browse jobs and job details |
| Jobs | `POST /jobs`, `PUT /jobs/:id`, `DELETE /jobs/:id` | Create and manage permitted jobs |
| Jobs | `PATCH /jobs/:id/publish`, `PATCH /jobs/:id/close` | Change job status |
| Applications | `POST /applications`, `GET /applications/my` | Apply to a job and view candidate's own applications |
| Applications | `GET /applications/job/:jobId`, `GET /applications/:id`, `PATCH /applications/:id/status` | Review and track applicants |
| Interviews | `POST /interviews`, `GET /interviews/my`, `GET /interviews/job/:jobId` | Schedule and view permitted interviews |
| Interviews | `PUT /interviews/:id`, `PATCH /interviews/:id/cancel` | Update or cancel an interview |
| Dashboards | `GET /dashboard/recruiter`, `GET /dashboard/admin` | View role-specific hiring statistics |
| Health | `GET /health` | API health check |

Job listing supports title search, location, department, employment type, status where permitted, and pagination. Applicant listing supports candidate name/email search, status filtering, and pagination.

## 9. Project Structure

```text
client/
  src/
    api/          Axios client and API functions
    components/   Reusable UI components
    context/      Authentication context
    pages/        Application pages
    routes/       Protected route component
server/
  src/
    config/       Database connection
    controllers/  HTTP request handlers
    middleware/   Authentication, authorization, validation, errors
    models/       Mongoose models
    routes/       REST API routes
    services/     Business logic
    utils/        Shared utilities
```

## 10. Local Setup and Running

**Requirements:** Node.js, npm, and a running local MongoDB instance.

1. Configure the backend environment:

   ```bash
   cd server
   npm install
   ```

   Copy `.env.example` to `.env`, then set `MONGO_URI` to your local MongoDB connection string and replace `JWT_SECRET` with a development secret. The example uses port `5001` and the client origin `http://localhost:5173`.

2. Start the backend:

   ```bash
   npm run dev
   ```

3. In another terminal, install and start the frontend:

   ```bash
   cd client
   npm install
   npm run dev
   ```

   Open the Vite URL shown in the terminal (by default `http://localhost:5173`). The Vite development server proxies `/api` requests to the backend at `http://localhost:5001`.

To create a production frontend bundle, run `npm run build` from `client/`.
