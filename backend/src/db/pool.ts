import { Pool } from "pg"
import { config } from "../config"

export const pool = new Pool({
  connectionString: config.databaseUrl,
  // Neon suspends idle computes; keep few connections and drop them quickly.
  max: 5,
  idleTimeoutMillis: 30_000,
})
