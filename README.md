# 🚆 RailMadad AI Platform

> AI-powered railway grievance redressal platform — complaint registration, tracking, AI classification, severity detection, chatbot assistance, and analytics.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React.js + Vite, Tailwind CSS + Shadcn/UI |
| **Backend** | Python 3.11+, FastAPI, async SQLAlchemy + Alembic |
| **Database** | PostgreSQL 15 (pgvector) |
| **Cache / Broker** | Redis 7 |
| **Auth** | OTP (mobile/email) + JWT, guest access |
| **State** | React Query (server) + Zustand (client) |
| **Real-time** | WebSockets |
| **AI** | LangChain + LangGraph, Sentence Transformers, Whisper |
| **Background** | Celery |
| **Monitoring** | Prometheus + Grafana + ELK |
| **CI/CD** | GitHub Actions |
| **Deployment** | Docker + Vercel (frontend) |

## Repository Structure

```
├── frontend/          # React + Vite application
├── backend/           # FastAPI + Celery application
├── ai-services/       # Standalone AI/ML microservices
├── infra/             # Docker, Nginx, monitoring configs
└── .github/workflows/ # CI/CD pipelines
```

## Quick Start

### Prerequisites

- Node.js 18+
- Python 3.11+
- Docker & Docker Compose
- Poetry (Python)

### 1. Clone & Configure

```bash
git clone https://github.com/<your-org>/RailMadad-AI-Platform.git
cd RailMadad-AI-Platform
cp .env.example .env
# Edit .env with your actual values
```

### 2. Start Services (Docker)

```bash
docker compose -f infra/docker-compose.yml up -d
```

### 3. Run Backend (Development)

```bash
cd backend
poetry install
poetry run alembic upgrade head
poetry run uvicorn app.main:app --reload --port 8000
```

### 4. Run Frontend (Development)

```bash
cd frontend
npm install
npm run dev
```

### 5. Run Celery Worker

```bash
cd backend
poetry run celery -A app.celery_app worker --loglevel=info
```

## API Documentation

Once the backend is running, visit:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## Deployment

- **Frontend**: Deployed to Vercel — see `frontend/vercel.json`
- **Backend + Services**: Deployed via Docker — see `infra/docker-compose.yml`

## Contributing

1. Fork the repo
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.
