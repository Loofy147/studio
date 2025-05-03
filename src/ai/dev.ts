
'use server';
/**
 * @fileOverview Development entry point for Genkit.
 * This file is often used for local development and testing of flows.
 * It ensures Genkit is configured when running flows directly (e.g., via `genkit start`).
 */
import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';
import {configureGenkit} from '@genkit-ai/next'; // Although using Next.js config, keep for direct runs

// Configure Genkit plugins (mirroring configureGenkit in ai-instance for consistency)
configureGenkit({
  plugins: [
    googleAI({
       apiKey: process.env.GOOGLE_GENAI_API_KEY,
       apiVersion: ["v1beta"],
    }),
    // Add other development-specific plugins or configurations if needed
  ],
  logLevel: 'debug',
  enableTracingAndMetrics: true,
});

// Export necessary flows or tools for the Genkit development UI if desired
// e.g., import { someFlow } from './flows/some-flow';
// export { someFlow };

// The global AI instance might be used here if defining dev-specific flows
export const ai = genkit();


// Note: The previous weather service related code has been removed as it's
// no longer relevant to the marketplace application.
