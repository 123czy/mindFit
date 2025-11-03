#!/bin/bash

# 检查内网穿透状态脚本

echo "🔍 检查内网穿透状态..."
echo ""

# 检查开发服务器
if lsof -i :3000 | grep LISTEN > /dev/null; then
    echo "✅ 开发服务器: 运行中 (端口 3000)"
else
    echo "❌ 开发服务器: 未运行"
    echo "   请先运行: pnpm dev"
fi

echo ""

# 检查 localtunnel
if ps aux | grep "lt --port 3000" | grep -v grep > /dev/null; then
    echo "✅ LocalTunnel: 运行中"
    echo ""
    echo "📋 当前公网访问地址:"
    # 尝试从进程信息中获取 URL，或者提示用户查看终端输出
    echo "   请查看运行 'lt --port 3000' 的终端窗口"
    echo "   或者访问终端显示的 URL（格式类似: https://xxx.loca.lt）"
else
    echo "❌ LocalTunnel: 未运行"
    echo ""
    echo "💡 启动方法:"
    echo "   运行: pnpm tunnel"
    echo "   或: lt --port 3000 --print-requests"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📖 更多信息请查看 README.md"

