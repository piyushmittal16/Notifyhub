# 9. Roadmap & Architecture Decisions

## 9.1 Implementation roadmap

### Phase 0 — Planning and foundation
- [x] Define product purpose and MVP scope.
- [x] Define Developer and Admin roles.
- [x] Define project/template lifecycle rules.
- [x] Design database collections and indexes.
- [x] Choose modular monolith architecture.
- [x] Define JWT/RBAC approach.
- [x] Define API endpoint groups.
- [x] Define email send and log behavior.
- [ ] Review and finalize detailed endpoint schemas.
- [ ] Create repository and environment templates.

### Phase 1 — Backend foundation and authentication
- Set up Express application.
- Connect MongoDB.
- Add configuration and centralized error handling.
- Implement signup, login, logout, and current-user endpoint.
- Add JWT cookie middleware and role authorization.
- Add authentication tests.

### Phase 2 — Projects and API keys
- Implement project CRUD and soft deletion.
- Implement project status.
- Generate secure project API keys.
- Store only key hashes and display raw key once.
- Add ownership tests.

### Phase 3 — Templates
- Implement template CRUD and soft deletion.
- Implement template status changes.
- Enforce per-project template-name uniqueness.
- Define and implement safe variable syntax and HTML escaping.

### Phase 4 — Email engine
- Configure Nodemailer transport.
- Implement API-key authentication.
- Enforce project/template status and ownership rules.
- Implement one-recipient send endpoint.
- Store sent/failed logs.
- Test success and failure paths.

### Phase 5 — Logs and analytics
- Implement All Logs and project-specific logs.
- Add filters and pagination.
- Add project analytics endpoints.
- Verify aggregation accuracy.

### Phase 6 — Frontend dashboard
- Implement auth screens and protected navigation.
- Build project management.
- Build template management and preview.
- Build email logs and filters.
- Build basic analytics views.

### Phase 7 — Admin panel
- Build user list and block/unblock controls.
- Build basic project overview.
- Build platform aggregate analytics.
- Verify admin data does not expose secrets or private template content.

### Phase 8 — Release hardening
- Complete security review.
- Run automated tests and manual smoke tests.
- Configure production deployment.
- Verify backups, monitoring, and error handling.

### Phase 9 — Post-MVP
- Evaluate Redis/BullMQ, retries, webhooks, SDKs, multiple keys, Docker, CI/CD, and advanced monitoring based on actual needs.

## 9.2 Key decisions register

| Area | Decision |
|---|---|
| Architecture | Modular monolith; no microservices for MVP |
| Frontend | React |
| Backend | Node.js + Express |
| Database | MongoDB |
| Email transport | Nodemailer with configured SMTP/provider |
| Dashboard auth | JWT in HTTP-only cookie |
| JWT expiry | 7 days for MVP |
| Refresh token | Deferred |
| Roles | Developer and Admin |
| Role protection | RBAC middleware |
| Project key | One current key per project |
| Key storage | Hash only; raw key shown once |
| Template ownership | Template stores `projectId`; no API key in template |
| Project statuses | `active` / `inactive` |
| Template statuses | `draft` / `active` / `archived` |
| Deletion | Soft delete projects and templates |
| Email send | One recipient per request |
| Email failure | Save failed log; no automatic retry in MVP |
| Logs | Preserve history; developer gets All Logs and project filters |
| API version | Prefix routes with `/api/v1` |
| Queue | Redis/BullMQ deferred |
| SDK | Deferred; use REST/fetch for MVP |

## 9.3 Decisions still requiring implementation-time confirmation

These details were not fully specified and should not be silently assumed:

1. SMTP/email provider and its verified sender/domain.
2. Exact template placeholder syntax and behavior for missing variables.
3. Whether soft-deleted template names can be reused (this affects the unique index).
4. Whether deleted projects/templates can be restored.
5. Exact pagination defaults and maximum page size.
6. Exact analytics metrics and date/timezone rules.
7. Whether email send success means provider accepted the message or a provider delivery event confirmed delivery. MVP should report transport/provider acceptance accurately.
8. Cookie `sameSite`, domain, and CORS configuration based on deployment topology.
9. Whether All Logs is exposed as `GET /api/v1/logs` (recommended) or another documented route.
10. Retention policy for logs and user data.

## 9.4 Definition of done

A feature is not complete merely because the UI works. It should include:
- Backend validation and authorization.
- Correct ownership/tenant isolation.
- Success and failure handling.
- Relevant tests.
- Loading, empty, and error UI states where applicable.
- Documentation updates for changed API behavior.
