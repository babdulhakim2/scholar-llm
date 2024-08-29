import puppeteer, { Browser } from 'puppeteer';
import { saveData, hasExcludedExtension, readLinks } from './utils';
import fs from 'fs';
import path from 'path';
import { config, dirs } from './config';
import { sites } from './sites';
import { Site } from './types';





const { excludeExtensions, maxIterations: MAX_ITERATIONS, maxDepth: MAX_DEPTH } = config;
const outputDir = dirs.scrapeOutput;

// Ensure the output directory exists
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir);
}

function getFilePath(siteName: string): string {
  return path.join(outputDir, `${siteName}-data.txt`);
}


async function getAllLinksForSite(site: Site): Promise<void> {
  console.log(`Starting to scrape: ${site.domain}`);
  
  const browser: Browser = await puppeteer.launch();
  const page = await browser.newPage();
  const visited: Set<string> = readLinks(site.name);
  const linksToVisit: string[] = [site.domain];
  let currentDepth = 0;
  let iterations = 0;

  while (linksToVisit.length && iterations < MAX_ITERATIONS && currentDepth <= MAX_DEPTH) {
    const currentUrl = linksToVisit.shift();
    if (currentUrl && !visited.has(currentUrl) && !hasExcludedExtension(currentUrl, excludeExtensions)) {
      console.log(`Visiting: ${currentUrl}`);
      visited.add(currentUrl);
      iterations++;

      try {
        await page.goto(currentUrl, { waitUntil: 'networkidle2', timeout: 30000 });
        console.log(`Successfully accessed: ${currentUrl}`);

        const pageText = await page.evaluate(() => document.body.innerText);
        saveData(site.name, currentUrl, pageText);

        const links = await page.evaluate(() =>
          Array.from(document.querySelectorAll('a[href]')).map(a => (a as HTMLAnchorElement).href)
        );

        console.log(`Found ${links.length} links on ${currentUrl}`);

        for (const link of links) {
          if (link.startsWith(site.domain) && !visited.has(link) && !linksToVisit.includes(link) && !hasExcludedExtension(link, excludeExtensions)) {
            console.log(`Discovered link: ${link}`);
            linksToVisit.push(link);
          }
        }

        currentDepth++;

      } catch (error) {
        console.error(`Failed to access ${currentUrl}:`, error);
      }
    }

    if (iterations >= MAX_ITERATIONS) {
      console.log(`Reached iteration limit of ${MAX_ITERATIONS} for site ${site.name}. Stopping.`);
    }

    if (currentDepth > MAX_DEPTH) {
      console.log(`Reached maximum depth of ${MAX_DEPTH} for site ${site.name}. Stopping.`);
    }
  }

  console.log(`Finished scraping ${site.domain}.`);
  await browser.close();
}

async function scrapeAllSites(): Promise<void> {
  for (const site of sites) {
    await getAllLinksForSite(site);
  }
}

// Start scraping all sites
scrapeAllSites().then(() => {
  console.log('All sites have been scraped and data saved in text files.');
});