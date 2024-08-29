import fs from 'fs';
import path from 'path';
import { generateObject } from 'ai';
import { scholarshipSchema } from './schemas';
import { currentAIModel, dirs } from './config';

const inputDir = dirs.scrapeOutput;
const outputDir = dirs.processOutput;

// Ensure the output directory exists
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

function formatScholarshipData(data: any, indent: string = ''): string {
  let output = '';
  for (const [key, value] of Object.entries(data)) {
    if (Array.isArray(value)) {
      output += `${indent}${key.toUpperCase()}:\n`;
      value.forEach((item) => {
        if (typeof item === 'object' && item !== null) {
          output += `${indent}  ${formatScholarshipData(item, indent + '    ')}`;
        } else {
          output += `${indent}  ${item}\n`;
        }
      });
    } else if (typeof value === 'object' && value !== null) {
      output += `${indent}${key.toUpperCase()}:\n${formatScholarshipData(value, indent + '  ')}`;
    } else {
      output += `${indent}${key.toUpperCase()}: ${value}\n`;
    }
  }
  return output;
}

async function processScrapedData(): Promise<void> {
  const files = fs.readdirSync(inputDir).filter(file => file.endsWith('-data.txt'));

  if (files.length === 0) {
    throw new Error("No scraped data found in the scrape-output directory. Please run the scraper first using 'pnpm run scrape' or use 'pnpm run all' to scrape and process data.");
  }

  for (const file of files) {
    console.log(`Processing ${file}...`);
    const siteName = file.replace('-data.txt', '');
    const filePath = path.join(inputDir, file);
    const fileContent = fs.readFileSync(filePath, 'utf8');

    try {
      const prompt = `
        Based on the following text from ${siteName}, extract as much information as possible about scholarships.
        Use the provided schema to structure the output. If a field is not applicable or the information is not available, omit it from the output.

        Text:
        ${fileContent}
      `;

      const { object } = await generateObject({
        model: currentAIModel,
        schema: scholarshipSchema,
        prompt: prompt,
      });

      console.log({object});

      const formattedData = formatScholarshipData(object);
      const outputFilePath = path.join(outputDir, `${siteName}_processed.txt`);
      fs.writeFileSync(outputFilePath, formattedData);
      console.log(`Processed and saved scholarship data to ${outputFilePath}`);
    } catch (error) {
      console.error(`Error processing file ${file}: ${error}`);
    }
  }
}

// Function to run after scraping is finished
export async function postScrapeProcessing(): Promise<void> {
  console.log('Starting post-scrape processing...');
  await processScrapedData();
  console.log('Post-scrape processing completed.');
}

if (require.main === module) {
  (async () => {
    console.log('Starting standalone processing of scraped data...');
    try {
      await processScrapedData();
      console.log('Standalone processing completed.');
    } catch (error) {
      console.error('Error during processing:', error);
      process.exit(1);
    }
  })();
}