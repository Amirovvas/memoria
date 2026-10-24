import { pool } from "./pool"
import { SCHEMA } from "./schema"

async function main() {
  await pool.query(SCHEMA)
  console.log("Schema is up to date")
  await pool.end()
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
