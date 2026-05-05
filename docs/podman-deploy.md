# Podman Compose 部署说明

本文档用于把「快乐交易所」部署为公网可访问站点，并绑定你自己的域名，例如 `https://example.com/`。

## 1. 部署前提

- 一台可公网访问的 Linux 服务器
- 已安装 `podman` 和 `podman compose`
- 你的域名 `A` 记录已经指向服务器公网 IP
- 云防火墙和系统防火墙已经放行 `80/tcp` 与 `443/tcp`
- 宿主机允许容器暴露 `80/443`

## 2. 准备环境文件

在项目根目录执行：

```bash
cp .env.example .env
cp deploy/backend.env.example deploy/backend.env
```

然后至少修改以下值：

- `.env` 中的 `APP_DOMAIN`
- `.env` 中的 `POSTGRES_PASSWORD`
- `deploy/backend.env` 中的 `JWT_SECRET_KEY`

## 3. 启动服务

在项目根目录执行：

```bash
sudo podman compose -f podman-compose.yml up -d --build
```

首次启动后，Caddy 会自动为 `APP_DOMAIN` 对应的域名申请和续期 HTTPS 证书。

## 4. 验证

检查容器状态：

```bash
sudo podman compose -f podman-compose.yml ps
```

查看日志：

```bash
sudo podman compose -f podman-compose.yml logs -f caddy
sudo podman compose -f podman-compose.yml logs -f backend
```

验证地址：

- 前端首页：`https://<your-domain>/`
- 健康检查：`https://<your-domain>/health`
- OpenAPI：`https://<your-domain>/docs`

## 5. 常见问题

如果 HTTPS 证书一直申请失败，优先检查：

- `APP_DOMAIN` 对应域名是否已经正确解析到当前服务器
- `80/443` 是否真的对公网开放
- 服务器上是否已有其他服务占用了 `80/443`

如果后端日志提示 PostgreSQL 密码认证失败，而且你之前已经启动过旧版本容器，说明当前 `POSTGRES_PASSWORD` 和现有 `pg_data` 卷初始化时使用的密码不一致。此时二选一：

- 把 `.env` 中的 `POSTGRES_PASSWORD` 改回旧值
- 确认不需要旧数据后，删除旧卷再重建

如果需要重建：

```bash
sudo podman compose -f podman-compose.yml down
sudo podman compose -f podman-compose.yml up -d --build
```
