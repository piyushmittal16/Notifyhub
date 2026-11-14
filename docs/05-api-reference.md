# 5. API Reference

## 5.1 Conventions

Base path: `/api/v1`

`v1` is the first public API version. A future breaking API change can be introduced under `/api/v2` while users migrate from v1.

Use JSON request/response bodies unless an endpoint states otherwise. Use consistent error response structure across the backend.

Suggested error shape:

```json
{
  "success": false,
  "message": "Human-readable error message",
  "code": "RESOURCE_NOT_FOUND"
}
```

Do not expose internal stack traces or secrets.

## 5.2 Authentication endpoints

| Method | Endpoint | Purpose | Access |
|---|---|---|---|
| POST | `/auth/signup` | Register developer | Public |
| POST | `/auth/login` | Login | Public |
| POST | `/auth/logout` | Clear login cookie | Authenticated |
| GET | `/auth/me` | Current user details | Authenticated |

Public signup must assign `developer` server-side. Do not accept a client-supplied admin role.

## 5.3 Project endpoints

| Method | Endpoint | Purpose | Access |
|---|---|---|---|
| POST | `/projects` | Create project | Developer |
| GET | `/projects` | List own projects | Developer |
| GET | `/projects/:id` | Get own project | Developer |
| PATCH | `/projects/:id` | Update project details | Developer |
| DELETE | `/projects/:id` | Soft-delete project | Developer |
| PATCH | `/projects/:id/status` | Activate/deactivate project | Developer |
| POST | `/projects/:id/api-key` | Generate/regenerate key | Developer |

Every operation must enforce project ownership. A soft-deleted project cannot send emails. Define whether project restore is supported before adding a restore endpoint.

## 5.4 Template endpoints

| Method | Endpoint | Purpose | Access |
|---|---|---|---|
| POST | `/projects/:id/templates` | Create template in project | Developer |
| GET | `/projects/:id/templates` | List project templates | Developer |
| GET | `/templates/:id` | Get template | Developer |
| PATCH | `/templates/:id` | Update template | Developer |
| DELETE | `/templates/:id` | Soft-delete template | Developer |
| PATCH | `/templates/:id/status` | Change draft/active/archived status | Developer |

Verify template ownership through its project on every operation.

## 5.5 Email send endpoint

| Method | Endpoint | Purpose | Access |
|---|---|---|---|
| POST | `/emails/send` | Send one email to one recipient | Project API key |

Full path: `POST /api/v1/emails/send`

Authentication header:

```http
x-api-key: sk_live_your_project_key
Content-Type: application/json
```

Request example:

```json
{
  "templateId": "TEMPLATE_OBJECT_ID",
  "to": "recipient@example.com",
  "variables": {
    "name": "Piyush"
  }
}
```

Rules:
- One request sends to exactly one recipient.
- `templateId` must belong to the project identified by the API key.
- Project must be active and not soft-deleted.
- Project owner must not be blocked.
- Template must be active and not soft-deleted.
- Required template variables must be supplied.
- Variable values must be safely escaped for HTML output.

Suggested responses:
- `200` — email accepted/sent successfully by the configured transport.
- `400` — invalid request body or missing required variables.
- `401` — missing or invalid API key.
- `403` — project inactive, owner blocked, or template/project access mismatch.
- `404` — template not found within the authenticated project.
- `429` — rate limit exceeded.
- `500` — unexpected server error.

For SMTP/provider send failures, create a failed log with a safe error reason. Do not automatically retry in the MVP. Be precise in response wording: SMTP acceptance is not a guarantee that the recipient's inbox received the message.

## 5.6 Email log endpoints

| Method | Endpoint | Purpose | Access |
|---|---|---|---|
| GET | `/projects/:id/logs` | List logs for one project | Developer |
| GET | `/logs/:id` | Get one log | Developer |
| GET | `/projects/:id/logs/stats` | Project sent/failed counts | Developer |

The developer dashboard should also provide an **All Logs** view across the authenticated developer's projects. This can be implemented as a dedicated endpoint such as `GET /logs` with server-side ownership scoping, or by a documented query mode. Do not fetch all platform logs and filter them in the browser.

Supported filters:
- `projectId`
- `status` (`sent` or `failed`)
- `to` (recipient email)
- `from` and `toDate` (date range)
- `page` and `limit` (pagination)

The backend must constrain all results to projects owned by the authenticated developer.

## 5.7 Developer analytics

| Method | Endpoint | Purpose | Access |
|---|---|---|---|
| GET | `/projects/:id/analytics` | Project analytics summary | Developer |
| GET | `/projects/:id/analytics/daily` | Daily send counts | Developer |

Analytics must be scoped to projects owned by the authenticated developer.

## 5.8 Admin endpoints

| Method | Endpoint | Purpose | Access |
|---|---|---|---|
| GET | `/admin/users` | List users | Admin |
| PATCH | `/admin/users/:id/status` | Block/unblock user | Admin |
| GET | `/admin/projects` | List basic project details | Admin |
| GET | `/admin/analytics` | Platform aggregate analytics | Admin |

Admin responses must omit API keys, API-key hashes, password hashes, and private template HTML.

## 5.9 HTTP method guidance

- `GET`: read data.
- `POST`: create a resource or perform an action such as sending an email.
- `PATCH`: partially update an existing resource.
- `DELETE`: request deletion; for projects/templates in this MVP, this means soft deletion.

## 5.10 API design items to confirm during implementation

- Exact pagination format and maximum page size.
- Exact date filter parameter names and timezone behavior.
- Whether `200` or `202` is used for provider-accepted email sends.
- Whether a dedicated `GET /logs` endpoint is used for All Logs.
- Exact error codes and response envelope.
