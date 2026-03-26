import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { initDB } from '@/lib/db';

export async function POST() {
  try {
    await initDB();
    const result = await sql`DELETE FROM bets WHERE date < CURRENT_DATE`;
    return NextResponse.json({
      message: 'Deleted past bets',
      rowsDeleted: result.rowCount,
    });
  } catch (error) {
    console.error('cleanup error:', error);
    return NextResponse.json({ error: 'Cleanup failed' }, { status: 500 });
  }
}
