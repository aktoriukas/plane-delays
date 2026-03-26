import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { initDB } from '@/lib/db';

export async function GET() {
  try {
    await initDB();

    const result = await sql`
      SELECT
        COUNT(*) FILTER (WHERE status = 'placed') as total_placed,
        COUNT(*) FILTER (WHERE outcome = 'won') as total_won,
        COUNT(*) FILTER (WHERE outcome = 'lost') as total_lost,
        COUNT(*) FILTER (WHERE status = 'placed' AND outcome IS NULL) as total_pending,
        COALESCE(SUM(pnl) FILTER (WHERE pnl IS NOT NULL), 0) as total_pnl,
        COALESCE(SUM(ticket_price) FILTER (WHERE status = 'placed'), 0) as total_invested,
        COALESCE(SUM(pnl + ticket_price) FILTER (WHERE outcome = 'won'), 0) as total_returned,
        MAX(pnl) FILTER (WHERE outcome = 'won') as best_bet
      FROM bets
    `;
    const stats = result.rows[0];

    const totalPlaced = parseInt(stats.total_placed) || 0;
    const totalWon = parseInt(stats.total_won) || 0;
    const totalLost = parseInt(stats.total_lost) || 0;
    const totalPending = parseInt(stats.total_pending) || 0;
    const winRate = (totalWon + totalLost) > 0 ? Math.round((totalWon / (totalWon + totalLost)) * 100) : 0;
    const totalInvested = parseFloat(stats.total_invested) || 0;
    const totalPnl = parseFloat(stats.total_pnl) || 0;
    const roi = totalInvested > 0 ? Math.round((totalPnl / totalInvested) * 100) : 0;
    const bestBet = stats.best_bet ? Math.round(parseFloat(stats.best_bet) * 100) / 100 : null;

    return NextResponse.json({
      totalPlaced,
      totalWon,
      totalLost,
      totalPending,
      winRate,
      totalPnl: Math.round(totalPnl * 100) / 100,
      totalInvested: Math.round(totalInvested * 100) / 100,
      totalReturned: Math.round((parseFloat(stats.total_returned) || 0) * 100) / 100,
      bestBet,
      roi,
    });
  } catch (error) {
    console.error('GET /api/stats error:', error);
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
}
