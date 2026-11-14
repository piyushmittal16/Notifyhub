# 7. Testing Strategy

Testing should be introduced alongside implementation, not postponed until the end.

## 7.1 Testing levels

- Unit tests: isolated service/helper logic.
- Integration tests: routes, middleware, database behavior, and external-service boundaries.
- End-to-end tests: critical user workflows through the application.
- Manual smoke tests: deployed app and real provider configuration.

Choose a test framework during implementation (for example, Vitest/Jest for JavaScript/TypeScript and Supertest for Express HTTP integration tests). Keep the choice consistent.

## 7.2 Authentication tests

- Valid signup creates a developer account.
- Signup cannot create an admin account by passing `role: "admin"`.
- Duplicate email is rejected.
- Password is stored as a bcrypt hash, not plaintext.
- Valid login sets the expected HTTP-only cookie.
- Invalid password is rejected.
- Blocked user cannot log in or use protected dashboard actions.
- Logout clears the cookie.
- Expired/invalid JWT is rejected.
- `/auth/me` returns only the current user's safe profile fields.

## 7.3 Authorization and tenant-isolation tests

- Developer cannot access another developer's project.
- Developer cannot read/update/delete another developer's template.
- Developer cannot read another developer's logs.
- Developer cannot call admin endpoints.
- Admin can call admin endpoints.
- Admin responses do not contain secret fields.
- Project A API key plus Project B template ID is rejected.

## 7.4 Project and template tests

- Create and list own projects.
- Project update affects only allowed fields.
- Inactive project cannot send.
- Soft-deleted project cannot send.
- Draft/archived template cannot send.
- Active template in an active project can be used.
- Soft-deleted template cannot send.
- Duplicate template name in the same project is rejected according to the chosen index policy.
- Same template name in different projects is allowed.

## 7.5 Email sending tests

Use a mocked email transport for automated tests; do not send real emails from routine test runs.

- Missing API key is rejected.
- Invalid API key is rejected.
- Invalid request body is rejected.
- Invalid recipient address is rejected.
- Missing template is rejected.
- Template from another project is rejected.
- Variables are replaced correctly.
- Untrusted variable values are escaped safely.
- Successful transport result creates a `sent` log.
- Transport failure creates a `failed` log with a safe error.
- One request targets only one recipient.
- Rate limit is enforced.

## 7.6 Logs and analytics tests

- Developer sees only their own logs.
- All Logs combines only the developer's projects.
- Project filter returns only that project's logs.
- Status and date filters work.
- Pagination is stable and bounded.
- Soft deletion does not remove historical logs.
- Analytics counts match the underlying logs.

## 7.7 MVP acceptance checklist

The MVP is ready for initial release when:

- A developer can sign up and log in.
- A developer can create a project and safely retrieve its API key once.
- A developer can create and activate a template.
- An external backend can send a test email using the project key.
- Invalid project/template combinations are rejected.
- Both successful and failed attempts create logs.
- Developers can view All Logs and project-filtered logs.
- Admin role restrictions work.
- No secrets are exposed in API responses or frontend bundles.
- Critical tests pass.
