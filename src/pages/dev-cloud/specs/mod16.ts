import {
  asNum,
  asSel,
  fmtMoney,
  fmtNum,
  n,
  pctres,
  res,
  sel,
  type DevCloudSpec,
} from './devCloudSpec'

export const SUBJECT = 'Observability & Log Management'

export const MOD16_SPECS: DevCloudSpec[] = [
  {
    id: 'log-volume-gb-day-indexing-cost-calculator',
    name: 'Log Ingest Volume (GB/Day) & SIEM Cost Sizer',
    subject: SUBJECT,
    blurb: 'Calculate daily and monthly log ingest volume in Gigabytes and forecast vendor ingestion bills across Datadog, Grafana Cloud, and CloudWatch.',
    tip: 'Filter out noisy health check logs (`GET /healthz`) at the logging agent level to instantly cut 20-40% of log ingestion costs.',
    usage: [
      'Enter log events generated per second (EPS) across your fleet.',
      'Enter average JSON log event size in bytes.',
      'Review daily ingest volume and forecasted monthly bills.',
    ],
    method: [
      'Daily GB = (EPS * 86,400 * Event_Bytes) / (1024^3).',
      'Applies vendor ingest rates (Datadog: ~$0.10/GB, CloudWatch: $0.50/GB, Grafana Cloud: ~$0.50/GB).',
    ],
    fields: [
      n('eps', 'Events Per Second (EPS)', 1200, 10, 500000, 100),
      n('eventBytes', 'Average Log Event Size (Bytes)', 450, 100, 4096, 50),
      sel('retentionDays', 'Retention Period', ['15 Days', '30 Days (Standard)', '90 Days (Compliance)']),
    ],
    compute: (v) => {
      const eps = asNum(v, 'eps', 1200)
      const bytes = asNum(v, 'eventBytes', 450)
      const ret = asSel(v, 'retentionDays', '30 Days')

      const dailyBytes = eps * 86400 * bytes
      const dailyGb = dailyBytes / (1024 * 1024 * 1024)
      const monthlyGb = dailyGb * 30

      // CloudWatch ~$0.50 per GB ingest
      const cloudwatchCost = monthlyGb * 0.50
      // Datadog ~$0.10 per GB ingest + retention
      const datadogCost = monthlyGb * 0.10 + (monthlyGb * 0.05)

      return [
        res('Daily Ingestion Volume', `${dailyGb.toFixed(1)} GB / day`, 'good', `${fmtNum(eps * 86400)} events/day`),
        res('Retention Window', ret, 'neutral'),
        res('Monthly Ingestion Volume', `${fmtNum(monthlyGb)} GB / month`, 'neutral'),
        res('Est. Datadog Log Bill', fmtMoney(datadogCost), 'warn', 'At ~$0.10/GB ingest + 30d retention'),
        res('Est. CloudWatch Log Bill', fmtMoney(cloudwatchCost), 'bad', 'At $0.50/GB ingestion'),
        pctres('High-Volume Saturation', eps > 5000 ? 'High Fleet Throughput' : 'Moderate Ingest', Math.min(100, Math.round((eps / 10000) * 100)), 'good'),
      ]
    },
  },
  {
    id: 'opentelemetry-trace-sampling-budgeter',
    name: 'OpenTelemetry (OTel) Distributed Trace Sampling Budgeter',
    subject: SUBJECT,
    blurb: 'Size tail-based and probabilistic trace sampling rates to capture 100% of errors and slow outliers while dropping expensive 200 OK traces.',
    tip: 'Tail-based sampling buffers spans in memory and only persists traces containing HTTP 5xx or latency > 1,500ms, slashing tracing bills by 90%.',
    usage: [
      'Enter total service requests per second across all spans.',
      'Enter baseline service error rate percentage.',
      'Review dropped span volume and APM storage cost reduction.',
    ],
    method: [
      'Calculates spans saved by sampling 100% of errors + 5% of healthy traces vs 100% full sampling.',
    ],
    fields: [
      n('totalRps', 'Total Traced Requests / Sec', 2500, 50, 100000, 100),
      n('errorRatePct', 'Baseline Error Rate %', 1.5, 0.1, 20.0, 0.1),
    ],
    compute: (v) => {
      const rps = asNum(v, 'totalRps', 2500)
      const errPct = asNum(v, 'errorRatePct', 1.5) / 100

      const spansPerReq = 6 // Average distributed microservice depth
      const totalSpansSec = rps * spansPerReq

      const errorSpansSec = totalSpansSec * errPct
      const healthySpansSec = totalSpansSec * (1 - errPct)

      // Tail sampling: 100% errors + 5% healthy sample
      const retainedHealthy = healthySpansSec * 0.05
      const totalRetainedSpansSec = errorSpansSec + retainedHealthy
      const droppedSpansSec = totalSpansSec - totalRetainedSpansSec

      const savingsPct = Math.round((droppedSpansSec / totalSpansSec) * 100)

      return [
        res('Retained Error Traces', '100% of Errors Captured', 'good', 'Zero visibility loss for production incidents'),
        res('Retained Healthy Sample', '5% Statistical Sample', 'neutral', 'Sufficient for P95 / P99 latency charts'),
        pctres('APM Trace Storage Savings', `${savingsPct}% Volume Reduction`, savingsPct, 'good'),
        res('Dropped Redundant Spans', `${fmtNum(droppedSpansSec * 86400 / 1000000)}M spans / day`, 'good', `From ${fmtNum(totalSpansSec * 86400 / 1000000)}M baseline`),
      ]
    },
  },
]
