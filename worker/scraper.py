import asyncio
import random
from playwright.async_api import async_playwright

BASE_URL = "https://books.toscrape.com/catalogue/page-{}.html"

async def scrape_page(browser, page_num):
    """Extrae productos de una página específica"""
    page = await browser.new_page()
    products = []

    try:
        url = BASE_URL.format(page_num)
        await page.goto(url, timeout=30000)

        # Delay aleatorio entre 500ms y 2s
        await asyncio.sleep(random.uniform(0.5, 2.0))

        # Extraer todos los artículos de la página
        articles = await page.query_selector_all('article.product_pod')

        for article in articles:
            try:
                title = await article.query_selector('h3 a')
                price = await article.query_selector('p.price_color')
                availability = await article.query_selector('p.availability')

                title_text = await title.get_attribute('title')
                price_text = await price.inner_text()
                stock_text = await availability.inner_text()

                # Limpiar precio — viene como "£51.77"
                price_clean = float(price_text.replace('£', '').replace('Â', '').strip())

                products.append({
                    'sku': f'BTS-{page_num:02d}{len(products):02d}',
                    'title': title_text,
                    'price': price_clean,
                    'currency': 'GBP',
                    'in_stock': 'In stock' in stock_text,
                    'source': 'books.toscrape.com'
                })

            except Exception as e:
                print(f'⚠️  Error extrayendo producto en página {page_num}: {e}')
                continue

        print(f'✅ Página {page_num}: {len(products)} productos extraídos')

    except Exception as e:
        print(f'❌ Error en página {page_num}: {e}')

    finally:
        await page.close()

    return products


async def scrape_all(num_pages=5):
    """Lanza múltiples páginas en paralelo con asyncio.gather"""
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)

        # Lanzar al menos 3 páginas en paralelo
        tasks = [scrape_page(browser, i) for i in range(1, num_pages + 1)]
        results = await asyncio.gather(*tasks, return_exceptions=True)

        await browser.close()

    # Aplanar resultados — results es una lista de listas
    all_products = []
    for i, result in enumerate(results, 1):
        if isinstance(result, Exception):
            print(f'❌ Página {i} falló completamente: {result}')
        else:
            all_products.extend(result)

    print(f'\n📦 Total productos extraídos: {len(all_products)}')
    return all_products