# ScamNemesis - Production Credentials

> **CONFIDENTIAL** - This file contains sensitive production credentials.
> Store securely and never commit to public repositories.

## GitHub Secrets (Repository Settings)

| Secret Name | Value | Purpose |
|-------------|-------|---------|
| `DOMAIN` | `scamnemesis.com` | Production domain |
| `ACME_EMAIL` | `info@scamnemesis.com` | Let's Encrypt SSL certificate email |
| `POSTGRES_PASSWORD` | *(set in GitHub)* | PostgreSQL database password |
| `JWT_SECRET` | `k8Jm9Pq2RsT5vW7xY0zA3bC6dE8fG1hI4jK7lM0nO2pQ5rS8tU1vW4xY7zA0bC3dE6f` | JWT access token signing |
| `JWT_REFRESH_SECRET` | `H2jK5mN8pQ1rT4vW7xZ0aC3bE6fH9iK2lN5oQ8rT1uW4xZ7aD0cF3gI6jL9mP2qS5t` | JWT refresh token signing |
| `GRAFANA_ADMIN_PASSWORD` | `ScamNemesis2024Grafana!` | Grafana admin login |
| `REDIS_PASSWORD` | `scamnemesis_redis_2024` | Redis cache password |
| `TYPESENSE_API_KEY` | `scamnemesis_typesense_key_2024` | Typesense search API key |
| `S3_ACCESS_KEY` | `minioadmin` | MinIO/S3 access key |
| `S3_SECRET_KEY` | `minioadmin123` | MinIO/S3 secret key |
| `SSH_HOST` | *(server IP)* | Production server SSH host |
| `SSH_USER` | *(ssh username)* | Production server SSH user |
| `SSH_PRIVATE_KEY` | *(private key)* | SSH key for deployment |

## Service Access URLs

| Service | URL | Credentials |
|---------|-----|-------------|
| **Website** | https://scamnemesis.com | Public |
| **API** | https://scamnemesis.com/api/v1 | Public/Auth |
| **Admin Panel** | https://scamnemesis.com/admin | Admin user |
| **Grafana** | Internal only (port 3000) | admin / ScamNemesis2024Grafana! |
| **MinIO Console** | Internal only (port 9001) | minioadmin / minioadmin123 |

## Database Connection

```
Host: postgres (internal) or server-ip:5432 (external)
Database: scamnemesis
User: postgres
Password: (POSTGRES_PASSWORD from GitHub secrets)
```

## Admin Account Setup

After first deployment, create admin account:
```
GET https://scamnemesis.com/api/setup/admin?token=ADMIN_SETUP_TOKEN
```

## Security Notes

1. **JWT tokens** - 64-character random strings for security
2. **Change default passwords** in production if exposed
3. **S3 credentials** - Consider using stronger passwords for production
4. **Backup** these credentials securely (password manager, encrypted storage)

## Deployment

To deploy, either:
1. Push to `main` branch (triggers CI/CD)
2. Manually trigger: Actions → Deploy to Production → Run workflow

---
*Last updated: December 2024*
