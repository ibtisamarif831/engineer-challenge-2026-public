import 'dotenv/config'
import { createApp } from './app'
import { db } from './db'

const port = process.env.PORT || 4000
createApp(db).listen(port, () => {
  console.log(`Pulse API running on http://localhost:${port}`)
})
