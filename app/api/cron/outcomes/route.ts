import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

// NOTE: This uses simulated outcomes weighted by delay_probability.
// To use real data, replace the simulation block with a call to:
// OpenSky Network: GET https://opensky-network.org/api/flights/departure?airport={icao}&begin={unix}&end={unix}
// or AviationStack API (free tier available).

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Find placed bets with no outcome where the flight has had time to complete (4h grace)
    const pending = await sql`
      SELECT id, delay_probability, compensation_amount, ticket_price, flight_number
      FROM bets
      WHERE status = 'placed'
        AND outcome IS NULL
        AND departure_at < NOW() - INTERVAL '4 hours'
    `;

    if (pending.rows.length === 0) {
      return NextResponse.json({ success: true, resolved: 0, message: 'No pending bets to resolve' });
    }

    let resolved = 0;

    for (const bet of pending.rows) {
      const delayProb = parseFloat(bet.delay_probability);
      const compensation = parseInt(bet.compensation_amount);
      const ticketPrice = parseFloat(bet.ticket_price);

      // Simulated outcome: weighted by delay_probability
      // Replace this block with real API calls when available
      const rand = Math.random();
      const won = rand < delayProb;

      const outcome = won ? 'won' : 'lost';
      const actualDelayMinutes = won
        ? Math.floor(Math.random() * (480 - 180) + 180)   // 180–480 min if won
        : Math.floor(Math.random() * 60);                  // 0–60 min if lost
      const pnl = won
        ? compensation - ticketPrice
        : -ticketPrice;

      await sql`
        UPDATE bets SET
          outcome = ${outcome},
          actual_delay_minutes = ${actualDelayMinutes},
          pnl = ${pnl}
        WHERE id = ${bet.id}
      `;

      resolved++;
    }

    return NextResponse.json({
      success: true,
      resolved,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Cron outcomes error:', error);
    return NextResponse.json({ error: 'Outcomes check failed', details: String(error) }, { status: 500 });
  }
}
