import airportsData from './data/airports.json';

interface Airport {
  iata: string;
  name: string;
  lat: number;
  lon: number;
  country: string;
  region: string;
}

// Build a map for O(1) lookup
const airportMap = new Map<string, Airport>();
airportsData.airports.forEach((airport) => {
  airportMap.set(airport.iata.toUpperCase(), airport);
});

/**
 * Haversine formula to calculate great-circle distance between two coordinates
 * @param lat1 Latitude of point 1 (degrees)
 * @param lon1 Longitude of point 1 (degrees)
 * @param lat2 Latitude of point 2 (degrees)
 * @param lon2 Longitude of point 2 (degrees)
 * @returns Distance in kilometers
 */
export function haversine(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in kilometers
  const toRadians = (degrees: number) => (degrees * Math.PI) / 180;

  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.asin(Math.sqrt(a));
  const distance = R * c;

  return Math.round(distance);
}

/**
 * Get airport data by IATA code
 * @param iata Airport IATA code
 * @returns Airport object or null if not found
 */
export function getAirport(iata: string): Airport | null {
  return airportMap.get(iata.toUpperCase()) || null;
}

/**
 * Calculate distance between two airports by IATA code
 * @param departure_iata Departure airport IATA code
 * @param arrival_iata Arrival airport IATA code
 * @returns Distance in kilometers, or -1 if either airport not found
 */
export function calculateDistance(departure_iata: string, arrival_iata: string): number {
  const departure = getAirport(departure_iata);
  const arrival = getAirport(arrival_iata);

  if (!departure || !arrival) {
    return -1; // Signal not found
  }

  return haversine(departure.lat, departure.lon, arrival.lat, arrival.lon);
}

/**
 * Check if an airport is in the EU/EEA region
 * @param iata Airport IATA code
 * @returns true if airport is in EU/EEA region
 */
export function isEUAirport(iata: string): boolean {
  const airport = getAirport(iata);
  return airport ? airport.region === 'EU' : false;
}

export { Airport };
