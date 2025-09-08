Globizora API










Globizora API is a production-ready Express.js backend service that provides:

🔑 JWT authentication & API key management

📦 MongoDB integration (Mongoose ODM)

💳 Stripe Checkout subscription support

📊 API usage tracking & server metrics

📜 Interactive Swagger UI documentation

✨ Features

Auth: User registration / login with JWT, hashed passwords

API Keys: Generate unique keys for each user

Stripe Integration: Subscription plans (free, pro, enterprise) with checkout sessions & webhooks

Data Endpoints: Company info, mock analytics data

Contact Form: Validated input form endpoint

Swagger Docs: Built-in interactive API documentation

Metrics: Users, memory usage, database status

📂 Project Structure
globizora-api/
├─ src/
│  └─ app.js              # Main API server
├─ .env.example           # Environment variable template
├─ .gitignore
├─ docker-compose.yml     # MongoDB service (optional)
├─ Dockerfile             # API container build
├─ package.json
└─ README.md

🚀 Quick Start
1. Clone & Install
git clone https://github.com/Globizora/globizora-api.git
cd globizora-api
npm install

2. Configure Environment
cp .env.example .env


Edit .env:

NODE_ENV=development
PORT=3000
MONGO_URI=mongodb://localhost:27017/globizora
JWT_SECRET=your_long_secret_string
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx

3. Start MongoDB

Local install: MongoDB server running on localhost:27017

Or via Docker:

docker compose up -d mongo

4. Run API
npm run dev    # Development with nodemon
# OR
node src/app.js

🧪 API Examples
Register
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{ "username":"demo", "email":"demo@example.com", "password":"secret123" }'

Login
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{ "email":"demo@example.com", "password":"secret123" }'

Protected Endpoint
curl http://localhost:3000/users \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

📖 Documentation

Swagger UI is available at:
👉 http://localhost:3000/docs

It allows you to explore and test all endpoints (auth, users, API keys, Stripe subscriptions, webhooks).


Example: Globizora API Swagger UI screenshot.

🐳 Docker Deployment
docker build -t globizora-api .
docker run --env-file .env -p 3000:3000 globizora-api

📊 Roadmap

 Role-based access control (RBAC)

 Stripe metered billing

 Admin dashboard (Next.js)

 Cloud deployment on AWS/GCP

📜 License

MIT © 2025 Globizora Inc

✅ Next steps for you:

Create .github/assets/ in your repo.

Upload your Swagger UI screenshot as swagger-ui.png.

Replace your current README.md with the above full content.
