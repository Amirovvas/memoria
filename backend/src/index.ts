import { config } from "./config"
import { createApi } from "./createApi"

createApi().listen(config.port, () => {
  console.log(`API listening on http://localhost:${config.port}`)
})
