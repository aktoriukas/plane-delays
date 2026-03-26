import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { initDB } from '@/lib/db';

// Public endpoint for auto-resolving past bets on dashboard load.
// Called client-side (no auth required).
// NOTE: Uses simulated outcomes. Replace the simulation block with real API calls when available.

export async function GET() {
  try {
    await initDB();

    const pending = await sql`
      SELECT id, delay_probability, compensation_amount, ticket_price
      FROM bets
      WHERE status = 'placed'
        AND outcome IS NULL
        AND departure_at < NOW() - INTERVAL '4 hours'
    `;

    if (pending.rows.length === 0) {
      return NextResponse.json({ resolved: 0 });
    }

    let resolved = 0;

    for (const bet of pending.rows) {
      const delayProb = parseFloat(bet.delay_probability);
      const compensation = parseInt(bet.compensation_amount);
      const ticketPrice = parseFloat(bet.ticket_price);

      // Simulated outcome weighted by delay_probability
      const won = Math.random() < delayProb;
      const outcome = won ? 'won' : 'lost';
      const actualDelayMinutes = won
        ? Math.floor(Math.random() * (480 - 180) + 180)
        : Math.floor(Math.random() * 60);
      const pnl = won ? compensation - ticketPrice : -ticketPrice;

      await sql`
        UPDATE bets SET
          outcome = ${outcome},
          actual_delay_minutes = ${actualDelayMinutes},
          pnl = ${pnl}
        WHERE id = ${bet.id}
      `;
      resolved++;
    }

    return NextResponse.json({ resolved });
  } catch (error) {
    console.error('Resolve outcomes error:', error);
    return NextResponse.json({ resolved: 0, error: String(error) });
  }
}
