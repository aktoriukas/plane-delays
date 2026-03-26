'use client';

import { useEffect, useState } from 'react';

interface Bet {
  id: number;
  date: string;
  flight_number: string;
  airline_code: string;
  origin: string;
  destination: string;
  ticket_price: string;
  delay_probability: string;
  compensation_amount: number;
  expected_value: string;
  status: string;
  outcome: string | null;
  pnl: string | null;
}

export default function HistoryPage() {
  const [bets, setBets] = useState<Bet[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'placed' | 'won' | 'lost' | 'pending'>('all');

  useEffect(() => {
    fetch('/api/bets')
      .then(r => r.json())
      .then(d => { setBets(d.bets || []); setLoading(false); });
  }, []);

  const filtered = bets.filter(b => {
    if (filter === 'all') return true;
    if (filter === 'placed') return b.status === 'placed';
    if (filter === 'won') return b.outcome === 'won';
    if (filter === 'lost') return b.outcome === 'lost';
    if (filter === 'pending') return b.status === 'pending';
    return true;
  });

  const outcomeColor = (outcome: string | null, status: string) => {
    if (outcome === 'won') return '#00ff88';
    if (outcome === 'lost') return '#ff4466';
    if (status === 'placed') return '#4488ff';
    if (status === 'skipped') return '#666677';
    return '#ffd700';
  };

  return (
    <div>
      <h1 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '8px' }}>Bet History</h1>
      <p style={{ color: '#666677', fontSize: '14px', marginBottom: '24px' }}>All recorded flight bets</p>

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
        {(['all', 'pending', 'placed', 'won', 'lost'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              padding: '8px 16px', borderRadius: '6px', border: '1px solid #1e1e2e',
              background: filter === f ? '#4488ff' : 'transparent',
              color: filter === f ? '#fff' : '#9999aa',
              fontSize: '13px', fontWeight: 600, textTransform: 'capitalize',
            }}
          >
            {f}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '64px', color: '#666677' }}>Loading...</div>
      ) : (
        <div style={{ background: '#13131a', border: '1px solid #1e1e2e', borderRadius: '12px', overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #1e1e2e' }}>
                  {['Date', 'Flight', 'Route', 'Price', 'Delay %', 'Comp.', 'EV', 'Status', 'Outcome', 'P&L'].map(h => (
                    <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: '11px', color: '#666677', textTransform: 'uppercase', letterSpacing: '0.5px', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={10} style={{ padding: '48px', textAlign: 'center', color: '#666677' }}>No bets found</td>
                  </tr>
                ) : filtered.map((bet, i) => (
                  <tr key={bet.id} style={{ borderBottom: i < filtered.length - 1 ? '1px solid #1e1e2e' : 'none' }}>
                    <td style={{ padding: '12px 16px', fontSize: '13px', color: '#9999aa', whiteSpace: 'nowrap' }}>{bet.date}</td>
                    <td style={{ padding: '12px 16px', fontSize: '13px', fontWeight: 600, color: '#4488ff' }}>{bet.flight_number}</td>
                    <td style={{ padding: '12px 16px', fontSize: '13px', whiteSpace: 'nowrap' }}>{bet.origin} → {bet.destination}</td>
                    <td style={{ padding: '12px 16px', fontSize: '13px' }}>€{parseFloat(bet.ticket_price).toFixed(0)}</td>
                    <td style={{ padding: '12px 16px', fontSize: '13px', color: parseFloat(bet.delay_probability) > 0.3 ? '#ff4466' : '#ffd700' }}>
                      {Math.round(parseFloat(bet.delay_probability) * 100)}%
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: '13px' }}>€{bet.compensation_amount}</td>
                    <td style={{ padding: '12px 16px', fontSize: '13px', color: '#00ff88', fontWeight: 600 }}>+€{parseFloat(bet.expected_value).toFixed(0)}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{
                        padding: '3px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 600,
                        background: bet.status === 'placed' ? '#0a2040' : bet.status === 'skipped' ? '#1a1a2e' : '#1a2a1a',
                        color: bet.status === 'placed' ? '#4488ff' : bet.status === 'skipped' ? '#666677' : '#ffd700',
                      }}>
                        {bet.status}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      {bet.outcome ? (
                        <span style={{
                          padding: '3px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 600,
                          background: bet.outcome === 'won' ? '#0a2a1a' : '#2a0a1a',
                          color: outcomeColor(bet.outcome, bet.status),
                        }}>
                          {bet.outcome}
                        </span>
                      ) : <span style={{ color: '#444455' }}>—</span>}
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: '13px', fontWeight: 600, color: bet.pnl ? (parseFloat(bet.pnl) >= 0 ? '#00ff88' : '#ff4466') : '#444455' }}>
                      {bet.pnl ? `${parseFloat(bet.pnl) >= 0 ? '+' : ''}€${parseFloat(bet.pnl).toFixed(0)}` : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
