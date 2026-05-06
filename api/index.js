import express from 'express'
import dotenv from 'dotenv'
import { connectDB } from './db/connection.js'

dotenv.config()

const app = express()
app.use(express.json())

// Rutas
import healthRouter from './routes/health.js'
import snapshotsRouter from './routes/snapshots.js'
import changesRouter from './routes/changes.js'

app.use('/health', healthRouter)
app.use('/snapshots', snapshotsRouter)
app.use('/changes', changesRouter)

// Arrancar servidor
const PORT = process.env.PORT || 3000

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 API corriendo en http://localhost:${PORT}`)
  })
})