# Roles and Permissions Matrix

This document defines the Role-Based Access Control (RBAC) architecture of the Lumani school management frontend.

---

## 1. System Roles

The system supports 5 standard user roles:

1. **`ADMIN`**: School System Administrator. Full administrative privileges across all modules, configuration, and destructive operations.
2. **`PRINCIPAL`**: School Principal / Academic Director. Full academic oversight, student enrollment, faculty view, and result editing.
3. **`TEACHER`**: Teaching Faculty. Access to assigned student rosters, daily attendance marking, and grade entries.
4. **`PARENT`**: Parent or Legal Guardian. Restricted to viewing their linked children's attendance, reports, and updating their guardian contact profile.
5. **`STUDENT`**: Enrolled Student. Restricted to personal attendance records, personal grade reports, and basic profile details.

---

## 2. Product Capability Matrix

| Capability | Admin | Principal | Teacher | Parent | Student |
|---|:---:|:---:|:---:|:---:|:---:|
| **View Dashboard** | Yes | Yes | Yes | Yes | Yes |
| **Enroll Student** | Yes | Yes | No | No | No |
| **Edit Student** | Yes | Yes | No | No | No |
| **Deactivate Student** | Yes | Yes | No | No | No |
| **View All Students Directory** | Yes | Yes | Yes | No | No |
| **View Own Children** | No | No | No | Yes | No |
| **View Own Record** | No | No | No | No | Yes |
| **Mark Daily Attendance** | Yes | Yes | Yes | No | No |
| **View Attendance Registers** | Yes | Yes | Yes | Own children | Own record |
| **Create / Record Grade** | Yes | No | Yes | No | No |
| **Edit Academic Result** | Yes | Yes | No | No | No |
| **Delete Academic Result** | Yes | No | No | No | No |
| **Manage Curriculum / Subjects** | Yes | Yes | No | No | No |
| **Manage Faculty Teachers** | Yes | View/Edit | No | No | No |
| **Manage Parents / Guardians** | Yes | Yes | No | Own Profile | No |

---

## 3. Implementation in Frontend Code

### Configuration File: `src/config/permissionsConfig.ts`
All capability arrays and helper predicates are centralized:
```typescript
import { hasPermission } from '../config/permissionsConfig';

if (hasPermission(role, 'CREATE_STUDENT')) {
  // Render enrollment action
}
```

### Route-Level Enforcement: `<ProtectedRoute>`
Protects URL routes and redirects unauthorized roles to `/unauthorized`:
```tsx
<Route
  path="/students/new"
  element={
    <ProtectedRoute requiredCapability="CREATE_STUDENT">
      <StudentFormPage />
    </ProtectedRoute>
  }
/>
```

### Component-Level Action Guards: `<RoleGuard>`
Conditionally renders buttons, action links, or toolbars:
```tsx
<RoleGuard capability="DELETE_RESULT">
  <Button variant="danger" onClick={handleDelete}>Delete</Button>
</RoleGuard>
```

---

## 4. Crucial Security Notice: Backend as Source of Truth

> [!WARNING]
> Client-side permission checks and conditional button hiding are **UX conveniences**, not security boundaries.
>
> The backend REST server is the sole authoritative enforcement point. If a malicious client constructs an unauthorized HTTP request directly, the backend must respond with HTTP `403 Forbidden`. The frontend client intercepts this and surfaces an accessible error without crashing.

---

## 5. Known Backend Inconsistencies & Workarounds

1. **Spring Boot Authority Prefix**:
   - Spring Security often prefixes roles with `ROLE_` (e.g. `ROLE_ADMIN`).
   - The frontend's `auth.service.ts` automatically strips the prefix so it cleanly matches `ADMIN`.
2. **Attendance Route Nesting**:
   - In the reference API, attendance endpoints are nested under `/students/attendance/...` rather than `/attendance/...`. The endpoint map in `src/api/endpoints.ts` mirrors this structure.
3. **Immutable Results Update Endpoint**:
   - The reference backend's `PUT /results/{id}` may return the unmodified record. The frontend implements the update flow cleanly and warns the operator neutrally if the backend leaves the data intact.
