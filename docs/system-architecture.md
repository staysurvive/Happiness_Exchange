# 系统架构文档

## 1. 架构目标

快乐交易所采用前后端分离架构。

目标：

- 前端负责用户界面、路由、交互状态、接口调用。
- 后端负责认证、业务逻辑、积分交易、数据持久化、文件上传。
- PostgreSQL 负责核心业务数据存储。
- 图片文件 MVP 阶段存储在本地目录，后续可替换为对象存储。

## 2. 技术栈

前端：

- React
- TypeScript
- Vite
- React Router
- TanStack Query
- Zustand
- Tailwind CSS

后端：

- Python
- FastAPI
- SQLAlchemy 2.x
- Alembic
- Pydantic
- PostgreSQL
- JWT Auth

## 3. 推荐目录结构

```txt
happy-exchange/
  README.md
  podman-compose.yml
  docs/
    product-design.md
    system-architecture.md
    database-schema.md
    api-design.md
    compliance-policy.md
    roadmap.md

  frontend/
    package.json
    vite.config.ts
    tsconfig.json
    src/
      main.tsx
      App.tsx
      pages/
      components/
      features/
      hooks/
      lib/
      stores/
      types/
      assets/

  backend/
    pyproject.toml
    alembic.ini
    app/
      main.py
      core/
        config.py
        database.py
        security.py
      models/
      schemas/
      api/
        v1/
          auth.py
          users.py
          products.py
          purchases.py
          checkins.py
          uploads.py
          comments.py
          likes.py
          collections.py
      services/
      repositories/
      utils/
    alembic/
      versions/
    uploads/
    tests/
```

## 4. 前端架构

### pages

存放页面级组件，例如：

- HomePage
- MarketPage
- ProductDetailPage
- PublishPage
- LoginPage
- RegisterPage
- MePage
- WalletPage

### components

存放通用 UI 组件，例如：

- ProductCard
- ProductGrid
- HeroSection
- CheckinCard
- PointBalance
- EmptyState
- LoadingState
- ErrorState
- ImageUploader

### features

按业务模块组织代码，例如：

- auth
- products
- purchases
- checkins
- comments
- collections
- likes

每个 feature 可包含：

- api.ts
- hooks.ts
- types.ts
- components.tsx

### lib

存放通用工具：

- api client
- auth token storage
- date formatter
- upload helper

### stores

使用 Zustand 存放轻量全局状态，例如：

- 当前用户
- 登录状态
- UI 状态

接口数据优先使用 TanStack Query 管理，不要把服务端列表数据长期塞进 Zustand。

## 5. 后端架构

### core

基础配置：

- `config.py`：环境变量和配置。
- `database.py`：数据库连接和 session。
- `security.py`：密码哈希、JWT。

### models

SQLAlchemy ORM 模型。

### schemas

Pydantic 请求和响应模型。

### api/v1

FastAPI 路由。路由只负责：

- 接收参数
- 调用 service
- 返回响应

不要把复杂业务逻辑堆在 router 中。

### services

业务逻辑层。

重要服务：

- AuthService
- UserService
- PointService
- ProductService
- PurchaseService
- CheckinService
- UploadService
- CommentService

### repositories

数据库访问层。可以在 MVP 阶段简化，但复杂查询应逐步抽离。

## 6. 核心服务职责

### PointService

负责所有积分变化：

- 增加积分
- 扣除积分
- 写入积分流水
- 校验余额

任何地方都不要直接修改 `users.points_balance`，必须通过 PointService。

### PurchaseService

负责购买流程：

1. 校验商品存在且可购买。
2. 校验不能购买自己的商品。
3. 校验不能重复购买。
4. 校验积分足够。
5. 创建购买记录。
6. 扣除买家积分。
7. 增加作者积分。
8. 更新商品购买数和快乐指数。

以上操作必须在同一个数据库事务中完成。

### ProductService

负责商品创建、更新、删除、查询、计数更新。

### UploadService

负责图片上传校验：

- 文件类型
- 文件大小
- 文件保存
- URL 返回

## 7. 数据流

### 商品购买数据流

```txt
Frontend ProductDetailPage
  -> POST /api/v1/products/{id}/purchase
  -> PurchaseService.purchase_product
  -> Product query
  -> Permission and balance checks
  -> Purchase insert
  -> PointService.spend buyer points
  -> PointService.income seller points
  -> Product counters update
  -> Commit transaction
  -> Return result
```

### 图片上传数据流

```txt
Frontend ImageUploader
  -> POST /api/v1/uploads/images
  -> UploadService validate file
  -> Save to backend/uploads
  -> Return image_url
  -> Frontend uses image_url in product creation
```

## 8. 环境变量

建议后端环境变量：

```txt
DATABASE_URL=
JWT_SECRET_KEY=
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=10080
UPLOAD_DIR=uploads
MAX_UPLOAD_SIZE_MB=5
```

前端环境变量：

```txt
VITE_API_BASE_URL=http://localhost:8000/api/v1
```

## 9. 容器编排

MVP 至少需要 PostgreSQL 服务。

建议服务：

- postgres
- backend
- frontend，可选

可以先保证本地命令启动，再补容器编排配置。

## 10. 架构限制

- 不要实现真实支付。
- 不要实现充值提现。
- 不要引入区块链或 NFT。
- 不要使用复杂金融交易引擎。
- 不要用数据库存图片二进制。
- 不要让前端绕过后端直接修改积分。
