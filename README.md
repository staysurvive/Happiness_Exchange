# Happy Exchange

Happy Exchange（快乐交易所）是一个围绕“情绪价值内容”设计的轻社交积分平台。用户可以发布治愈照片、快乐瞬间、风景、宠物、鼓励话语等内容，并使用平台积分“快乐币”完成浏览、购买、收藏、点赞、评论等互动。

项目当前已经具备完整的 MVP 闭环：

- 注册、登录、获取当前用户
- 快乐币余额、积分流水、每日签到
- 商品发布、图片上传、商品列表、商品详情
- 购买、点赞、收藏、评论
- 个人中心、钱包、我的发布、我的购买、我的收藏

## Tech Stack

- Frontend: React, TypeScript, Vite, React Router, TanStack Query, Zustand, Tailwind CSS
- Backend: FastAPI, SQLAlchemy 2.x, Alembic, PostgreSQL, JWT
- Deployment: Podman Compose, Caddy, Nginx

## Project Structure

```txt
happy_shop/
├─ backend/              # FastAPI backend
├─ frontend/             # React frontend
├─ docs/                 # Product, API, architecture, deployment docs
├─ deploy/               # Deployment templates
├─ assets/               # Preset public assets used by the app
├─ scripts/              # Utility scripts
└─ podman-compose.yml    # Container orchestration entrypoint
```

## Quick Start

### 1. Requirements

- Node.js 22+
- npm 10+
- Python 3.12+
- PostgreSQL 14+

### 2. Prepare Database

Create a local database:

```sql
CREATE DATABASE happy_exchange;
```

### 3. Configure Environment Variables

Backend:

```bash
cp backend/.env.example backend/.env
```

Frontend:

```bash
cp frontend/.env.example frontend/.env
```

Root deployment template:

```bash
cp .env.example .env
cp deploy/backend.env.example deploy/backend.env
```

Before running the project, replace placeholder values such as:

- `DATABASE_URL`
- `JWT_SECRET_KEY`
- `POSTGRES_PASSWORD`
- `APP_DOMAIN`

### 4. Start Backend

Linux/macOS:

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
python -m pip install --upgrade pip
pip install -e .
alembic upgrade head
uvicorn app.main:app --reload
```

Windows PowerShell:

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
pip install -e .
alembic upgrade head
uvicorn app.main:app --reload
```

Backend endpoints:

- Health: `http://127.0.0.1:8000/health`
- OpenAPI: `http://127.0.0.1:8000/docs`
- ReDoc: `http://127.0.0.1:8000/redoc`

### 5. Start Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend default address:

- `http://127.0.0.1:5173`

## Deployment

The repository includes a Podman Compose based deployment setup:

- [`podman-compose.yml`](podman-compose.yml)
- [`deploy/Caddyfile`](deploy/Caddyfile)
- [`docs/podman-deploy.md`](docs/podman-deploy.md)

If you deploy publicly, use your own domain and replace all placeholder secrets before startup.

## API Overview

Core API groups:

- `/api/v1/auth`
- `/api/v1/users`
- `/api/v1/checkins`
- `/api/v1/products`
- `/api/v1/comments`
- `/api/v1/uploads`

Detailed API design is documented in [docs/api-design.md](docs/api-design.md).

## Useful Commands

Frontend build:

```bash
cd frontend
npm run build
```

Backend tests:

```bash
cd backend
pytest -q
```

Database migration status:

```bash
cd backend
alembic current
```

Seed demo content inside a running backend container:

```bash
podman exec -e HAPPY_EXCHANGE_DEMO_PASSWORD='set-a-demo-password-first' <backend-container-name> python /srv/backend/scripts/seed_demo_content.py
```

## Documentation

- [Startup Guide](docs/startup-guide.md)
- [Podman Deploy Guide](docs/podman-deploy.md)
- [System Architecture](docs/system-architecture.md)
- [API Design](docs/api-design.md)
- [Database Schema](docs/database-schema.md)
- [Compliance Policy](docs/compliance-policy.md)

## Repository Rules

- Do not commit real `.env` files, private keys, tokens, or credentials.
- Do not commit build artifacts, runtime uploads, caches, or local virtual environments.
- This project provides an MVP implementation and does not include real payment, recharge, withdrawal, or other real-money transaction flows.

## Status

Current status: MVP available, local development ready, deployment templates included.
