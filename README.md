# LLM AI-Powered Scholarship Finder

LLM AI-Powered Scholarship Finder is an intelligent tool that leverages AI to streamline your scholarship search process. It scrapes scholarship websites, processes the data, and evaluates your eligibility, helping you discover opportunities that best match your credentials.

## Features

- Web scraping of multiple scholarship sites
- AI-powered data processing and eligibility evaluation
- Support for multiple AI models (OpenAI, Groq)
- Docker support for easy setup and execution

## Prerequisites

- Docker (recommended)
- OR Node.js 18+ and pnpm

## Setup

### Using Docker (Recommended)

1. Clone the repository:
   ```
   git clone https://github.com/scholar-llm/llm-scholarship-finder.git
   cd llm-scholarship-finder
   ```

2. Create a `.env` file in the root directory with your API keys:
   ```
   OPENAI_API_KEY=your_openai_api_key
   GROQ_API_KEY=your_groq_api_key
   ```

3. Build the Docker image:
   ```
   docker build -t llm-scholarship-finder .
   ```

### Using Node.js and pnpm

Follow steps 1-5 from the previous README version.

## Usage

### With Docker

Run the entire process:
