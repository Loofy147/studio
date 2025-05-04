
'use server';
/**
 * @fileOverview Development entry point for Genkit flows.
 * This file imports the configured 'ai' instance and exports flows
 * intended for use with the Genkit development UI (`genkit start`).
 * Configuration should primarily reside in `ai-instance.ts` and the
 * Next.js Genkit plugin setup.
 *
 * Placeholder: Import and export actual implemented flows here.
 */

import { ai } from './ai-instance'; // Import the configured instance

// Import and re-export flows for the dev UI
// e.g., import { optimizeRouteFlow } from './flows/optimize-route-flow';
// export { optimizeRouteFlow };

// Optional: Define development-specific flows or tools if needed, using the imported 'ai' instance.
// Example:
/*
const testFlow = ai.defineFlow(
  { name: 'devTestFlow' },
  async (input: string) => `Dev echo: ${input}`
);
export { testFlow };
*/
