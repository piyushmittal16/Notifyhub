# 1. Project Overview & Requirements

## 1.1 Purpose

NotifyHub lets a developer's application send transactional emails through a centralized API.

Example events:

- A user signs up → send a welcome email.
- A customer places an order → send an order confirmation.
- A user requests a password reset → send a reset email.
- A patient books an appointment → send a booking confirmation.

The developer stores email HTML and subject in NotifyHub as a template. Their application sends the template ID, recipient address, and dynamic variables to NotifyHub.

## 1.2 MVP goals

- Allow developers to register and log in.
- Allow developers to create and manage multiple projects.
- Generate one API key per project.
- Allow developers to create and manage email templates inside projects.
- Provide an API to send one email to one recipient per request.
- Replace template variables before sending.
- Store sent and failed email logs.
- Provide project-level and combined log views.
- Provide basic developer analytics.
- Provide an admin panel for platform-level user, project, and analytics management.

## 1.3 User roles

### Developer

A developer can:

- Sign up and log in.
- Create, view, update, deactivate, and soft-delete their own projects.
- Generate or regenerate a project's API key.
- Create, view, update, archive, and soft-delete templates in their own projects.
- Send emails through the project's API key.
- View all their logs or filter logs by project.
- View analytics for their projects.

A developer must never access another developer's projects, templates, or logs.

### Admin

An admin can:

- View registered users.
- Block or unblock users.
- View basic project details and project status.
- View platform-wide email counts and analytics.

An admin must not see developers' API keys or private template HTML/content.

Admin accounts are created through a controlled/manual process. Public signup must always assign the `developer` role; clients cannot choose their own role.

## 1.4 MVP non-goals

The following are not part of the first MVP:

- Redis and BullMQ queues.
- Automatic retry scheduling.
- Multiple API keys per project.
- Official client SDKs.
- Webhooks.
- Microservices.
- Advanced deliverability analytics.
- Complex billing/subscription management.

## 1.5 Functional requirements

| ID | Requirement |
|---|---|
| FR-01 | A developer can sign up and log in. |
| FR-02 | A logged-in user can retrieve their own profile. |
| FR-03 | A developer can manage their own projects. |
| FR-04 | Each project has one current API key. |
| FR-05 | The raw API key is shown only when generated or regenerated. |
| FR-06 | A developer can manage templates belonging to their projects. |
| FR-07 | Only active projects and active templates can send email. |
| FR-08 | Each send request targets exactly one recipient. |
| FR-09 | NotifyHub replaces template variables before sending. |
| FR-10 | Each attempt creates a sent or failed email log. |
| FR-11 | Developers can view combined logs and filter by project. |
| FR-12 | Developers can view project analytics. |
| FR-13 | Admins can manage user status and view platform-level data. |
| FR-14 | Admin APIs enforce the admin role. |

## 1.6 Non-functional requirements

- Enforce tenant isolation at the backend, not only in the UI.
- Never store plaintext passwords or API keys.
- Keep API responses consistent and useful for debugging.
- Validate and sanitize incoming data.
- Use pagination for potentially large lists.
- Keep secrets out of logs and error responses.
- Preserve historical email logs when projects or templates are soft-deleted.
- Keep the MVP architecture simple enough to maintain and extend.
