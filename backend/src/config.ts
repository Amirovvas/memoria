import { existsSync } from "node:fs"

if (existsSync(".env")) process.loadEnvFile(".env")

function required(name: string) {
  const value = process.env[name]
  if (!value) throw new Error(`Missing env variable ${name} (see .env.example)`)
  return value
}

export const config = {
  port: Number(process.env.PORT ?? 4000),
  clientOrigin: process.env.CLIENT_ORIGIN ?? "http://localhost:3000",
  databaseUrl: required("DATABASE_URL"),
  jwtSecret: required("JWT_SECRET"),
  accessTokenTtl: process.env.ACCESS_TOKEN_TTL ?? "15m",
  refreshTokenDays: Number(process.env.REFRESH_TOKEN_DAYS ?? 30),
  isProd: process.env.NODE_ENV === "production",
  supabaseUrl: (process.env.SUPABASE_URL ?? "").replace(/\/$/, ""),
  // optional at boot so auth keeps working; photo uploads answer 503 until it is set
  supabaseSecretKey: process.env.SUPABASE_SECRET_KEY ?? "",
}
