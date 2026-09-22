# Smart Internship & Placement Portal

Backend foundation for a college project that connects students, companies, and administrators through internship and placement opportunities.

## Requirements

- Java 17
- Maven 3.9 or higher
- MySQL 8 or higher

## MySQL setup

Create the local database before starting the application:

```sql
CREATE DATABASE placement_portal;
```

The application uses Hibernate `ddl-auto=update` during this foundation stage, so tables are created or updated from the JPA entities when the backend starts.

## Environment variables

Configure these variables in the terminal or IDE run configuration. Do not commit a real `.env` file or real passwords.

```text
DB_URL=jdbc:mysql://localhost:3306/placement_portal?createDatabaseIfNotExist=true&serverTimezone=UTC
DB_USERNAME=your_mysql_username
DB_PASSWORD=your_mysql_password
```

See [.env.example](.env.example) for a placeholder configuration. The application has local development defaults for the URL and username, but the password should be supplied through `DB_PASSWORD`.

## Run the backend

From the repository root:

```bash
mvn clean package
mvn spring-boot:run
```

The backend starts on `http://localhost:8080`.

Health check:

```text
GET http://localhost:8080/api/health
```

Response:

```json
{
	"success": true,
	"message": "Backend is running"
}
```

## Current API architecture

The project follows a simple Spring Boot layered structure:

```text
src/main/java/com/placement/portal/
├── config/       CORS and application configuration
├── controller/   REST controllers
├── dto/          API request and response objects
├── exception/    Custom exceptions and global error handling
├── model/        JPA entities and enums
├── repository/   Spring Data JPA repositories
└── service/      Business-service extension points
```

The complete backend API is implemented. Authentication is intentionally sessionless for this college MVP: login validates credentials and returns user data, while ownership/admin context is supplied by request IDs. Passwords are stored as simple SHA-256 hashes for this MVP and should be replaced with a slow salted password encoder before production. There are no JWTs or Spring Security sessions yet.

## Database entities

- `User`: common account details, unique email, and role.
- `Student`: student profile linked one-to-one with a user.
- `Company`: company profile linked one-to-one with a user.
- `Job`: opportunity owned by a company, with job type, status, deadline, and required skills.
- `PlacementApplication`: student application linked to a job, with status and application date. A database unique constraint prevents a student from applying to the same job more than once.

Roles are `STUDENT`, `COMPANY`, and `ADMIN`. Application statuses are `APPLIED`, `SHORTLISTED`, and `REJECTED`. Job statuses are `ACTIVE` and `CLOSED`.

## Current dependencies

- Spring Web
- Spring Validation
- Spring Data JPA
- MySQL Connector/J
- Spring Boot Test

## Features and API endpoints

- `POST /api/auth/register` and `POST /api/auth/login` for student/company accounts. Admin registration is rejected.
- `GET/PUT /api/students/{id}` and `GET /api/students/{id}/applications`.
- `GET/PUT /api/companies/{id}`.
- `GET /api/jobs`, `GET /api/jobs/{id}`, `POST/PUT/DELETE /api/jobs` with company ownership checks.
- `POST /api/applications`, `GET /api/applications/student/{id}`, `GET /api/applications/job/{id}`, and status updates.
- `GET /api/admin/students`, `/companies`, `/jobs`, `/applications`, and `/dashboard`.
- Deterministic comma-separated skill matching is returned as `matchPercentage`.
- Validation and errors use consistent JSON envelopes; passwords are never returned.

Job creation example:

```json
{
	"companyId": 1,
	"title": "Java Intern",
	"description": "Build Spring Boot APIs",
	"skillsRequired": "Java, SQL, Spring Boot",
	"location": "Remote",
	"salary": 15000,
	"jobType": "INTERNSHIP",
	"deadline": "2027-01-31"
}
```

Application example:

```json
{
	"studentId": 1,
	"jobId": 1
}
```

Successful responses use `{ "success": true, "message": "...", "data": {} }`. Validation errors include an `errors` object keyed by field name.

## Testing and team responsibilities

Run `mvn clean test`, then `mvn spring-boot:run`. Use Postman or curl against `http://localhost:8080`; create a student and company first, then use their returned profile IDs for the profile, job, application, and admin workflow. The backend owns persistence, validation, business rules, and API contracts; the frontend consumes these JSON endpoints.
