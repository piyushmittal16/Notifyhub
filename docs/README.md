# NotifyHub Documentation

NotifyHub is a multi-tenant email notification platform. Developers create projects, configure email templates, and call a REST API from their own applications to send transactional emails.

## Documentation index

1. [Project Overview & Requirements](01-project-overview.md)
2. [Architecture & Request Flows](02-architecture.md)
3. [Database Design](03-database-design.md)
4. [Authentication & Authorization](04-authentication-security.md)
5. [API Reference](05-api-reference.md)
6. [Core Workflows & Business Rules](06-workflows-business-rules.md)
7. [Testing Strategy](07-testing-strategy.md)
8. [Deployment & Operations](08-deployment-operations.md)
9. [Roadmap & Decisions](09-roadmap-decisions.md)

## Current scope

The first release is an MVP built as a modular monolith:

- Frontend: React
- Backend: Node.js + Express
- Database: MongoDB
- Email delivery: Nodemailer with a configured SMTP/email provider
- Authentication: JWT in an HTTP-only cookie for dashboard users
- Project integration: project-scoped API key in the `x-api-key` header

Redis, BullMQ, automatic retries, SDKs, webhooks, and microservices are deliberately deferred.

## Status and assumptions

These documents capture the decisions made during planning. A few implementation details still need to be selected during development, such as the exact SMTP provider, hosting provider, cookie domain, CORS origins, and production rate-limit thresholds.

Before production, review the security and operational sections and test the implementation against the acceptance criteria.
