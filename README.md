# Todo Platform

Vite React TypeScript frontend, Express.js backend, MySQL database, and phpMyAdmin managed with Docker Compose.

## Run

```bash
docker compose up --build
```

Open:

- Frontend: http://localhost:5173
- Backend health: http://localhost:3000/health
- API todos: http://localhost:3000/api/todos
- phpMyAdmin: http://localhost:8080

## Database Login

- Server: `mysql`
- Database: `todo_platform`
- User: `todo_user`
- Password: `todo_pass`
- Root user: `root`
- Root password: `rootpass`

## Useful Commands

```bash
docker compose ps
docker compose logs -f backend
docker compose logs -f frontend
docker compose down
docker compose down -v
```

Use `docker compose down -v` only when you want to remove the MySQL data volume and start fresh.

## API

| Method | Path | Description |
| --- | --- | --- |
| `GET` | `/api/todos` | List todos |
| `POST` | `/api/todos` | Create todo |
| `PATCH` | `/api/todos/:id` | Update title or completed state |
| `DELETE` | `/api/todos/:id` | Delete todo |


## CICD
```
    เรา push code ไป GitHub
            ↓
    GitHub Actions ทำงาน
            ↓
    SSH เข้า VM
            ↓
    pull code ล่าสุด
            ↓
    docker compose up -d --build
```