# Face AI SaaS - 医美智能管理平台

一个面向美容顾问/医生的垂直患者管理 SaaS 系统。通过 AI 提供面容诊断、长期个性化护理方案以及节气养生建议。

## ✨ 功能特性

- **患者管理**: 完整的患者档案、会员等级、消费记录管理
- **AI 面容诊断**: 上传照片即可获得结构化肤质分析和专业建议
- **长期方案生成**: 结合"节气"算法，动态生成个性化护理计划
- **问卷反馈**: 定期收集健康状况和满意度信息
- **时间轴**: 完整记录患者全生命周期数据

## 🛠 技术栈

### 后端
- **FastAPI** - 高性能 Python Web 框架
- **SQLAlchemy** - ORM
- **Pydantic** - 数据验证
- **SQLite/PostgreSQL** - 数据库

### 前端
- **React 18** + **TypeScript**
- **Vite** - 构建工具
- **Arco Design** - UI 组件库
- **ECharts** - 数据可视化
- **Zustand** - 状态管理

## 🚀 快速开始

### 环境要求
- Python 3.9+
- Node.js 18+
- npm 或 yarn

### 本地开发

1. **克隆项目**
```bash
git clone https://github.com/your-username/face-ai.git
cd face-ai
```

2. **启动后端**
```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload
```
后端 API 文档: http://localhost:8000/docs

3. **启动前端**
```bash
cd frontend
npm install
npm run dev
```
前端页面: http://localhost:5173

### 一键启动 (Windows)
```powershell
.\start_dev.ps1
```

## 📦 部署

### Docker Compose
```bash
docker-compose up --build
```

### 手动部署
- 后端: 使用 uvicorn 或 gunicorn
- 前端: `npm run build` 后部署 `dist/` 目录到 Nginx

## 📁 项目结构

```
face-ai/
├── backend/                # FastAPI 后端
│   ├── app/
│   │   ├── ai/            # AI Provider (Mock/DeepSeek)
│   │   ├── core/          # 配置、数据库、安全
│   │   ├── models/        # SQLAlchemy 模型
│   │   ├── routers/       # API 路由
│   │   ├── schemas/       # Pydantic 模型
│   │   ├── services/      # 业务逻辑层
│   │   └── utils/         # 工具函数 (节气等)
│   └── requirements.txt
├── frontend/               # React 前端
│   ├── src/
│   │   ├── api/           # API 调用封装
│   │   ├── components/    # 通用组件
│   │   ├── pages/         # 页面组件
│   │   └── utils/         # 工具函数
│   └── package.json
└── docker-compose.yml
```

## 📄 License

MIT License
