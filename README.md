# 🏠 Real Estate Platform

A full-stack real estate platform built with Next.js, Express, PostgreSQL, and Prisma. Features property listings, admin dashboard, inquiry system, and user authentication.

## 🌐 Live Demo

- **Frontend:** https://your-app.vercel.app
- **Backend API:** https://your-app.onrender.com
- **API Health:** https://your-app.onrender.com/health

## ✨ Features

### Public Website
- 🏡 Homepage with featured properties and search
- 🔍 Property listings with filters (city, type, status, price, bedrooms)
- 📄 Property detail page with image gallery
- ❤️ Favorites system (per user)
- 📬 Inquiry form on each property
- 📱 Fully responsive design

### Authentication
- 🔐 JWT access token + refresh token
- 👤 Register and login
- 🔒 Role-based access (ADMIN, AGENT, USER)
- 👁️ Password show/hide
- 🔑 Change password from profile

### Admin Dashboard
- 📊 Overview with stats
- 🏘️ Create, edit, delete properties
- 📩 View and manage inquiries (NEW → CONTACTED → CLOSED)
- 👤 Profile management

### Backend API
- ✅ RESTful API with Express
- 🛡️ Security: Helmet, CORS, Rate limiting, HPP
- 📝 Logging: Winston + Morgan
- ✔️ Validation: Zod schemas
- 🗜️ Compression for performance
- 🖼️ Image upload system

## 🛠️ Tech Stack

| Layer      | Technology                        |
|------------|-----------------------------------|
| Frontend   | Next.js 16, TypeScript, Tailwind  |
| Backend    | Node.js, Express, TypeScript      |
| Database   | PostgreSQL, Prisma ORM            |
| Auth       | JWT (access + refresh tokens)     |
| Hosting    | Vercel (frontend), Render (backend) |
| Database   | Neon PostgreSQL                   |
| CI/CD      | GitHub Actions                    |

## 📁 Project Structure
## 🚀 Getting Started

### Prerequisites

- Node.js 20+
- Docker Desktop
- Git

### 1. Clone the repository

```bash
git clone https://github.com/your-username/real-estate-platform.git
cd real-estate-platform
```

### 2. Install dependencies

```bash
npm install
cd apps/backend && npm install
cd ../frontend && npm install
cd ../..
```

### 3. Set up environment variables

```bash
# Backend
cp apps/backend/.env.example apps/backend/.env
```

Edit `apps/backend/.env`:

```env
NODE_ENV=development
PORT=5000
FRONTEND_URL=http://localhost:3000
DATABASE_URL="postgresql://postgres:password@localhost:5432/real_estate_db?schema=public"
DIRECT_URL="postgresql://postgres:password@localhost:5432/real_estate_db?schema=public"
JWT_SECRET=your_min_32_char_secret_here
JWT_EXPIRES_IN=15m
JWT_REFRESH_SECRET=your_different_min_32_char_secret
JWT_REFRESH_EXPIRES_IN=30d
```

```bash
# Frontend
cp apps/frontend/.env.example apps/frontend/.env.local
```

Edit `apps/frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1
NEXT_PUBLIC_UPLOAD_URL=http://localhost:5000
```

### 4. Start the database

```bash
npm run docker:dev
```

### 5. Run database migrations and seed

```bash
cd apps/backend
npx prisma migrate deploy
npx prisma generate
npx ts-node prisma/seed.ts
```

### 6. Start development servers

```bash
# From project root — starts both frontend and backend
npm run dev

# Or separately
npm run dev:backend   # http://localhost:5000
npm run dev:frontend  # http://localhost:3000
```

## 🗄️ Database

### Run migrations

```bash
cd apps/backend
npx prisma migrate deploy
```

### Seed test data

```bash
npx ts-node prisma/seed.ts
```

### Open Prisma Studio (visual DB browser)

```bash
npx prisma studio
# Opens at http://localhost:5555
```

### View database in PgAdmin
## 🔑 Test Accounts

After seeding, these accounts are available:

| Role  | Email                      | Password  |
|-------|----------------------------|-----------|
| Admin | admin@realestate.com       | Password1 |
| Agent | sarah@realestate.com       | Password1 |
| Agent | mike@realestate.com        | Password1 |
| User  | buyer@example.com          | Password1 |

## 📡 API Endpoints

### Auth
### Inquiries
### Upload
### Health
## 🔍 Property Filters
## 🐳 Docker

### Start local development stack

```bash
npm run docker:dev
# Starts PostgreSQL + PgAdmin
```

### Stop

```bash
npm run docker:dev:down
```

### Build production images

```bash
# Backend
docker build -t real-estate-backend apps/backend/

# Frontend
docker build \
  --build-arg NEXT_PUBLIC_API_URL=https://your-api.onrender.com/api/v1 \
  --build-arg NEXT_PUBLIC_UPLOAD_URL=https://your-api.onrender.com \
  -t real-estate-frontend apps/frontend/
```

## ⚙️ CI/CD Pipeline

GitHub Actions runs automatically on every push to `main` or `develop`:
## 🌍 Deployment

### Backend on Render

Set these environment variables in Render dashboard:
### Database on Neon

```bash
# Run migrations
npx prisma migrate deploy

# Seed data
npx ts-node prisma/seed.ts
```

## 🔒 Security Features

- JWT access tokens (15 min) + refresh tokens (30 days)
- Bcrypt password hashing (12 rounds)
- Helmet HTTP security headers
- CORS restricted to frontend URL
- Rate limiting: 100 req/15min general, 10 req/15min for auth
- HPP (HTTP Parameter Pollution) protection
- Input validation with Zod
- SQL injection protection via Prisma ORM
- Environment variables for all secrets

## 📊 Database Schema
## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feat/your-feature`
3. Commit changes: `git commit -m 'feat: add your feature'`
4. Push to branch: `git push origin feat/your-feature`
5. Open a Pull Request

## 📝 License

MIT License — feel free to use this project for learning or commercial purposes.

---

Built with ❤️ using Next.js, Express, PostgreSQL, and Prisma
