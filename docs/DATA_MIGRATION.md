# 数据迁移指南

将 mock-data 中的测试数据导入到 Supabase 数据库。

## 📋 前置条件

在运行数据迁移之前，请确保：

- ✅ 已创建 Supabase 项目
- ✅ 已执行数据库初始化 SQL (`lib/supabase/schema.sql`)
- ✅ 已配置环境变量（`.env.local`）

## 🚀 快速开始

### 方法 1: 使用 npm 脚本（推荐）

```bash
# 运行数据迁移
pnpm db:seed
```

### 方法 2: 直接运行脚本

```bash
# 使用 tsx 运行 TypeScript 脚本
pnpm tsx scripts/seed-database.ts
```

## 📊 导入的数据

脚本会按顺序导入以下数据：

### 1. 用户数据
- **数量**: 3 个用户
- **用户名**:
  - AI_Creator_Pro
  - PromptMaster
  - DigitalArtist
- **钱包地址**: 自动生成的测试地址

### 2. 帖子数据
- **数量**: 8 篇帖子
- **内容**: 包含标题、正文、图片、标签
- **类型**: 付费和免费内容混合

### 3. 商品数据
- **数量**: 7 个商品
- **价格**: 0 - 10.7 mUSDT
- **类型**: 教程、模板、指南等

### 4. 评论数据
- **数量**: 3 条评论
- **包含**: 顶层评论和回复

## 📝 运行输出示例

```bash
🚀 开始导入 Mock 数据到 Supabase...

📍 Supabase URL: https://xxxxx.supabase.co

📝 导入用户数据...
✅ 用户 AI_Creator_Pro (uuid-1234...)
✅ 用户 PromptMaster (uuid-5678...)
✅ 用户 DigitalArtist (uuid-9012...)
✨ 完成! 共导入 3 个用户

📝 导入帖子数据...
✅ 帖子 Creating Stunning AI Art with... (uuid-abcd...)
✅ 帖子 Free ChatGPT Workflow Templates... (uuid-efgh...)
...
✨ 完成! 共导入 8 篇帖子

📝 导入商品数据...
✅ 商品 Advanced Midjourney Prompts... (uuid-ijkl...)
...
✨ 完成! 共导入 7 个商品

📝 导入评论数据...
✅ 评论 This is incredibly helpful!...
✅ 回复 I agree! Would love to see...
✨ 完成! 共导入 3 条评论

✅ 所有数据导入完成!

📊 导入摘要:
  - 用户: 3
  - 帖子: 8
  - 商品: 7
  - 评论: 3

💡 提示:
  - 可以在 Supabase Dashboard 的 Table Editor 中查看数据
  - 所有用户的钱包地址都是模拟生成的
  - 需要使用真实钱包登录后才能进行交易操作
```

## 🔍 验证数据导入

### 方法 1: Supabase Dashboard

1. 打开 Supabase Dashboard
2. 点击 **Table Editor**
3. 检查各个表的数据：
   - `users` - 应该有 3 条记录
   - `posts` - 应该有 8 条记录
   - `products` - 应该有 7 条记录
   - `comments` - 应该有 3 条记录

### 方法 2: SQL 查询

在 Supabase SQL Editor 中运行：

```sql
-- 检查各表记录数
SELECT 
  'users' as table_name, COUNT(*) as count FROM users
UNION ALL
SELECT 
  'posts' as table_name, COUNT(*) as count FROM posts
UNION ALL
SELECT 
  'products' as table_name, COUNT(*) as count FROM products
UNION ALL
SELECT 
  'comments' as table_name, COUNT(*) as count FROM comments;
```

期望结果：
```
table_name | count
-----------|------
users      | 3
posts      | 8
products   | 7
comments   | 3
```

### 方法 3: 应用中查看

1. 启动开发服务器: `pnpm dev`
2. 访问 http://localhost:3000
3. 应该能看到导入的帖子和商品

## ⚠️ 注意事项

### 1. 钱包地址
- 所有用户的钱包地址都是**自动生成的测试地址**
- 格式: `0x0000...000{userId}`
- **不是真实的以太坊地址**
- 不能用于真实的区块链交易

### 2. 重复运行
- 如果重复运行脚本，会创建**重复的数据**
- 建议重新运行前先清空数据库

### 3. 清空数据库
如果需要重新导入，可以执行：

```sql
-- 警告：这将删除所有数据！
DELETE FROM comments;
DELETE FROM likes;
DELETE FROM post_purchases;
DELETE FROM purchases;
DELETE FROM products;
DELETE FROM posts;
DELETE FROM users;

-- 或者使用 CASCADE 删除（更简洁）
TRUNCATE TABLE users CASCADE;
```

## 🔧 故障排除

### 错误: "缺少 Supabase 环境变量"

**原因**: 未配置 `.env.local`

**解决**:
```bash
# 创建 .env.local 文件
cat > .env.local << EOF
NEXT_PUBLIC_SUPABASE_URL=your_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key_here
EOF
```

### 错误: "找不到用户 ID"

**原因**: 用户数据导入失败

**解决**:
1. 检查 Supabase RLS 策略
2. 确保数据库表已正确创建
3. 查看详细错误信息

### 错误: "foreign key constraint"

**原因**: 表之间的外键关系未正确设置

**解决**:
1. 确保已执行完整的 `schema.sql`
2. 按顺序导入数据（脚本已自动处理）

### 错误: "relation does not exist"

**原因**: 数据库表未创建

**解决**:
1. 先执行数据库初始化: `pnpm db:init`
2. 或在 Supabase Dashboard 中执行 `schema.sql`

## 🎯 自定义数据

如果要修改导入的数据：

### 1. 编辑 Mock 数据
编辑 `lib/mock-data.ts`:
```typescript
export const mockUsers: User[] = [
  // 添加或修改用户
  {
    id: "4",
    username: "NewUser",
    email: "new@example.com",
    avatar: "/new-avatar.png",
  },
];
```

### 2. 重新运行脚本
```bash
# 清空数据库（可选）
# 然后重新导入
pnpm db:seed
```

## 📚 相关文档

- [DATABASE_INITIALIZATION.md](./DATABASE_INITIALIZATION.md) - 数据库初始化
- [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) - Supabase 设置
- [QUICK_START.md](./QUICK_START.md) - 快速开始指南

## 💡 最佳实践

### 开发环境
1. 使用测试数据进行开发
2. 定期重置数据库
3. 保持 mock-data 与实际数据结构同步

### 生产环境
⚠️ **不要在生产环境运行此脚本！**

生产环境应该：
- 使用真实的用户注册流程
- 通过应用界面创建内容
- 备份数据库

## 🤝 贡献

如果要添加更多测试数据：
1. 更新 `lib/mock-data.ts`
2. 更新 `scripts/seed-database.ts` 的导入逻辑
3. 更新本文档

---

## 快速命令参考

```bash
# 初始化数据库表结构
pnpm db:init

# 导入测试数据
pnpm db:seed

# 启动开发服务器
pnpm dev

# 查看 Supabase Dashboard
# 访问: https://app.supabase.com
```

