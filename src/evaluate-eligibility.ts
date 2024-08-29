import fs from 'fs';
import path from 'path';
import pdf from 'pdf-parse';
import { generateObject } from 'ai';
import { z } from 'zod';
import { currentAIModel, dirs } from './config';

const inputDir = dirs.processOutput;
const credentialsDir = dirs.credentials;
const outputDir = dirs.eligibilityResults;

// Ensure the output directory exists
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

const eligibilityResultSchema = z.object({
  scholarshipName: z.string().describe('The name of the scholarship'),
  eligibilityScore: z.number().min(0).max(100).describe('The assessed score of the scholarship based on my credentials'),
  reasons: z.array(z.string()).describe('The reasons for the score, supporting the eligibility score given'),
  missingRequirements: z.array(z.string()).describe('The missing requirements for the scholarship'),
  recommendations: z.array(z.string()).describe('recommendations for improving my eligibility for the scholarship, if any, otherwise return that No recommendations are needed'),
});

async function extractPDFContent(pdfPath: string): Promise<string> {
  try {
    const dataBuffer = fs.readFileSync(pdfPath);
    const data = await pdf(dataBuffer);
    return data.text;
  } catch (error) {
    console.error(`Error extracting content from PDF ${pdfPath}:`, error);
    return '';
  }
}

async function processCredentials(): Promise<string | null> {
  if (!fs.existsSync(credentialsDir)) {
    console.warn("Credentials directory does not exist.");
    return null;
  }

  const pdfFiles = fs.readdirSync(credentialsDir).filter(file => file.toLowerCase().endsWith('.pdf'));
  if (pdfFiles.length === 0) {
    console.warn("No credential PDFs found in the credentials folder.");
    return null;
  }

  let allContent = '';
  for (const pdfFile of pdfFiles) {
    const pdfPath = path.join(credentialsDir, pdfFile);
    console.log(`Extracting content from ${pdfFile}...`);
    const content = await extractPDFContent(pdfPath);
    if (content) {
      allContent += `--- Content from ${pdfFile} ---\n\n${content}\n\n`;
      console.log(`Successfully extracted content from ${pdfFile}`);
    } else {
      console.warn(`Failed to extract content from ${pdfFile}`);
    }
  }

  if (!allContent) {
    console.error("Failed to extract content from any PDF files.");
    return null;
  }

  console.log({allContent});

  return allContent;
}

async function evaluateEligibility(scholarshipData: string, credentials: string | null): Promise<any> {
  if (credentials === null) {
    return {
      scholarshipName: "Unknown Scholarship",
      eligibilityScore: 0,
      reasons: ["No credentials provided for evaluation"],
      missingRequirements: ["All credentials are missing"],
      recommendations: ["Please provide credentials for evaluation"]
    };
  }

  const prompt = `
    Based on the following scholarship information and my credentials, evaluate my eligibility and provide a score from 0-100%.
    Also, provide reasons for the score, list any missing requirements, and give recommendations for improving eligibility.
    Use step by step thinking when evaluating the score.

    Scholarship Information:
    ${scholarshipData}

    My Credentials:
    ${credentials}

    Provide your evaluation in the required schema format, and address the user directly.
  `;

  try {
    const result = await generateObject({
      model: currentAIModel,
      schema: eligibilityResultSchema,
      prompt: prompt,
    });

    return result;
  } catch (error) {
    console.error('Error evaluating eligibility:', error);
    return {
      scholarshipName: "Unknown Scholarship",
      eligibilityScore: 0,
      reasons: ["Error occurred during evaluation"],
      missingRequirements: ["Unable to determine due to error"],
      recommendations: ["Please try again or contact support"]
    };
  }
}

function formatEligibilityResult(result: any): string {
  return `
Scholarship Eligibility Evaluation
==================================

Scholarship Name: ${result.scholarshipName}
Eligibility Score: ${result.eligibilityScore}%

Reasons:
${result.reasons.map((reason: string) => `- ${reason}`).join('\n')}

Missing Requirements:
${result.missingRequirements.map((req: string) => `- ${req}`).join('\n')}

Recommendations:
${result.recommendations.map((rec: string) => `- ${rec}`).join('\n')}
`;
}

async function processScholarships(): Promise<void> {
  console.log('Processing credentials...');
  const credentials = await processCredentials();

  if (credentials === null) {
    console.error("No credentials found or extracted. Please check the credentials folder and PDF files.");
    return;
  }

  console.log('Credentials processed successfully. Starting scholarship evaluation...');

  const scholarshipFiles = fs.readdirSync(inputDir).filter(file => file.endsWith('.txt'));

  for (const scholarshipFile of scholarshipFiles) {
    const scholarshipPath = path.join(inputDir, scholarshipFile);
    const scholarshipContent = fs.readFileSync(scholarshipPath, 'utf8');

    console.log(`Evaluating eligibility for ${scholarshipFile}...`);

    try {
      const eligibilityResult = await evaluateEligibility(scholarshipContent, credentials);
      const formattedResult = formatEligibilityResult(eligibilityResult);

      const outputFilePath = path.join(outputDir, scholarshipFile.replace('.txt', '_eligibility.txt'));
      fs.writeFileSync(outputFilePath, formattedResult);

      console.log(`Eligibility evaluation saved to ${outputFilePath}`);
    } catch (error) {
      console.error(`Error processing scholarship ${scholarshipFile}:`, error);
    }
  }
}

if (require.main === module) {
  (async () => {
    console.log('Starting eligibility evaluation...');
    try {
      await processScholarships();
      console.log('Eligibility evaluation completed.');
    } catch (error) {
      console.error('Error during eligibility evaluation:', error);
      process.exit(1);
    }
  })();
}