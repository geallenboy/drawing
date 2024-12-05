import { defineConfig } from 'drizzle-kit'
console.log(process.env.NEXT_PUBLIC_DATABASE_URL!)
export default defineConfig({
  schema: "./src/config/schema.ts",
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.NEXT_PUBLIC_DATABASE_URL!
  },
  verbose: true,
  strict: true,
})