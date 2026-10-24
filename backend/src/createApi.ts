import cookieParser from "cookie-parser"
import cors from "cors"
import express from "express"
import { config } from "./config"
import { pool } from "./db/pool"
import { errorHandler } from "./middlewares/errorHandler"
import { authRouter } from "./routes/auth.routes"
import { giftsRouter } from "./routes/gifts.routes"
import { libraryRouter } from "./routes/library.routes"
import { apiErrors } from "./utils/apiErrors"

export function createApi() {
  const app = express()

  app.disable("x-powered-by")
  app.use(cors({ origin: config.clientOrigin, credentials: true }))
  // a collage document is a few KB of JSON; photos travel separately as raw image bodies
  app.use(express.json({ limit: "600kb" }))
  app.use(cookieParser())

  app.get("/api/health", async (_req, res) => {
    await pool.query("SELECT 1")
    res.json({ ok: true })
  })

  app.use("/api/auth", authRouter)
  app.use("/api", libraryRouter)
  app.use("/api", giftsRouter)

  app.use((_req, _res, next) => {
    next(apiErrors.notFound("Не найдено"))
  })

  app.use(errorHandler)

  return app
}
