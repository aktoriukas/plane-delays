import { NextRequest, NextResponse } from 'next/server';
import { updateBet, initDB } from '@/lib/db';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await initDB();
    const { id } = await params;
    const body = await request.json();
    const updated = await updateBet(parseInt(id), body);
    if (!updated) {
      return NextResponse.json({ error: 'Bet not found' }, { status: 404 });
    }
    return NextResponse.json({ bet: updated });
  } catch (error) {
    console.error('PATCH /api/bets/[id] error:', error);
    return NextResponse.json({ error: 'Failed to update bet' }, { status: 500 });
  }
}
