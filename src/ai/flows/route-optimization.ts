// route-optimization.ts
'use server';

/**
 * @fileOverview An AI route optimization agent considering traffic and weather conditions.
 *
 * - optimizeRoute - A function that handles the route optimization process.
 * - OptimizeRouteInput - The input type for the optimizeRoute function.
 * - OptimizeRouteOutput - The return type for the optimizeRoute function.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';
import {Weather, getWeather, Location} from '@/services/weather';

const OptimizeRouteInputSchema = z.object({
  startLocation: z.object({
    lat: z.number().describe('The latitude of the starting location.'),
    lng: z.number().describe('The longitude of the starting location.'),
  }).describe('The starting location coordinates.'),
  endLocation: z.object({
    lat: z.number().describe('The latitude of the destination location.'),
    lng: z.number().describe('The longitude of the destination location.'),
  }).describe('The destination location coordinates.'),
  currentTrafficConditions: z.string().describe('The current traffic conditions (e.g., light, moderate, heavy).'),
});
export type OptimizeRouteInput = z.infer<typeof OptimizeRouteInputSchema>;

const OptimizeRouteOutputSchema = z.object({
  optimalRoute: z.string().describe('A description of the optimal route, considering traffic and weather.'),
  estimatedArrivalTime: z.string().describe('The estimated time of arrival.'),
  weatherConditions: z.string().describe('The weather conditions at destination.'),
});
export type OptimizeRouteOutput = z.infer<typeof OptimizeRouteOutputSchema>;

export async function optimizeRoute(input: OptimizeRouteInput): Promise<OptimizeRouteOutput> {
  return optimizeRouteFlow(input);
}

const weatherTool = ai.defineTool({
  name: 'getWeatherConditions',
  description: 'Retrieves the current weather conditions for a given location.',
  inputSchema: z.object({
    lat: z.number().describe('The latitude of the location.'),
    lng: z.number().describe('The longitude of the location.'),
  }),
  outputSchema: z.object({
    temperatureFarenheit: z.number(),
    conditions: z.string(),
  }),
  async execute(input) {
    const weather = await getWeather({lat: input.lat, lng: input.lng});
    return {
      temperatureFarenheit: weather.temperatureFarenheit,
      conditions: weather.conditions,
    };
  },
});

const prompt = ai.definePrompt({
  name: 'optimizeRoutePrompt',
  input: {
    schema: z.object({
      startLocation: z.object({
        lat: z.number().describe('The latitude of the starting location.'),
        lng: z.number().describe('The longitude of the starting location.'),
      }).describe('The starting location coordinates.'),
      endLocation: z.object({
        lat: z.number().describe('The latitude of the destination location.'),
        lng: z.number().describe('The longitude of the destination location.'),
      }).describe('The destination location coordinates.'),
      currentTrafficConditions: z.string().describe('The current traffic conditions.'),
    }),
  },
  output: {
    schema: z.object({
      optimalRoute: z.string().describe('A description of the optimal route, considering traffic and weather.'),
      estimatedArrivalTime: z.string().describe('The estimated time of arrival.'),
      weatherConditions: z.string().describe('The weather conditions at destination.'),
    }),
  },
  prompt: `You are a route optimization expert. Given the start and end locations, current traffic conditions, and weather conditions at the destination, suggest the optimal delivery route and estimate the arrival time.

Start Location: {{{startLocation.lat}}}, {{{startLocation.lng}}}
End Location: {{{endLocation.lat}}}, {{{endLocation.lng}}}
Current Traffic Conditions: {{{currentTrafficConditions}}}

Consider using the getWeatherConditions tool to get weather information for the destination.

Output the optimal route, estimated arrival time, and weather conditions at the destination.`,,
  tools: [weatherTool],
});

const optimizeRouteFlow = ai.defineFlow<
  typeof OptimizeRouteInputSchema,
  typeof OptimizeRouteOutputSchema
>({
  name: 'optimizeRouteFlow',
  inputSchema: OptimizeRouteInputSchema,
  outputSchema: OptimizeRouteOutputSchema,
}, async input => {
  const {output} = await prompt(input);
  return output!;
});
