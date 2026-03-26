import { NextResponse } from 'next/server';
import { initDB } from '@/lib/db';
import { runScan } from '@/lib/scanner';

export async function POST() {
  try {
    await initDB();
    const result = await runScan();
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
