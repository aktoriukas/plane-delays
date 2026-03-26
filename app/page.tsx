'use client';

import { useEffect, useState, useCallback } from 'react';

interface Bet {
  id: number;
  date: string;
  flight_number: string;
  airline_code: string;
  origin: string;
  destination: string;
  origin_name: string;
  destination_name: string;
  departure_at: string;
  distance_km: number;
  ticket_price: string;
  delay_probability: string;
  compensation_amount: number;
  expected_value: string;
  status: string;
  outcome: string | null;
  pnl: string | null;
}

interface Stats {
  totalPlaced: number;
  totalWon: number;
  totalLost: number;
  winRate: number;
  totalPnl: number;
  totalInvested: number;
  roi: number;
}

function getProbColor(prob: number): string {
  if (prob >= 0.35) return '#ff4466';
  if (prob >= 0.25) return '#ffd700';
  return '#00ff88';
}

function BoardingPass({ bet, onUpdate }: { bet: Bet; onUpdate: () => void }) {
  const prob = parseFloat(bet.delay_probability);
  const ev = parseFloat(bet.expected_value);
  const price = parseFloat(bet.ticket_price);
  const probPct = Math.round(prob * 100);
  const depTime = new Date(bet.departure_at).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', timeZone: 'UTC' });
  const probColor = getProbColor(prob);

  async function updateStatus(status: string) {
    await fetch(`/api/bets/${bet.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    onUpdate();
  }

  return (
    <div style={{
      background: '#13131a',
      border: '1px solid #1e1e2e',
      borderRadius: '12px',
      overflow: 'hidden',
      position: 'relative',
    }}>
      {/* Top strip */}
      <div style={{ height: '4px', background: `linear-gradient(90deg, ${probColor}, #4488ff)` }} />

      <div style={{ padding: '20px' }}>
        {/* Header row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
          <div>
            <div style={{ fontSize: '22px', fontWeight: 800, letterSpacing: '2px', color: '#e8e8f0' }}>
              {bet.origin} → {bet.destination}
            </div>
            <div style={{ fontSize: '12px', color: '#666677', marginTop: '2px' }}>
              {bet.origin_name} → {bet.destination_name}
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '20px', fontWeight: 700, color: '#4488ff' }}>{bet.flight_number}</div>
            <div style={{ fontSize: '12px', color: '#666677' }}>{depTime} UTC</div>
          </div>
        </div>

        {/* Dashed divider */}
        <div style={{ borderTop: '1px dashed #1e1e2e', margin: '12px 0' }} />

        {/* Stats row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '16px' }}>
          <div>
            <div style={{ fontSize: '11px', color: '#666677', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Ticket</div>
            <div style={{ fontSize: '18px', fontWeight: 700, color: '#e8e8f0' }}>€{price.toFixed(0)}</div>
          </div>
          <div>
            <div style={{ fontSize: '11px', color: '#666677', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Delay %</div>
            <div style={{ fontSize: '18px', fontWeight: 700, color: probColor }}>{probPct}%</div>
          </div>
          <div>
            <div style={{ fontSize: '11px', color: '#666677', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Comp.</div>
            <div style={{ fontSize: '18px', fontWeight: 700, color: '#e8e8f0' }}>€{bet.compensation_amount}</div>
          </div>
          <div>
            <div style={{ fontSize: '11px', color: '#666677', textTransform: 'uppercase', letterSpacing: '0.5px' }}>EV</div>
            <div style={{ fontSize: '18px', fontWeight: 700, color: ev > 0 ? '#00ff88' : '#ff4466' }}>+€{ev.toFixed(0)}</div>
          </div>
        </div>

        {/* Progress bar */}
        <div style={{ marginBottom: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#666677', marginBottom: '4px' }}>
            <span>Delay probability</span>
            <span style={{ color: probColor }}>{probPct}%</span>
          </div>
          <div style={{ height: '6px', background: '#1e1e2e', borderRadius: '3px', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${Math.min(probPct, 100)}%`, background: probColor, borderRadius: '3px', transition: 'width 0.3s' }} />
          </div>
        </div>

        {/* Distance badge */}
        <div style={{ marginBottom: '16px', fontSize: '11px', color: '#666677' }}>
          {bet.distance_km} km · EU261 eligible
        </div>

        {/* Actions */}
        {bet.status === 'pending' && (
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => updateStatus('placed')}
              style={{
                flex: 1, padding: '10px', borderRadius: '8px', border: 'none',
                background: '#00ff88', color: '#0a0a0f', fontWeight: 700, fontSize: '13px',
              }}
            >
              ✓ Mark as Placed
            </button>
            <button
              onClick={() => updateStatus('skipped')}
              style={{
                flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid #1e1e2e',
                background: 'transparent', color: '#666677', fontWeight: 600, fontSize: '13px',
              }}
            >
              Skip
            </button>
          </div>
        )}

        {bet.status === 'placed' && (
          <div style={{ padding: '10px', background: '#0a2040', borderRadius: '8px', textAlign: 'center', fontSize: '13px', color: '#4488ff', fontWeight: 600 }}>
            🎫 Ticket placed — awaiting outcome
          </div>
        )}

        {bet.status === 'skipped' && (
          <div style={{ padding: '10px', background: '#1e1e2e', borderRadius: '8px', textAlign: 'center', fontSize: '13px', color: '#666677' }}>
            Skipped
          </div>
        )}
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [bets, setBets] = useState<Bet[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [today] = useState(new Date().toISOString().split('T')[0]);

  const fetchData = useCallback(async () => {
    const [betsRes, statsRes] = await Promise.all([
      fetch('/api/bets/today'),
      fetch('/api/stats'),
    ]);
    const betsData = await betsRes.json();
    const statsData = await statsRes.json();
    setBets(betsData.bets || []);
    setStats(statsData);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  async function triggerScan() {
    setScanning(true);
    await fetch('/api/scan', { method: 'POST' });
    await fetchData();
    setScanning(false);
  }

  return (
    <div>
      {/* Stats bar */}
      {stats && (
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
          gap: '16px', marginBottom: '32px',
        }}>
          {[
            { label: 'Bets Placed', value: stats.totalPlaced, suffix: '' },
            { label: 'Win Rate', value: stats.winRate, suffix: '%', color: '#00ff88' },
            { label: 'Total P&L', value: stats.totalPnl >= 0 ? `+€${stats.totalPnl}` : `-€${Math.abs(stats.totalPnl)}`, raw: true, color: stats.totalPnl >= 0 ? '#00ff88' : '#ff4466' },
            { label: 'ROI', value: stats.roi, suffix: '%', color: stats.roi >= 0 ? '#00ff88' : '#ff4466' },
          ].map(s => (
            <div key={s.label} style={{ background: '#13131a', border: '1px solid #1e1e2e', borderRadius: '10px', padding: '16px' }}>
              <div style={{ fontSize: '11px', color: '#666677', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>{s.label}</div>
              <div style={{ fontSize: '24px', fontWeight: 800, color: s.color || '#e8e8f0' }}>
                {s.raw ? s.value : `${s.value}${s.suffix}`}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 700 }}>Today&apos;s Bets</h1>
          <p style={{ color: '#666677', fontSize: '14px', marginTop: '4px' }}>{today} · {bets.length} recommendations</p>
        </div>
        <button
          onClick={triggerScan}
          disabled={scanning}
          style={{
            padding: '10px 20px', borderRadius: '8px', border: 'none',
            background: scanning ? '#1e1e2e' : '#4488ff', color: '#fff',
            fontWeight: 600, fontSize: '14px', opacity: scanning ? 0.7 : 1,
          }}
        >
          {scanning ? '⏳ Scanning...' : '🔄 Run Scan'}
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '64px', color: '#666677' }}>Loading...</div>
      ) : bets.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '64px', color: '#666677' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>✈️</div>
          <p style={{ fontSize: '18px', marginBottom: '8px' }}>No bets for today yet</p>
          <p style={{ fontSize: '14px', marginBottom: '24px' }}>Run a scan to find today&apos;s best delay bets</p>
          <button
            onClick={triggerScan}
            disabled={scanning}
            style={{ padding: '12px 24px', borderRadius: '8px', border: 'none', background: '#4488ff', color: '#fff', fontWeight: 600, fontSize: '14px' }}
          >
            {scanning ? '⏳ Scanning...' : '🔍 Find Bets Now'}
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '20px' }}>
          {bets.map(bet => (
            <BoardingPass key={bet.id} bet={bet} onUpdate={fetchData} />
          ))}
        </div>
      )}
    </div>
  );
}
