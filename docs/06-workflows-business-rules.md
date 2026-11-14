# 6. Core Workflows & Business Rules

## 6.1 Developer workflow

1. Developer signs up or logs in.
2. Developer opens the dashboard.
3. Developer creates a project.
4. NotifyHub generates a project API key and displays it once.
5. Developer stores the key in their own backend environment variables.
6. Developer creates email templates inside the project.
7. Developer marks a template active when it is ready.
8. Developer integrates the NotifyHub send endpoint into their backend.
9. Their application calls NotifyHub with API key, template ID, recipient, and variables.
10. Developer reviews All Logs or filters logs by project.

## 6.2 Admin workflow

1. Admin logs in using an admin account created through a controlled process.
2. Admin views registered users.
3. Admin blocks/unblocks a user when required.
4. Admin views basic project metadata.
5. Admin reviews platform-level send statistics.

Admin cannot inspect private API secrets or template HTML.

## 6.3 Project status rules

Project status:
- `active`
- `inactive`

Rules:
- Only an active, non-deleted project can send email.
- Inactive project blocks all email API requests for that project.
- Project deactivation does not change individual template statuses.
- Existing email logs remain available.
- Soft-deleted projects are treated as unusable for sending.

## 6.4 Template status rules

Template status:
- `draft`
- `active`
- `archived`

Rules:
- Only an active, non-deleted template can send email.
- A draft or archived template cannot send email.
- Deactivating/archiving one template does not affect other active templates in the same active project.
- Soft-deleted templates cannot send email.
- Existing logs remain available.

## 6.5 API key rules

- One current API key per project in the MVP.
- Store only a hash.
- Display the raw key only at generation/regeneration time.
- Regeneration immediately invalidates the old key.
- API key identifies the project; it does not identify a dashboard user.
- The API key is never stored in a template.

## 6.6 Tenant isolation rules

For every project-scoped action, the backend verifies ownership.

For email sending, the API key identifies Project A. If the request contains a template ID belonging to Project B, reject it. Never trust a template ID by itself.

## 6.7 Email send and log rules

- One request = one recipient.
- A log is created for each send attempt.
- Store recipient, project, template reference, template-name snapshot, subject, status, error (if failed), and attempt timestamp.
- Do not store the complete rendered HTML in logs for the MVP.
- Failed sends are logged.
- Automatic retries are deferred.
- Historical logs are retained when projects/templates are soft-deleted.

## 6.8 Soft-delete behavior

Projects and templates use a `deletedAt` timestamp (null means not soft-deleted).

Soft deletion should:
- Hide the resource from normal active lists by default.
- Prevent use for sending.
- Preserve historical email logs.
- Avoid physically deleting historical records.

The UI should make the deleted state clear. Restore functionality is not part of the agreed MVP unless added later.

## 6.9 Dashboard log views

Developers get both:
- **All Logs:** logs across all projects owned by the logged-in developer.
- **Project Logs:** logs filtered to one of their projects.

Admin gets platform-level aggregate analytics. Any admin log-viewing capability beyond aggregates should be separately specified; it is not required by the current MVP scope.
