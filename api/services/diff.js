// Recibe dos arrays de productos y devuelve los cambios detectados
export function compareSnapshots(yesterday, today) {

  // Caso especial: si no hay snapshot anterior, no hay nada que comparar
  if (!yesterday || yesterday.length === 0) {
    return {
      changes: [],
      summary: { total: 0, new: 0, removed: 0, priceChanged: 0 }
    }
  }

  // Convertimos las listas en Maps para buscar por SKU rápidamente
  const yesterdayMap = new Map(yesterday.map(p => [p.sku, p]))
  const todayMap = new Map(today.map(p => [p.sku, p]))

  const changes = []

  // Recorremos los productos de HOY
  for (const [sku, product] of todayMap) {
    const old = yesterdayMap.get(sku)

    if (!old) {
      // El SKU no existía ayer → producto nuevo
      changes.push({
        type: 'new',
        sku,
        title: product.title,
        price: product.price,
        detectedAt: new Date()
      })
    } else if (old.price !== product.price) {
      // El SKU existía pero el precio cambió
      const diff = product.price - old.price
      const percentage = ((diff / old.price) * 100).toFixed(2)
      changes.push({
        type: 'price_change',
        sku,
        title: product.title,
        oldPrice: old.price,
        newPrice: product.price,
        percentage: parseFloat(percentage),
        direction: diff > 0 ? 'up' : 'down',
        detectedAt: new Date()
      })
    }
    // Si el SKU existe y el precio es igual → sin cambios, no hacemos nada
  }

  // Recorremos los productos de AYER para encontrar eliminados
  for (const [sku, product] of yesterdayMap) {
    if (!todayMap.has(sku)) {
      changes.push({
        type: 'removed',
        sku,
        title: product.title,
        lastPrice: product.price,
        detectedAt: new Date()
      })
    }
  }

  return {
    changes,
    summary: {
      total: changes.length,
      new: changes.filter(c => c.type === 'new').length,
      removed: changes.filter(c => c.type === 'removed').length,
      priceChanged: changes.filter(c => c.type === 'price_change').length
    }
  }
}