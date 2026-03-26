import { NextRequest, NextResponse } from 'next/server';
import { getAllBets, getBetsForDate, initDB } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    await initDB();
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');

    if (date) {
      const bets = await getBetsForDate(date);
      return NextResponse.json({ bets });
    }

    const bets = await getAllBets();
    return NextResponse.json({ bets });
  } catch (error) {
    console.error('GET /api/bets error:', error);
    return NextResponse.json({ error: 'Failed to fetch bets' }, { status: 500 });
  }
}
