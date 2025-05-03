/**
 * Represents a geographical location with latitude and longitude coordinates.
 */
export interface Location {
  /**
   * The latitude of the location (degrees). Must be between -90 and 90.
   */
  lat: number;
  /**
   * The longitude of the location (degrees). Must be between -180 and 180.
   */
  lng: number;
}


/**
 * Represents weather information, including temperature and conditions.
 */
export interface Weather {
  /**
   * The temperature in Fahrenheit.
   */
  temperatureFahrenheit: number; // Corrected spelling
  /**
   * The weather conditions (e.g., Sunny, Cloudy, Rainy).
   */
  conditions: string;
}


/**
 * Asynchronously retrieves weather information for a given location.
 * This is a placeholder and does not call a real API.
 *
 * @param location The location (lat/lng) for which to retrieve weather data.
 * @returns A promise that resolves to a Weather object containing temperature and conditions.
 */
export async function getWeather(location: Location): Promise<Weather> {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 300));

  // Basic mock logic based on location (very simplistic)
  let temp = 70;
  let condition = 'Sunny';

  if (location.lat > 45) { // Simulate colder for northern latitudes
    temp = 55;
    condition = 'Cloudy';
  } else if (location.lat < 30) { // Simulate warmer for southern
    temp = 80;
  }

  // Add slight randomness
  temp += Math.random() * 10 - 5; // +/- 5 degrees
  if (Math.random() < 0.1) condition = 'Rainy'; // 10% chance of rain

  console.log(`Mock weather for ${location.lat}, ${location.lng}: ${temp.toFixed(0)}°F, ${condition}`);

  return {
    temperatureFahrenheit: Math.round(temp),
    conditions: condition,
  };
}
```