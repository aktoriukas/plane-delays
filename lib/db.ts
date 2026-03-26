import { sql } from '@vercel/postgres';

export async function initDB() {
  await sql`
    CREATE TABLE IF NOT EXISTS bets (
      id SERIAL PRIMARY KEY,
      date DATE NOT NULL,
      flight_number VARCHAR(10),
      airline_code VARCHAR(3),
      origin VARCHAR(4),
      destination VARCHAR(4),
      origin_name VARCHAR(100),
      destination_name VARCHAR(100),
      departure_at TIMESTAMPTZ,
      distance_km INTEGER,
      ticket_price DECIMAL(8,2),
      delay_probability DECIMAL(4,3),
      compensation_amount INTEGER,
      expected_value DECIMAL(8,2),
      status VARCHAR(20) DEFAULT 'pending',
      outcome VARCHAR(20),
      actual_delay_minutes INTEGER,
      pnl DECIMAL(8,2),
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS scan_logs (
      id SERIAL PRIMARY KEY,
      scanned_at TIMESTAMPTZ DEFAULT NOW(),
      flights_scanned INTEGER,
      bets_generated INTEGER,
      status VARCHAR(20)
    )
  `;
}

export async function getBetsForDate(date: string) {
  const result = await sql`
    SELECT * FROM bets WHERE date = ${date} ORDER BY expected_value DESC
  `;
  return result.rows;
}

export async function getAllBets(limit = 200, offset = 0) {
  const result = await sql`
    SELECT * FROM bets ORDER BY date DESC, expected_value DESC LIMIT ${limit} OFFSET ${offset}
  `;
  return result.rows;
}

export async function updateBet(id: number, updates: Record<string, unknown>) {
  const { status, outcome, actual_delay_minutes, pnl } = updates as {
    status?: string;
    outcome?: string;
    actual_delay_minutes?: number;
    pnl?: number;
  };

  const result = await sql`
    UPDATE bets SET
      status = COALESCE(${status ?? null}, status),
      outcome = COALESCE(${outcome ?? null}, outcome),
      actual_delay_minutes = COALESCE(${actual_delay_minutes ?? null}, actual_delay_minutes),
      pnl = COALESCE(${pnl ?? null}, pnl)
    WHERE id = ${id}
    RETURNING *
  `;
  return result.rows[0];
}

export async function getStats() {
  const result = await sql`
    SELECT
      COUNT(*) FILTER (WHERE status = 'placed') as total_placed,
      COUNT(*) FILTER (WHERE outcome = 'won') as total_won,
      COUNT(*) FILTER (WHERE outcome = 'lost') as total_lost,
      COALESCE(SUM(pnl) FILTER (WHERE pnl IS NOT NULL), 0) as total_pnl,
      COALESCE(SUM(ticket_price) FILTER (WHERE status = 'placed'), 0) as total_invested,
      COALESCE(SUM(pnl + ticket_price) FILTER (WHERE outcome = 'won'), 0) as total_returned
    FROM bets
  `;
  return result.rows[0];
}
