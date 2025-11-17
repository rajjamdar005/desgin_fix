import puppeteer from 'puppeteer';
import { getDesignSuggestions } from './gemini.js';

// Reuse a single browser instance to avoid the costly startup on every request.
let browserPromise = null;
const VIEWPORT = { width: 1280, height: 720 };

async function getBrowser() {
  if (!browserPromise) {
    browserPromise = puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    }).catch((err) => {
      // reset promise on failure so future attempts can retry
      browserPromise = null;
      throw err;
    });
  }

  return browserPromise;
}

// Simple in-memory cache to avoid repeated analysis for the same URL.
const analysisCache = new Map(); // key -> {expires, value}
const DEFAULT_TTL_MS = 1000 * 60 * 10; // 10 minutes

function getCached(url) {
  const entry = analysisCache.get(url);
  if (!entry) return null;
  if (Date.now() > entry.expires) {
    analysisCache.delete(url);
    return null;
  }
  return entry.value;
}

function setCached(url, value, ttl = DEFAULT_TTL_MS) {
  analysisCache.set(url, { value, expires: Date.now() + ttl });
}

export async function analyzeWebsite(url) {
  // return cached result when available
  const cached = getCached(url);
  if (cached) {
    return { ...cached, cached: true };
  }

  let page;

  try {
    const browser = await getBrowser();
    page = await browser.newPage();
    await page.setViewport(VIEWPORT);

    // Faster navigation: wait for DOMContentLoaded rather than full network idle.
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 20000 });
  // give a tiny grace period for any late-rendered styles/scripts
  // page.waitForTimeout may not exist in all puppeteer builds; use a portable sleep
  await new Promise((r) => setTimeout(r, 500));
      await new Promise((r) => setTimeout(r, 500));
    const designSnapshot = await page.evaluate(() => {
      const getComputedStyles = (selector) => {
        const elements = Array.from(document.querySelectorAll(selector));
        return elements.slice(0, 8).map((element) => {
          const styles = window.getComputedStyle(element);
          return {
            text: element.innerText?.slice(0, 120) || '',
            fontFamily: styles.fontFamily,
            fontSize: styles.fontSize,
            fontWeight: styles.fontWeight,
            color: styles.color,
            backgroundColor: styles.backgroundColor,
            lineHeight: styles.lineHeight
          };
        });
      };

      const colorPalette = Array.from(new Set(
        Array.from(document.querySelectorAll('*'))
          .slice(0, 120)
          .map((element) => window.getComputedStyle(element).color)
      )).slice(0, 12);

      return {
        title: document.title,
        metaDescription: document.querySelector('meta[name="description"]')?.content || '',
        headings: getComputedStyles('h1, h2, h3'),
        buttons: getComputedStyles('button, a.btn, a.button, .btn, .button'),
        bodyStyles: (() => {
          const bodyStyles = window.getComputedStyle(document.body);
          return {
            fontFamily: bodyStyles.fontFamily,
            fontSize: bodyStyles.fontSize,
            color: bodyStyles.color,
            backgroundColor: bodyStyles.backgroundColor,
            lineHeight: bodyStyles.lineHeight
          };
        })(),
        colorPalette
      };
    });

    // capture viewport screenshot (faster than fullPage)
    const screenshotBase64 = await page.screenshot({ type: 'png', fullPage: false, encoding: 'base64' });

    // get suggestions (may be an external call)
    const suggestions = await getDesignSuggestions(designSnapshot, screenshotBase64);

    const result = {
      url,
      scrapedAt: new Date().toISOString(),
      designSnapshot,
      suggestions,
      screenshot: `data:image/png;base64,${screenshotBase64}`
    };

    // cache the result for subsequent requests
    setCached(url, result);

    return result;
  } catch (error) {
    console.error('Analyzer error:', error);
    throw new Error(error.message || 'Failed to analyze website.');
  } finally {
    if (page) {
      try {
        await page.close();
      } catch (e) {
        // ignore
      }
    }
  }
}

// Attempt to gracefully close the browser when the process exits.
async function _closeBrowser() {
  if (!browserPromise) return;
  try {
    const browser = await browserPromise;
    await browser.close();
  } catch (e) {
    // ignore
  } finally {
    browserPromise = null;
  }
}

process.on('SIGINT', async () => {
  await _closeBrowser();
  process.exit(0);
});

process.on('exit', async () => {
  await _closeBrowser();
});
