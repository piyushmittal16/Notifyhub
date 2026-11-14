# 2. Architecture & Request Flows

## 2.1 Architecture style

Use a **modular monolith** for the MVP. The application is one backend deployment with clearly separated modules. Do not split it into microservices at this stage.

```text
Developer / Admin Browser
          |
          v
     React Frontend
          |
       HTTPS
          |
          v
    Express Backend
      |    |    |
      |    |    +--> Middleware (auth, role, validation)
      |    |
      |    +-------> Controllers
      |                 |
      |                 v
      |              Services
      |                 |
      |                 v
      +--------------> Models
                        |
                        v
                     MongoDB

External Developer App
          |
          | POST /api/v1/emails/send + x-api-key
          v
    Express Backend
          |
          v
    Email Service
          |
          v
  SMTP / Email Provider
```

## 2.2 Backend layer responsibilities

Request flow:

`Route → Middleware → Controller → Service → Model/Database → Response`

- **Routes:** Declare URL paths and HTTP methods; attach the required middleware and controller.
- **Middleware:** Perform authentication, role checks, API-key checks, validation, and other request-wide checks.
- **Controllers:** Read validated request data, call services, and format HTTP responses. Keep business logic out of controllers.
- **Services:** Implement business rules and coordinate database/email operations.
- **Models:** Define MongoDB document structure, validation, and indexes.
- **Config:** Load and validate environment configuration.
- **Utils:** Shared helpers such as API response formatting and error classes.

## 2.3 Authentication paths

There are two distinct authentication mechanisms.

### Dashboard requests

Browser → React → Express → JWT cookie verification → role/ownership checks → controller/service → database.

JWT identifies the logged-in dashboard user.

### External email requests

Developer's backend → `POST /api/v1/emails/send` with `x-api-key` → API-key verification → project identification/status check → template ownership/status check → email service → log creation.

The API key identifies a project, not a dashboard user session.

## 2.4 Email send flow

1. Receive the send request.
2. Validate the request body and recipient email.
3. Read the API key from `x-api-key`.
4. Hash the supplied key using the same secure hashing approach and compare it with the stored hash.
5. Identify the project.
6. Reject the request if the project is inactive or soft-deleted.
7. Reject the request if the project owner is blocked.
8. Find the requested template and verify it belongs to the identified project.
9. Reject the request if the template is not active or is soft-deleted.
10. Replace supported variables in the subject and HTML.
11. Send through the configured Nodemailer transport.
12. Save an email log with `sent` or `failed` status.
13. Return a response that does not expose secrets or internal stack traces.

For an email delivery failure, save a failed log and return a clear failure response. Automatic retries are deferred from the MVP.

## 2.5 Frontend structure

The React frontend should separate:

- Pages/routes
- Reusable components
- Authentication state/context
- API/service functions
- Shared utilities
- Form validation and UI state

Protected frontend routes improve navigation and user experience, but backend authorization remains the actual security boundary.

## 2.6 Suggested repository layout

```text
notifyhub/
├── client/
│   └── src/
│       ├── components/
│       ├── pages/
│       ├── context/
│       ├── services/
│       └── utils/
├── server/
│   └── src/
│       ├── config/
│       ├── models/
│       ├── routes/
│       ├── controllers/
│       ├── services/
│       ├── middleware/
│       ├── utils/
│       └── app.js
├── docs/
├── .gitignore
└── README.md
```

As the codebase grows, organize files by feature where that improves clarity, without creating unnecessary abstraction.
