#!/usr/bin/env tsx
/**
 * 检查 Cloudflare R2 配置和连接状态
 */
import { isR2Available } from "@/lib/cloudflare-r2";

async function checkR2Config() {
  console.log("🔍 检查 Cloudflare R2 配置...\n");

  // 检查环境变量
  const envVars = {
    CLOUDFLARE_ACCOUNT_ID: process.env.CLOUDFLARE_ACCOUNT_ID,
    CLOUDFLARE_R2_ACCESS_KEY_ID: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID,
    CLOUDFLARE_R2_SECRET_ACCESS_KEY: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY,
    CLOUDFLARE_R2_BUCKET_NAME: process.env.CLOUDFLARE_R2_BUCKET_NAME,
  };

  console.log("📋 环境变量检查:");
  for (const [key, value] of Object.entries(envVars)) {
    if (value) {
      console.log(`  ✅ ${key}: ${key.includes('SECRET') ? '[已设置]' : value}`);
    } else {
      console.log(`  ❌ ${key}: 未设置`);
    }
  }

  const missingVars = Object.entries(envVars)
    .filter(([_, value]) => !value)
    .map(([key, _]) => key);

  if (missingVars.length > 0) {
    console.log(`\n❌ 缺少环境变量: ${missingVars.join(', ')}`);
    console.log("\n请在 .env.local 文件中设置以下变量:");
    missingVars.forEach(varName => {
      console.log(`${varName}=your_value_here`);
    });
    return;
  }

  console.log("\n🔗 测试 R2 连接...");
  try {
    const isAvailable = await isR2Available();
    if (isAvailable) {
      console.log("✅ R2 连接成功！");
    } else {
      console.log("❌ R2 连接失败");
    }
  } catch (error) {
    console.error("❌ R2 连接测试出错:", error);
  }
}

checkR2Config().catch(console.error);