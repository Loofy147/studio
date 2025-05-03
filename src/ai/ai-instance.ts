
'use server';
/**
 * @fileOverview Centralized Genkit AI instance configuration.
 */
import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';
import {configureGenkit} from '@genkit-ai/next';

// Configure Genkit plugins
configureGenkit({
  plugins: [
    googleAI({
      // Use environment variable for API Key (best practice)
       apiKey: process.env.GOOGLE_GENAI_API_KEY,
       apiVersion: ["v1beta"], // Specify necessary API version if needed (e.g., for Gemini 1.5)
    }),
  ],
  logLevel: 'debug', // Set log level (optional)
  enableTracingAndMetrics: true, // Enable telemetry (optional)
});


// Define the global AI instance
// You can potentially configure different models or settings here if needed.
// For now, it relies on the globally configured plugins.
export const ai = genkit();


// Note: The previous weather service related code has been removed as it's
// no longer relevant to the marketplace application.
// If new AI tools or services are needed for the marketplace, they should be
// defined here or in separate service files and potentially registered as tools.
