import React, { useState } from 'react';

const INITIAL_CHANNELS = [
  { id: 'search', name: 'Google Paid Search', pct: 40, cpc: 3.50, convRate: 4.5, winRate: 15 },
  { id: 'meta', name: 'Meta / Instagram Ads', pct: 30, cpc: 1.80, convRate: 3.0, winRate: 12 },
  { id: 'linkedin', name: 'LinkedIn B2B Ads', pct: 20, cpc: 8.50, convRate: 5.5, winRate: 20 },
  { id: 'retargeting', name: 'Display & Retargeting', pct: 10, cpc: 1.20, convRate: 6.0, winRate: 18 }
];

export default function CampaignBudgetAllocator() {
  const [totalBudget, setTotalBudget] = useState(25000); // $25,000 monthly ad spend
  const [dealValue, setDealValue] = useState(2400); // $2,400 Average Customer ACV / LTV
  const [channels, setChannels] = useState(INITIAL_CHANNELS);

  const updateChannel = (id, field, val) => {
    setChannels(channels.map(c => c.id === id ? { ...c, [field]: Number(val) } : c));
  };

  const totalPct = channels.reduce((acc, c) => acc + (c.pct || 0), 0);

  // Compute metrics per channel
  let totalProjectedCustomers = 0;
  let totalProjectedLeads = 0;
  let totalProjectedRevenue = 0;

  const channelMetrics = channels.map(c => {
    const budget = (totalBudget * (c.pct / 100));
    const clicks = c.cpc > 0 ? Math.round(budget / c.cpc) : 0;
    const leads = Math.round(clicks * (c.convRate / 100));
    const customers = Math.round(leads * (c.winRate / 100));
    const cac = customers > 0 ? Math.round(budget / customers) : budget;
    const cpl = leads > 0 ? Math.round(budget / leads) : budget;
    const channelRev = customers * dealValue;
    const roas = budget > 0 ? (channelRev / budget).toFixed(2) : 0;

    totalProjectedCustomers += customers;
    totalProjectedLeads += leads;
    totalProjectedRevenue += channelRev;

    return { ...c, budget, clicks, leads, customers, cac, cpl, channelRev, roas };
  });

  const blendedCac = totalProjectedCustomers > 0 ? Math.round(totalBudget / totalProjectedCustomers) : totalBudget;
  const blendedRoas = totalBudget > 0 ? (totalProjectedRevenue / totalBudget).toFixed(2) : 0;

  return (
    <div style={{ maxWidth: '1050px', margin: '0 auto', padding: '1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '1.4rem' }}>Marketing Campaign Budget Allocation & Blended CAC Calculator</h2>
          <p style={{ margin: '0.3rem 0 0', color: 'var(--muted)', fontSize: '0.85rem' }}>
            Simulate channel spend across Search, Social, and Retargeting with blended ROAS and CAC projections.
          </p>
        </div>
      </div>

      {/* Top Parameter Controls */}
      <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: '12px', padding: '1.2rem', marginBottom: '1.5rem', display: 'flex', gap: '1.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <div>
          <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '0.3rem' }}>Total Monthly Ad Spend ($):</label>
          <input
            type="number"
            step="1000"
            value={totalBudget}
            onChange={(e) => setTotalBudget(Number(e.target.value))}
            style={{ width: '160px', padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', fontWeight: 700, fontSize: '1.1rem' }}
          />
        </div>

        <div>
          <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '0.3rem' }}>Average Deal Value / LTV ($):</label>
          <input
            type="number"
            step="100"
            value={dealValue}
            onChange={(e) => setDealValue(Number(e.target.value))}
            style={{ width: '160px', padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', fontWeight: 700, fontSize: '1.1rem' }}
          />
        </div>

        <div style={{ flex: 1, minWidth: '200px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.3rem' }}>
            <span>Total Allocation:</span>
            <strong style={{ color: totalPct === 100 ? 'var(--success, #0D9B79)' : '#E11D48' }}>{totalPct}% / 100%</strong>
          </div>
          <div style={{ height: '8px', background: 'var(--border)', borderRadius: '4px', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${Math.min(100, totalPct)}%`, background: totalPct === 100 ? 'var(--success, #0D9B79)' : '#E11D48' }} />
          </div>
        </div>
      </div>

      {/* Aggregate KPI Strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        <div style={{ background: 'var(--card-bg)', border: '2px solid var(--primary, #6C4CF1)', borderRadius: '10px', padding: '1rem' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 600 }}>Projected New Customers</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--primary)' }}>{totalProjectedCustomers} Clients</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>From {totalProjectedLeads.toLocaleString()} qualified leads</div>
        </div>

        <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: '10px', padding: '1rem' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>Blended CAC</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#2563EB' }}>${blendedCac.toLocaleString()}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>Cost per acquired customer</div>
        </div>

        <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: '10px', padding: '1rem' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>Projected Pipeline Revenue</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--success, #0D9B79)' }}>${totalProjectedRevenue.toLocaleString()}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>Blended ROAS: <strong>{blendedRoas}x</strong></div>
        </div>
      </div>

      {/* Channel Breakdown Table */}
      <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
          <thead style={{ background: 'var(--bg)', borderBottom: '1px solid var(--border)' }}>
            <tr>
              <th style={{ padding: '0.8rem 1rem' }}>Channel</th>
              <th style={{ padding: '0.8rem 1rem' }}>Budget Share %</th>
              <th style={{ padding: '0.8rem 1rem' }}>Est. CPC ($)</th>
              <th style={{ padding: '0.8rem 1rem' }}>Lead Conv %</th>
              <th style={{ padding: '0.8rem 1rem' }}>Win Rate %</th>
              <th style={{ padding: '0.8rem 1rem' }}>Leads</th>
              <th style={{ padding: '0.8rem 1rem' }}>Channel CAC</th>
              <th style={{ padding: '0.8rem 1rem' }}>ROAS</th>
            </tr>
          </thead>
          <tbody>
            {channelMetrics.map(c => (
              <tr key={c.id} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '0.8rem 1rem', fontWeight: 600 }}>
                  <div>{c.name}</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--muted)' }}>${c.budget.toLocaleString()} / mo</div>
                </td>
                <td style={{ padding: '0.8rem 1rem' }}>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={c.pct}
                    onChange={(e) => updateChannel(c.id, 'pct', e.target.value)}
                    style={{ width: '60px', padding: '3px 6px' }}
                  /> %
                </td>
                <td style={{ padding: '0.8rem 1rem' }}>
                  $<input
                    type="number"
                    step="0.1"
                    value={c.cpc}
                    onChange={(e) => updateChannel(c.id, 'cpc', e.target.value)}
                    style={{ width: '60px', padding: '3px 6px' }}
                  />
                </td>
                <td style={{ padding: '0.8rem 1rem' }}>
                  <input
                    type="number"
                    step="0.5"
                    value={c.convRate}
                    onChange={(e) => updateChannel(c.id, 'convRate', e.target.value)}
                    style={{ width: '55px', padding: '3px 6px' }}
                  /> %
                </td>
                <td style={{ padding: '0.8rem 1rem' }}>
                  <input
                    type="number"
                    step="1"
                    value={c.winRate}
                    onChange={(e) => updateChannel(c.id, 'winRate', e.target.value)}
                    style={{ width: '55px', padding: '3px 6px' }}
                  /> %
                </td>
                <td style={{ padding: '0.8rem 1rem' }}>{c.leads}</td>
                <td style={{ padding: '0.8rem 1rem', fontWeight: 600 }}>${c.cac.toLocaleString()}</td>
                <td style={{ padding: '0.8rem 1rem', fontWeight: 700, color: Number(c.roas) >= 3 ? 'var(--success, #0D9B79)' : 'var(--text)' }}>
                  {c.roas}x
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
