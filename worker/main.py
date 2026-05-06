import asyncio
import sys
import os
from dotenv import load_dotenv

# Cargar variables de entorno
load_dotenv()

from scraper import scrape_all
from api_client import send_snapshot


async def main():
    print('🚀 Iniciando worker de scraping...\n')

    # Fase 1 — Scraping
    print('🔍 Extrayendo productos de books.toscrape.com...')
    products = await scrape_all(num_pages=5)

    if not products:
        print('❌ No se extrajeron productos. Abortando.')
        sys.exit(1)

    print(f'\n✅ Extracción completada — {len(products)} productos\n')

    # Fase 2 — Enviar a la API
    print('📤 Enviando datos a la API...\n')
    result = await send_snapshot(products)

    if result:
        print('\n✅ Worker finalizado correctamente')
    else:
        print('\n⚠️  Worker finalizado con errores — revisa el backup')


if __name__ == '__main__':
    asyncio.run(main())