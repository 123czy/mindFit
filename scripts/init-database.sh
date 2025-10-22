#!/bin/bash

# Supabase 数据库初始化脚本
# 使用方法: ./scripts/init-database.sh

echo "🚀 开始初始化 Supabase 数据库..."

# 检查是否安装了 Supabase CLI
if ! command -v supabase &> /dev/null; then
    echo "❌ 未检测到 Supabase CLI"
    echo "请先安装: npm install -g supabase"
    echo "或访问: https://supabase.com/docs/guides/cli"
    exit 1
fi

# 检查环境变量
if [ -z "$SUPABASE_DB_URL" ]; then
    echo "⚠️  未设置 SUPABASE_DB_URL 环境变量"
    echo "请设置数据库连接字符串："
    echo "export SUPABASE_DB_URL='postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres'"
    exit 1
fi

# 执行 SQL 文件
echo "📝 执行数据库迁移..."
psql "$SUPABASE_DB_URL" -f lib/supabase/schema.sql

if [ $? -eq 0 ]; then
    echo "✅ 数据库初始化成功！"
    echo "📊 已创建以下表："
    echo "  - users"
    echo "  - posts"
    echo "  - products"
    echo "  - purchases"
    echo "  - post_purchases"
    echo "  - comments"
    echo "  - likes"
else
    echo "❌ 数据库初始化失败"
    exit 1
fi

