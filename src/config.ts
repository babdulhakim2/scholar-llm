import { createOpenAI } from '@ai-sdk/openai';
import { createOpenAI as createGroq } from '@ai-sdk/openai';
import path from 'path';

// AI Model Configuration
const openai = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const groq = createGroq({
  baseURL: 'https://api.groq.com/openai/v1',
  apiKey: process.env.GROQ_API_KEY,
});


export const aiModels = {
  openai: openai('gpt-4'),
  groq: groq('llama-3.1-70b-versatile'),
};

// Current AI Model Selection
export const currentAIModel = aiModels.openai; // Change this to switch models

// Directory Configuration
export const dirs = {
  scrapeOutput: path.join(__dirname, '..', 'scrape-output'),
  processOutput: path.join(__dirname, '..', 'process-output'),
  credentials: path.join(__dirname, '..', 'credentials'),
  eligibilityResults: path.join(__dirname, '..', 'eligibility-results'),
};

// Other Configuration
export const config = {
  maxIterations: 1000,
  maxDepth: 50,
  excludeExtensions: ['.png', '.jpg', '.jpeg', '.mp4'],
};