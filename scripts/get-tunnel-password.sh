#!/bin/bash

# 获取当前运行的 localtunnel 密码
# 密码通常在 localtunnel 启动时显示在输出中

echo "🔍 正在查找 Tunnel Password..."
echo ""

# 检查是否有日志文件
if [ -f /tmp/localtunnel.log ]; then
    echo "📝 从日志文件中查找密码："
    grep -i "password\|pass" /tmp/localtunnel.log | head -5
    echo ""
fi

# 检查当前运行的 localtunnel 进程
PID=$(ps aux | grep "lt --port 3000" | grep -v grep | awk '{print $2}')

if [ -z "$PID" ]; then
    echo "❌ 没有找到运行中的 localtunnel 进程"
    echo ""
    echo "💡 解决方案："
    echo "   1. 重新运行: pnpm tunnel"
    echo "   2. 查看终端输出，密码会在 'password:' 或类似字段后显示"
    echo "   3. 或者使用其他内网穿透工具（如 ngrok）"
else
    echo "✅ 找到运行中的 localtunnel 进程 (PID: $PID)"
    echo ""
    echo "📋 如何获取密码："
    echo ""
    echo "方法一：查看启动 localtunnel 的终端窗口"
    echo "   密码通常在启动时显示，格式类似："
    echo "   'password: xxxxx' 或 'tunnel password: xxxxx'"
    echo ""
    echo "方法二：重启隧道并查看输出"
    echo "   运行: pnpm tunnel"
    echo "   然后在输出中查找密码"
    echo ""
    echo "方法三：使用 ngrok（无需密码）"
    echo "   运行: ngrok http 3000"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "⚠️  注意：localtunnel 的密码是随机生成的，"
echo "   每次重启隧道时密码都会改变。"

