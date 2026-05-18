import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "npx ts-node prisma/seed.ts", // Skrip seed lu aman di sini
  },
  datasource: {
    url: process.env["DATABASE_URL"], // Ini buat nyuapin URL ke schema.prisma
  },
});