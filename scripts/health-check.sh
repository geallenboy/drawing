#!/bin/bash

echo "🔍 系统健康检查开始..."
echo "================================"

# 检查Node版本
echo "📦 Node.js版本:"
node --version

# 检查环境变量
echo ""
echo "🔧 环境变量检查:"
if [ -f ".env.local" ]; then
    echo "✅ .env.local 文件存在"
    if grep -q "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY" .env.local; then
        echo "✅ Clerk配置已设置"
    else
        echo "⚠️  请检查Clerk配置"
    fi
    if grep -q "DATABASE_URL" .env.local; then
        echo "✅ 数据库配置已设置"
    else
        echo "⚠️  请检查数据库配置"
    fi
else
    echo "⚠️  .env.local 文件不存在，请创建环境配置"
fi

# 检查依赖
echo ""
echo "📚 依赖检查:"
if command -v pnpm &> /dev/null; then
    echo "✅ pnpm 已安装"
else
    echo "❌ pnpm 未安装，请先安装 pnpm"
fi

# 检查关键文件
echo ""
echo "📁 关键文件检查:"
files=(
    "src/drizzle/db.ts"
    "src/lib/minio.ts" 
    "src/app/provider.tsx"
    "src/features/auth/auth-clerk.ts"
    "src/app/(dashboard)/system-diagnosis/page.tsx"
)

for file in "${files[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ $file"
    else
        echo "❌ $file 缺失"
    fi
done

echo ""
echo "🚀 推荐启动命令:"
echo "pnpm run dev:safe"
echo ""
echo "🔍 诊断页面地址:"
echo "http://localhost:3000/system-diagnosis"
echo ""
echo "================================"
echo "健康检查完成！" 