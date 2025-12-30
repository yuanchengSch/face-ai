# Face AI 部署指南 (Deployment Guide)

本指南将帮助您将 **Face AI** 项目部署到一台全新的 Linux 服务器上（推荐 Ubuntu 20.04/22.04 或 CentOS 7/8）。

我们将使用 **Docker** 和 **Docker Compose** 进行部署，这是最简单、最稳定的方式。

## 第一步：准备服务器环境

登录到您的 Linux 服务器，执行以下命令安装 Git 和 Docker。

### 1. 更新系统并安装 Git
```bash
# Ubuntu / Debian
sudo apt-get update
sudo apt-get install -y git

# CentOS / Alibaba Cloud Linux / RHEL (您当前的系统很有可能是这个)
sudo yum update -y
sudo yum install -y git

# CentOS / RHEL
sudo yum update -y
sudo yum install -y git
```

### 2. 安装 Docker & Docker Compose
最快捷的安装方式是使用官方脚本：
```bash
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
```

启动 Docker 并设置开机自启：
```bash
sudo systemctl start docker
sudo systemctl enable docker
```

验证安装：
```bash
sudo docker --version
sudo docker compose version
```

### 3. 配置防火墙端口 (Security Group / Firewall)
请确保您的服务器防火墙或云服务商安全组已开放以下端口：

| 端口 | 说明 | 必需性 |
| :--- | :--- | :--- |
| **80** | HTTP Web 服务 | **必须** (用户访问入口) |
| **8000** | 后端 API 调试/Swagger | 可选 (如果不公开调试可关闭) |
| **22** | SSH 远程连接 | **必须** (用于远程登录) |

## 第二步：获取项目代码

如果您尚未配置 GitHub SSH Key，可以使用 HTTPS 方式克隆（需要输入账号密码），或者先配置 SSH Key。这里假设您的仓库是公开的或您已配置好权限。

```bash
# 切换到您想存放项目的目录，例如 /opt 或 /home
cd /opt

# 克隆项目
sudo git clone https://github.com/yuanchengSch/face-ai.git

# 进入项目目录
cd face-ai
```

## 第三步：部署运行

我们已经配置好了 `docker-compose.yml`，这会让部署变得非常极其简单。

### 1. 构建并启动服务
在 `face-ai` 目录下执行：

```bash
sudo docker compose up -d --build
```
*   `-d`: 后台运行
*   `--build`: 强制重新构建镜像（确保获取最新代码依赖）

### 2. 验证部署
等待几分钟构建完成后，检查容器状态：
```bash
sudo docker compose ps
```
您应该能看到 `face-ai-frontend` 和 `face-ai-backend` 都在 `Up` 状态。

现在，您可以通过浏览器访问服务器的 IP 地址：
*   **前端访问**：`http://<服务器IP>`
*   **后端 API**：`http://<服务器IP>:8000/docs` (Swagger 文档)

## 常见维护操作

### 更新代码并重新部署
当您在本地开发完成并推送到 GitHub 后，在服务器上只需执行：
```bash
# 1. 拉取最新代码
sudo git pull origin main

# 2. 重新构建并重启服务
sudo docker compose up -d --build
```

### 查看日志
如果有错误发生，可以查看日志进行排查：
```bash
# 查看所有日志
sudo docker compose logs -f

# 查看特定服务日志（backend 或 frontend）
sudo docker compose logs -f backend
```

### 停止服务
```bash
sudo docker compose down
```

## 环境变量说明
目前项目使用 SQLite 数据库，数据会自动持久化在 `backend/sql_app.db`。如果需要修改配置，可以编辑 `docker-compose.yml` 或 `backend/.env` 文件。
