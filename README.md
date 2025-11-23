# GitHub Marker

A full-stack web application for bookmarking and managing GitHub repositories. Built with FastAPI (backend) and React + TypeScript (frontend).

## Project Structure

```
github-marker/
├── github-marker-backend/   # FastAPI backend
└── github-marker-frontend/  # React + Vite frontend
```

## Features

- 🔐 User authentication (register/login/logout)
- 🔖 Bookmark GitHub repositories
- 📊 Dashboard with statistics and charts
- 🔍 Search GitHub repositories
- 📈 Track bookmarking activity over time
- 📤 CSV import/export functionality

## Tech Stack

### Backend
- **FastAPI** - Modern Python web framework
- **SQLAlchemy** - ORM with async support
- **PostgreSQL** - Database with asyncpg driver
- **Alembic** - Database migrations
- **JWT** - Authentication
- **Pydantic** - Data validation

### Frontend
- **React** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool
- **TanStack Query** - Data fetching
- **Recharts** - Data visualization
- **shadcn/ui** - UI components
- **Tailwind CSS** - Styling

## Getting Started

### Prerequisites

- Python 3.14+
- Node.js 22+
- PostgreSQL database
- pnpm (for frontend)

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd github-marker-backend
   ```

2. Create a virtual environment and activate it:
   ```bash
   python -m venv .venv
   source .venv/bin/activate  # On Windows: .venv\Scripts\activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Copy `.env.example` to `.env` and configure your environment variables:
   ```bash
   cp .env.example .env
   ```


5. Start the development server:
   ```bash
   .venv/bin/uvicorn app.main:app --reload
   ```

The API will be available at `http://localhost:8000`

API documentation: `http://localhost:8000/docs`

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd github-marker-frontend
   ```

2. Install dependencies:
   ```bash
   pnpm install
   ```

3. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

4. Start the development server:
   ```bash
   pnpm dev
   ```

The app will be available at `http://localhost:5173`


