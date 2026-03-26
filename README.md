# AWS Practice Project: React + Node + PostgreSQL CRUD

This project is a simple full-stack CRUD app to practice AWS services:

- **Frontend**: React (Dockerized)
- **Backend**: Node.js + Express + PostgreSQL client (Dockerized)
- **Database**: PostgreSQL Docker image (`postgres:16-alpine`)

You can run it locally first, then deploy using EC2/ECR/ECS/Fargate/S3/RDS.

## 1) Local Run (Docker Compose)

From the project root:

```bash
docker compose up --build
```

App URLs:

- Frontend: `http://localhost:5173`
- Backend health: `http://localhost:4000/health`

## 2) CRUD API

- `GET /users` - list users
- `GET /users/:id` - single user
- `POST /users` - create `{ "name": "...", "email": "..." }`
- `PUT /users/:id` - update `{ "name": "...", "email": "..." }`
- `DELETE /users/:id` - delete user

## 3) Build Images and Push to Docker Hub

Replace `YOUR_DOCKERHUB_USERNAME`:

```bash
docker login

docker build -t YOUR_DOCKERHUB_USERNAME/aws-practice-backend:latest ./backend
docker build -t YOUR_DOCKERHUB_USERNAME/aws-practice-frontend:latest ./frontend

docker push YOUR_DOCKERHUB_USERNAME/aws-practice-backend:latest
docker push YOUR_DOCKERHUB_USERNAME/aws-practice-frontend:latest
```

## 4) AWS Practice Path

### A) EC2 (quick practice)

1. Launch EC2 (Amazon Linux 2023 or Ubuntu).
2. Install Docker + Docker Compose plugin.
3. Pull Docker Hub images and run containers.
4. Open security group inbound rules:
   - `80` for frontend
   - `4000` if testing backend directly

### B) ECR (AWS registry)

Create ECR repos:

- `aws-practice-backend`
- `aws-practice-frontend`

Tag and push (replace placeholders):

```bash
aws ecr get-login-password --region <REGION> | docker login --username AWS --password-stdin <ACCOUNT_ID>.dkr.ecr.<REGION>.amazonaws.com

docker tag YOUR_DOCKERHUB_USERNAME/aws-practice-backend:latest <ACCOUNT_ID>.dkr.ecr.<REGION>.amazonaws.com/aws-practice-backend:latest
docker tag YOUR_DOCKERHUB_USERNAME/aws-practice-frontend:latest <ACCOUNT_ID>.dkr.ecr.<REGION>.amazonaws.com/aws-practice-frontend:latest

docker push <ACCOUNT_ID>.dkr.ecr.<REGION>.amazonaws.com/aws-practice-backend:latest
docker push <ACCOUNT_ID>.dkr.ecr.<REGION>.amazonaws.com/aws-practice-frontend:latest
```

### C) ECS + Fargate

1. Create ECS cluster (Fargate).
2. Create task definitions:
   - frontend task image from ECR
   - backend task image from ECR
3. Create services for each task.
4. Use ALB:
   - route `/api/*` to backend target group
   - route `/` to frontend target group
5. Set backend environment variables in task definition.

### D) RDS PostgreSQL

1. Create RDS PostgreSQL instance.
2. Allow ECS security group to access RDS port `5432`.
3. Create `usersdb` and `users` table using `db/init.sql`.
4. Update backend env in ECS:
   - `DB_HOST=<RDS endpoint>`
   - `DB_PORT=5432`
   - `DB_USER=<rds user>`
   - `DB_PASSWORD=<rds password>`
   - `DB_NAME=usersdb`

### E) S3 (frontend static hosting alternative)

Alternative to running frontend container:

1. Build frontend:
   ```bash
   cd frontend && npm install && npm run build
   ```
2. Create S3 bucket for static website hosting.
3. Upload `frontend/dist` contents.
4. Optionally put CloudFront in front.
5. Set `VITE_API_URL` to backend ALB URL before build.

## 5) Suggested Next Improvements

- Add auth (JWT)
- Add migrations (Prisma or Knex)
- Add CI/CD (GitHub Actions -> ECR -> ECS deploy)
- Store secrets in AWS Secrets Manager
# aws
# aws
