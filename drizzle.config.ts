import { defineConfig } from "drizzle-kit"

// 根据环境获取不同的数据库配置
const getDbConfig = () => {
  const dbUrl = process.env.DATABASE_URL

  if (!dbUrl) {
    throw new Error("DATABASE_URL 环境变量必须设置")
  }


  return {
    url: dbUrl,
    ssl: true
  }
}

export default defineConfig({
    out: "./src/drizzle/migrations",
    schema: "./src/drizzle/schemas",
    dialect: "postgresql",
    strict: true,
    verbose: true,
    dbCredentials: getDbConfig(),
})