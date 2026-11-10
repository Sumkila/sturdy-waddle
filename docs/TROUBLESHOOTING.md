# Troubleshooting Guide

Solutions for common operational and integration issues.

---

## 1. CORS (Cross-Origin Resource Sharing) Errors

**Symptom**: Browser console logs `Access to XMLHttpRequest at 'http://localhost:8080/api/...' from origin 'http://localhost:3000' has been blocked by CORS policy`.

**Cause**: The backend server is not permitting requests from the frontend origin.

**Resolution**:
In Spring Boot, add a global CORS configuration:
```java
@Configuration
public class CorsConfig implements WebMvcConfigurer {
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
                .allowedOrigins("http://localhost:3000")
                .allowedMethods("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true);
    }
}
```

---

## 2. 401 Redirect Loop

**Symptom**: The browser continually refreshes or bounces between `/login` and the requested page.

**Cause**:
- Token is missing or invalid.
- Backend endpoint returns `401 Unauthorized` for `/auth/login` or `/auth/register`.

**Resolution**:
In `src/api/httpClient.ts`, the 401 interceptor checks:
```typescript
if (!window.location.pathname.includes('/login')) {
  window.dispatchEvent(new CustomEvent('auth:unauthorized'));
}
```
Ensure `/auth/login` credentials are correct and verify that the token returned by the backend matches the configured storage key in `.env` (`VITE_AUTH_TOKEN_KEY`).

---

## 3. 403 Permission Denied Errors

**Symptom**: The user can see a link or button, but clicking it results in `HTTP 403 Forbidden`.

**Cause**:
The user's assigned role on the backend lacks the required authority for that endpoint (e.g. A Teacher attempting to delete an Academic Result or create a Student).

**Resolution**:
1. Check the user's role using the User Menu in the top right.
2. Review `src/config/permissionsConfig.ts` to ensure frontend capability rules match your backend's security configuration.

---

## 4. Environment Variables Not Loading

**Symptom**: `VITE_API_URL` defaults to `http://localhost:8080` even after modifying `.env`.

**Cause**: Vite only loads environment variables prefixed with `VITE_` at startup.

**Resolution**:
1. Ensure the variable name starts with `VITE_` (e.g. `VITE_API_URL`).
2. Restart the Vite development server after editing `.env`:
   ```bash
   npm run dev
   ```

---

## 5. Backend Not Reachable (`NETWORK_ERROR`)

**Symptom**: Frontend shows error card `Unable to reach the school server. Please verify the backend is running...`.

**Cause**: Backend is down or running on a different port than specified in `.env`.

**Resolution**:
1. Verify backend is running on `http://localhost:8080` or update `VITE_API_URL`.
2. Check firewall or Docker container port mappings.

---

## 6. Invalid or Malformed JWT

**Symptom**: User logs in successfully, but role defaults to `STUDENT` or navigation does not show administrative links.

**Cause**: The JWT token returned by the backend does not contain a standard `role`, `roles`, or `authorities` claim in its decoded payload.

**Resolution**:
Inspect `decodeJwtPayload` in `src/api/services/auth.service.ts` and verify how your backend encodes claims in the JWT payload.

---

## 7. Date Formatting Inconsistencies

**Symptom**: Date appears as `NaN-NaN-NaN` or `Invalid Date`.

**Cause**: Backend returns dates in non-ISO formats (e.g., `DD/MM/YYYY` or epoch timestamps).

**Resolution**:
`src/utils/date.ts` safely parses ISO strings (`YYYY-MM-DD`). If your backend returns Unix milliseconds or localized strings, adjust `formatDate` in `src/utils/date.ts`.

---

## 8. Phone Number and Special Character Encoding

**Symptom**: Looking up parents by phone (`+1 555-0199`) returns `404` or `400` because the `+` character turns into a space.

**Cause**: Unencoded URL query parameters.

**Resolution**:
The application automatically encodes all path parameters using `encodeURIComponent` in `src/api/endpoints.ts` and `src/utils/url.ts`.
For example:
`+1 555-0199` becomes `%2B1%20555-0199`.
