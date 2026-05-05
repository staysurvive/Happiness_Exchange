# 数据库设计文档

## 1. 数据库

使用 PostgreSQL。

数据库迁移使用 Alembic 管理。

所有表建议包含：

- `created_at`
- `updated_at`，如需要

时间字段统一使用 UTC 存储。

## 2. users

用户表。

| 字段 | 类型 | 说明 |
|---|---|---|
| id | UUID / BIGINT | 主键 |
| username | VARCHAR | 用户名，唯一 |
| email | VARCHAR | 邮箱，唯一 |
| password_hash | VARCHAR | 密码哈希 |
| avatar_url | TEXT | 头像 URL |
| bio | TEXT | 个人简介 |
| points_balance | INTEGER | 快乐币余额 |
| is_active | BOOLEAN | 是否启用 |
| created_at | TIMESTAMP | 创建时间 |
| updated_at | TIMESTAMP | 更新时间 |

规则：

- 新用户默认 `points_balance = 100`。
- 密码必须哈希存储。
- 不允许明文密码入库。

## 3. emotion_products

情绪商品表。

| 字段 | 类型 | 说明 |
|---|---|---|
| id | UUID / BIGINT | 主键 |
| author_id | FK users.id | 作者 |
| title | VARCHAR | 标题 |
| description | TEXT | 描述 |
| product_type | VARCHAR | 商品类型 |
| mood_tags | JSONB / TEXT[] | 情绪标签 |
| price | INTEGER | 价格，单位快乐币 |
| cover_image_url | TEXT | 封面图 URL |
| is_resellable | BOOLEAN | 是否允许转卖，MVP 可默认 false |
| is_limited | BOOLEAN | 是否限量，MVP 可默认 false |
| stock_total | INTEGER | 总库存，MVP 可为空 |
| stock_remaining | INTEGER | 剩余库存，MVP 可为空 |
| status | VARCHAR | 状态 |
| happy_score | INTEGER | 快乐指数 |
| purchase_count | INTEGER | 购买数 |
| like_count | INTEGER | 点赞数 |
| collection_count | INTEGER | 收藏数 |
| comment_count | INTEGER | 评论数 |
| created_at | TIMESTAMP | 创建时间 |
| updated_at | TIMESTAMP | 更新时间 |

`product_type` 可选值：

- happy_moment
- lucky_today
- healing_photo
- beautiful_view
- cute_pet
- funny_joke
- encouragement
- other

`status` 可选值：

- published
- hidden
- deleted
- under_review

MVP 可以只使用：

- published
- deleted

规则：

- `price >= 0`。
- `happy_score` 初始为 0。
- `purchase_count`、`like_count`、`collection_count`、`comment_count` 初始为 0。
- 删除商品建议软删除，将 status 改为 deleted。

## 4. product_images

商品图片表。

| 字段 | 类型 | 说明 |
|---|---|---|
| id | UUID / BIGINT | 主键 |
| product_id | FK emotion_products.id | 商品 ID |
| image_url | TEXT | 图片 URL |
| sort_order | INTEGER | 排序 |
| created_at | TIMESTAMP | 创建时间 |

规则：

- 每个商品最多 9 张图片。
- 图片二进制不进入数据库。
- 商品创建时应设置一张封面图，可使用第一张图片。

## 5. purchases

购买记录表。

| 字段 | 类型 | 说明 |
|---|---|---|
| id | UUID / BIGINT | 主键 |
| buyer_id | FK users.id | 买家 |
| product_id | FK emotion_products.id | 商品 ID |
| seller_id | FK users.id | 卖家/作者 |
| price | INTEGER | 成交价格 |
| created_at | TIMESTAMP | 创建时间 |

约束：

- `buyer_id + product_id` 唯一，防止重复购买。
- `buyer_id != seller_id`，业务层也要校验。

## 6. point_transactions

积分流水表。

