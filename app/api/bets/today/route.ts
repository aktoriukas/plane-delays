import { NextResponse } from 'next/server';
import { getUpcomingBetsForDate, initDB } from '@/lib/db';

export async function GET() {
  try {
    await initDB();
    const today = new Date().toISOString().split('T')[0];
    const bets = await getUpcomingBetsForDate(today);
    return NextResponse.json({ bets, date: today });
  } catch (error) {
    console.error('GET /api/bets/today error:', error);
    return NextResponse.json({ error: 'Failed to fetch today\'s bets' }, { status: 500 });
  }
}
