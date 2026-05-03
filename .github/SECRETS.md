# GitHub Secrets Required

Go to: GitHub repo → Settings → Secrets and variables → Actions → New repository secret

## Required for CI to work
These are set automatically by GitHub — no action needed:
- GITHUB_TOKEN (automatic)

## Required for real deployment (optional)
Add these only when you are ready to deploy to a real server:

| Secret name       | Description                              | Example                    |
|-------------------|------------------------------------------|----------------------------|
| SSH_HOST          | Your server IP or domain                 | 192.168.1.100              |
| SSH_USER          | SSH username on server                   | ubuntu                     |
| SSH_KEY           | Private SSH key (contents of id_rsa)     | -----BEGIN OPENSSH...      |
| JWT_SECRET        | Production JWT secret (min 32 chars)     | run: openssl rand -hex 32  |
| JWT_REFRESH_SECRET| Production refresh secret (min 32 chars) | run: openssl rand -hex 32  |
| POSTGRES_PASSWORD | Production database password             | StrongPassword123!         |

## Generate strong secrets locally
Run these commands and paste the output into GitHub Secrets:

  openssl rand -hex 32    # for JWT_SECRET
  openssl rand -hex 32    # for JWT_REFRESH_SECRET
  openssl rand -base64 24 # for POSTGRES_PASSWORD
