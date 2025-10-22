# 数据库初始化指南

本指南详细说明如何初始化 Supabase 数据库。

## 🎯 目标

执行 `lib/supabase/schema.sql` 文件来创建所有必需的数据库表和配置。

---

## 方法 1: Supabase Dashboard（推荐 ⭐）

### 第一步：创建/打开项目

1. 访问 [https://app.supabase.com](https://app.supabase.com)
2. 点击 **New Project** 创建新项目，或选择已有项目
3. 等待项目初始化完成（约 2 分钟）

### 第二步：打开 SQL Editor

1. 在左侧菜单中找到 **SQL Editor**
   - 图标：`</>`
   - 位置：通常在 Table Editor 下方
2. 点击进入

### 第三步：准备 SQL 语句

1. 打开项目中的 `lib/supabase/schema.sql` 文件
2. **全选**所有内容（Cmd/Ctrl + A）
3. **复制**（Cmd/Ctrl + C）

### 第四步：执行 SQL

1. 在 SQL Editor 中点击 **New Query**
2. 将复制的内容**粘贴**到编辑器中
3. （可选）给查询命名，如 "Initial Database Setup"
4. 点击右下角的 **Run** 按钮
   - 或使用快捷键：`Cmd/Ctrl + Enter`

### 第五步：验证结果

执行成功后，你应该看到：

```
Success. No rows returned
```

或类似的成功提示。

### 第六步：检查表是否创建成功

1. 点击左侧的 **Table Editor**
2. 你应该能看到以下 7 个表：
   - ✅ users
   - ✅ posts
   - ✅ products
   - ✅ purchases
   - ✅ post_purchases
   - ✅ comments
   - ✅ likes

---

## 方法 2: 使用 psql 命令行工具

### 前置要求

- 已安装 PostgreSQL 客户端工具（包含 psql）
- 有 Supabase 项目的数据库连接字符串

### 步骤 1: 获取数据库连接字符串

1. 在 Supabase Dashboard 中
2. 进入 **Settings** → **Database**
3. 找到 **Connection string** 部分
4. 选择 **URI** 标签
5. 复制连接字符串（类似）：
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.xxx.supabase.co:5432/postgres
   ```

### 步骤 2: 执行 SQL 文件

在终端中运行：

```bash
# 方式 1: 直接执行
psql "你的数据库连接字符串" -f lib/supabase/schema.sql

# 方式 2: 使用环境变量
export SUPABASE_DB_URL="你的数据库连接字符串"
psql "$SUPABASE_DB_URL" -f lib/supabase/schema.sql
```

### 步骤 3: 验证

如果看到类似输出，说明成功：

```
CREATE TABLE
CREATE TABLE
CREATE TABLE
...
CREATE POLICY
```

---

## 方法 3: 使用提供的脚本

### 步骤 1: 添加执行权限

```bash
chmod +x scripts/init-database.sh
```

### 步骤 2: 设置环境变量

```bash
export SUPABASE_DB_URL="postgresql://postgres:[YOUR-PASSWORD]@db.xxx.supabase.co:5432/postgres"
```

### 步骤 3: 运行脚本

```bash
./scripts/init-database.sh
```

---

## 常见问题

### Q1: 执行 SQL 时出现 "permission denied" 错误

**原因**: 可能是 RLS 策略冲突或权限问题

**解决方案**:

1. 确保使用的是 **postgres** 用户（项目所有者）
2. 在 Supabase Dashboard 中执行（推荐）

### Q2: 表已存在的错误

**错误信息**: `relation "users" already exists`

**解决方案**:

1. 如果是测试环境，可以先删除旧表：
   ```sql
   DROP TABLE IF EXISTS public.likes CASCADE;
   DROP TABLE IF EXISTS public.comments CASCADE;
   DROP TABLE IF EXISTS public.post_purchases CASCADE;
   DROP TABLE IF EXISTS public.purchases CASCADE;
   DROP TABLE IF EXISTS public.products CASCADE;
   DROP TABLE IF EXISTS public.posts CASCADE;
   DROP TABLE IF EXISTS public.users CASCADE;
   ```
2. 然后重新执行 `schema.sql`

### Q3: 密码包含特殊字符无法连接

**解决方案**:
使用 URL 编码密码，或在 Supabase Dashboard 中执行（推荐）

### Q4: 执行后看不到表

**检查清单**:

1. ✅ SQL 是否执行成功（看提示信息）
2. ✅ 刷新 Table Editor 页面
3. ✅ 检查是否在正确的 schema（应该是 `public`）

---

## 验证数据库设置

执行完 SQL 后，可以运行以下查询验证：

```sql
-- 检查所有表
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;

-- 应该返回 7 个表:
-- comments
-- likes
-- post_purchases
-- posts
-- products
-- purchases
-- users
```

---

## 下一步

数据库初始化完成后：

1. ✅ 配置环境变量（`.env.local`）
2. ✅ 测试 API 连接
3. ✅ 创建第一个用户（自动）
4. ✅ 发布第一篇帖子

查看 [QUICK_START.md](./QUICK_START.md) 了解详细使用方法。

---

## 需要帮助？

- 📖 [Supabase 官方文档](https://supabase.com/docs)
- 💬 [Supabase Discord](https://discord.supabase.com)
- 📧 查看项目 README.md
