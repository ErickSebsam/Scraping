import httpx
import asyncio
import json
import os
from datetime import datetime

API_URL = os.getenv('API_URL', 'http://localhost:3000')
MAX_RETRIES = 3
BACKUP_FILE = 'worker/backup.json'


async def send_snapshot(products):
    """Envía los productos a la API con reintentos automáticos"""
    payload = {
        'source': 'books.toscrape.com',
        'products': products
    }

    for attempt in range(1, MAX_RETRIES + 1):
        try:
            print(f'📤 Intento {attempt}/{MAX_RETRIES} — enviando {len(products)} productos...')

            async with httpx.AsyncClient(timeout=30) as client:
                response = await client.post(
                    f'{API_URL}/snapshots',
                    json=payload
                )

            if response.status_code == 201:
                data = response.json()
                print(f'✅ Snapshot guardado correctamente')
                print(f'📊 Resumen de cambios:')
                print(f'   - Nuevos: {data["summary"]["new"]}')
                print(f'   - Eliminados: {data["summary"]["removed"]}')
                print(f'   - Cambios de precio: {data["summary"]["priceChanged"]}')
                print(f'   - Total: {data["summary"]["total"]}')
                return data

            else:
                print(f'⚠️  La API respondió con status {response.status_code}')

        except httpx.ConnectError:
            print(f'❌ No se pudo conectar a la API (intento {attempt}/{MAX_RETRIES})')
        except httpx.TimeoutException:
            print(f'❌ Timeout esperando respuesta (intento {attempt}/{MAX_RETRIES})')
        except Exception as e:
            print(f'❌ Error inesperado: {e}')

        # Esperar antes de reintentar
        if attempt < MAX_RETRIES:
            print(f'⏳ Esperando 3 segundos antes de reintentar...')
            await asyncio.sleep(3)

    # Si todos los intentos fallaron → guardar backup local
    print(f'\n💾 Guardando backup local en {BACKUP_FILE}...')
    save_backup(products)
    return None


def save_backup(products):
    """Guarda los productos en un archivo local si la API no responde"""
    backup = {
        'timestamp': datetime.now().isoformat(),
        'products': products
    }
    with open(BACKUP_FILE, 'w', encoding='utf-8') as f:
        json.dump(backup, f, ensure_ascii=False, indent=2)
    print(f'✅ Backup guardado con {len(products)} productos')