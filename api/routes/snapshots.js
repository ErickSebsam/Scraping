import { Router } from 'express'
import { Snapshot, Change } from '../db/models.js'
import { compareSnapshots } from '../services/diff.js'

const router = Router()

router.post('/', async (req, res) => {
  try {
    const { products, source } = req.body

    // Validación básica
    if (!products || !Array.isArray(products) || products.length === 0) {
      return res.status(400).json({ error: 'products debe ser un array no vacío' })
    }

    // Guardar snapshot nuevo
    const snapshot = await Snapshot.create({ products, source })

    // Buscar el snapshot anterior
    const previous = await Snapshot.findOne(
      { _id: { $ne: snapshot._id } },
      {},
      { sort: { capturedAt: -1 } }
    )

    // Comparar
    const { changes, summary } = compareSnapshots(
      previous ? previous.products : [],
      products
    )

    // Guardar cambios detectados
    if (changes.length > 0) {
      const changesToSave = changes.map(c => ({ ...c, snapshotId: snapshot._id }))
      await Change.insertMany(changesToSave)
    }

    res.status(201).json({
      snapshotId: snapshot._id,
      summary
    })

  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Error interno del servidor' })
  }
})

export default router