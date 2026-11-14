# 8. Deployment & Operations

## 8.1 MVP deployment components

The initial deployment needs:

- React frontend hosting.
- Node.js/Express backend hosting.
- MongoDB database (managed service recommended for an MVP).
- SMTP/email provider credentials.
- HTTPS domain(s).
- Environment-variable/secret management.

The exact providers are intentionally not selected in this planning document.

## 8.2 Environment configuration

Example backend environment variables (names may be adjusted during implementation):

```env
NODE_ENV=development
PORT=5000
MONGODB_URI=
JWT_SECRET=
JWT_EXPIRES_IN=7d
CLIENT_ORIGIN=
COOKIE_DOMAIN=
EMAIL_HOST=
EMAIL_PORT=
EMAIL_USER=
EMAIL_PASS=
EMAIL_FROM=
```

Do not commit real values. Provide a `.env.example` with blank or placeholder values. Use strong, unique secrets in each environment.

The developer's project API key belongs in the developer's own backend environment, not in the NotifyHub frontend.

## 8.3 Deployment checklist

- Configure production environment variables.
- Use HTTPS.
- Set secure cookie attributes for the deployed frontend/backend domains.
- Configure CORS to allow only intended frontend origins.
- Configure MongoDB access controls and backups.
- Configure SMTP/provider credentials.
- Apply database indexes.
- Configure rate limits and request-size limits.
- Ensure logs do not contain passwords, API keys, JWTs, or provider credentials.
- Verify health endpoint and error handling.
- Run database and API smoke tests after deployment.

## 8.4 Monitoring and operational basics

For the MVP, capture:
- Application errors.
- Request failures and latency.
- Email send success/failure counts.
- Provider/SMTP errors in a safe form.
- Database connection failures.

Never log raw authentication tokens, raw project API keys, passwords, or full secret-bearing request headers.

## 8.5 Deferred production improvements

After the MVP is stable, consider:

- Redis + BullMQ for background email queues.
- Retry policies with backoff and dead-letter handling.
- Webhooks for delivery/bounce events if supported by the provider.
- Multiple API keys and key rotation history.
- SDKs for common languages.
- Stronger session revocation and refresh-token strategy.
- CI/CD pipelines.
- Docker/container deployment.
- Structured centralized logging and alerting.
- Provider failover and delivery analytics.

Do not add these before the core MVP workflows are reliable.
