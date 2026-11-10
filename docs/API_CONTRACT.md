# API Contract Documentation

This document describes all endpoints utilized by the frontend application, their contract specifications, associated frontend service functions, and the UI views that consume them.

---

## 1. Authentication Endpoints

### `POST /auth/login`
- **Purpose**: Authenticates a user and issues an authorization bearer token.
- **Required Role**: Public / Unauthenticated.
- **Request Body**:
  ```json
  {
    "username": "admin",
    "password": "secretPassword"
  }
  ```
- **Response Body**:
  ```json
  {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
  ```
- **Error Responses**: `400 Bad Request`, `401 Unauthorized`.
- **Frontend Service**: `authService.login(credentials)`
- **UI Screen**: `LoginPage` (`/login`)

---

### `POST /auth/register`
- **Purpose**: Registers a new user account with assigned role.
- **Required Role**: Public.
- **Request Body**:
  ```json
  {
    "username": "jsmith",
    "email": "jsmith@school.edu",
    "password": "password123",
    "role": "ADMIN | PRINCIPAL | TEACHER | PARENT | STUDENT"
  }
  ```
- **Response Body**: `{ "token": "..." }`
- **Error Responses**: `400 Bad Request`, `409 Conflict` (duplicate username/email).
- **Frontend Service**: `authService.register(payload)`
- **UI Screen**: `RegisterPage` (`/register`)

---

## 2. Students Endpoints

### `GET /students`
- **Purpose**: Retrieves all students or filtered list.
- **Required Role**: `ADMIN`, `PRINCIPAL`, `TEACHER`.
- **Query Parameters**: `name`, `grade`, `className`, `gender`, `studentNumber`, `status`.
- **Response Body**: `Student[]`
- **Frontend Service**: `studentsService.getStudents(filters)`
- **UI Screen**: `StudentListPage` (`/students`), `AdminDashboard`, `ParentDashboard`

### `POST /students`
- **Purpose**: Creates a new student enrollment record.
- **Required Role**: `ADMIN`, `PRINCIPAL`.
- **Request Body**:
  ```json
  {
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@school.edu",
    "studentNumber": "STU-2026-001",
    "grade": "10",
    "className": "10-A",
    "gender": "MALE",
    "phoneNumber": "+1 555-0101",
    "address": "123 Academic Way",
    "parentUsername": "parent_doe",
    "status": "ACTIVE"
  }
  ```
- **Response Body**: `Student` object.
- **Error Responses**: `400 Bad Request`, `409 Conflict` (duplicate email or student number), `403 Forbidden`.
- **Frontend Service**: `studentsService.createStudent(payload)`
- **UI Screen**: `StudentFormPage` (`/students/new`)

### `GET /students/{id}`
- **Purpose**: Fetches a single student record by primary ID.
- **Required Role**: `ADMIN`, `PRINCIPAL`, `TEACHER`, `PARENT` (own child), `STUDENT` (own record).
- **Response Body**: `Student` object.
- **Frontend Service**: `studentsService.getStudentById(id)`
- **UI Screen**: `StudentProfilePage` (`/students/:id`), `StudentFormPage` (`/students/:id/edit`)

### `PUT /students/{id}`
- **Purpose**: Updates an existing student record.
- **Required Role**: `ADMIN`, `PRINCIPAL`.
- **Request Body**: Partial or full `StudentCreatePayload`.
- **Response Body**: Updated `Student` object.
- **Frontend Service**: `studentsService.updateStudent(id, payload)`
- **UI Screen**: `StudentFormPage` (`/students/:id/edit`)

### `PATCH /students/{id}/status`
- **Purpose**: Updates status or deactivates a student record.
- **Required Role**: `ADMIN`, `PRINCIPAL`.
- **Request Body**: `{ "status": "INACTIVE" }`
- **Response Body**: Updated `Student` object.
- **Frontend Service**: `studentsService.deactivateStudent(id)`, `studentsService.updateStatus(id, status)`
- **UI Screen**: `StudentListPage`, `StudentProfilePage`

### `GET /students/class/{className}`
- **Purpose**: Retrieves students enrolled in a specific class.
- **Query/Path Parameters**: `className` (URL-encoded).
- **Response Body**: `Student[]`
- **Frontend Service**: `studentsService.getByClass(className)`
- **UI Screen**: `AttendanceRegisterPage`

---

## 3. Attendance Endpoints

*Note: In the reference backend, attendance endpoints reside under `/students/attendance/...`.*

### `GET /students/attendance/summary`
- **Purpose**: Computes institutional or classroom-level attendance aggregates.
- **Query Parameters**: `className` (optional), `date` (optional).
- **Response Body**:
  ```json
  {
    "present": 42,
    "absent": 3,
    "late": 2,
    "excused": 1,
    "total": 48,
    "attendanceRate": 87.5
  }
  ```
- **Frontend Service**: `attendanceService.getSummary(filters)`
- **UI Screen**: `AdminDashboard`, `AttendanceSummaryPage`

### `GET /students/attendance`
- **Purpose**: Returns attendance logs for a classroom or date filter.
- **Query Parameters**: `className`, `date`.
- **Response Body**: `AttendanceRecord[]`
- **Frontend Service**: `attendanceService.getAttendanceList(filters)`
- **UI Screen**: `AttendanceRegisterPage`

