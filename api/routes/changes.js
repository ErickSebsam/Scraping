import { Router } from 'express'
import { Change } from '../db/models.js'

const router = Router()

router.get('/', async (req, res) => {
  try {
    const filter = {}

    if (req.query.since) {
      filter.detectedAt = { $gte: new Date(req.query.since) }
    }

    if (req.query.type) {
      filter.type = req.query.type
    }

    const changes = await Change.find(filter).sort({ detectedAt: -1 })
    res.json({ total: changes.length, changes })

  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Error interno del servidor' })
  }
})

export default router