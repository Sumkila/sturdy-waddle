# Lumani — School Management System

A production-quality, backend-agnostic React frontend for modern school administration, daily attendance registers, academic gradebooks, and role-based access control.

This application is decoupled from any single backend implementation: no backend URL, endpoint path, DTO structure, role name, or error string is hard-coded into feature components. Connecting to a new backend requires only updating environment variables and the integration adapter.

---

## Key Features

- **Authentication & RBAC**:
  - JWT token storage with session expiration interceptors.
  - Role-based route guards and action visibility (Admin, Principal, Teacher, Parent, Student).
  - Quick-switch demo logins for rapid testing.
- **Student Management**:
  - Full student directory with faceted filters (grade, classroom, gender, status).
  - Student profile tabs: Overview, Attendance Log, and Academic Results.
  - Student enrollment, status updates, and soft-delete/deactivation confirmation.
- **Daily Attendance Registers**:
  - Classroom and Date selector with quick "Mark All Present" shortcut.
  - Status tracking: `PRESENT`, `ABSENT`, `LATE`, `EXCUSED` with optional remarks.
  - Bulk register submission (`/students/attendance/bulk`).
  - Institutional summary analytics with presence rate benchmarks.
- **Academic Results & Gradebook**:
  - Evaluator scoring, grade pass/fail badges, and remarks.
  - Role-restricted edit and delete capabilities.
  - Student and Parent read-only views.
- **Faculty & Guardians**:
  - Teacher department directory and subject instructor assignments.
  - Parent/guardian records with URL-encoded email and phone lookups.
- **Curriculum & Subjects**:
  - Course code administration, syllabus overviews, and grade levels.
- **Role-Tailored Dashboards**:
  - Executive stats for Administrators and Principals.
  - Class schedule and attendance shortcuts for Teachers.
  - Multi-child progress monitoring for Parents.
  - Personal gradebook and attendance reports for Students.

---

## Tech Stack

- **Framework**: React 19 + TypeScript
- **Build Tool**: Vite 8
- **Routing**: React Router 7
- **Network Client**: Axios
- **Server State & Caching**: TanStack Query v5
- **Forms & Validation**: React Hook Form + Zod
- **Styling**: Tailwind CSS v4
- **Icons**: Lucide React
- **Testing**: Vitest + React Testing Library + JSDOM

---

## Project Structure

```
school-frontend-template/
├── README.md
├── .env.example
├── vitest.config.ts
├── docs/
│   ├── BACKEND_INTEGRATION.md
│   ├── API_CONTRACT.md
│   ├── ROLES_AND_PERMISSIONS.md
│   ├── CUSTOMIZATION.md
│   └── TROUBLESHOOTING.md
├── public/
│   └── favicon.svg
└── src/
    ├── main.tsx
    ├── App.tsx
    ├── config/
    │   ├── appConfig.ts
    │   ├── navigationConfig.ts
    │   └── permissionsConfig.ts
    ├── api/
    │   ├── httpClient.ts
    │   ├── endpoints.ts
    │   ├── apiAdapter.ts
    │   ├── errorMapper.ts
    │   └── services/
    ├── auth/
    │   ├── AuthProvider.tsx
    │   ├── useAuth.ts
    │   ├── ProtectedRoute.tsx
    │   ├── RoleGuard.tsx
    │   └── tokenStorage.ts
    ├── components/
    │   ├── layout/
    │   ├── ui/
    │   ├── forms/
    │   ├── tables/
    │   └── feedback/
    ├── features/
    │   ├── auth/
    │   ├── dashboard/
    │   ├── students/
    │   ├── attendance/
    │   ├── results/
    │   ├── subjects/
    │   ├── teachers/
    │   └── parents/
    ├── hooks/
    ├── lib/
    ├── routes/
    ├── types/
    └── utils/
```

---

## Getting Started

### 1. Prerequisites
- Node.js 18+
- npm 9+

### 2. Installation
```bash
npm install
```

### 3. Environment Setup
Copy the example environment configuration:
```bash
cp .env.example .env
```
Default configuration connects to the reference Spring Boot API at `http://localhost:8080`:
```env
VITE_API_URL=http://localhost:8080
VITE_API_PREFIX=/api
VITE_APP_NAME=Lumani
VITE_AUTH_TOKEN_KEY=app_token
VITE_AUTH_ROLE_KEY=app_role
```

### 4. Running the Development Server
```bash
npm run dev
```
The application will start on `http://localhost:3000`.

### 5. Running Tests
```bash
npm run test
```

---

## Role & Capability Matrix

| Capability | Admin | Principal | Teacher | Parent | Student |
|---|:---:|:---:|:---:|:---:|:---:|
| View Dashboard | Yes | Yes | Yes | Yes | Yes |
| Enroll Student | Yes | Yes | No | No | No |
| Edit Student | Yes | Yes | No | No | No |
| Deactivate Student | Yes | Yes | No | No | No |
| View All Students Directory | Yes | Yes | Yes | No | No |
| Mark Attendance | Yes | Yes | Yes | No | No |
| View Attendance | Yes | Yes | Yes | Own Children | Own Record |
| Create Grade / Result | Yes | No | Yes | No | No |
| Edit Grade / Result | Yes | Yes | No | No | No |
| Delete Grade / Result | Yes | No | No | No | No |
| Manage Subjects | Yes | Yes | No | No | No |
| Manage Teachers | Yes | View/Edit | No | No | No |
| Manage Parents | Yes | Yes | No | Own Profile | No |

---

## Connecting Your Own Backend

To connect any compatible REST API without modifying UI pages:
1. Update `VITE_API_URL` and `VITE_API_PREFIX` in `.env`.
2. Map route paths in `src/api/endpoints.ts`.
3. Align TypeScript interfaces in `src/types/`.
4. Adjust DTO translation in `src/api/apiAdapter.ts`.
5. Verify CORS and error schemas.

For step-by-step instructions, see [`docs/BACKEND_INTEGRATION.md`](docs/BACKEND_INTEGRATION.md).

---

## Documentation Links

- [Backend Integration Guide](docs/BACKEND_INTEGRATION.md)
- [API Contract Specification](docs/API_CONTRACT.md)
- [Roles & Permissions Matrix](docs/ROLES_AND_PERMISSIONS.md)
- [Customization & Extensibility](docs/CUSTOMIZATION.md)
- [Troubleshooting & Diagnostics](docs/TROUBLESHOOTING.md)
