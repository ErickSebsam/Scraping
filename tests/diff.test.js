import { compareSnapshots } from '../api/services/diff.js'
import yesterdayData from '../fixtures/snapshot_yesterday.json' with { type: 'json' }
import todayData from '../fixtures/snapshot_today.json' with { type: 'json' }

const yesterday = yesterdayData.products
const today = todayData.products

describe('Motor de comparación', () => {

  test('detecta un producto nuevo', () => {
    const { changes } = compareSnapshots(yesterday, today)
    const nuevos = changes.filter(c => c.type === 'new')
    expect(nuevos.length).toBeGreaterThan(0)
    expect(nuevos.some(c => c.sku === 'BTS-0013')).toBe(true)
  })

  test('detecta un producto eliminado', () => {
    const { changes } = compareSnapshots(yesterday, today)
    const eliminados = changes.filter(c => c.type === 'removed')
    expect(eliminados.length).toBeGreaterThan(0)
    expect(eliminados.some(c => c.sku === 'BTS-0009')).toBe(true)
  })

  test('detecta una bajada de precio', () => {
    const { changes } = compareSnapshots(yesterday, today)
    const precios = changes.filter(c => c.type === 'price_change')
    const bajada = precios.find(c => c.sku === 'BTS-0002')
    expect(bajada).toBeDefined()
    expect(bajada.direction).toBe('down')
    expect(bajada.percentage).toBeLessThan(0)
  })

  test('no marca cambios donde no los hay', () => {
    const { changes } = compareSnapshots(yesterday, today)
    const sinCambio = changes.find(c => c.sku === 'BTS-0001')
    expect(sinCambio).toBeUndefined()
  })

  test('maneja el primer snapshot sin errores', () => {
    const { changes, summary } = compareSnapshots([], today)
    expect(changes).toEqual([])
    expect(summary.total).toBe(0)
  })

})