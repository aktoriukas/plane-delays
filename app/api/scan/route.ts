import { NextRequest, NextResponse } from 'next/server';
import { initDB } from '@/lib/db';
import { runScan } from '@/lib/scanner';

export async function POST(request: NextRequest) {
  try {
    await initDB();
    const { searchParams } = new URL(request.url);
    const dateParam = searchParams.get('date');
    const targetDate = dateParam ? new Date(dateParam) : undefined;
    const result = await runScan(targetDate);
    return NextResponse.json({
      success: true,
      flightsScanned: result.flightsScanned,
      betsGenerated: result.betsGenerated,
    });
  } catch (error) {
    console.error('POST /api/scan error:', error);
    return NextResponse.json({ error: 'Scan failed', details: String(error) }, { status: 500 });
  }
}
