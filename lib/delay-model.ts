// Delay probability model based on Eurocontrol statistics
// TODO: Replace with real-time data from Eurocontrol/OAG API

// Airline base delay rates (% flights delayed >3 hours, from Eurocontrol data)
const AIRLINE_DELAY_RATES: Record<string, number> = {
  'FR': 0.18, // Ryanair
  'U2': 0.15, // EasyJet
  'W6': 0.22, // Wizz Air
  'VY': 0.14, // Vueling
  'PC': 0.25, // Pegasus
  'HV': 0.12, // Transavia
};

// Route risk modifiers (airports with high congestion/weather issues)
const AIRPORT_RISK: Record<string, number> = {
  'LHR': 1.4,
  'CDG': 1.3,
  'FCO': 1.3,
  'ATH': 1.2,
  'BGY': 1.1,
  'CIA': 1.0,
  'STN': 1.1,
  'LTN': 1.0,
  'BCN': 1.2,
  'MAD': 1.1,
  'AMS': 1.2,
  'BRU': 1.2,
  'DUB': 1.1,
  'PMI': 1.0,
  'ALC': 1.0,
  'WAW': 1.0,
};

// Time modifiers
const TIME_MODIFIERS = {
  earlyMorning: 0.7,  // 05:00-08:00
  morning: 0.9,       // 08:00-12:00
  afternoon: 1.1,     // 12:00-18:00
  evening: 1.3,       // 18:00-22:00
  night: 1.0,         // 22:00-05:00
};

// Day of week modifiers
const DOW_MODIFIERS: Record<number, number> = {
  0: 1.1, // Sunday
  1: 0.9, // Monday
  2: 0.9, // Tuesday
  3: 1.0, // Wednesday
  4: 1.1, // Thursday
  5: 1.3, // Friday (highest)
  6: 1.2, // Saturday
};

function getTimeModifier(hour: number): number {
  if (hour >= 5 && hour < 8) return TIME_MODIFIERS.earlyMorning;
  if (hour >= 8 && hour < 12) return TIME_MODIFIERS.morning;
  if (hour >= 12 && hour < 18) return TIME_MODIFIERS.afternoon;
  if (hour >= 18 && hour < 22) return TIME_MODIFIERS.evening;
  return TIME_MODIFIERS.night;
}

export function calculateDelayProbability(
  airlineCode: string,
  origin: string,
  destination: string,
  departureHour: number,
  dayOfWeek: number
): number {
  const baseRate = AIRLINE_DELAY_RATES[airlineCode] ?? 0.15;
  const originRisk = AIRPORT_RISK[origin] ?? 1.0;
  const destRisk = AIRPORT_RISK[destination] ?? 1.0;
  const timeModifier = getTimeModifier(departureHour);
  const dowModifier = DOW_MODIFIERS[dayOfWeek] ?? 1.0;

  const probability = baseRate * originRisk * destRisk * timeModifier * dowModifier;
  return Math.min(probability, 0.65);
}

export function getCompensation(distanceKm: number): number {
  if (distanceKm < 1500) return 250;
  if (distanceKm < 3500) return 400;
  return 600;
}

export function calculateEV(delayProbability: number, compensationAmount: number, ticketPrice: number): number {
  return delayProbability * compensationAmount - ticketPrice;
}
