# 项目启动文档

本文档说明如何在本地启动「快乐交易所」项目。

---

## 1. 运行环境

### 前端

- Node.js 22+
- npm 10+

### 后端

- Python 3.12+
- PostgreSQL 14+

### 本地数据库

- Host：`localhost`
- Port：`5432`
- Username：`postgres`
- Password：`<your-local-db-password>`
- Database：`happy_exchange`

---

## 2. 启动前准备

### 2.1 确认数据库存在

如果数据库还没创建，可以执行：

```sql
CREATE DATABASE happy_exchange;
```

### 2.2 确认环境变量文件存在

后端：

```txt
backend/.env
```

前端：

```txt
frontend/.env
```

---

## 3. 启动后端

在 PowerShell 中执行：

```powershell
cd backend
.\.venv\Scripts\Activate.ps1
alembic upgrade head
uvicorn app.main:app --reload
```

启动后访问：

- 健康检查：<http://127.0.0.1:8000/health>
- OpenAPI：<http://127.0.0.1:8000/docs>

---

## 4. 启动前端

在另一个 PowerShell 窗口执行：

```powershell
cd frontend
npm run dev
```

启动后访问：

- 前端地址：<http://127.0.0.1:5173>

---

## 5. 常用检查命令

### 灌入演示假数据

如果你已经用 `podman compose` 跑起来了容器，可以执行：

```bash
podman exec -e HAPPY_EXCHANGE_DEMO_PASSWORD='set-a-demo-password-first' <backend-container-name> python /srv/backend/scripts/seed_demo_content.py
```

默认会创建一批演示用户、商品、评论、购买、签到和快乐礼物，并复用项目内的主题图片资源。

### 前端构建检查

```powershell
cd frontend
npm run build
```

### 后端测试

```powershell
cd backend
.\.venv\Scripts\pytest -q
```

### 数据库迁移状态

```powershell
cd backend
.\.venv\Scripts\alembic current
```

---

## 6. 停止服务

如果服务是你在终端前台启动的，直接：

```powershell
Ctrl + C
```

如果是后台进程，可按端口查找并结束进程：

```powershell
Get-NetTCPConnection -LocalPort 8000 | Select-Object OwningProcess
Get-NetTCPConnection -LocalPort 5173 | Select-Object OwningProcess
Stop-Process -Id <PID>
```

---

## 7. 当前 MVP 已支持

- 注册 / 登录
- 获取当前用户
- 签到
- 图片上传
- 商品发布
- 商品列表 / 商品详情
- 购买
- 点赞 / 收藏 / 评论
- 个人中心 / 钱包
