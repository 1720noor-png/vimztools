import {
  asNum,
  asSel,
  fmtBytes,
  fmtMoney,
  fmtNum,
  n,
  pctres,
  res,
  sel,
  type DevCloudSpec,
} from './devCloudSpec'

export const SUBJECT = 'Cloud FinOps & Infrastructure Sizing'

export const MOD10_SPECS: DevCloudSpec[] = [
  {
    id: 'multi-cloud-egress-cost-estimator',
    name: 'Multi-Cloud Bandwidth Egress Fee & CDN Arbitrage Calculator',
    subject: SUBJECT,
    blurb: 'Calculate monthly public internet data transfer egress bills across AWS, Azure, Google Cloud, and zero-egress providers like Cloudflare.',
    tip: 'Routing asset downloads through a CDN or zero-egress object storage (Cloudflare R2) can eliminate 90%+ of cloud provider egress line items.',
    usage: [
      'Enter total monthly outbound bandwidth in Terabytes (TB).',
      'Select origin cloud provider (AWS, GCP, Azure).',
      'Compare egress bills and review zero-egress cost arbitrage.',
    ],
    method: [
      'Applies tiered public egress rates (AWS: $0.09/GB, Azure: $0.087/GB, GCP: $0.085/GB, Cloudflare R2: $0.00).',
    ],
    fields: [
      n('egressTb', 'Monthly Outbound Internet Egress (TB)', 15, 1, 1000, 1),
      sel('cloudProvider', 'Primary Cloud Origin Provider', ['AWS (Amazon Web Services)', 'Google Cloud Platform (GCP)', 'Microsoft Azure']),
    ],
    compute: (v) => {
      const tb = asNum(v, 'egressTb', 15)
      const provider = asSel(v, 'cloudProvider', 'AWS')

      const gb = tb * 1024

      let ratePerGb = 0.09
      if (provider.startsWith('Google')) ratePerGb = 0.085
      else if (provider.startsWith('Microsoft')) ratePerGb = 0.087

      // First 100 GB often free
      const billableGb = Math.max(0, gb - 100)
      const providerBill = billableGb * ratePerGb

      return [
        res(`${provider.split(' ')[0]} Egress Bill`, fmtMoney(providerBill), 'warn', `At $${ratePerGb}/GB rate for ${tb} TB`),
        res('Zero-Egress Bill (Cloudflare R2)', '$0.00 / month', 'good', 'Zero bandwidth egress fees'),
        pctres('Cost Reduction Potential', '100% Egress Savings', 100, 'good'),
        res('Annualized Egress Waste', fmtMoney(providerBill * 12), 'bad', 'Potential budget reclaimed annually'),
        res('Total Outbound Volume', `${fmtNum(tb)} TB (${fmtBytes(gb * 1024 * 1024 * 1024)})`, 'neutral'),
      ]
    },
  },
  {
    id: 'aws-s3-tier-transition-planner',
    name: 'AWS S3 Lifecycle Tier Storage Cost Planner',
    subject: SUBJECT,
    blurb: 'Model cloud object storage bills transitioning aging files from S3 Standard to Infrequent Access, Glacier Instant, and Deep Archive.',
    tip: 'Glacier Deep Archive costs under $1 per Terabyte/month ($0.00099/GB), making it ideal for regulatory audit logs and long-term compliance.',
    usage: [
      'Enter total stored dataset volume in Terabytes (TB).',
      'Select target S3 storage tier.',
      'Inspect monthly bill and percentage savings vs S3 Standard.',
    ],
    method: [
      'S3 Standard: $0.023/GB.',
      'S3 Standard-IA: $0.0125/GB.',
      'Glacier Instant Retrieval: $0.004/GB.',
      'Glacier Deep Archive: $0.00099/GB.',
    ],
    fields: [
      n('storageTb', 'Total Stored Data Volume (TB)', 50, 1, 5000, 5),
      sel('targetTier', 'Target S3 Lifecycle Tier', ['Glacier Instant Retrieval ($0.004/GB - 82% savings)', 'Glacier Deep Archive ($0.00099/GB - 95% savings)', 'S3 Standard-IA ($0.0125/GB - 45% savings)']),
    ],
    compute: (v) => {
      const tb = asNum(v, 'storageTb', 50)
      const tier = asSel(v, 'targetTier', 'Glacier Instant Retrieval')

      const gb = tb * 1024
      const standardCost = gb * 0.023

      let tierRate = 0.004
      if (tier.includes('Deep Archive')) tierRate = 0.00099
      else if (tier.includes('Standard-IA')) tierRate = 0.0125

      const tierCost = gb * tierRate
      const monthlySavings = standardCost - tierCost
      const savingsPct = Math.round((monthlySavings / standardCost) * 100)

      return [
        res('S3 Standard Monthly Cost', fmtMoney(standardCost), 'warn', 'Baseline $0.023 / GB'),
        res('Optimized Tier Monthly Cost', fmtMoney(tierCost), 'good', `At $${tierRate}/GB rate`),
        pctres('Monthly Bill Reduction', `${savingsPct}% Savings`, savingsPct, 'good'),
        res('Annual Budget Saved', fmtMoney(monthlySavings * 12), 'good', `Saves ${fmtMoney(monthlySavings)} every month`),
      ]
    },
  },
]
