import React, { useState } from 'react';

export default function ColdEmailOutreachPlanner() {
  const [targetMeetings, setTargetMeetings] = useState(25); // Target meetings per month
  const [meetingBookingRate, setMeetingBookingRate] = useState(40); // % of positive replies that book
  const [positiveReplyRate, setPositiveReplyRate] = useState(2.0); // % of contacted leads that reply positively
  const [inboxDailyLimit, setInboxDailyLimit] = useState(30); // Max safe cold emails per inbox/day
  const [inboxesPerDomain, setInboxesPerDomain] = useState(3); // Standard 2-3 inboxes per secondary domain
  const [workingDays, setWorkingDays] = useState(22); // Sending business days per month

  // Calculations:
  // Positive replies needed = targetMeetings / (meetingBookingRate / 100)
  const positiveRepliesNeeded = meetingBookingRate > 0 ? Math.ceil(targetMeetings / (meetingBookingRate / 100)) : 0;
  
  // Total emails delivered needed = positiveRepliesNeeded / (positiveReplyRate / 100)
  const totalEmailsNeeded = positiveReplyRate > 0 ? Math.ceil(positiveRepliesNeeded / (positiveReplyRate / 100)) : 0;
  
  // Daily send capacity needed
  const dailySendVolume = workingDays > 0 ? Math.ceil(totalEmailsNeeded / workingDays) : 0;
  
  // Total inboxes required
  const inboxesRequired = inboxDailyLimit > 0 ? Math.ceil(dailySendVolume / inboxDailyLimit) : 0;
  
  // Domains required
  const domainsRequired = inboxesPerDomain > 0 ? Math.ceil(inboxesRequired / inboxesPerDomain) : 0;
  
  // Estimated infrastructure costs
  // Domain ~$12/yr ($1/mo) + Workspace inbox ~$6/mo
  const monthlyInfraCost = (domainsRequired * 1.2) + (inboxesRequired * 6.5);
  const costPerMeeting = targetMeetings > 0 ? (monthlyInfraCost / targetMeetings).toFixed(2) : 0;

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '1.4rem' }}>Cold Email Deliverability & Outbound Volume Planner</h2>
          <p style={{ margin: '0.3rem 0 0', color: 'var(--muted)', fontSize: '0.85rem' }}>
            Calculate inbox counts, domain rotation, and safe warm-up schedules to hit sales meeting targets.
          </p>
        </div>
      </div>

      {/* KPI Overview Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        <div style={{ background: 'var(--card-bg)', border: '2px solid var(--primary, #6C4CF1)', borderRadius: '10px', padding: '1rem' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 600 }}>Active Inboxes Needed</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--primary)' }}>{inboxesRequired} Inboxes</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>Capped at {inboxDailyLimit} sends/day</div>
        </div>

        <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: '10px', padding: '1rem' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>Secondary Domains Needed</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#2563EB' }}>{domainsRequired} Domains</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>Separate from root brand domain</div>
        </div>

        <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: '10px', padding: '1rem' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>Monthly Contact Volume</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text)' }}>{totalEmailsNeeded.toLocaleString()}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>~{dailySendVolume.toLocaleString()} emails/day</div>
        </div>

        <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: '10px', padding: '1rem' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>Est. Infrastructure Cost</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--success, #0D9B79)' }}>${Math.round(monthlyInfraCost)}<span style={{ fontSize: '0.8rem', fontWeight: 400 }}>/mo</span></div>
          <div style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>${costPerMeeting} infrastructure / meeting</div>
        </div>
      </div>

      {/* Funnel Parameter Inputs */}
      <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: '12px', padding: '1.2rem', marginBottom: '1.5rem' }}>
        <h3 style={{ margin: '0 0 1rem', fontSize: '1.1rem' }}>Outbound Funnel Assumptions</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.2rem' }}>
          <div>
            <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '0.3rem' }}>Target Booked Meetings / Month:</label>
            <input
              type="number"
              min="1"
              value={targetMeetings}
              onChange={(e) => setTargetMeetings(Number(e.target.value))}
              style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)' }}
            />
          </div>

          <div>
            <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '0.3rem' }}>Positive Reply Rate (%):</label>
            <input
              type="number"
              step="0.1"
              value={positiveReplyRate}
              onChange={(e) => setPositiveReplyRate(Number(e.target.value))}
              style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)' }}
            />
            <span style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>Industry average: 1.5% – 3.0%</span>
          </div>

          <div>
            <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '0.3rem' }}>Meeting Conversion from Reply (%):</label>
            <input
              type="number"
              min="5"
              max="100"
              value={meetingBookingRate}
              onChange={(e) => setMeetingBookingRate(Number(e.target.value))}
              style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)' }}
            />
            <span style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>Target: 35% – 50%</span>
          </div>

          <div>
            <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '0.3rem' }}>Max Daily Sends Per Inbox:</label>
            <input
              type="number"
              min="10"
              max="50"
              value={inboxDailyLimit}
              onChange={(e) => setInboxDailyLimit(Number(e.target.value))}
              style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)' }}
            />
            <span style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>Recommended: &le; 30 to avoid spam traps</span>
          </div>
        </div>
      </div>

      {/* Recommended 4-Week Warm-Up Ramp Schedule */}
      <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: '12px', padding: '1.2rem' }}>
        <h3 style={{ margin: '0 0 0.8rem', fontSize: '1.1rem' }}>🛡️ Mandatory 4-Week Domain Warm-Up Schedule</h3>
        <p style={{ margin: '0 0 1rem', fontSize: '0.85rem', color: 'var(--muted)' }}>
          Never send full cold volume on new secondary domains immediately. Follow this gradual warm-up trajectory:
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.8rem' }}>
          <div style={{ background: 'var(--bg)', padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--border)' }}>
            <strong style={{ color: '#2563EB', fontSize: '0.9rem' }}>Week 1: Automated Warmup</strong>
            <div style={{ fontSize: '0.8rem', color: 'var(--muted)', marginTop: '0.3rem' }}>5–10 warmup emails/day. 0 cold outbound. Configure SPF, DKIM, DMARC.</div>
          </div>
          <div style={{ background: 'var(--bg)', padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--border)' }}>
            <strong style={{ color: '#2563EB', fontSize: '0.9rem' }}>Week 2: Initial Pilot</strong>
            <div style={{ fontSize: '0.8rem', color: 'var(--muted)', marginTop: '0.3rem' }}>10–15 warmups + 5 cold emails/day per inbox. Monitor bounce rate (&lt;2%).</div>
          </div>
          <div style={{ background: 'var(--bg)', padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--border)' }}>
            <strong style={{ color: '#2563EB', fontSize: '0.9rem' }}>Week 3: Scaling Volume</strong>
            <div style={{ fontSize: '0.8rem', color: 'var(--muted)', marginTop: '0.3rem' }}>15–20 warmups + 15 cold emails/day. Ensure spam complaint rate is 0.0%.</div>
          </div>
          <div style={{ background: 'var(--bg)', padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--border)' }}>
            <strong style={{ color: 'var(--success, #0D9B79)', fontSize: '0.9rem' }}>Week 4+: Steady State</strong>
            <div style={{ fontSize: '0.8rem', color: 'var(--muted)', marginTop: '0.3rem' }}>Full target volume ({inboxDailyLimit} cold/day) + ongoing background warmup.</div>
          </div>
        </div>
      </div>
    </div>
  );
}
