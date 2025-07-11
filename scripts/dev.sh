#!/bin/bash

# 开发环境启动脚本  
# 解决SSL证书验证问题

echo "🚀 启动开发环境..."
echo "⚠️  禁用SSL证书验证以解决数据库连接问题"

# 设置环境变量解决SSL问题
export NODE_TLS_REJECT_UNAUTHORIZED=0
export NODE_OPTIONS="--use-system-ca"

# 启动开发服务器
echo "🔥 正在启动Next.js开发服务器..."
pnpm dev 