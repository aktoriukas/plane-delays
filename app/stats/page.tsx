'use client';

import { useEffect, useState } from 'react';

interface Stats {
  totalPlaced: number;
  totalWon: number;
  totalLost: number;
  winRate: number;
  totalPnl: number;
  totalInvested: number;
  totalReturned: number;
  roi: number;
}

function StatCard({ label, value, subtext, color }: { label: string; value: string | number; subtext?: string; color?: string }) {
  return (
    <div style={{ background: '#13131a', border: '1px solid #1e1e2e', borderRadius: '12px', padding: '24px' }}>
      <div style={{ fontSize: '12px', color: '#666677', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>{label}</div>
      <div style={{ fontSize: '32px', fontWeight: 800, color: color || '#e8e8f0', marginBottom: '4px' }}>{value}</div>
      {subtext && <div style={{ fontSize: '12px', color: '#666677' }}>{subtext}</div>}
    </div>
  );
}

export default function StatsPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/stats')
      .then(r => r.json())
      .then(d => { setStats(d); setLoading(false); });
  }, []);

  if (loading) return <div style={{ textAlign: 'center', padding: '64px', color: '#666677' }}>Loading...</div>;
  if (!stats) return null;

  const avgReturn = stats.totalWon > 0 ? Math.round(stats.totalReturned / stats.totalWon) : 0;

  return (
    <div>
      <h1 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '8px' }}>Performance Stats</h1>
      <p style={{ color: '#666677', fontSize: '14px', marginBottom: '32px' }}>Your EU261 arbitrage performance overview</p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '16px', marginBottom: '32px' }}>
        <StatCard label="Total Bets Placed" value={stats.totalPlaced} />
        <StatCard label="Win Rate" value={`${stats.winRate}%`} subtext={`${stats.totalWon}W / ${stats.totalLost}L`} color="#00ff88" />
        <StatCard label="Total P&L" value={`${stats.totalPnl >= 0 ? '+' : ''}€${stats.totalPnl}`} color={stats.totalPnl >= 0 ? '#00ff88' : '#ff4466'} />
        <StatCard label="ROI" value={`${stats.roi >= 0 ? '+' : ''}${stats.roi}%`} subtext="Return on investment" color={stats.roi >= 0 ? '#00ff88' : '#ff4466'} />
        <StatCard label="Total Invested" value={`€${stats.totalInvested}`} subtext="Sum of placed tickets" />
        <StatCard label="Total Returned" value={`€${stats.totalReturned}`} subtext="Compensation received" color="#4488ff" />
        <StatCard label="Avg. Return / Win" value={`€${avgReturn}`} subtext="Compensation per winning bet" color="#4488ff" />
        <StatCard label="Break-even Win Rate" value="~20%" subtext="Needed for positive EV" color="#ffd700" />
      </div>

      {/* How it works */}
      <div style={{ background: '#13131a', border: '1px solid #1e1e2e', borderRadius: '12px', padding: '24px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '16px' }}>How EU261 Arbitrage Works</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
          {[
            { icon: '🎯', title: 'Find High-Delay Flights', desc: 'We scan budget routes with historically high delay rates (Ryanair, Wizz Air, Pegasus) at high-risk airports.' },
            { icon: '💶', title: 'EU261 Compensation', desc: 'Flights delayed 3+ hours qualify: €250 (<1500km), €400 (1500-3500km), €600 (>3500km). No fault required.' },
            { icon: '📊', title: 'Expected Value', desc: 'EV = delay_probability × compensation - ticket_price. Only bet when EV > 0 to ensure statistical edge.' },
            { icon: '⚠️', title: 'Risk Disclaimer', desc: 'This is experimental. Compensation claims can take months. Airlines dispute claims. Not financial advice.' },
          ].map(item => (
            <div key={item.title} style={{ padding: '16px', background: '#0d0d14', borderRadius: '8px' }}>
              <div style={{ fontSize: '24px', marginBottom: '8px' }}>{item.icon}</div>
              <div style={{ fontWeight: 600, marginBottom: '6px', fontSize: '14px' }}>{item.title}</div>
              <div style={{ fontSize: '13px', color: '#666677', lineHeight: 1.5 }}>{item.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
