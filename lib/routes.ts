// Hardcoded European budget flight routes for MVP
// TODO: Replace with real Kiwi.com / Skyscanner API calls using KIWI_API_KEY

export interface Route {
  origin: string;
  destination: string;
  originName: string;
  destinationName: string;
  distanceKm: number;
  airlines: string[];
  priceRange: [number, number]; // [min, max] EUR
}

export const ROUTES: Route[] = [
  { origin: 'STN', destination: 'DUB', originName: 'London Stansted', destinationName: 'Dublin', distanceKm: 447, airlines: ['FR'], priceRange: [9, 45] },
  { origin: 'STN', destination: 'BCN', originName: 'London Stansted', destinationName: 'Barcelona', distanceKm: 1371, airlines: ['FR', 'VY'], priceRange: [15, 70] },
  { origin: 'STN', destination: 'PMI', originName: 'London Stansted', destinationName: 'Palma de Mallorca', distanceKm: 1334, airlines: ['FR'], priceRange: [12, 60] },
  { origin: 'STN', destination: 'FCO', originName: 'London Stansted', destinationName: 'Rome Fiumicino', distanceKm: 1733, airlines: ['FR'], priceRange: [19, 75] },
  { origin: 'STN', destination: 'CIA', originName: 'London Stansted', destinationName: 'Rome Ciampino', distanceKm: 1733, airlines: ['FR'], priceRange: [14, 65] },
  { origin: 'LTN', destination: 'ALC', originName: 'London Luton', destinationName: 'Alicante', distanceKm: 1414, airlines: ['FR', 'U2'], priceRange: [12, 55] },
  { origin: 'LTN', destination: 'MAD', originName: 'London Luton', destinationName: 'Madrid', distanceKm: 1438, airlines: ['W6', 'U2'], priceRange: [18, 72] },
  { origin: 'LTN', destination: 'ATH', originName: 'London Luton', destinationName: 'Athens', distanceKm: 2398, airlines: ['W6'], priceRange: [25, 80] },
  { origin: 'LTN', destination: 'BGY', originName: 'London Luton', destinationName: 'Milan Bergamo', distanceKm: 1180, airlines: ['W6', 'U2'], priceRange: [14, 60] },
  { origin: 'BGY', destination: 'STN', originName: 'Milan Bergamo', destinationName: 'London Stansted', distanceKm: 1180, airlines: ['FR'], priceRange: [14, 58] },
  { origin: 'BGY', destination: 'BRU', originName: 'Milan Bergamo', destinationName: 'Brussels', distanceKm: 821, airlines: ['W6'], priceRange: [11, 45] },
  { origin: 'BGY', destination: 'WAW', originName: 'Milan Bergamo', destinationName: 'Warsaw', distanceKm: 1225, airlines: ['W6'], priceRange: [14, 52] },
  { origin: 'CDG', destination: 'BCN', originName: 'Paris CDG', destinationName: 'Barcelona', distanceKm: 831, airlines: ['VY', 'U2'], priceRange: [16, 65] },
  { origin: 'CDG', destination: 'MAD', originName: 'Paris CDG', destinationName: 'Madrid', distanceKm: 1055, airlines: ['VY'], priceRange: [18, 68] },
  { origin: 'CDG', destination: 'FCO', originName: 'Paris CDG', destinationName: 'Rome Fiumicino', distanceKm: 1107, airlines: ['U2', 'FR'], priceRange: [19, 72] },
  { origin: 'AMS', destination: 'BCN', originName: 'Amsterdam', destinationName: 'Barcelona', distanceKm: 1507, airlines: ['VY', 'HV'], priceRange: [20, 78] },
  { origin: 'AMS', destination: 'MAD', originName: 'Amsterdam', destinationName: 'Madrid', distanceKm: 1462, airlines: ['HV', 'VY'], priceRange: [22, 80] },
  { origin: 'AMS', destination: 'FCO', originName: 'Amsterdam', destinationName: 'Rome Fiumicino', distanceKm: 1596, airlines: ['HV', 'U2'], priceRange: [24, 79] },
  { origin: 'AMS', destination: 'ATH', originName: 'Amsterdam', destinationName: 'Athens', distanceKm: 2163, airlines: ['HV'], priceRange: [28, 80] },
  { origin: 'BCN', destination: 'LHR', originName: 'Barcelona', destinationName: 'London Heathrow', distanceKm: 1371, airlines: ['VY', 'U2'], priceRange: [20, 75] },
  { origin: 'BCN', destination: 'CDG', originName: 'Barcelona', destinationName: 'Paris CDG', distanceKm: 831, airlines: ['VY'], priceRange: [16, 62] },
  { origin: 'BCN', destination: 'AMS', originName: 'Barcelona', destinationName: 'Amsterdam', distanceKm: 1507, airlines: ['VY'], priceRange: [21, 77] },
  { origin: 'MAD', destination: 'LHR', originName: 'Madrid', destinationName: 'London Heathrow', distanceKm: 1438, airlines: ['VY', 'U2'], priceRange: [22, 78] },
  { origin: 'MAD', destination: 'CDG', originName: 'Madrid', destinationName: 'Paris CDG', distanceKm: 1055, airlines: ['VY'], priceRange: [18, 65] },
  { origin: 'MAD', destination: 'FCO', originName: 'Madrid', destinationName: 'Rome Fiumicino', distanceKm: 1364, airlines: ['VY', 'U2'], priceRange: [20, 72] },
  { origin: 'LHR', destination: 'BCN', originName: 'London Heathrow', destinationName: 'Barcelona', distanceKm: 1371, airlines: ['U2'], priceRange: [22, 80] },
  { origin: 'LHR', destination: 'MAD', originName: 'London Heathrow', destinationName: 'Madrid', distanceKm: 1438, airlines: ['U2'], priceRange: [25, 80] },
  { origin: 'LHR', destination: 'AMS', originName: 'London Heathrow', destinationName: 'Amsterdam', distanceKm: 360, airlines: ['U2'], priceRange: [15, 60] },
  { origin: 'LHR', destination: 'FCO', originName: 'London Heathrow', destinationName: 'Rome Fiumicino', distanceKm: 1733, airlines: ['U2'], priceRange: [28, 80] },
];

export const DEPARTURE_TIMES = [
  { hour: 6, minute: 0 },
  { hour: 6, minute: 30 },
  { hour: 7, minute: 0 },
  { hour: 7, minute: 30 },
  { hour: 8, minute: 0 },
  { hour: 9, minute: 15 },
  { hour: 10, minute: 0 },
  { hour: 11, minute: 45 },
  { hour: 13, minute: 0 },
  { hour: 14, minute: 30 },
  { hour: 15, minute: 0 },
  { hour: 16, minute: 45 },
  { hour: 17, minute: 30 },
  { hour: 18, minute: 0 },
  { hour: 19, minute: 15 },
  { hour: 20, minute: 0 },
  { hour: 20, minute: 45 },
  { hour: 21, minute: 0 },
];
