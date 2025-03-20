
import { defineConfig } from "drizzle-kit"

export default defineConfig({
    out: "./src/drizzle/migrations",
    schema: "./src/drizzle/schema.ts",
    dialect: "postgresql",
    strict: true,
    verbose: true,
    dbCredentials: {
        url: process.env.DATABASE_URL!,
        ssl: true,
    },
})