### `POST /students/attendance/bulk`
- **Purpose**: Batch saves daily register records for a class.
- **Required Role**: `ADMIN`, `PRINCIPAL`, `TEACHER`.
- **Request Body**:
  ```json
  [
    {
      "studentId": "stu-1",
      "date": "2026-11-09",
      "status": "PRESENT",
      "remarks": "On time",
      "recordedBy": "teacher_smith"
    }
  ]
  ```
- **Response Body**: `{ "count": 1, "success": true }`
- **Frontend Service**: `attendanceService.saveBulk(records)`
- **UI Screen**: `AttendanceRegisterPage` (`/attendance`)

### `GET /students/{studentId}/attendance`
- **Purpose**: Retrieves historical attendance events for an individual student.
- **Response Body**: `AttendanceRecord[]`
- **Frontend Service**: `attendanceService.getStudentAttendance(studentId)`
- **UI Screen**: `StudentProfilePage` (Attendance tab), `ParentDashboard`, `StudentDashboard`

---

## 4. Academic Results Endpoints

### `GET /results`
- **Purpose**: Lists all academic result evaluations.
- **Query Parameters**: `studentId`, `subject`, `term`.
- **Response Body**: `AcademicResult[]`
- **Frontend Service**: `resultsService.getResults(filters)`
- **UI Screen**: `ResultListPage`, `AdminDashboard`, `TeacherDashboard`, `ParentDashboard`, `StudentDashboard`

### `POST /results`
- **Purpose**: Submits a grade for a student in a subject.
- **Required Role**: `ADMIN`, `TEACHER`.
- **Request Body**:
  ```json
  {
    "studentId": "stu-1",
    "subject": "Mathematics",
    "score": 92.5,
    "maxScore": 100,
    "term": "Term 1",
    "academicYear": "2026",
    "remarks": "Excellent comprehension"
  }
  ```
- **Response Body**: `AcademicResult`
- **Frontend Service**: `resultsService.createResult(payload)`
- **UI Screen**: `ResultFormPage` (`/results/new`)

### `PUT /results/{id}`
- **Purpose**: Updates an existing result evaluation.
- **Required Role**: `ADMIN`, `PRINCIPAL`.
- **Response Body**: `AcademicResult`
- **Frontend Service**: `resultsService.updateResult(id, payload)`
- **UI Screen**: `ResultFormPage` (`/results/:id/edit`)

### `DELETE /results/{id}`
- **Purpose**: Permanently removes an erroneous grade record.
- **Required Role**: `ADMIN`.
- **Frontend Service**: `resultsService.deleteResult(id)`
- **UI Screen**: `ResultListPage`

---

## 5. Subjects Endpoints

### `GET /subjects`
- **Response Body**: `Subject[]`
- **Frontend Service**: `subjectsService.getSubjects()`
- **UI Screen**: `SubjectListPage`, `ResultFormPage`

### `POST /subjects`
- **Request Body**:
  ```json
  {
    "subjectCode": "MATH-101",
    "subjectName": "Algebra & Calculus",
    "grade": "10",
    "teacher": "Dr. Sarah Connor",
    "description": "Core mathematics syllabus"
  }
  ```
- **Frontend Service**: `subjectsService.createSubject(payload)`
- **UI Screen**: `SubjectFormPage` (`/subjects/new`)

### `PUT /subjects/{id}` & `DELETE /subjects/{id}`
- **Frontend Service**: `subjectsService.updateSubject(id, payload)`, `subjectsService.deleteSubject(id)`
- **UI Screen**: `SubjectListPage`, `SubjectFormPage`

---

## 6. Teachers Endpoints

### `GET /teachers` | `POST /teachers` | `PUT /teachers/{id}` | `DELETE /teachers/{id}`
- **Entity**:
  ```json
  {
    "firstName": "Sarah",
    "lastName": "Connor",
    "employeeNumber": "EMP-1042",
    "department": "Mathematics",
    "phoneNumber": "+1 555-0144",
    "email": "sconnor@school.edu"
  }
  ```
- **Frontend Services**: `teachersService.getTeachers()`, `createTeacher()`, `updateTeacher()`, `deleteTeacher()`
- **UI Screen**: `TeacherListPage`, `TeacherFormPage`

---

## 7. Parents Endpoints

### `GET /parents` | `POST /parents` | `PUT /parents/{id}` | `DELETE /parents/{id}`
### `GET /parents/email/{email}` (URL-encoded)
### `GET /parents/phone/{phone}` (URL-encoded, e.g. `%2B1%20555-0199`)
- **Entity**:
  ```json
  {
    "firstName": "Maria",
    "lastName": "Santos",
    "phoneNumber": "+1 555-0182",
    "email": "msantos@example.com",
    "address": "45 Elm St",
    "relationship": "Mother"
  }
  ```
- **Frontend Services**: `parentsService.getParents()`, `createParent()`, `findByEmail()`, `findByPhone()`, etc.
- **UI Screen**: `ParentListPage`, `ParentFormPage`
