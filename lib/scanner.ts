import { sql } from '@vercel/postgres';
import { calculateDelayProbability, getCompensation, calculateEV } from './delay-model';
import { ROUTES, DEPARTURE_TIMES } from './routes';

function seededRandom(seed: number): () => number {
  let s = seed;
  return function () {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return (s >>> 0) / 0xffffffff;
  };
}

function getFlightNumber(airlineCode: string, rng: () => number): string {
  const num = Math.floor(rng() * 8999) + 1000;
  return `${airlineCode}${num}`;
}

export async function runScan(targetDate?: Date): Promise<{ flightsScanned: number; betsGenerated: number }> {
  const date = targetDate ?? new Date();
  const dateStr = date.toISOString().split('T')[0];
  const dayOfWeek = date.getDay();

  const dateSeed = parseInt(dateStr.replace(/-/g, ''), 10);
  const rng = seededRandom(dateSeed);

  const candidates: Array<{
    flightNumber: string;
    airlineCode: string;
    origin: string;
    destination: string;
    originName: string;
    destinationName: string;
    distanceKm: number;
    ticketPrice: number;
    delayProbability: number;
    compensationAmount: number;
    expectedValue: number;
    departureAt: Date;
  }> = [];

  for (const route of ROUTES) {
    const numFlights = Math.floor(rng() * 4) + 2;

    for (let i = 0; i < numFlights; i++) {
      const airline = route.airlines[Math.floor(rng() * route.airlines.length)];
      const timeSlot = DEPARTURE_TIMES[Math.floor(rng() * DEPARTURE_TIMES.length)];

      const [minPrice, maxPrice] = route.priceRange;
      const ticketPrice = Math.round((minPrice + rng() * (maxPrice - minPrice)) * 100) / 100;

      const delayProb = calculateDelayProbability(
        airline, route.origin, route.destination, timeSlot.hour, dayOfWeek
      );

      const compensation = getCompensation(route.distanceKm);
      const ev = calculateEV(delayProb, compensation, ticketPrice);

      const departureAt = new Date(date);
      departureAt.setUTCHours(timeSlot.hour, timeSlot.minute, 0, 0);

      candidates.push({
        flightNumber: getFlightNumber(airline, rng),
        airlineCode: airline,
        origin: route.origin,
        destination: route.destination,
        originName: route.originName,
        destinationName: route.destinationName,
        distanceKm: route.distanceKm,
        ticketPrice,
        delayProbability: Math.round(delayProb * 1000) / 1000,
        compensationAmount: compensation,
        expectedValue: Math.round(ev * 100) / 100,
        departureAt,
      });
    }
  }

  const flightsScanned = candidates.length;

  const filtered = candidates
    .filter(c => c.expectedValue > 0 && c.ticketPrice < 80 && c.delayProbability > 0.12)
    .sort((a, b) => b.expectedValue - a.expectedValue)
    .slice(0, 8);

  for (const bet of filtered) {
    await sql`
      INSERT INTO bets (
        date, flight_number, airline_code, origin, destination,
        origin_name, destination_name, departure_at, distance_km,
        ticket_price, delay_probability, compensation_amount, expected_value
      ) VALUES (
        ${dateStr}, ${bet.flightNumber}, ${bet.airlineCode},
        ${bet.origin}, ${bet.destination}, ${bet.originName},
        ${bet.destinationName}, ${bet.departureAt.toISOString()},
        ${bet.distanceKm}, ${bet.ticketPrice}, ${bet.delayProbability},
        ${bet.compensationAmount}, ${bet.expectedValue}
      )
    `;
  }

  await sql`
    INSERT INTO scan_logs (flights_scanned, bets_generated, status)
    VALUES (${flightsScanned}, ${filtered.length}, 'success')
  `;

  return { flightsScanned, betsGenerated: filtered.length };
}
