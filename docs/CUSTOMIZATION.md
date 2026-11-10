# Customization Guide

This guide details how to customize and extend the school management frontend for specific institutional requirements.

---

## 1. Changing Branding & Institutional Identity

1. **Application Name**:
   Update `VITE_APP_NAME` in `.env`:
   ```env
   VITE_APP_NAME=Oakridge Academy
   ```
2. **Favicon**:
   Replace `public/favicon.svg` with your institution's SVG crest or logo.
3. **HTML Title and Meta**:
   Update `index.html` `<title>` and `<meta name="description">`.

---

## 2. Customizing Navigation Links

Edit `src/config/navigationConfig.ts`:
- Add or reorder groups (`Core`, `Academic Management`, `Administration`).
- Set custom Lucide icon names and required capabilities.
- The sidebar and top navigation update automatically.

---

## 3. Adding a New User Role (e.g. `COUNSELOR` or `LIBRARIAN`)

1. **Update UserRole Type** in `src/types/auth.ts`:
   ```typescript
   export type UserRole =
     | 'ADMIN'
     | 'PRINCIPAL'
     | 'TEACHER'
     | 'PARENT'
     | 'STUDENT'
     | 'COUNSELOR';
   ```
2. **Define Capabilities** in `src/config/permissionsConfig.ts`:
   ```typescript
   export const permissionMatrix: PermissionMatrix = {
     ...
     COUNSELOR: ['VIEW_DASHBOARD', 'VIEW_ALL_STUDENTS', 'VIEW_ATTENDANCE'],
   };
   ```
3. **Add Role Options** in `RegisterPage.tsx` and `UserMenu.tsx`.

---

## 4. Adding a New Feature Module (e.g. `Fee Management` or `Library`)

1. **Add DTO Types**:
   Create `src/types/fees.ts`.
2. **Register Endpoints**:
   Add paths to `src/api/endpoints.ts`:
   ```typescript
   fees: {
     list: '/fees',
     byId: (id: string) => `/fees/${id}`,
   }
   ```
3. **Expose Adapter Functions**:
   Add `getFees`, `createFee` to `src/api/apiAdapter.ts`.
4. **Create Feature Service**:
   Create `src/api/services/fees.service.ts`.
5. **Create Pages**:
   Add `FeeListPage.tsx` in `src/features/fees/`.
6. **Register Route**:
   Add route in `src/routes/AppRoutes.tsx` and link in `src/config/navigationConfig.ts`.

---

## 5. Changing Form Fields & Validation Rules

Form fields use **React Hook Form** paired with **Zod** schemas in `src/utils/validation.ts`:
```typescript
export const studentSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  // Add custom fields here:
  bloodGroup: z.string().optional(),
  emergencyContact: z.string().min(5, 'Emergency contact is required'),
});
```
Then add matching `<FormField>` wrappers in `StudentFormPage.tsx`.

---

## 6. Changing Table Columns

Data tables use typed `Column<T>[]` definitions in feature list pages:
```typescript
const columns: Column<Student>[] = [
  { header: 'Student ID', accessor: 'studentNumber' },
  { header: 'Name', cell: (row) => <span>{row.firstName}</span> },
  // Add new column:
  { header: 'Date of Birth', cell: (row) => <span>{formatDate(row.dateOfBirth)}</span> },
];
```

---

## 7. Replacing Token Storage (e.g., HttpOnly Cookies)

All token reads and writes are encapsulated in `src/auth/tokenStorage.ts`:
```typescript
export const tokenStorage = {
  getToken(): string | null {
    // Replace localStorage with cookie or in-memory variable
  },
  setToken(token: string): void { ... },
  clear(): void { ... }
};
```
No feature page accesses `localStorage` directly.
