import puppeteerExtra from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
puppeteerExtra.use(StealthPlugin());
import logger from './logger.js';
import { sleep } from './throttle.js';

function extractNameFromLinkedInSnippet(text) {
  const patterns = [
    /([A-Z][a-záéíóúñ]+)\s+([A-Z][a-záéíóúñ]+(?:\s+[A-Z][a-záéíóúñ]+)?)\s*[—\-|]/,  
    /([A-Z][a-záéíóúñ]+\s+[A-Z][a-záéíóúñ]+)\s*[—\-|]/,                             
    /\"([A-Z][a-záéíóúñ]+\s+[A-Z][a-záéíóúñ]+)\"/,                                    
  ];
  for (const p of patterns) {
    const m = text.match(p);
    if (m) return m[1].trim();
  }
  return null;
}

function generateEmailPatterns(name, domain) {
  if (!name || !domain) return [];
  const parts = name.toLowerCase().split(/\s+/).filter(Boolean);
  if (parts.length < 2) return [];

  const first = parts[0];
  const last = parts[parts.length - 1];
  const patterns = new Set();

  patterns.add(`${first}.${last}@${domain}`);
  patterns.add(`${first}${last}@${domain}`);
  patterns.add(`${first}@${domain}`);
  patterns.add(`${last}@${domain}`);
  patterns.add(`${first}_${last}@${domain}`);
  patterns.add(`${first}-${last}@${domain}`);
  patterns.add(`${first}${last[0]}@${domain}`);
  patterns.add(`${first[0]}${last}@${domain}`);
  patterns.add(`${first[0]}.${last}@${domain}`);
  patterns.add(`${first}.${last[0]}@${domain}`);

  return [...patterns];
}

export async function findLinkedInEmails(companyName, domain) {
  if (!companyName || !domain) return [];

  const found = [];
  const browser = await puppeteerExtra.launch({
    headless: 'new',
    args: [
      '--no-sandbox', '--disable-setuid-sandbox',
      '--disable-dev-shm-usage', '--disable-gpu',
      '--window-size=1280,720',
    ],
  });

  try {
    const page = await browser.newPage();
    await page.setRequestInterception(true);
    page.on('request', (req) => {
      if (['image', 'stylesheet', 'font', 'media'].includes(req.resourceType())) {
        req.abort();
      } else {
        req.continue();
      }
    });

    const companyClean = companyName.replace(/[^a-zA-Z0-9áéíóúñü ]/g, ' ').trim();

    const searches = [
      `"${companyClean}" linkedin email`,
      `"${companyClean}" linkedin "in"`,
      `site:linkedin.com/in "${companyClean}"`,
      `site:linkedin.com/company "${companyClean}"`,
      `"${companyClean}" "${domain}" email contacto`,
      `"${companyClean}" "${domain}" "email" OR "correo"`,
      `"${companyClean}" "${domain}" "equipo" OR "team" OR "staff"`,
      `"${companyClean}" "${domain}" "fundador" OR "ceo" OR "director"`,
    ];

    for (const query of searches) {
      try {
        const url = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 10000 });
        await sleep(2000);

        const text = await page.evaluate(() => document.body.innerText);

        const emailMatches = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g);
        if (emailMatches) {
          for (const email of emailMatches) {
            const skipDomains = ['google.com', 'linkedin.com', 'youtube.com', 'twitter.com',
              'facebook.com', 'instagram.com', 'accounts.google.com', 'support.google.com',
              'policies.google.com', 'blogger.com', 'gmail.com'];
            if (skipDomains.some(d => email.toLowerCase().includes(d))) continue;

            const cleanEmail = email.toLowerCase().replace(/\.$/, '').trim();
            if (cleanEmail.endsWith(domain) || domain.endsWith(cleanEmail.split('@')[1])) {
              found.push({ email: cleanEmail, source: `google+${query.slice(0, 20)}`, confidence: 'medium' });
            } else if (!found.some(f => f.email === cleanEmail)) {
              found.push({ email: cleanEmail, source: `google+${query.slice(0, 20)}`, confidence: 'low' });
            }
          }
        }

        const potentialName = extractNameFromLinkedInSnippet(text);
        if (potentialName && !found.some(f => f.email && f.email.includes(domain))) {
          const patterns = generateEmailPatterns(potentialName, domain);
          for (const email of patterns) {
            found.push({ email, source: `pattern+${potentialName}`, confidence: 'medium' });
          }
        }

      } catch (err) {
        logger.warn(`  LinkedIn query falló: ${query.slice(0, 40)}...`);
        continue;
      }
    }

    await page.goto(`https://www.google.com/search?q=${encodeURIComponent(`"${companyClean}" "${domain}" linkedin "in" -public -profile`)}`, {
      waitUntil: 'domcontentloaded', timeout: 8000,
    });
    await sleep(1500);

    const finalText = await page.evaluate(() => document.body.innerText);
    const names = finalText.match(/[A-Z][a-záéíóúñ]+\s+[A-Z][a-záéíóúñ]+\s*[—\-|]/g);
    if (names) {
      for (const rawName of names) {
        const name = rawName.replace(/[—\-|].*$/, '').trim();
        const patterns = generateEmailPatterns(name, domain);
        for (const email of patterns) {
          if (!found.some(f => f.email === email)) {
            found.push({ email, source: `linkedin+${name}`, confidence: 'medium' });
          }
        }
      }
    }

  } catch (err) {
    logger.warn(`  LinkedIn finder error: ${err.message}`);
  } finally {
    await browser.close().catch(() => {});
  }

  const unique = [];
  const seen = new Set();
  for (const f of found) {
    if (!seen.has(f.email)) {
      seen.add(f.email);
      unique.push(f);
    }
  }

  return unique;
}
