#!/bin/bash

# Ngrok 内网穿透启动脚本
# 使用前请先配置 ngrok authtoken

echo "🚀 启动 ngrok 内网穿透..."
echo ""
echo "如果这是第一次使用，请先："
echo "1. 访问 https://dashboard.ngrok.com/signup 注册账号（免费）"
echo "2. 访问 https://dashboard.ngrok.com/get-started/your-authtoken 获取 authtoken"
echo "3. 运行: ngrok config add-authtoken YOUR_AUTHTOKEN"
echo ""
echo "正在启动 ngrok 转发到 http://localhost:3000 ..."
echo ""
echo "📋 公网访问地址将在下方显示"
echo "   访问 http://localhost:4040 查看 ngrok Web UI"
echo ""

ngrok http 3000

