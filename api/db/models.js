import mongoose from 'mongoose'

const productSchema = new mongoose.Schema({
  sku: String,
  title: String,
  price: Number,
  currency: String,
  category: String,
  in_stock: Boolean
})

const snapshotSchema = new mongoose.Schema({
  capturedAt: { type: Date, default: Date.now },
  source: String,
  products: [productSchema]
})

const changeSchema = new mongoose.Schema({
  snapshotId: mongoose.Schema.Types.ObjectId,
  detectedAt: { type: Date, default: Date.now },
  type: String,
  sku: String,
  title: String,
  oldPrice: Number,
  newPrice: Number,
  percentage: Number,
  direction: String,
  lastPrice: Number,
  price: Number
})

export const Snapshot = mongoose.model('Snapshot', snapshotSchema)
export const Change = mongoose.model('Change', changeSchema)