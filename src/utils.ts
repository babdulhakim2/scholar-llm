import fs from 'fs';
import path from 'path';
import { parse } from 'json2csv';
import { dirs } from './config';


const outputDir = dirs.scrapeOutput;

// Ensure the output directory exists
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir);
}

// Function to add a unique link to the site-specific file
export function saveLink(link: string, siteName: string): void {
  const filePath = getFilePath(siteName);
  const existingLinks = readLinks(siteName);
  if (!existingLinks.has(link)) {
    fs.appendFileSync(filePath, `${link}\n`, 'utf8');
  }
}

// Function to read all links from the site-specific file
export function readLinks(siteName: string): Set<string> {
  const filePath = getFilePath(siteName);
  if (!fs.existsSync(filePath)) {
    return new Set();
  }
  const data = fs.readFileSync(filePath, 'utf8');
  const links = data.split('\n\nLINK: ').slice(1).map(block => block.split('\n')[0]);
  return new Set(links);
}


// Helper function to generate the file path for a site
export function getFilePath(siteName: string): string {
  return path.join(outputDir, `${siteName}-data.txt`);
}






export function saveData(siteName: string, link: string, pageText: string): void {
  const filePath = getFilePath(siteName);
  const data = `\n\nLINK: ${link}\n\nCONTENT:\n${pageText}\n`;
  fs.appendFileSync(filePath, data, 'utf8');
}


// Function to check if a link has an excluded extension

export function hasExcludedExtension(link: string, excludeExtensions: string[]): boolean {
  return excludeExtensions.some(ext => link.endsWith(ext));
}