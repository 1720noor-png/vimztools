import React, { useState } from 'react';

export default function RevenueModelComparisonCalculator() {
  const [targetArr, setTargetArr] = useState(1000000); // Target $1M ARR ($83.3k/mo)
  
  // Model 1: Flat B2B SaaS
  const [saasPrice, setSaasPrice] = useState(79); // $/month
  const [saasChurn, setSaasChurn] = useState(2.5); // %/month
  const [saasCogs, setSaasCogs] = useState(15); // % COGS

  // Model 2: Usage / Consumption
  const [usageFeePerUnit, setUsageFeePerUnit] = useState(0.02); // $ per API call / credit
  const [avgUnitsPerAccount, setAvgUnitsPerAccount] = useState(5000); // units/mo ($100/mo)
  const [usageCogs, setUsageCogs] = useState(30); // % COGS

  // Model 3: Marketplace Take-Rate
  const [marketplaceGmvPerOrder, setMarketplaceGmvPerOrder] = useState(150); // $ avg order value
  const [takeRatePct, setTakeRatePct] = useState(12); // % fee
  const [marketplaceCogs, setMarketplaceCogs] = useState(25); // % COGS

  // Model 4: Freemium
  const [monthlyFreeSignups, setMonthlyFreeSignups] = useState(5000);
  const [freeToPaidConvPct, setFreeToPaidConvPct] = useState(3.5); // %
  const [freemiumPaidPrice, setFreemiumPaidPrice] = useState(29); // $/mo

  // Model 5: High-Ticket Enterprise / Setup
  const [enterpriseDealSize, setEnterpriseDealSize] = useState(15000); // annual or one-time
  const [enterpriseMaintenancePct, setEnterpriseMaintenancePct] = useState(20); // annual support

  // Calculations:
  // 1. SaaS
  const saasArpu = saasPrice;
  const saasCustomersNeeded = Math.ceil(targetArr / (saasArpu * 12));
  const saasLtv = saasChurn > 0 ? Math.round(saasArpu / (saasChurn / 100)) : saasArpu * 36;
  const saasGrossMargin = 100 - saasCogs;

  // 2. Usage
  const usageArpu = usageFeePerUnit * avgUnitsPerAccount;
  const usageAccountsNeeded = usageArpu > 0 ? Math.ceil(targetArr / (usageArpu * 12)) : 0;
  const usageGrossMargin = 100 - usageCogs;

  // 3. Marketplace
  const revPerTransaction = marketplaceGmvPerOrder * (takeRatePct / 100);
  const annualOrdersNeeded = revPerTransaction > 0 ? Math.ceil(targetArr / revPerTransaction) : 0;
  const monthlyOrdersNeeded = Math.ceil(annualOrdersNeeded / 12);
  const gmvNeeded = annualOrdersNeeded * marketplaceGmvPerOrder;

  // 4. Freemium
  const monthlyNewPaid = Math.round(monthlyFreeSignups * (freeToPaidConvPct / 100));
  const annualNewPaid = monthlyNewPaid * 12;
  const freemiumCustomersNeeded = Math.ceil(targetArr / (freemiumPaidPrice * 12));

  // 5. Enterprise
  const enterpriseDealsNeeded = Math.ceil(targetArr / enterpriseDealSize);

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '1.4rem' }}>Revenue Model Comparison & Scale Simulator</h2>
          <p style={{ margin: '0.3rem 0 0', color: 'var(--muted)', fontSize: '0.85rem' }}>
            Compare SaaS, Usage-Based, Marketplace Take-Rate, Freemium, and High-Ticket models side-by-side.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', background: 'var(--card-bg)', padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid var(--border)' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Target ARR Goal:</span>
          <select
            value={targetArr}
            onChange={(e) => setTargetArr(Number(e.target.value))}
            style={{ padding: '0.3rem 0.6rem', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', fontWeight: 700 }}
          >
            <option value={250000}>$250,000 ARR</option>
            <option value={500000}>$500,000 ARR</option>
            <option value={1000000}>$1,000,000 ARR ($1M)</option>
            <option value={5000000}>$5,000,000 ARR ($5M)</option>
            <option value={10000000}>$10,000,000 ARR ($10M)</option>
          </select>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))', gap: '1.2rem' }}>
        {/* Model 1: B2B SaaS */}
        <div style={{ background: 'var(--card-bg)', border: '2px solid var(--primary, #6C4CF1)', borderRadius: '12px', padding: '1.2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.8rem' }}>
            <span style={{ fontWeight: 700, fontSize: '1.05rem', color: 'var(--primary)' }}>💻 1. B2B SaaS Tiered</span>
            <span style={{ fontSize: '0.75rem', background: 'var(--border)', padding: '2px 8px', borderRadius: '10px' }}>Predictable</span>
          </div>
          
          <div style={{ fontSize: '0.85rem', color: 'var(--muted)', marginBottom: '1rem' }}>
            Monthly or annual recurring subscription with predictable cash flow.
          </div>

          <div style={{ display: 'grid', gap: '0.6rem', marginBottom: '1rem', fontSize: '0.85rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>Price ($/month):</span>
              <input type="number" value={saasPrice} onChange={e => setSaasPrice(Number(e.target.value))} style={{ width: '70px', padding: '3px 6px' }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>Monthly Churn %:</span>
              <input type="number" step="0.5" value={saasChurn} onChange={e => setSaasChurn(Number(e.target.value))} style={{ width: '70px', padding: '3px 6px' }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>Gross Margin %:</span>
              <strong>{saasGrossMargin}%</strong>
            </div>
          </div>

          <div style={{ background: 'var(--bg)', borderRadius: '8px', padding: '0.9rem', border: '1px solid var(--border)' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>Customers Needed for ${targetArr.toLocaleString()} ARR:</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--primary)', margin: '0.2rem 0' }}>{saasCustomersNeeded.toLocaleString()} Subscribers</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>Est. Lifetime Value (LTV): <strong>${saasLtv.toLocaleString()}</strong></div>
          </div>
        </div>

        {/* Model 2: Usage-Based */}
        <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: '12px', padding: '1.2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.8rem' }}>
            <span style={{ fontWeight: 700, fontSize: '1.05rem', color: '#0D9488' }}>⚡ 2. Usage & Consumption</span>
            <span style={{ fontSize: '0.75rem', background: 'var(--border)', padding: '2px 8px', borderRadius: '10px' }}>Scalable</span>
          </div>

          <div style={{ fontSize: '0.85rem', color: 'var(--muted)', marginBottom: '1rem' }}>
            Pay-as-you-go metering (API calls, storage, tokens, compute).
          </div>

          <div style={{ display: 'grid', gap: '0.6rem', marginBottom: '1rem', fontSize: '0.85rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>Unit Price ($):</span>
              <input type="number" step="0.005" value={usageFeePerUnit} onChange={e => setUsageFeePerUnit(Number(e.target.value))} style={{ width: '70px', padding: '3px 6px' }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>Avg Units / Account:</span>
              <input type="number" value={avgUnitsPerAccount} onChange={e => setAvgUnitsPerAccount(Number(e.target.value))} style={{ width: '70px', padding: '3px 6px' }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>Avg Monthly Bill:</span>
              <strong>${usageArpu.toLocaleString()} / mo</strong>
            </div>
          </div>

          <div style={{ background: 'var(--bg)', borderRadius: '8px', padding: '0.9rem', border: '1px solid var(--border)' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>Accounts Needed:</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0D9488', margin: '0.2rem 0' }}>{usageAccountsNeeded.toLocaleString()} Active Accounts</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>Gross Margin: <strong>{usageGrossMargin}%</strong></div>
          </div>
        </div>

        {/* Model 3: Marketplace Take-Rate */}
        <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: '12px', padding: '1.2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.8rem' }}>
            <span style={{ fontWeight: 700, fontSize: '1.05rem', color: '#D97706' }}>🛒 3. Marketplace Take-Rate</span>
            <span style={{ fontSize: '0.75rem', background: 'var(--border)', padding: '2px 8px', borderRadius: '10px' }}>Network-Driven</span>
          </div>

          <div style={{ fontSize: '0.85rem', color: 'var(--muted)', marginBottom: '1rem' }}>
            Percentage transaction fee on Gross Merchandise Value (GMV).
          </div>

          <div style={{ display: 'grid', gap: '0.6rem', marginBottom: '1rem', fontSize: '0.85rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>Avg Order Value ($):</span>
              <input type="number" value={marketplaceGmvPerOrder} onChange={e => setMarketplaceGmvPerOrder(Number(e.target.value))} style={{ width: '70px', padding: '3px 6px' }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>Take-Rate (%):</span>
              <input type="number" value={takeRatePct} onChange={e => setTakeRatePct(Number(e.target.value))} style={{ width: '70px', padding: '3px 6px' }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>Fee per Transaction:</span>
              <strong>${revPerTransaction.toFixed(2)}</strong>
            </div>
          </div>

          <div style={{ background: 'var(--bg)', borderRadius: '8px', padding: '0.9rem', border: '1px solid var(--border)' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>GMV Required Annually:</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#D97706', margin: '0.2rem 0' }}>${(gmvNeeded / 1000000).toFixed(2)}M GMV</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>Orders Needed: <strong>{monthlyOrdersNeeded.toLocaleString()}/month</strong></div>
          </div>
        </div>

        {/* Model 4: High-Ticket Enterprise */}
        <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: '12px', padding: '1.2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.8rem' }}>
            <span style={{ fontWeight: 700, fontSize: '1.05rem', color: '#2563EB' }}>🏢 4. High-Ticket Enterprise</span>
            <span style={{ fontSize: '0.75rem', background: 'var(--border)', padding: '2px 8px', borderRadius: '10px' }}>High-Touch</span>
          </div>

          <div style={{ fontSize: '0.85rem', color: 'var(--muted)', marginBottom: '1rem' }}>
            Annual upfront contracts with dedicated implementation and SLAs.
          </div>

          <div style={{ display: 'grid', gap: '0.6rem', marginBottom: '1rem', fontSize: '0.85rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>Avg Contract Value (ACV):</span>
              <input type="number" value={enterpriseDealSize} onChange={e => setEnterpriseDealSize(Number(e.target.value))} style={{ width: '80px', padding: '3px 6px' }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>Annual Maintenance %:</span>
              <input type="number" value={enterpriseMaintenancePct} onChange={e => setEnterpriseMaintenancePct(Number(e.target.value))} style={{ width: '60px', padding: '3px 6px' }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>Avg Sales Cycle:</span>
              <strong>60–120 Days</strong>
            </div>
          </div>

          <div style={{ background: 'var(--bg)', borderRadius: '8px', padding: '0.9rem', border: '1px solid var(--border)' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>Deals Needed to hit Target:</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#2563EB', margin: '0.2rem 0' }}>{enterpriseDealsNeeded} Enterprise Clients</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>Run Rate: <strong>{(enterpriseDealsNeeded / 12).toFixed(1)} deals/mo</strong></div>
          </div>
        </div>
      </div>
    </div>
  );
}
