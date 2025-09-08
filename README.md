# Globizora API (Express + MongoDB + Stripe)

Production-style Node/Express backend with JWT auth, MongoDB (Mongoose), Stripe Checkout, Swagger docs, and simple usage tracking.

## Directory

```
globizora-api/
├─ src/
│  └─ app.js              # Main server (your provided code, slightly organized)
├─ .env.example           # Copy to .env and fill variables
├─ .gitignore
├─ docker-compose.yml     # Optional MongoDB service
├─ Dockerfile             # Container for the API
├─ nodemon.json           # Dev autoreload
├─ package.json
└─ README.md
```

## Quick Start

1. **Install**

```bash
npm install
```

2. **Env**

```bash
cp .env.example .env
# edit .env (MONGO_URI, JWT_SECRET, STRIPE keys)
```

3. **Run MongoDB** (choose one)
- Local MongoDB on your machine, or
- Docker:
```bash
docker compose up -d mongo
```

4. **Dev server**

```bash
npm run dev
# http://localhost:3000  and docs at  http://localhost:3000/docs
```

## cURL Smoke Tests

```bash
# Health
curl http://localhost:3000/status

# Register
curl -X POST http://localhost:3000/auth/register -H "Content-Type: application/json" \
  -d '{ "username":"demo", "email":"demo@example.com", "password":"secret123" }'

# Login (grab token)
curl -X POST http://localhost:3000/auth/login -H "Content-Type: application/json" \
  -d '{ "email":"demo@example.com", "password":"secret123" }'

# Protected
curl http://localhost:3000/users -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## GitHub — Create & Push

**Option A: Website**
1. Create a new repo on GitHub (e.g., `globizora-api`), **do not** add any files.
2. Locally:
```bash
git init
git add .
git commit -m "chore: bootstrap Globizora API"
git branch -M main
git remote add origin https://github.com/<your-username>/globizora-api.git
git push -u origin main
```

**Option B: GitHub CLI**
```bash
gh repo create globizora-api --public --source=. --remote=origin --push
```

## Stripe Webhook (dev)

Expose your local server (e.g., with Stripe CLI):
```bash
stripe listen --forward-to localhost:3000/webhook/stripe
```

## Docker (API)

```bash
docker build -t globizora-api .
docker run --env-file .env -p 3000:3000 --name globizora-api --network=host globizora-api
```

---

MIT © Globizora Inc
