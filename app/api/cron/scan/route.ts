import { NextRequest, NextResponse } from 'next/server';
import { initDB } from '@/lib/db';
import { runScan } from '@/lib/scanner';

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await initDB();
    const result = await runScan();
    return NextResponse.json({
      success: true,
      flightsScanned: result.flightsScanned,
      betsGenerated: result.betsGenerated,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Cron scan error:', error);
    return NextResponse.json({ error: 'Cron scan failed', details: String(error) }, { status: 500 });
  }
}
