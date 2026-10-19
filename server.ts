import 'dotenv/config';
import { createApi } from './api';
import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT || 3000);
  app.set('trust proxy', 1);

  app.use(express.json({ limit: '12mb' }));
  app.use('/api', await createApi());

  // Link parser endpoint: resolves shortlinks (like a.co), extracts title, store name, and price
  app.post('/api/parse-link', async (req, res) => {
    try {
      const { url } = req.body;
      if (!url) {
        return res.status(400).json({ error: 'URL é obrigatória' });
      }

      let targetUrl = url.trim();
      if (!targetUrl.startsWith('http')) {
        targetUrl = 'https://' + targetUrl;
      }

      // Fetch the page with standard browser headers and follow redirects (e.g. a.co -> amazon.com.br)
      const response = await fetch(targetUrl, {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7',
          'Cache-Control': 'no-cache',
        },
        redirect: 'follow',
      });

      const finalUrl = response.url || targetUrl;
      const html = await response.text();

      // Determine store name
      let storeName = 'Loja Online';
      const host = new URL(finalUrl).hostname.replace('www.', '').toLowerCase();
      if (
        host.includes('amazon') ||
        host === 'a.co' ||
        host.endsWith('.a.co') ||
        host.includes('amzn')
      ) {
        storeName = 'Amazon';
      } else if (
        host.includes('mercadolivre') ||
        host.includes('mercadolibre') ||
        host.includes('meli') ||
        host === 'ml.com'
      ) {
        storeName = 'Mercado Livre';
      } else if (host.includes('magazineluiza') || host.includes('magalu')) {
        storeName = 'Magazine Luiza';
      } else if (host.includes('sephora')) {
        storeName = 'Sephora';
      } else if (host.includes('shopee') || host === 'shp.ee') {
        storeName = 'Shopee';
      } else if (host.includes('shein')) {
        storeName = 'SHEIN';
      } else if (host.includes('zara')) {
        storeName = 'Zara';
      } else if (host.includes('kabum')) {
        storeName = 'KaBuM!';
      } else if (host.includes('apple')) {
        storeName = 'Apple';
      } else if (host.includes('boticario')) {
        storeName = 'O Boticário';
      } else if (host.includes('natura')) {
        storeName = 'Natura';
      } else if (host.includes('fastshop')) {
        storeName = 'Fast Shop';
      } else {
        const domain = host.split('.')[0];
        if (domain && domain.length > 1) {
          storeName = domain.charAt(0).toUpperCase() + domain.slice(1);
        }
      }

      // Extract title
      let title = '';
      const ogTitleMatch = html.match(/<meta\s+property=["']og:title["']\s+content=["'](.*?)["']/i);
      if (ogTitleMatch && ogTitleMatch[1]) {
        title = ogTitleMatch[1]
          .replace(/Amazon\.com\.br\s*:?\s*/gi, '')
          .replace(/\|\s*Amazon.*$/gi, '')
          .trim();
      } else {
        const titleMatch = html.match(/<title>(.*?)<\/title>/i);
        if (titleMatch && titleMatch[1]) {
          title = titleMatch[1]
            .replace(/Amazon\.com\.br\s*:?\s*/gi, '')
            .split('|')[0]
            .split(':')[0]
            .trim();
        }
      }

      // Extract price with targeted prioritization
      let price = 0;
      let priceFormatted = '';

      // TIER 1: Schema.org Product / JSON-LD (Most authoritative, official price without banner noise)
      const ldMatches = [...html.matchAll(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)];
      for (const m of ldMatches) {
        try {
          const data = JSON.parse(m[1].trim());
          const items = Array.isArray(data) ? data : [data];
          for (const item of items) {
            const offers = item.offers || item['@graph']?.find((g: any) => g.offers)?.offers;
            const offerList = Array.isArray(offers) ? offers : [offers];
            for (const off of offerList) {
              if (off && off.price) {
                const p = parseFloat(String(off.price).replace(',', '.'));
                if (p > 0) {
                  price = p;
                  break;
                }
              }
            }
            if (price > 0) break;
          }
        } catch {}
        if (price > 0) break;
      }

      // TIER 2: Amazon Primary Buybox container (corePriceDisplay, priceToPay, apexPriceToPay)
      if (!price) {
        const buyboxRegex = /<(?:div|span)[^>]*(?:id=["'](?:corePriceDisplay_desktop_feature_div|corePrice_feature_div|apexPriceToPay|priceblock_ourprice|price_inside_buybox)["']|class=["'][^"']*(?:reinventPricePriceToPayMargin|priceToPay|apexPriceToPay)[^"']*)[^>]*>([\s\S]*?)<\/(?:div|span)>/i;
        const boxMatch = html.match(buyboxRegex);
        if (boxMatch && boxMatch[1]) {
          const content = boxMatch[1];
          const offscreen = content.match(/class=["']a-offscreen["'][^>]*>([^<]+)/i);
          if (offscreen && offscreen[1]) {
            const match = offscreen[1].match(/(\d{1,3}(?:\.\d{3})*,\d{2})/);
            if (match) {
              price = parseFloat(match[1].replace(/\./g, '').replace(',', '.'));
            }
          }
          if (!price) {
            const whole = content.match(/class=["']a-price-whole["'][^>]*>([\d\.,]+)/i);
            const frac = content.match(/class=["']a-price-fraction["'][^>]*>(\d+)/i);
            if (whole && whole[1]) {
              const w = whole[1].replace(/\D/g, '');
              const f = frac && frac[1] ? frac[1] : '00';
              price = parseFloat(w + '.' + f);
            }
          }
        }
      }

      // TIER 3: Mercado Livre primary price container
      if (!price && host.includes('mercado')) {
        const mlPriceBlock = html.match(/class=["'][^"']*ui-pdp-price__second-line[^"']*["'][\s\S]*?andes-money-amount__fraction["'][^>]*>([\d\.,]+)</i);
        if (mlPriceBlock && mlPriceBlock[1]) {
          price = parseFloat(mlPriceBlock[1].replace(/\./g, '').replace(',', '.'));
        }
      }

      // TIER 4: Explicit JSON price state in scripts
      if (!price) {
        const jsonMatch = html.match(/"(?:buyingPrice|priceAmount)":\s*"?(\d+(?:\.\d{2})?)"?/i);
        if (jsonMatch && jsonMatch[1]) {
          const p = parseFloat(jsonMatch[1]);
          if (p > 0) price = p;
        }
      }

      // TIER 5: OpenGraph or Twitter meta tags
      if (!price) {
        const metaPrice = html.match(/<meta[^>]*(?:property|name)=["'](?:product:price:amount|og:price:amount|twitter:data1)["'][^>]*content=["']([^"']+)["']/i);
        if (metaPrice && metaPrice[1]) {
          const raw = metaPrice[1].replace(/[^\d,\.]/g, '');
          if (raw.includes(',')) {
            price = parseFloat(raw.replace(/\./g, '').replace(',', '.'));
          } else if (raw) {
            price = parseFloat(raw);
          }
        }
      }

      // TIER 6: General Brazilian price pattern (R$ X.XXX,XX)
      if (!price) {
        const genericMatch = html.match(/R\$\s*(\d{1,3}(?:\.\d{3})*(?:,\d{2})?)/i);
        if (genericMatch && genericMatch[1]) {
          const pStr = genericMatch[1];
          if (pStr.includes(',')) {
            price = parseFloat(pStr.replace(/\./g, '').replace(',', '.'));
          } else {
            price = parseFloat(pStr.replace(/\./g, ''));
          }
        }
      }

      if (price > 0) {
        priceFormatted = `R$ ${price.toLocaleString('pt-BR', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}`;
      }

      return res.json({
        success: true,
        storeName,
        title,
        price,
        priceFormatted,
        resolvedUrl: finalUrl,
      });
    } catch (err: any) {
      console.error('Link parse error:', err);
      return res.json({
        success: false,
        storeName: 'Loja Online',
        error: err.message,
      });
    }
  });

  // Mount Vite dev server middlewares in dev
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Production static files
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(() => {
  console.error('Falha ao iniciar. Verifique a configura??o e o acesso ao MongoDB Atlas.');
  process.exitCode = 1;
});
