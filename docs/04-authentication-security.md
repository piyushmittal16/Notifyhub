# 4. Authentication, Authorization & Security

## 4.1 Dashboard authentication

MVP decision:

- Use JWT for dashboard login.
- Set JWT expiry to 7 days.
- Store JWT in an HTTP-only cookie.
- Hash passwords with bcrypt.
- Do not implement refresh tokens in the MVP.

Login flow:

1. Receive email and password.
2. Find the normalized email.
3. Reject if the account does not exist or is blocked.
4. Compare submitted password with the bcrypt hash.
5. Sign a JWT containing the minimum required identity/claims.
6. Set the token in a cookie with appropriate security attributes.

Cookie settings must be selected for the deployment environment:
- `httpOnly: true`
- `secure: true` in production over HTTPS
- Appropriate `sameSite` setting
- Appropriate cookie `path` and expiry/max-age

Logout clears the cookie. Since a stateless JWT may remain valid until expiry if copied, do not describe cookie clearing as server-side token revocation. If immediate revocation becomes a requirement, add a token-version/denylist/session strategy later.

## 4.2 Authorization and RBAC

Roles:

- `developer`
- `admin`

Use role authorization middleware for admin-only routes. Example conceptual policy: `authorizeRoles("admin")`.

Also enforce ownership for every developer resource:
- Developer can access only projects where `userId` equals the authenticated user's ID.
- Templates must belong to a project owned by the developer.
- Logs must belong to a project owned by the developer.

Role checks do not replace ownership checks.

## 4.3 Project API key security

- Generate a cryptographically secure random key.
- Show the raw key only once at creation/regeneration.
- Store only a secure hash of the key.
- Never return the hash from an API.
- Never log raw API keys.
- Regeneration invalidates the previous key immediately.
- Store the key in the developer's own backend environment variable, not frontend code.

Example integration environment:

```env
NOTIFYHUB_API_KEY=sk_live_your_key
NOTIFYHUB_URL=https://your-api-host
```

The developer's frontend must never contain the project secret.

## 4.4 API security baseline

Implement from the beginning:

- HTTPS in deployed environments.
- Input validation for every endpoint.
- Safe error responses; no stack traces or secret leakage.
- CORS allowlist for the dashboard frontend.
- Rate limiting, especially login/signup and public email-send endpoints.
- Request body size limits.
- Secure HTTP headers.
- Protection against NoSQL injection and unsafe query construction.
- Safe HTML/template handling and context-aware variable escaping.
- Authorization and ownership checks on every resource operation.
- Environment variables for secrets; never commit `.env`.
- Do not expose password hashes, API-key hashes, SMTP credentials, or private template content in admin responses.

## 4.5 Important email-template safety note

Variable replacement must not blindly inject untrusted user input into HTML. Escape values for the relevant HTML context, and define the supported placeholder syntax. Avoid evaluating arbitrary JavaScript or expressions from templates.

## 4.6 Admin visibility

Admin may view basic project metadata and aggregate send counts. Admin must not view:
- Raw API keys or API-key hashes.
- Password hashes.
- Private template HTML/content.
- SMTP/provider credentials.
