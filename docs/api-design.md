# API 设计文档

## 1. 基础约定

API 前缀：

```txt
/api/v1
```

认证方式：

```txt
Authorization: Bearer <access_token>
```

成功响应可以直接返回数据，也可以使用统一结构：

```json
{
  "data": {},
  "message": "success"
}
```

错误响应可以使用 FastAPI 默认格式：

```json
{
  "detail": "错误说明"
}
```

## 2. Auth

### POST /auth/register

注册用户。

请求：

```json
{
  "username": "happy_user",
  "email": "user@example.com",
  "password": "password123"
}
```

规则：

- email 唯一。
- username 唯一。
- 密码必须哈希存储。
- 注册成功后默认获得 100 快乐币。
- 注册奖励需要写入积分流水。

响应：

```json
{
  "id": 1,
  "username": "happy_user",
  "email": "user@example.com",
  "points_balance": 100
}
```

### POST /auth/login

登录。

请求：

```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

响应：

```json
{
  "access_token": "jwt-token",
  "token_type": "bearer"
}
```

### GET /auth/me

获取当前用户。

需要登录。

响应：

```json
{
  "id": 1,
  "username": "happy_user",
  "email": "user@example.com",
  "avatar_url": null,
  "bio": null,
  "points_balance": 100
}
```

## 3. Users

### GET /users/me

获取当前用户详情。

当前实现补充：

- 返回 `id`、`username`、`email`、`avatar_url`、`bio`、`points_balance`、`created_at`

### GET /users/me/points

获取当前用户快乐币余额和最近积分流水。

响应：

```json
{
  "points_balance": 120,
  "total": 2,
  "page": 1,
  "page_size": 20,
  "point_transactions": [
    {
      "id": 1,
      "amount": 10,
      "balance_after": 120,
      "transaction_type": "checkin_reward",
      "description": "每日签到奖励",
      "created_at": "2026-04-30T12:00:00Z"
    }
  ]
}
```

### GET /users/me/products

获取当前用户发布的商品。

当前实现补充：

```json
{
  "items": [],
  "page": 1,
  "page_size": 20,
  "total": 0
}
```

### GET /users/me/purchases

获取当前用户购买过的商品。

当前实现补充：

```json
{
  "items": [
    {
      "purchased_at": "2026-05-02T10:00:00Z",
      "purchase_price": 15,
      "product": {}
    }
  ],
  "page": 1,
  "page_size": 20,
  "total": 1
}
```

### GET /users/me/collections

获取当前用户收藏的商品。

当前实现补充：

```json
{
  "items": [
    {
      "collected_at": "2026-05-02T10:00:00Z",
      "product": {}
    }
  ],
  "page": 1,
  "page_size": 20,
  "total": 1
}
```

## 4. Checkins

### POST /checkins

每日签到。

需要登录。

规则：

- 每天只能签到一次。
- 成功后获得 10 快乐币。
- 需要写入 checkins 和 point_transactions。

响应：

```json
{
  "checked_in": true,
  "reward_points": 10,
  "points_balance": 110
}
```

### GET /checkins/me

获取当前用户签到状态。

响应：

```json
{
  "checked_in_today": true,
  "latest_checkin_date": "2026-04-30",
  "latest_checkin": {
    "checkin_date": "2026-04-30",
    "reward_points": 10,
    "created_at": "2026-04-30T12:00:00Z"
  },
  "reward_points": 10,
  "points_balance": 110
}
```

## 5. Uploads

### POST /uploads/images

上传图片。

需要登录。

请求：

```txt
multipart/form-data
file=<image>
```

规则：

- 支持 JPG、PNG、WEBP。
- 单张最大 5MB。
- 返回图片 URL。
- 不要把图片二进制写入数据库。

响应：

```json
{
  "image_url": "/uploads/2026/04/xxx.webp"
}
```

## 6. Products

### POST /products

创建情绪商品。

需要登录。

请求：

```json
{
  "title": "下班路上的橘子味天空",
  "description": "今天下班看到一片特别温柔的晚霞。",
  "product_type": "beautiful_view",
  "mood_tags": ["治愈", "放松", "美好"],
  "price": 15,
  "image_urls": ["/uploads/xxx.webp"]
}
```

规则：

- 标题不能为空。
- 价格不能为负数。
- 图片最多 9 张。
- 创建成功奖励作者 5 快乐币。
- 发布奖励需要写积分流水。

响应：

```json
{
  "id": 1,
  "title": "下班路上的橘子味天空",
  "price": 15,
  "happy_score": 0
}
```

### GET /products

获取商品列表。

查询参数：

```txt
type
mood_tag
min_price
max_price
sort
page
page_size
```

`sort` 可选：

- latest
- popular
- price_asc
- price_desc
- happy_score

响应：

```json
{
  "items": [],
  "page": 1,
  "page_size": 20,
  "total": 100
}
```

### GET /products/{id}

获取商品详情。

响应字段应包含：

- 商品基础信息
- 作者信息
- 图片列表
- 当前用户是否已购买
- 当前用户是否已点赞
- 当前用户是否已收藏
- 当前用户是否为作者
- 当前用户是否允许购买
- 当前用户是否允许评论

未购买时可以返回部分描述或完整描述，具体按产品实现决定。MVP 可以先返回完整内容，后续再做内容解锁。

### PATCH /products/{id}

修改商品。

需要登录。

规则：

- 只有作者可以修改。
- 已删除商品不能修改。

### DELETE /products/{id}

删除商品。

需要登录。

规则：

- 只有作者可以删除。
- 建议软删除，将 status 改为 deleted。

## 7. Purchase

### POST /products/{id}/purchase

购买商品。

需要登录。

规则：

- 不能购买自己的商品。
- 不能重复购买同一个商品。
- 积分不足不能购买。
- 已删除商品不能购买。
- 扣分、加分、创建购买记录、写积分流水必须在同一个事务中完成。

响应：

```json
{
  "purchased": true,
  "product_id": 1,
  "price": 15,
  "points_balance": 85
}
```

## 8. Likes

### POST /products/{id}/like

点赞商品。

需要登录。

规则：

- 同一用户对同一商品只能点赞一次。
- 点赞后更新商品 like_count 和 happy_score。

### DELETE /products/{id}/like

取消点赞。

需要登录。

## 9. Collections

### POST /products/{id}/collection

收藏商品。

需要登录。

规则：

- 同一用户对同一商品只能收藏一次。
- 收藏后更新 collection_count 和 happy_score。

### DELETE /products/{id}/collection

取消收藏。

需要登录。

## 10. Comments

### POST /products/{id}/comments

创建评论。

需要登录。

请求：

```json
{
  "content": "谢谢，看到这个心情好了点。"
}
```

规则：

- 评论内容不能为空。
- 评论后更新 comment_count 和 happy_score。

### GET /products/{id}/comments

获取商品评论列表。

当前实现补充：

```json
{
  "items": [
    {
      "id": 1,
      "content": "谢谢，看到这个心情好了点。",
      "created_at": "2026-05-02T10:00:00Z",
      "updated_at": "2026-05-02T10:00:00Z",
      "is_mine": true,
      "user": {}
    }
  ],
  "page": 1,
  "page_size": 20,
  "total": 1
}
```

### DELETE /comments/{id}

删除评论。

需要登录。

规则：

- 用户只能删除自己的评论。
- 商品作者是否可以删除评论，MVP 可暂不支持。
- 建议软删除。

## 11. 状态码建议

- 200：成功。
- 201：创建成功。
- 400：业务参数错误。
- 401：未登录。
- 403：无权限。
- 404：资源不存在。
- 409：重复操作，例如重复购买、重复点赞。
- 422：请求体校验失败。
