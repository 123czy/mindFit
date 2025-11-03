#!/bin/bash

# 显示 localtunnel 完整信息（URL 和密码）

echo "🔍 正在获取 Tunnel 信息..."
echo ""

# 获取公网 IP（这就是 localtunnel 的密码）
TUNNEL_PASSWORD=$(curl -s https://loca.lt/mytunnelpassword 2>/dev/null)

if [ -z "$TUNNEL_PASSWORD" ]; then
    # 备用方法获取公网 IP
    TUNNEL_PASSWORD=$(curl -s ifconfig.me 2>/dev/null)
fi

if [ -z "$TUNNEL_PASSWORD" ]; then
    TUNNEL_PASSWORD=$(curl -s icanhazip.com 2>/dev/null)
fi

# 检查是否有运行中的 localtunnel
if ps aux | grep "lt --port 3000" | grep -v grep > /dev/null; then
    echo "✅ Localtunnel 正在运行"
    echo ""
    
    # 尝试从日志获取 URL
    if [ -f /tmp/localtunnel.log ]; then
        TUNNEL_URL=$(grep "your url is:" /tmp/localtunnel.log | tail -1 | awk '{print $NF}')
    fi
    
    if [ -z "$TUNNEL_URL" ]; then
        echo "📋 Tunnel URL: （请查看启动终端获取）"
    else
        echo "📋 Tunnel URL: $TUNNEL_URL"
    fi
    
    echo ""
    echo "🔑 Tunnel Password: $TUNNEL_PASSWORD"
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    echo "📝 分享给访问者的信息："
    echo ""
    if [ ! -z "$TUNNEL_URL" ]; then
        echo "   URL:      $TUNNEL_URL"
    fi
    echo "   Password: $TUNNEL_PASSWORD"
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    echo "💡 访问流程："
    echo "   1. 访问者打开 URL"
    echo "   2. 第一次访问时输入 Password（你的公网 IP）"
    echo "   3. 之后可以正常访问"
else
    echo "❌ Localtunnel 未运行"
    echo ""
    echo "💡 启动方法："
    echo "   pnpm tunnel"
    echo ""
    echo "🔑 Tunnel Password（提前获取）: $TUNNEL_PASSWORD"
    echo "   （这是你的公网 IP 地址）"
fi

echo ""

