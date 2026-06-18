# Antigravity Uptime Monitor

A lightweight, containerized full-stack service health and uptime monitoring dashboard. Built using the MERN stack (MongoDB, Express, React, Node) and styled with Tailwind CSS v4.

---

## 📂 Folder Structure

```text
uptime-monitor/
├── backend/
│   ├── src/
│   │   ├── config/                 # DB connections & configurations
│   │   │   └── db.js
│   │   ├── controllers/            # Request handlers (MRC logic)
│   │   │   ├── monitorController.js
│   │   │   └── statsController.js
│   │   ├── models/                 # Database schemas (Mongoose)
│   │   │   ├── Monitor.js
│   │   │   └── PingLog.js
│   │   ├── routes/                 # Express API routes (MRC routing)
│   │   │   ├── monitorRoutes.js
│   │   │   └── statsRoutes.js
│   │   ├── services/               # Background services (pinger)
│   │   │   └── scheduler.js
│   │   ├── app.js                  # Express middleware & router mounting
│   │   └── server.js               # Application boot & database connection
│   ├── Dockerfile                  # Exposes port 3000
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/             # Reusable UI elements
│   │   │   ├── AddMonitorForm.jsx
│   │   │   ├── GlobalStats.jsx
│   │   │   ├── Header.jsx
│   │   │   ├── MonitorCard.jsx
│   │   │   └── MonitorList.jsx
│   │   ├── pages/                  # Top-level route pages
│   │   │   └── Dashboard.jsx
│   │   ├── services/               # Reusable service classes
│   │   │   └── api.js
│   │   ├── App.jsx                 # Entry dashboard mounting
│   │   ├── index.css               # Tailwind CSS v4 setup & custom styling
│   │   └── main.jsx
│   ├── Dockerfile                  # Exposes port 5173 (Nginx server)
│   ├── nginx.conf                  # Routes 5173 traffic & proxies /api
│   ├── vite.config.js              # Vite + Tailwind v4 config (Port 5173)
│   └── package.json
├── docker-compose.yml              # DB (27017), Backend (3000), Frontend (5173)
├── AI_LOG.md                       # AI tech stack and course corrections
└── README.md                       # Verification instructions & Cloud sketch
```

---

## ⚙️ Environment Configuration

