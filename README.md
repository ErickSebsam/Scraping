# Monitor de Cambios en E-commerce

Sistema de monitoreo de precios que detecta cambios en productos de la competencia usando un worker en Python y una API en Node.js.

## Requisitos

- Node.js v18+
- Python 3.8+
- MongoDB corriendo en localhost:27017

## Instalación

### API (Node.js)
```bash
npm install
cp .env.example .env
```

### Worker (Python)
```bash
cd worker
py -3 -m pip install -r requirements.txt
py -3 -m playwright install chromium
```

## Cómo correr el proyecto

### 1. Iniciar MongoDB
Abre MongoDB y conéctate a `mongodb://localhost:27017`

### 2. Iniciar la API
```bash
node api/index.js
```

### 3. Correr el worker
```bash
cd worker
py -3 main.py
```

### 4. Correr los tests
```bash
npm test
```

## Endpoints de la API

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | /health | Verifica que la API responde |
| POST | /snapshots | Recibe productos del worker |
| GET | /changes | Devuelve cambios detectados |

### Filtros disponibles en /changes
- `?since=2026-05-01` — cambios desde una fecha
- `?type=price_change` — por tipo (new, removed, price_change)

## Contrato JSON entre Worker y API

El worker envía este payload al `POST /snapshots`:

```json
{
  "source": "books.toscrape.com",
  "products": [
    {
      "sku": "BTS-0101",
      "title": "A Light in the Attic",
      "price": 51.77,
      "currency": "GBP",
      "in_stock": true,
      "source": "books.toscrape.com"
    }
  ]
}
```

La API responde con:

```json
{
  "snapshotId": "abc123",
  "summary": {
    "total": 3,
    "new": 1,
    "removed": 1,
    "priceChanged": 1
  }
}
```

## Manejo de errores

**Si la API no responde:** el worker reintenta 3 veces con 3 segundos de espera entre intentos. Si todos fallan, guarda los productos en `worker/backup.json`.

**Si la API recibe datos malformados:** responde con status 400 y un mensaje descriptivo del error.

**Si una página falla durante el scraping:** el worker registra el error y continúa con las demás páginas sin interrumpir el proceso.

## Decisiones de diseño

- Se usó **CommonJS** — no, ESM (`"type": "module"`) para consistencia con estándares modernos de JavaScript.
- El motor de comparación usa **Maps** para buscar productos por SKU en tiempo constante, evitando loops anidados ineficientes.
- El worker usa **asyncio.gather** para procesar 5 páginas en paralelo, reduciendo el tiempo de scraping significativamente.
- Las variables sensibles se manejan con **dotenv** tanto en Node como en Python.

## Uso de IA

Este proyecto fue desarrollado con asistencia de Claude (Anthropic).

**En qué ayudó:**
- Estructura inicial del proyecto y flujo entre servicios
- Implementación del motor de comparación en `diff.js`
- Configuración de Jest con ESM que presentó varios errores de compatibilidad
- Lógica de reintentos en `api_client.py`

**Qué se revisó y ajustó:**
- La importación de JSON en los tests usaba `assert` (deprecado) — se cambió a `with`
- Los fixtures del profe tienen los productos dentro de una propiedad `products`, no en el array raíz — se ajustó el test para extraerlos correctamente
- Se identificó que `api/package.json` estaba vacío y causaba errores en Jest, tonces lo eliminé

**Qué se rechazó:**
- La IA sugirió usar librerías de diff para la comparación — se rechazó porque el ejercicio lo prohíbe explícitamente y porque implementarlo a mano demuestra mejor comprensión del algoritmo