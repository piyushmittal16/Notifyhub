# 3. Database Design

MongoDB collections for the MVP:

1. `users`
2. `projects`
3. `templates`
4. `emaillogs`

Use MongoDB ObjectIds for document IDs and references unless the implementation deliberately chooses another consistent ID strategy.

## 3.1 Users

| Field | Type | Notes |
|---|---|---|
| `_id` | ObjectId | Primary identifier |
| `name` | String | Required |
| `email` | String | Required, normalized, unique |
| `password` | String | bcrypt hash only |
| `role` | String | `developer` or `admin`; signup defaults to `developer` |
| `status` | String | `active` or `blocked` |
| `createdAt` | Date | Creation timestamp |
| `updatedAt` | Date | Last update timestamp |

Index:
- Unique index on `email`.

## 3.2 Projects

| Field | Type | Notes |
|---|---|---|
| `_id` | ObjectId | Project ID |
| `userId` | ObjectId | Reference to owning user |
| `name` | String | Required |
| `description` | String | Optional |
| `status` | String | `active` or `inactive` |
| `apiKeyHash` | String | Hash of current API key; never store raw key |
| `deletedAt` | Date or null | Soft-delete marker |
| `createdAt` | Date | Creation timestamp |
| `updatedAt` | Date | Last update timestamp |

Indexes:
- Index on `userId`.
- Consider a compound index on `{ userId: 1, deletedAt: 1 }` for listing a user's non-deleted projects.

MVP rule: one current API key per project. Regenerating a key replaces the previous hash immediately. Show the new raw key once only.

## 3.3 Templates

| Field | Type | Notes |
|---|---|---|
| `_id` | ObjectId | Template ID |
| `projectId` | ObjectId | Reference to owning project |
| `name` | String | Required |
| `subject` | String | Email subject |
| `html` | String | HTML template |
| `status` | String | `draft`, `active`, or `archived` |
| `deletedAt` | Date or null | Soft-delete marker |
| `createdAt` | Date | Creation timestamp |
| `updatedAt` | Date | Last update timestamp |

Indexes:
- Compound unique index on `{ projectId: 1, name: 1 }` to prevent duplicate template names within a project.
- If soft-deleted names should be reusable, replace the simple unique index with a partial unique index applying only to non-deleted documents. Decide this before implementing deletion and name reuse.

A template belongs to exactly one project. The API key is not stored in the template.

## 3.4 EmailLogs

| Field | Type | Notes |
|---|---|---|
| `_id` | ObjectId | Log ID |
| `projectId` | ObjectId | Project that initiated the send |
| `templateId` | ObjectId or null | Template reference; nullable if template is later removed |
| `templateName` | String | Snapshot of the template name at send time |
| `to` | String | Recipient email |
| `subject` | String | Subject used for the send |
| `status` | String | `sent` or `failed` |
| `error` | String or null | Safe failure reason; do not store secrets |
| `sentAt` | Date | Attempt timestamp |

Indexes:
- Compound index on `{ projectId: 1, sentAt: -1 }` for project logs sorted newest first.
- Consider `{ status: 1, sentAt: -1 }` only if platform-wide status filtering is a common query.

Logs are historical records and should not be deleted when a project or template is soft-deleted.

## 3.5 Relationships

```text
User 1 -------- many Projects
Project 1 ----- many Templates
Project 1 ----- many EmailLogs
Template 1 ---- many EmailLogs (historical reference)
```

## 3.6 Tenant isolation

Every project-scoped read or write must verify ownership.

For example, a request using Project A's API key with Project B's template ID must be rejected. The backend must verify both:

- The template's `projectId` matches the project identified by the API key.
- The project is active and not soft-deleted.

Do not rely on a frontend filter to enforce tenant isolation.
