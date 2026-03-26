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
  actual_delay_minutes: number | null;
  pnl: string | null;
}

interface Stats {
  totalPlaced: number;
  totalWon: number;
  totalLost: number;
  totalPending: number;
  winRate: number;
  totalPnl: number;
  totalInvested: number;
  totalReturned: number;
  bestBet: number | null;
  roi: number;
}

function getOutcomeStyle(bet: Bet) {
  if (bet.outcome === 'won') return { bg: '#0a2a1a', color: '#00ff88', label: 'WON' };
  if (bet.outcome === 'lost') return { bg: '#2a0a1a', color: '#ff4466', label: 'LOST' };
  return { bg: '#0a1a2a', color: '#4488ff', label: 'PENDING' };
}

function formatDelay(minutes: number | null): string {
  if (!minutes) return '';
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return h > 0 ? `${h}h${m.toString().padStart(2, '0')}m` : `${m}m`;
}

function BetCard({ bet }: { bet: Bet }) {
  const prob = parseFloat(bet.delay_probability);
  const price = parseFloat(bet.ticket_price);
  const probPct = Math.round(prob * 100);
  const outcome = getOutcomeStyle(bet);

  const depDate = new Date(bet.departure_at);
  const depTime = depDate.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', timeZone: 'UTC' });
  const depDay = depDate.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', timeZone: 'UTC' });

  const netPnl = bet.pnl ? parseFloat(bet.pnl) : null;
  const pnlLabel = netPnl !== null
    ? `${netPnl >= 0 ? '+' : ''}€${netPnl.toFixed(0)}`
    : '?';
  const pnlColor = netPnl !== null ? (netPnl >= 0 ? '#00ff88' : '#ff4466') : '#666677';

  // strip color for the top bar
  const barColor = prob >= 0.35 ? '#ff4466' : prob >= 0.25 ? '#ffd700' : '#00ff88';

  return (
    <div style={{
      background: '#13131a',
      border: '1px solid #1e1e2e',
      borderRadius: '12px',
      overflow: 'hidden',
    }}>
      {/* Top accent bar */}
      <div style={{ height: '3px', background: `linear-gradient(90deg, ${barColor}, #4488ff)` }} />

      <div style={{ padding: '20px' }}>
        {/* Flight header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
          <div style={{ fontSize: '20px', fontWeight: 800, letterSpacing: '1px', color: '#4488ff' }}>
            {bet.flight_number}
          </div>
          <div style={{ fontSize: '13px', color: '#9999aa', textAlign: 'right' }}>
            {depDay} · {depTime} UTC
          </div>
        </div>
        <div style={{ fontSize: '18px', fontWeight: 700, color: '#e8e8f0', marginBottom: '4px' }}>
          {bet.origin} → {bet.destination}
        </div>
        <div style={{ fontSize: '11px', color: '#555566', marginBottom: '16px' }}>
          {bet.origin_name} → {bet.destination_name}
        </div>

        {/* Divider */}
        <div style={{ borderTop: '1px dashed #222233', marginBottom: '16px' }} />

        {/* Key numbers */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '16px' }}>
          <div>
            <div style={{ fontSize: '11px', color: '#555566', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '2px' }}>Ticket</div>
            <div style={{ fontSize: '20px', fontWeight: 700, color: '#e8e8f0' }}>€{price.toFixed(0)}</div>
          </div>
          <div>
            <div style={{ fontSize: '11px', color: '#555566', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '2px' }}>Compensation</div>
            <div style={{ fontSize: '20px', fontWeight: 700, color: '#e8e8f0' }}>€{bet.compensation_amount}</div>
          </div>
        </div>

        <div style={{ fontSize: '12px', color: '#555566', marginBottom: '16px' }}>
          <span style={{ color: barColor, fontWeight: 600 }}>{probPct}% delay prob</span>
          {' · '}if delayed 3h+ → EU261 applies
        </div>

        {/* Divider */}
        <div style={{ borderTop: '1px dashed #222233', marginBottom: '14px' }} />

        {/* Outcome strip */}
        <div style={{
          padding: '12px 16px',
          background: outcome.bg,
          borderRadius: '8px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <div>
            <div style={{ fontSize: '14px', fontWeight: 800, color: outcome.color, letterSpacing: '1px' }}>
              {outcome.label}
            </div>
            {bet.outcome === 'won' && bet.actual_delay_minutes && (
              <div style={{ fontSize: '11px', color: '#00cc66', marginTop: '2px' }}>
                delayed {formatDelay(bet.actual_delay_minutes)}
              </div>
            )}
            {bet.outcome === 'lost' && (
              <div style={{ fontSize: '11px', color: '#cc3355', marginTop: '2px' }}>on time / minor delay</div>
            )}
            {!bet.outcome && (
              <div style={{ fontSize: '11px', color: '#334466', marginTop: '2px' }}>flight hasn't completed yet</div>
            )}
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '20px', fontWeight: 800, color: pnlColor }}>{pnlLabel}</div>
            <div style={{ fontSize: '11px', color: '#444455', marginTop: '1px' }}>net P&amp;L</div>
          </div>
        </div>
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

  // Auto-trigger outcome resolution on page load for past flights
  const triggerOutcomes = useCallback(async () => {
    await fetch('/api/resolve');
  }, []);

  useEffect(() => {
    const init = async () => {
      // Trigger outcome resolution first (fire-and-forget is fine, but we await to get fresh data)
      await triggerOutcomes();
      await fetchData();
    };
    init();
  }, [fetchData, triggerOutcomes]);

  async function triggerScan() {
    setScanning(true);
    await fetch('/api/scan', { method: 'POST' });
    await triggerOutcomes();
    await fetchData();
    setScanning(false);
  }

  const wonBets = bets.filter(b => b.outcome === 'won');
  const lostBets = bets.filter(b => b.outcome === 'lost');
  const pendingBets = bets.filter(b => !b.outcome);

  return (
    <div>
      {/* Stats bar */}
      {stats && (
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
          gap: '12px', marginBottom: '32px',
        }}>
          {[
            { label: 'Total Bets', value: stats.totalPlaced.toString() },
            { label: 'Won / Lost / Pending', value: `${stats.totalWon} / ${stats.totalLost} / ${stats.totalPending}`, small: true },
            { label: 'Net P&L', value: stats.totalPnl >= 0 ? `+€${stats.totalPnl}` : `-€${Math.abs(stats.totalPnl)}`, color: stats.totalPnl >= 0 ? '#00ff88' : '#ff4466', big: true },
            { label: 'Win Rate', value: `${stats.winRate}%`, color: '#00ff88' },
          ].map(s => (
            <div key={s.label} style={{ background: '#13131a', border: '1px solid #1e1e2e', borderRadius: '10px', padding: '16px' }}>
              <div style={{ fontSize: '11px', color: '#555566', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>{s.label}</div>
              <div style={{ fontSize: s.big ? '28px' : s.small ? '16px' : '22px', fontWeight: 800, color: s.color || '#e8e8f0' }}>
                {s.value}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 700 }}>Today&apos;s Bets</h1>
          <p style={{ color: '#555566', fontSize: '14px', marginTop: '4px' }}>
            {today} · {bets.length} active · {wonBets.length} won · {lostBets.length} lost · {pendingBets.length} pending
          </p>
        </div>
        <button
          onClick={triggerScan}
          disabled={scanning}
          style={{
            padding: '10px 20px', borderRadius: '8px', border: 'none',
            background: scanning ? '#1e1e2e' : '#4488ff', color: '#fff',
            fontWeight: 600, fontSize: '14px', opacity: scanning ? 0.7 : 1, cursor: scanning ? 'default' : 'pointer',
          }}
        >
          {scanning ? '⏳ Scanning...' : '🔄 Run Scan'}
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '64px', color: '#555566' }}>
          <div style={{ fontSize: '32px', marginBottom: '12px' }}>⏳</div>
          Loading bets...
        </div>
      ) : bets.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '64px', color: '#555566' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>✈️</div>
          <p style={{ fontSize: '18px', marginBottom: '8px' }}>No bets for today yet</p>
          <p style={{ fontSize: '14px', marginBottom: '24px' }}>The daily cron runs at 06:00 UTC. Run a manual scan now.</p>
          <button
            onClick={triggerScan}
            disabled={scanning}
            style={{ padding: '12px 24px', borderRadius: '8px', border: 'none', background: '#4488ff', color: '#fff', fontWeight: 600, fontSize: '14px', cursor: 'pointer' }}
          >
            {scanning ? '⏳ Scanning...' : '🔍 Find Bets Now'}
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
          {bets.map(bet => (
            <BetCard key={bet.id} bet={bet} />
          ))}
        </div>
      )}
    </div>
  );
}
