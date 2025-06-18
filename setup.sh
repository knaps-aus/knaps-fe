#!/usr/bin/env bash
set -e

# 1. Project root (default “my-fullstack-app” or first arg)
PROJECT_DIR=${1:-knaps}
mkdir -p "$PROJECT_DIR"
cd "$PROJECT_DIR"

# 2. Scaffold React frontend
echo "⏳ Creating React app…"
npx create-react-app frontend

# 3. Frontend Dockerfile
cat > frontend/Dockerfile << 'EOF'
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
CMD ["npm", "start"]
EOF

# 4. Backend requirements & .env
mkdir -p backend/app
cat > backend/requirements.txt << 'EOF'
fastapi
uvicorn[standard]
psycopg2-binary
SQLAlchemy
asyncpg
python-dotenv
EOF

cat > backend/.env << 'EOF'
DATABASE_URL=postgresql+asyncpg://postgres:postgres@db:5432/mydatabase
EOF

# 5. FastAPI “hello world”
cat > backend/app/main.py << 'EOF'
import os
from fastapi import FastAPI
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

load_dotenv()
DATABASE_URL = os.getenv("DATABASE_URL")

engine = create_async_engine(DATABASE_URL, echo=True)
SessionLocal = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
async def health():
    return {"status": "ok"}
EOF

# 6. Backend Dockerfile
cat > backend/Dockerfile << 'EOF'
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]
EOF

# 7. Docker Compose (React, FastAPI, Postgres)
cat > docker-compose.yml << 'EOF'
version: '3.9'
services:
  db:
    image: postgres:15
    restart: always
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: mydatabase
    volumes:
      - db_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  backend:
    build: ./backend
    restart: always
    volumes:
      - ./backend:/app
    env_file:
      - ./backend/.env
    ports:
      - "8000:8000"
    depends_on:
      - db

  frontend:
    build: ./frontend
    restart: always
    volumes:
      - ./frontend:/app
      - /app/node_modules
    ports:
      - "3000:3000"
    depends_on:
      - backend

volumes:
  db_data:
EOF

echo "✅  Setup complete!  
Run `docker-compose up --build` to start React on :3000, FastAPI on :8000 and Postgres on :5432."  