| 字段 | 类型 | 说明 |
|---|---|---|
| id | UUID / BIGINT | 主键 |
| user_id | FK users.id | 用户 ID |
| amount | INTEGER | 积分变化，可正可负 |
| balance_after | INTEGER | 变化后的余额 |
| transaction_type | VARCHAR | 流水类型 |
| related_product_id | FK emotion_products.id | 关联商品，可空 |
| related_purchase_id | FK purchases.id | 关联购买记录，可空 |
| description | TEXT | 描述 |
| created_at | TIMESTAMP | 创建时间 |

`transaction_type` 可选值：

- register_bonus
- checkin_reward
- product_publish_reward
- product_purchase_spend
- product_purchase_income
- system_adjustment

规则：

- 所有积分变化必须写入该表。
- 不允许直接修改余额而不写流水。
- 购买时买家扣分和卖家加分都要写流水。

## 7. checkins

签到表。

| 字段 | 类型 | 说明 |
|---|---|---|
| id | UUID / BIGINT | 主键 |
| user_id | FK users.id | 用户 ID |
| checkin_date | DATE | 签到日期 |
| reward_points | INTEGER | 奖励积分 |
| created_at | TIMESTAMP | 创建时间 |

约束：

- `user_id + checkin_date` 唯一。

规则：

- 每个用户每天只能签到一次。
- MVP 默认奖励 10 快乐币。

## 8. product_likes

商品点赞表。

| 字段 | 类型 | 说明 |
|---|---|---|
| id | UUID / BIGINT | 主键 |
| user_id | FK users.id | 用户 ID |
| product_id | FK emotion_products.id | 商品 ID |
| created_at | TIMESTAMP | 创建时间 |

约束：

- `user_id + product_id` 唯一。

规则：

- 点赞时商品 `like_count + 1`。
- 取消点赞时商品 `like_count - 1`。
- 同步更新 `happy_score`。

## 9. product_collections

商品收藏表。

| 字段 | 类型 | 说明 |
|---|---|---|
| id | UUID / BIGINT | 主键 |
| user_id | FK users.id | 用户 ID |
| product_id | FK emotion_products.id | 商品 ID |
| created_at | TIMESTAMP | 创建时间 |

约束：

- `user_id + product_id` 唯一。

规则：

- 收藏时商品 `collection_count + 1`。
- 取消收藏时商品 `collection_count - 1`。
- 同步更新 `happy_score`。

## 10. product_comments

商品评论表。

| 字段 | 类型 | 说明 |
|---|---|---|
| id | UUID / BIGINT | 主键 |
| user_id | FK users.id | 评论用户 |
| product_id | FK emotion_products.id | 商品 ID |
| content | TEXT | 评论内容 |
| is_deleted | BOOLEAN | 是否删除 |
| created_at | TIMESTAMP | 创建时间 |
| updated_at | TIMESTAMP | 更新时间 |

规则：

- 评论内容不能为空。
- 删除评论建议软删除，将 `is_deleted = true`。
- MVP 不需要楼中楼。

## 11. reports（可选，建议预留）

举报表。

| 字段 | 类型 | 说明 |
|---|---|---|
| id | UUID / BIGINT | 主键 |
| reporter_id | FK users.id | 举报人 |
| target_type | VARCHAR | product/comment/user |
| target_id | VARCHAR | 被举报对象 ID |
| reason | VARCHAR | 举报原因 |
| description | TEXT | 补充说明 |
| status | VARCHAR | pending/resolved/rejected |
| created_at | TIMESTAMP | 创建时间 |
| updated_at | TIMESTAMP | 更新时间 |

MVP 可以只建表，不实现完整审核后台。

## 12. 索引建议

建议索引：

- users.email
- users.username
- emotion_products.author_id
- emotion_products.product_type
- emotion_products.status
- emotion_products.created_at
- emotion_products.happy_score
- purchases.buyer_id
- purchases.product_id
- point_transactions.user_id
- point_transactions.created_at
- checkins.user_id
- checkins.checkin_date
- product_likes.product_id
- product_collections.product_id
- product_comments.product_id

## 13. 快乐指数计算

MVP 公式：

```txt
happy_score = purchase_count * 3 + like_count * 1 + collection_count * 2 + comment_count * 2
```

建议封装为后端函数或 service 方法，不要在多处重复计算。