The application utilizes environment variables to manage configurations such as the database connection string and API port. A template file is provided at [backend/.env.example](file:///c:/accio-job/7.projects/uptime-monitor/backend/.env.example).

### Setup Instructions

1. **Navigate to the backend directory**:

   ```bash
   cd backend
   ```

2. **Generate the configuration file** by copying the template:
   - **Linux/macOS**:
     ```bash
     cp .env.example .env
     ```
   - **Windows (PowerShell)**:
     ```powershell
     Copy-Item .env.example .env
     ```

3. **Configure the variables** in the newly created `backend/.env`:
   - `PORT`: The port on which the Express server runs (defaults to `3000`).
   - `MONGO_URI`: The connection URI for your MongoDB instance. You can set this to a local server or a hosted cloud cluster (e.g., MongoDB Atlas).

   _Example configuration:_

   ```env
   PORT=3000
   MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/uptimemonitor
   ```

### Running with Docker Compose

When running via Docker Compose (`docker compose up --build`), environment variables are configured automatically:

- The backend container is preconfigured to resolve to the database container using `mongodb://db:27017/uptimemonitor`.
- Creating a manual `.env` file is optional for Docker Compose setups.
- To override any default variables inside Docker Compose, you can place a `.env` file in the root directory or modify the `environment:` definitions inside `docker-compose.yml`.

### Frontend API URL Configuration (Optional)

The React frontend (built with Vite) proxies API requests to the backend server.

- By default, it proxies to `http://localhost:3000`.
- To specify a custom backend endpoint for the frontend proxy, you can set the environment variable:
  - `VITE_BACKEND_URL`: The URL of your API service (e.g., `http://my-api-server:3000`).

---

## ⚡ 1-Line Setup

To spin up the database, backend API, and frontend dashboard locally, run:

```bash
docker compose up --build
```

Once started:

- **Frontend Dashboard**: Open [http://localhost:5173](http://localhost:5173)
- **Backend API**: Accessible at [http://localhost:3000/api/monitors](http://localhost:3000/api/monitors)

To shut down the services:

```bash
docker compose down
```

---

## 🧪 Testing & Verification Steps

Follow these steps to verify that the up/down state tracking, latency logging, and sparklines operate correctly:

1. **Launch the environment** using the setup command above.
2. **Open the browser** and navigate to [http://localhost:5173](http://localhost:5173). You will see the main dashboard showing "No endpoints are currently monitored".
3. **Verify Up State**:
   - In the control panel, enter:
     - **Friendly Name**: `Example Domain`
     - **Monitor Destination URL**: `https://example.com`
   - Click **Add Monitor**.
   - The monitor card will appear with status `Online` (green badge).
   - Within 10-20 seconds, the first ping latency (ms) will register and the custom SVG sparkline will start drawing points.
4. **Verify Down State**:
   - In the control panel, register an unreachable destination:
     - **Friendly Name**: `Broken Service`
     - **Monitor Destination URL**: `https://this-domain-does-not-exist-12345.com`
   - Click **Add Monitor**.
   - The monitor card will appear with status `Offline` (red badge).
   - You can trigger a manual check at any time by clicking the **Check Now** button on either card to bypass the 60-second background poll timer.
5. **Verify Persistence**:
   - Shut down the containers using `docker compose down`.
   - Start them again with `docker compose up`.
   - Refresh the page at [http://localhost:5173](http://localhost:5173). All registered monitors and their latency history logs will be restored.

---

## ☁️ Deployment Sketch (Lightweight IaC)

This sketch details how to deploy this application to **Amazon Web Services (AWS)** using a serverless container architecture.

### Architectural Overview

- **Frontend**: Built static assets uploaded to an **Amazon S3** bucket and served globally via **Amazon CloudFront** (CDN) for low-latency delivery.
- **Backend API**: Express application deployed to **AWS Elastic Container Service (ECS)** on **Fargate** (serverless containers) behind an **Application Load Balancer (ALB)**.
- **Database**: **MongoDB Atlas** (Managed MongoDB cloud) or **AWS DocumentDB** configured in a multi-availability-zone cluster.
- **Network**: All backend systems run inside a secure VPC with private subnets. Nginx / ECS Fargate instances communicate securely.

### Terraform Sketch (`deploy.tf`)

```hcl
# 1. ECS Cluster & Service for Backend API
resource "aws_ecs_cluster" "app_cluster" {
  name = "uptime-monitor-cluster"
}

resource "aws_ecs_task_definition" "backend_task" {
  family                   = "uptime-backend"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = "256"
  memory                   = "512"
  execution_role_arn       = aws_iam_role.ecs_execution_role.arn

  container_definitions = jsonencode([{
    name      = "uptime-backend"
    image     = "<AWS_ACCOUNT_ID>.dkr.ecr.<REGION>.amazonaws.com/uptime-backend:latest"
    essential = true
    portMappings = [{
      containerPort = 3000
      hostPort      = 3000
    }]
    environment = [
      { name = "PORT", value = "3000" },
      { name = "MONGO_URI", value = "mongodb+srv://<USERNAME>:<PASSWORD>@cluster.mongodb.net/uptimemonitor" }
    ]
  }])
}

resource "aws_ecs_service" "backend_service" {
  name            = "uptime-backend-service"
  cluster         = aws_ecs_cluster.app_cluster.id
  task_definition = aws_ecs_task_definition.backend_task.arn
  desired_count   = 2
  launch_type     = "FARGATE"

  network_configuration {
    subnets          = ["subnet-12345", "subnet-67890"]
    security_groups  = [aws_security_group.backend_sg.id]
    assign_public_ip = true
  }

  load_balancer {
    target_group_arn = aws_lb_target_group.backend_tg.arn
    container_name   = "uptime-backend"
    container_port   = 3000
  }
}

# 2. Amazon S3 Bucket for Frontend Static Files
resource "aws_s3_bucket" "frontend_bucket" {
  bucket = "antigravity-uptime-monitor-frontend"
}

# 3. CloudFront Distribution
resource "aws_cloudfront_distribution" "cdn" {
  origin {
    domain_name = aws_s3_bucket.frontend_bucket.bucket_regional_domain_name
    origin_id   = "S3-Frontend"
  }

  origin {
    domain_name = aws_lb.alb.dns_name
    origin_id   = "ALB-Backend"

    custom_origin_config {
      http_port              = 80
      https_port             = 443
      origin_protocol_policy = "match-viewer"
      origin_ssl_protocols   = ["TLSv1.2"]
    }
  }

  enabled             = true
  default_root_object = "index.html"

  # Forward /api requests to ECS backend ALB
  ordered_cache_behavior {
    path_pattern     = "/api/*"
    target_origin_id = "ALB-Backend"
    allowed_methods  = ["GET", "HEAD", "OPTIONS", "PUT", "POST", "PATCH", "DELETE"]
    cached_methods   = ["GET", "HEAD"]

    forwarded_values {
      query_string = true
      headers      = ["*"]
      cookies { forward = "all" }
    }

    viewer_protocol_policy = "redirect-to-https"
  }

  # Forward everything else to S3 bucket (React frontend SPA)
  default_cache_behavior {
    allowed_methods  = ["GET", "HEAD"]
    cached_methods   = ["GET", "HEAD"]
    target_origin_id = "S3-Frontend"

    forwarded_values {
      query_string = false
      cookies { forward = "none" }
    }

    viewer_protocol_policy = "redirect-to-https"
  }

  restrictions {
    geo_restriction { restriction_type = "none" }
  }

  viewer_certificate {
    cloudfront_default_certificate = true
  }
}
```
