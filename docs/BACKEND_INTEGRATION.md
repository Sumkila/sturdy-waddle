# Backend Integration Guide

This application is built with a strictly decoupled integration architecture. No backend URL, endpoint path, DTO structure, role string, or error layout is hard-coded into feature components.

Follow this 10-step checklist to connect your own REST API (e.g., Spring Boot, Django, Express, ASP.NET Core, Laravel, Go Gin).

---

## 1. Configure the Base URL

In your environment file (`.env`):

```env
# Base URL of your backend REST service (no trailing slash)
VITE_API_URL=http://localhost:8080

# Optional common prefix applied to all API routes
VITE_API_PREFIX=/api
```

The app computes the active base URL inside `src/config/appConfig.ts`:
```ts
export const appConfig = {
  apiUrl: import.meta.env.VITE_API_URL,
  apiPrefix: import.meta.env.VITE_API_PREFIX,
  fullApiBaseUrl: `${cleanApiUrl}${cleanApiPrefix}`,
  ...
};
```

---

## 2. Update Endpoint Paths in `src/api/endpoints.ts`

All endpoints are registered in `src/api/endpoints.ts`. If your backend organizes routes differently (for example, using `/attendance` instead of `/students/attendance`):

```typescript
export const endpoints = {
  auth: {
    login: '/auth/token',           // Change path as needed
    register: '/auth/signup',
  },
  students: {
    list: '/v1/students',
    byId: (id: string) => `/v1/students/${encodeURIComponent(id)}`,
    ...
  },
};
```

---

## 3. Align TypeScript Types in `src/types/`

Inspect your backend DTOs and adjust the TypeScript interfaces:
- `src/types/student.ts` (e.g. rename `studentNumber` to `matriculationNumber` or `rollNumber` if needed).
- `src/types/attendance.ts` (e.g. adjust allowed statuses).
- `src/types/result.ts` (e.g. score, grade, remarks).
- `src/types/auth.ts` (e.g. token and profile response payload).

---

## 4. Adapt Payload Shapes in `src/api/apiAdapter.ts`

`src/api/apiAdapter.ts` is the single adapter layer that converts frontend objects to backend payloads and normalizes responses.

For example, if your backend returns wrapped responses like `{ status: 'success', result: { ... } }`:

```typescript
async getStudents(filters?: StudentFilters): Promise<Student[]> {
  const query = buildQueryString(filters);
  const response = await httpClient.get<BackendEnvelope<Student[]>>(`${endpoints.students.list}${query}`);
  return response.result;
}
```

---

## 5. Map Authentication & Tokens

In `src/api/httpClient.ts`, the default request interceptor attaches tokens as:
```http
Authorization: Bearer <token>
```
If your backend expects a custom header (e.g. `X-Auth-Token: <token>`) or cookie-based sessions:
1. Update `src/api/httpClient.ts` request interceptor.
2. Update `src/auth/tokenStorage.ts` if switching to HttpOnly cookies or memory storage.

---

## 6. Configure Role Mappings & Permissions

Roles in this frontend default to:
`ADMIN`, `PRINCIPAL`, `TEACHER`, `PARENT`, `STUDENT`.

If your backend returns Spring Security authorities (e.g., `ROLE_ADMINISTRATOR` or `STAFF`):
1. Update `UserRole` in `src/types/auth.ts`.
2. Update the role parsing helper in `src/api/services/auth.service.ts`:
   ```typescript
   const cleanRole = rawRole.replace('ROLE_', '');
   ```
3. Update `permissionMatrix` in `src/config/permissionsConfig.ts`.

---

## 7. Verify Form Validation Schemas

Check `src/utils/validation.ts` to ensure frontend Zod validation rules match your backend's constraints (such as minimum password length, phone formats, or student ID patterns).

---

## 8. Error Response Normalization

Ensure your backend's error structure is handled by `src/api/errorMapper.ts`. The error mapper currently normalizes:
- Spring Boot `MethodArgumentNotValidException` field errors (`data.errors: [{ field, defaultMessage }]`).
- RFC-7807 Problem Details (`{ detail, status, fieldErrors: { ... } }`).
- Flat key-value validation error maps (`{ email: "already in use" }`).

If your API uses a different error envelope, update `src/api/errorMapper.ts` without touching any UI component.

---

## 9. Enable CORS on the Backend

Ensure your backend server permits cross-origin requests from the frontend origin:
- Allowed Origins: `http://localhost:3000` (development) and your deployed cloud domain.
- Allowed Methods: `GET`, `POST`, `PUT`, `PATCH`, `DELETE`, `OPTIONS`.
- Allowed Headers: `Authorization`, `Content-Type`, `Accept`.

---

## 10. Run Full Verification

Run the test suite and build verification:
```bash
npm run test
npm run build
```
Then log in with your backend credentials.
