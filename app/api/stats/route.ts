import { NextResponse } from 'next/server';
import { getStats, initDB } from '@/lib/db';

export async function GET() {
  try {
    await initDB();
    const stats = await getStats();
    const totalPlaced = parseInt(stats.total_placed) || 0;
    const totalWon = parseInt(stats.total_won) || 0;
    const winRate = totalPlaced > 0 ? Math.round((totalWon / totalPlaced) * 100) : 0;
    const totalInvested = parseFloat(stats.total_invested) || 0;
    const totalPnl = parseFloat(stats.total_pnl) || 0;
    const roi = totalInvested > 0 ? Math.round((totalPnl / totalInvested) * 100) : 0;

    return NextResponse.json({
      totalPlaced,
      totalWon,
      totalLost: parseInt(stats.total_lost) || 0,
      winRate,
      totalPnl: Math.round(totalPnl * 100) / 100,
      totalInvested: Math.round(totalInvested * 100) / 100,
      totalReturned: Math.round((parseFloat(stats.total_returned) || 0) * 100) / 100,
      roi,
    });
  } catch (error) {
    console.error('GET /api/stats error:', error);
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
}
