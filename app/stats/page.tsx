'use client';

import { useEffect, useState } from 'react';

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

export default function StatsPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/stats')
      .then(r => r.json())
      .then(d => { setStats(d); setLoading(false); });
  }, []);

  if (loading) return (
    <div style={{ textAlign: 'center', padding: '64px', color: '#555566' }}>
      <div style={{ fontSize: '32px', marginBottom: '12px' }}>📊</div>
      Loading stats...
    </div>
  );
  if (!stats) return null;

  const pnlColor = stats.totalPnl >= 0 ? '#00ff88' : '#ff4466';
  const roiColor = stats.roi >= 0 ? '#00ff88' : '#ff4466';

  return (
    <div>
      <h1 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '4px' }}>Performance</h1>
      <p style={{ color: '#555566', fontSize: '14px', marginBottom: '32px' }}>EU261 arbitrage tracker · all-time results</p>

      {/* Hero P&L */}
      <div style={{
        background: '#13131a',
        border: `1px solid ${pnlColor}33`,
        borderRadius: '16px',
        padding: '32px',
        marginBottom: '24px',
        textAlign: 'center',
      }}>
        <div style={{ fontSize: '13px', color: '#555566', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>Net P&amp;L</div>
        <div style={{ fontSize: '56px', fontWeight: 900, color: pnlColor, lineHeight: 1 }}>
          {stats.totalPnl >= 0 ? '+' : ''}€{stats.totalPnl.toFixed(0)}
        </div>
        <div style={{ fontSize: '13px', color: '#555566', marginTop: '8px' }}>
          {stats.totalWon}W · {stats.totalLost}L · {stats.totalPending} pending
        </div>
      </div>

      {/* Grid stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px', marginBottom: '32px' }}>
        {[
          { label: 'Total Bets', value: stats.totalPlaced.toString(), sub: 'all-time' },
          { label: 'Won', value: stats.totalWon.toString(), color: '#00ff88', sub: `of ${stats.totalPlaced} placed` },
          { label: 'Lost', value: stats.totalLost.toString(), color: '#ff4466', sub: 'no compensation' },
          { label: 'Pending', value: stats.totalPending.toString(), color: '#4488ff', sub: 'awaiting outcome' },
          { label: 'Win Rate', value: `${stats.winRate}%`, color: '#00ff88', sub: 'of resolved bets' },
          { label: 'Tickets Spent', value: `€${stats.totalInvested.toFixed(0)}`, sub: 'total cost' },
          { label: 'Compensation In', value: `€${stats.totalReturned.toFixed(0)}`, color: '#4488ff', sub: 'EU261 received' },
          { label: 'ROI', value: `${stats.roi >= 0 ? '+' : ''}${stats.roi}%`, color: roiColor, sub: 'return on investment' },
        ].map(s => (
          <div key={s.label} style={{ background: '#13131a', border: '1px solid #1e1e2e', borderRadius: '12px', padding: '20px' }}>
            <div style={{ fontSize: '11px', color: '#555566', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>{s.label}</div>
            <div style={{ fontSize: '28px', fontWeight: 800, color: s.color || '#e8e8f0', marginBottom: '4px' }}>{s.value}</div>
            {s.sub && <div style={{ fontSize: '11px', color: '#444455' }}>{s.sub}</div>}
          </div>
        ))}
      </div>

      {/* Best bet highlight */}
      {stats.bestBet !== null && stats.bestBet > 0 && (
        <div style={{
          background: '#0a2a1a',
          border: '1px solid #00ff8844',
          borderRadius: '12px',
          padding: '20px 24px',
          marginBottom: '24px',
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
        }}>
          <div style={{ fontSize: '32px' }}>🏆</div>
          <div>
            <div style={{ fontSize: '12px', color: '#004422', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>Best Single Bet</div>
            <div style={{ fontSize: '24px', fontWeight: 800, color: '#00ff88' }}>+€{stats.bestBet.toFixed(0)}</div>
            <div style={{ fontSize: '12px', color: '#006633', marginTop: '2px' }}>net gain after ticket cost</div>
          </div>
        </div>
      )}

      {/* How it works */}
      <div style={{ background: '#13131a', border: '1px solid #1e1e2e', borderRadius: '12px', padding: '24px' }}>
        <h2 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '16px', color: '#9999aa' }}>How It Works</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '12px' }}>
          {[
            { icon: '🎯', title: 'High-Delay Routes', desc: 'Daily scan picks budget routes (Ryanair, Wizz Air) with historically high delay rates at congested airports.' },
            { icon: '💶', title: 'EU261 Compensation', desc: 'Flights 3h+ late pay: €250 (<1500km), €400 (1500–3500km), €600 (>3500km). Mandatory by EU law.' },
            { icon: '📊', title: 'Positive EV Only', desc: 'EV = delay_prob × compensation − ticket_price. Only bets with EV > 0 make the cut.' },
            { icon: '🤖', title: 'Fully Autonomous', desc: 'Scan at 06:00 UTC, outcome check at 22:00 UTC. No manual input needed — system runs itself.' },
          ].map(item => (
            <div key={item.title} style={{ padding: '14px', background: '#0d0d14', borderRadius: '8px' }}>
              <div style={{ fontSize: '20px', marginBottom: '6px' }}>{item.icon}</div>
              <div style={{ fontWeight: 600, marginBottom: '4px', fontSize: '13px' }}>{item.title}</div>
              <div style={{ fontSize: '12px', color: '#555566', lineHeight: 1.5 }}>{item.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
