import { Users, Target, Wallet, Truck, Scale, Server, TrendingUp, Headphones, ClipboardList, Building2, Globe, Leaf, type LucideIcon } from 'lucide-react'
import type { Tool } from '../../lib/catalog'

export const OFFICE_CATEGORY = 'office-corporate'
export const OFFICE_CATEGORY_NAME = 'Office & Corporate Utilities'

export interface OfficeToolMeta {
  name: string
}

export interface OfficeSubcategory {
  id: string
  name: string
  tagline: string
  description: string
  tools: OfficeToolMeta[]
}

export interface OfficeModule {
  id: string
  label: string
  name: string
  description: string
  icon: LucideIcon
  accent: string
  subcategories: OfficeSubcategory[]
}

const STOPWORDS = new Set([
  'the',
  'and',
  'for',
  'of',
  'to',
  'a',
  'an',
  'in',
  'on',
  'with',
  'by',
  'from',
  'vs',
  'or',
  'at',
  'as',
  'per',
  'net',
  'pay',
  'a',
  'tool',
  'tools',
])

function slugify(value: string): string {
  const v = value
    .replace(/[’‘`"']/g, '')
    .replace(/&/g, ' and ')
    .replace(/%/g, ' percent ')
    .replace(/[^a-z0-9]+/gi, ' ')
    .trim()
    .replace(/\s+/g, ' ')
    .toLowerCase()
  return v ? v.split(' ').join('-') : ''
}

function deriveKeywords(name: string): string[] {
  const tokens = slugify(name).split('-')
  const kw: string[] = []
  for (const t of tokens) {
    if (t.length > 2 && !STOPWORDS.has(t)) kw.push(t)
  }
  return [...new Set(kw)].slice(0, 8)
}

export const officeModules: OfficeModule[] = [
  {
    id: 'hr-people',
    label: 'Module 01',
    name: 'HR & People',
    icon: Users,
    accent: 'text-sky-600 bg-sky-50 border-sky-200',
    description:
      'Recruitment, day-to-day HR operations and employee retention — hiring math, leave, pay, compliance and people analytics that run entirely on your device.',
    subcategories: [
      {
        id: 'recruitment',
        name: 'Recruitment',
        tagline: 'Hiring pipelines, costs & compliance',
        description:
          'Job posts, interview matrices, cost-per-hire, worker classification, contractor vs employee costs, referrals and NDA / non-compete helpers.',
        tools: [
          { name: 'Job Description Keyword Density & Bias Checker' },
          { name: 'Interview Question Matrix Builder' },
          { name: 'Cost-Per-Hire Calculator' },
          { name: 'Worker Classification Compliance Checker' },
          { name: 'Contractor vs Full-Time Employee Cost Comparator' },
          { name: 'Headcount Forecasting Calculator' },
          { name: 'Internship Stipend vs Minimum Wage Estimator' },
          { name: 'Employee Referral Bonus Estimator' },
          { name: 'Background Check Turnaround Estimator' },
          { name: 'Alumni Network Engagement Tracker' },
          { name: 'Non-Disclosure Agreement (NDA) HR Template Builder' },
          { name: 'Non-Compete Geographic Radius Estimator' },
        ],
      },
      {
        id: 'operations',
        name: 'Operations',
        tagline: 'Onboarding, leave, pay & lifecycle',
        description:
          'Onboarding to offboarding — leave accrual, overtime FLSA, severance, stipends, benefits splits, ERC and the daily HR logs every team needs.',
        tools: [
          { name: 'Employee Onboarding Checklist Generator' },
          { name: 'Offboarding & Asset Recovery Checklist Builder' },
          { name: 'New Hire Equipment Provisioning Formatter' },
          { name: 'Annual Leave / PTO Accrual Calculator' },
          { name: 'Bereavement & Parental Leave Estimator' },
          { name: 'Overtime Pay Estimator (FLSA Compliance)' },
          { name: 'Shift Differential Pay Calculator' },
          { name: 'Salary Inflation & Merit Increase Adjuster' },
          { name: 'Compensation Ratio (Compa-Ratio) Calculator' },
          { name: 'Equal Pay Audit Estimator' },
          { name: 'Notice Period Buyout Estimator' },
          { name: 'Termination Pay & Severance Package Calculator' },
          { name: 'Commute Stipend & Mileage Reimbursement Calculator' },
          { name: 'Remote Work Stipend Allocator' },
          { name: 'Health Insurance Premium Split Calculator' },
          { name: 'Flexible Spending Account (FSA/HSA) Estimator' },
          { name: 'Employee Retention Credit (ERC) Estimator' },
          { name: 'Staffing Ratio Estimator' },
          { name: 'Disciplinary Action Warning Letter Builder' },
          { name: 'HR Whistleblower Report Log Template' },
        ],
      },
      {
        id: 'retention',
        name: 'Retention',
        tagline: 'Engagement, growth & wellbeing',
        description:
          'Probation reviews, performance and skills gaps, retention math, engagement scores, ergonomics, diversity and the KPIs behind a healthy headcount.',
        tools: [
          { name: 'Probationary Period Evaluation Calculator' },
          { name: 'Performance Review Rating Matrix' },
          { name: 'Skill Gap Analysis Matrix' },
          { name: 'Internal Mobility & Career Pathway Planner' },
          { name: 'Training ROI Calculator' },
          { name: 'Employee Turnover Rate Calculator' },
          { name: 'Absenteeism Rate Calculator' },
          { name: 'Employee Net Promoter Score (eNPS) Calculator' },
          { name: 'Employee Engagement Survey Score Aggregator' },
          { name: 'Employee Wellbeing Index Calculator' },
          { name: 'Workplace Ergonomics Risk Estimator' },
          { name: 'Workplace Diversity Ratio Calculator' },
          { name: 'Peer-to-Peer Recognition Point Multiplier' },
          { name: 'Employee Engagement Event Budgeter' },
          { name: 'Conflict Resolution Meeting Formatter' },
          { name: 'Remote Team Timezone Overlap Finder' },
          { name: 'Relocation Package Estimator' },
          { name: 'HR KPI & Metrics Dashboard Generator' },
        ],
      },
    ],
  },
  {
    id: 'strategy-executive',
    label: 'Module 02',
    name: 'Strategy & Executive',
    icon: Target,
    accent: 'text-violet-600 bg-violet-50 border-violet-200',
    description:
      'Strategic planning frameworks, board governance and company valuation calculators for leadership teams that need decisions grounded in numbers.',
    subcategories: [
      {
        id: 'strategy',
        name: 'Strategy',
        tagline: 'Frameworks, pivots & roadmaps',
        description:
          'SWOT, PESTEL, OKRs, balanced scorecards, Porter and BCG, business model canvases, feasibility and the calculators behind strategic pivots.',
        tools: [
          { name: 'SWOT Analysis Matrix Builder' },
          { name: 'PESTEL Analysis Formatter' },
          { name: 'OKR (Objectives & Key Results) Cascade Planner' },
          { name: 'Balanced Scorecard (BSC) Builder' },
          { name: 'Porter’s Five Forces Estimator' },
          { name: 'BCG Growth-Share Matrix Mapper' },
          { name: 'Business Model Canvas (BMC) Generator' },
          { name: 'VRIO Framework Analyzer' },
          { name: 'Strategic Pivot Feasibility Calculator' },
          { name: 'Feasibility Study Scoring Matrix' },
          { name: 'Competitive Benchmarking Matrix' },
          { name: 'Strategic Alliance Value Creator Estimator' },
          { name: 'Turnaround Strategy Cost Estimator' },
          { name: 'Company Mission/Vision Statement Formatter' },
          { name: 'Change Management Readiness Scorecard' },
          { name: 'Global Expansion Country Attractiveness Index' },
          { name: 'Stakeholder Influence/Interest Grid Builder' },
          { name: 'Divestiture Impact Calculator' },
        ],
      },
      {
        id: 'governance',
        name: 'Governance',
        tagline: 'Board, compliance & risk',
        description:
          'Board resolutions, RACI, governance audits, policies, business continuity, ESG and CSR, crisis communications and risk heatmaps.',
        tools: [
          { name: 'Board Meeting Resolution Builder' },
          { name: 'Corporate Governance Compliance Audit Matrix' },
          { name: 'RACI Matrix Generator' },
          { name: 'Whistleblower Policy Formatter' },
          { name: 'Proxy Statement Voting Agenda Formatter' },
          { name: 'Business Continuity Plan (BCP) Outliner' },
          { name: 'Regulatory Fine Risk Estimator' },
          { name: 'Corporate Governance Proxy Voting Formatter' },
          { name: 'Anti-Bribery & Corruption Policy Generator' },
          { name: 'Board of Directors Skill Matrix Builder' },
          { name: 'Corporate Charters & Bylaws Formatter' },
          { name: 'ESG Score Builder' },
          { name: 'Corporate Social Responsibility (CSR) Budget Allocator' },
          { name: 'Crisis Communication Decision Tree Builder' },
          { name: 'Risk Register & Heatmap Matrix' },
          { name: 'Cyber Liability Executive Risk Estimator' },
        ],
      },
      {
        id: 'valuation',
        name: 'Valuation',
        tagline: 'Money, dilution & succession',
        description:
          'Dilution, burn rate, M&A synergies, JV and franchise economics, executive bonuses, valuations, succession, IP and stock options.',
        tools: [
          { name: 'Venture Capital Dilution Calculator' },
          { name: 'Burn Rate & Runway Extension Estimator' },
          { name: 'M&A Synergy Valuation Calculator' },
          { name: 'Corporate Restructuring Timeline Builder' },
          { name: 'Shareholder Voting Power Calculator' },
          { name: 'Executive Bonus Pool Allocator' },
          { name: 'Joint Venture (JV) Profit Split Estimator' },
          { name: 'Corporate Advisory Board Stipend Calculator' },
          { name: 'Company Valuation Multiplier Estimator' },
          { name: 'Succession Planning Talent Bench Builder' },
          { name: 'Corporate Franchising Royalty Estimator' },
          { name: 'Subsidized Subsidiary Ownership Allocator' },
          { name: 'Intellectual Property (IP) Portfolio Value Estimator' },
          { name: 'Executive Travel Expense Allowance Matrix' },
          { name: 'CEO Pay Ratio Estimator' },
          { name: 'Stock Option Exercise (Strike Price) Calculator' },
        ],
      },
    ],
  },
  {
    id: 'finance-procurement',
    label: 'Module 03',
    name: 'Finance & Procurement',
    icon: Wallet,
    accent: 'text-emerald-600 bg-emerald-50 border-emerald-200',
    description:
      'Budgeting, procurement and treasury — capital planning, vendor sourcing, cash management and the cost calculations that keep the books in line.',
    subcategories: [
      {
        id: 'budgeting',
        name: 'Budgeting',
        tagline: 'Capital, tax & planning',
        description:
          'CapEx vs OpEx, NPV and IRR, WACC, lease evaluation, zero-based budgeting, depreciation, ratios, cash cycles and loan amortization.',
        tools: [
          { name: 'CapEx vs OpEx Financial Classifier' },
          { name: 'Net Present Value (NPV) & IRR Calculator' },
          { name: 'Weighted Average Cost of Capital (WACC) Calculator' },
          { name: 'Capital Lease vs Operating Lease Evaluator' },
          { name: 'Zero-Based Budgeting (ZBB) Template Builder' },
          { name: 'Corporate Tax Liability Estimator' },
          { name: 'Asset Depreciation Schedule (Straight-Line & MACRS)' },
          { name: 'Working Capital Ratio Calculator' },
          { name: 'Cash Conversion Cycle (CCC) Calculator' },
          { name: 'Amortization Schedule for Commercial Loans' },
          { name: 'Financial Ratio Analysis Dashboard' },
          { name: 'Corporate Travel Budget Allocation Planner' },
          { name: 'Asset Scrap Value Estimator' },
          { name: 'Commercial Real Estate Lease Escalate Calculator' },
          { name: 'Sunk Cost Fallacy Project Evaluator' },
          { name: 'Intercompany Loan Interest Calculator' },
        ],
      },
      {
        id: 'procurement',
        name: 'Procurement',
        tagline: 'Sourcing, contracts & spend',
        description:
          'RFQs and POs, vendor matrices, three-way matching, SaaS and maverick spend, penalties, SLAs, withholding tax and corporate card policies.',
        tools: [
          { name: 'Vendor RFQ (Request for Quote) Formatter' },
          { name: 'Vendor Comparison Matrix' },
          { name: 'Purchase Order (PO) Generator' },
          { name: 'Three-Way Matching Audit Formatter' },
          { name: 'Procurement Spend Under Management (SUM) Calculator' },
          { name: 'SaaS License Wastage Calculator' },
          { name: 'Vendor Tiering & Criticality Matrix' },
          { name: 'Contract Penalty & Liquidated Damages Estimator' },
          { name: 'Procurement Cycle Time Estimator' },
          { name: 'Maverick Spend Estimator' },
          { name: 'SLA Breach Financial Rebate Calculator' },
          { name: 'Cross-Border Withholding Tax (WHT) Calculator' },
          { name: 'Requisition to Pay (R2P) Workflow Builder' },
          { name: 'Procurement Savings (Hard vs Soft) Calculator' },
          { name: 'Supplier Sustainability Rating Scorecard' },
          { name: 'Auditor Fee Estimator' },
          { name: 'Corporate Gift & Hospitality Expense Log' },
          { name: 'Corporate Credit Card Expense Policy Builder' },
        ],
      },
      {
        id: 'treasury',
        name: 'Treasury',
        tagline: 'Cash, credit & exposure',
        description:
          'AP and AR aging, bad debt reserves, payment discounts, inventory economics, petty cash, transfer pricing, letters of credit, FX and VaR.',
        tools: [
          { name: 'Accounts Payable Aging Schedule Formatter' },
          { name: 'Accounts Receivable Aging Schedule Formatter' },
          { name: 'Bad Debt Reserve Calculator' },
          { name: 'Early Payment Discount (2/10 Net 30) Calculator' },
          { name: 'Inventory Holding Cost Calculator' },
          { name: 'Economic Order Quantity (EOQ) Calculator' },
          { name: 'Safety Stock & Reorder Point Calculator' },
          { name: 'Petty Cash Reconciler & Vault Log' },
          { name: 'Transfer Pricing Risk Estimator' },
          { name: 'Letter of Credit (LC) Cost Calculator' },
          { name: 'Escrow Service Fee Estimator' },
          { name: 'Corporate Treasury Yield Calculator' },
          { name: 'Foreign Exchange (FX) Exposure Hedging Calculator' },
          { name: 'Value at Risk (VaR) Financial Estimator' },
          { name: 'Company Credit Rating Estimation Matrix' },
          { name: 'Total Cost of Ownership (TCO) Calculator' },
        ],
      },
    ],
  },
  {
    id: 'logistics-operations',
    label: 'Module 04',
    name: 'Logistics & Operations',
    icon: Truck,
    accent: 'text-amber-600 bg-amber-50 border-amber-200',
    description:
      'Warehousing, freight and transportation, and manufacturing — capacity, costs, lead times and the OEE-style metrics behind smooth operations.',
    subcategories: [
      {
        id: 'warehousing',
        name: 'Warehousing',
        tagline: 'Storage, slots & inventory',
        description:
          'Utilization, container loads, deadstock, cross-docking, pick rates, pallets, dock doors, SKU velocity, slotting and cold chain estimates.',
        tools: [
          { name: 'Warehouse Storage Utilization Calculator' },
          { name: 'Container Loading (20ft / 40ft CBM) Calculator' },
          { name: 'Deadstock & Slow-Moving Inventory Auditor' },
          { name: 'Cross-Docking Feasibility Estimator' },
          { name: 'Warehouse Labor Pick-Rate Calculator' },
          { name: 'Pallet Stacking Height & Weight Limits' },
          { name: 'Dock Door Scheduling Allocator' },
          { name: 'Consignment Inventory Fee Estimator' },
          { name: 'Distribution Center Location Gravity Model' },
          { name: 'Warehouse SKU Velocity Mapper' },
          { name: 'Warehouse Slotting Optimization Estimator' },
          { name: 'Packaging Material Cost Minimizer' },
          { name: 'Safety Data Sheet (SDS) Chemical Indexer' },
          { name: 'Loss & Shrinkage Rate Estimator' },
          { name: 'Inventory Turnover Ratio Calculator' },
          { name: 'Cold Chain Temperature Variance Estimator' },
          { name: 'Demand Forecasting Moving Average Calculator' },
        ],
      },
      {
        id: 'logistics',
        name: 'Logistics',
        tagline: 'Freight, cost & service',
        description:
          'Freight class, dimensional weight, incoterms, duties, 3PL costs, fuel and route costing, last mile, carbon, demurrage and carrier OTIF scores.',
        tools: [
          { name: 'Freight Class Calculator (US DOT)' },
          { name: 'Volumetric Weight (Dimensional Weight) Calculator' },
          { name: 'Incoterms Quick Selection & Risk Guide' },
          { name: 'Customs Duty & Import Tariff Estimator' },
          { name: 'Logistics Cost as a % of Sales Calculator' },
          { name: 'Third-Party Logistics (3PL) Cost Comparator' },
          { name: 'Fleet Fuel Consumption & Route Costing' },
          { name: 'Drop-Shipping Margin Estimator' },
          { name: 'Reverse Logistics & Return Handling Cost Estimator' },
          { name: 'Fleet Vehicle Replacement Cycle Estimator' },
          { name: 'Last-Mile Delivery Cost Estimator' },
          { name: 'CO2 Shipping Footprint Calculator' },
          { name: 'Demurrage & Detention Fee Calculator' },
          { name: 'Customs Brokerage Fee Estimator' },
          { name: 'Carrier Performance Scorecard' },
          { name: 'Supplier On-Time In-Full (OTIF) Scorer' },
          { name: 'Lead Time Variability Estimator' },
        ],
      },
      {
        id: 'manufacturing',
        name: 'Manufacturing',
        tagline: 'Throughput, quality & maintenance',
        description:
          'OEE, BOM costs, MTBF and MTTR, cycle and takt time, kanban, JIT, bottlenecks, line balancing, VSM, scrap and supply chain RONA.',
        tools: [
          { name: 'Overall Equipment Effectiveness (OEE) Calculator' },
          { name: 'Bill of Materials (BOM) Cost Exploder' },
          { name: 'Mean Time Between Failures (MTBF) Calculator' },
          { name: 'Mean Time to Repair (MTTR) Calculator' },
          { name: 'Manufacturing Cycle Efficiency (MCE) Calculator' },
          { name: 'Takt Time & Cycle Time Calculator' },
          { name: 'Kanban Card & WIP Limit Calculator' },
          { name: 'Just-In-Time (JIT) Buffer Index Estimator' },
          { name: 'Supply Chain Bottleneck Finder' },
          { name: 'Equipment Lease vs Buy ROI Matrix' },
          { name: 'Assembly Line Balancing Calculator' },
          { name: 'Value Stream Mapping (VSM) Lead Time Analyzer' },
          { name: 'Batch Size Production Cost Calculator' },
          { name: 'Preventive Maintenance Schedule Builder' },
          { name: 'Quality Yield & Scrap Rate Calculator' },
          { name: 'Return on Net Assets (RONA) Supply Chain Metric' },
        ],
      },
    ],
  },
  {
    id: 'legal-compliance-risk',
    label: 'Module 05',
    name: 'Legal, Compliance & Risk Management',
    icon: Scale,
    accent: 'text-red-600 bg-red-50 border-red-200',
    description:
      'Contracts, compliance and risk — legal templates, regulatory calendars, data protection checklists and risk matrices that run 100% in your browser.',
    subcategories: [
      {
        id: 'contracts',
        name: 'Contracts',
        tagline: 'Agreements, SLAs & legal terms',
        description:
          'Contract renewals, indemnification, SLAs, subcontractor and MNDA templates, employment clauses, EULAs, MSAs, SOWs and billing-rate negotiators.',
        tools: [
          { name: 'Contract Expiration & Renewal Notification Planner' },
          { name: 'Indemnification Clause Risk Evaluator' },
          { name: 'Service Level Agreement (SLA) Penalty Calculator' },
          { name: 'Subcontractor Agreement Generator' },
          { name: 'Mutual Non-Disclosure Agreement (MNDA) Formatter' },
          { name: 'Force Majeure Contract Clause Checker' },
          { name: 'Employment Agreement Standard Clause Generator' },
          { name: 'Commercial Contract Risk Scorecard' },
          { name: 'EULA (End User License Agreement) Builder' },
          { name: 'Master Services Agreement (MSA) Structure Builder' },
          { name: 'Statement of Work (SOW) Scope Creep Legal Shield' },
          { name: 'Non-Solicitation Geographic Scope Checker' },
          { name: 'Legal Billing Rate & Fee Cap Negotiator' },
          { name: 'Arbitration vs Litigation Cost Comparator' },
          { name: 'Sublease Legal Liability Calculator' },
          { name: 'Contract Value Lifetime Risk Calculator' },
          { name: 'Corporate Legal Spend vs Budget Tracker' },
        ],
      },
      {
        id: 'compliance',
        name: 'Compliance',
        tagline: 'Regulations, filings & policies',
        description:
          'GDPR DPIAs and DSAR logs, DPAs, gap analyses, annual filings, OSHA logs, sanctions checks, cookie consent and POA builders.',
        tools: [
          { name: 'GDPR Data Protection Impact Assessment (DPIA) Formatter' },
          { name: 'CCPA/CPRA Data Subject Request (DSAR) Log' },
          { name: 'Data Processing Agreement (DPA) Template Builder' },
          { name: 'Regulatory Compliance Gap Analysis Matrix' },
          { name: 'Corporation Annual Return Filing Deadline Tracker' },
          { name: 'OSHA Workplace Incident Log Formatter' },
          { name: 'Export Control & Sanctions Country Checker' },
          { name: 'Regulatory Reporting Calendar Generator' },
          { name: 'Affiliate Marketing Legal Compliance Checker' },
          { name: 'Regulatory Compliance Training Tracker' },
          { name: 'Bribe / Gift Policy Legal Threshold Matrix' },
          { name: 'Third-Party Data Controller vs Processor Tagger' },
          { name: 'Cookie Consent Compliance Formatter' },
          { name: 'Environmental Permit Expiration Tracker' },
          { name: 'Consumer Financial Protection Compliance Checker' },
          { name: 'Corporate Power of Attorney (POA) Document Builder' },
          { name: 'Freedom of Information Act (FOIA) Request Generator' },
        ],
      },
      {
        id: 'risk',
        name: 'Risk',
        tagline: 'IP, liability & exposure',
        description:
          'Licensing royalties, litigation holds, trade secrets, AML and KYC, patents, trademarks, data breach penalties and IP ownership.',
        tools: [
          { name: 'IP Licensing Royalty Rate Estimator' },
          { name: 'Litigation Hold Notice Formatter' },
          { name: 'Trade Secret Classification Indexer' },
          { name: 'Anti-Money Laundering (AML) Risk Scoring Matrix' },
          { name: 'Know Your Customer (KYC) Document Checklist Generator' },
          { name: 'Patent Maintenance Fee Schedule Planner' },
          { name: 'Cease and Desist (C&D) Letter Formatter' },
          { name: 'Product Liability Risk Rating Matrix' },
          { name: 'Term Sheet Valuation & Liquidation Preference Builder' },
          { name: 'Copyright Registration Cost Estimator' },
          { name: 'Trademark Knockout Search Log' },
          { name: 'Data Breach Penalty Estimator' },
          { name: 'Corporate Governance Charter Template Builder' },
          { name: 'Joint Ownership IP Assignment Generator' },
          { name: 'Statute of Limitations Legal Calculator' },
          { name: 'Corporate Seal Stamp Formatter' },
        ],
      },
    ],
  },
  {
    id: 'it-infrastructure-cyber',
    label: 'Module 06',
    name: 'IT Infrastructure, Cyber & Asset Management',
    icon: Server,
    accent: 'text-cyan-600 bg-cyan-50 border-cyan-200',
    description:
      'Infrastructure, cyber and assets — capacity and power planning, security scorecards, SLA calculators and IT asset trackers for modern operations teams.',
    subcategories: [
      {
        id: 'infrastructure',
        name: 'Infrastructure',
        tagline: 'Capacity, power & networking',
        description:
          'Bandwidth per user, rack U-space, UPS runtime, PUE, RAID, subnets, PoE budgets, Wi-Fi density, virtualization and API rate limits.',
        tools: [
          { name: 'Network Bandwidth Usage Per User Estimator' },
          { name: 'Server Rack Space (U-Height) Calculator' },
          { name: 'Uninterruptible Power Supply (UPS) Runtime Calculator' },
          { name: 'Data Center Power Usage Effectiveness (PUE) Calculator' },
          { name: 'RAID Array Capacity & Redundancy Calculator' },
          { name: 'IP Address Subnet Allocation Planner' },
          { name: 'Network Port Security Assignment Matrix' },
          { name: 'Datacenter Cooling Load Calculator' },
          { name: 'VoIP SIP Trunk Channel Estimator' },
          { name: 'Active Directory Organizational Unit (OU) Planner' },
          { name: 'Network Switch Power over Ethernet (PoE) Budget' },
          { name: 'Wi-Fi Access Point Coverage Density Estimator' },
          { name: 'Datacenter Floor Load Weight Estimator' },
          { name: 'Network Fiber Optic Attenuation Estimator' },
          { name: 'Server Virtualization Consolidation Ratio' },
          { name: 'Zero Trust Access Architecture Scorer' },
          { name: 'Internal API Rate Limiting Estimator' },
        ],
      },
      {
        id: 'cyber',
        name: 'Cyber',
        tagline: 'Security, trust & incidents',
        description:
          'Certificate expiry, password and MFA policies, phishing scorecards, vulnerability priority, SOC 2 readiness, shadow IT and incident severity.',
        tools: [
          { name: 'SSL/TLS Certificate Expiration Alert Planner' },
          { name: 'Password Policy Complexity Matrix Builder' },
          { name: 'Multi-Factor Authentication (MFA) Rollout Tracker' },
          { name: 'Phishing Simulation Campaign Scorecard' },
          { name: 'BYOD (Bring Your Own Device) Security Compliance Matrix' },
          { name: 'Vulnerability Assessment Risk Priority Calculator' },
          { name: 'DNS Propagation Time Estimator' },
          { name: 'VPN Gateway Tunnel Capacity Calculator' },
          { name: 'Cyber Risk Insurance Coverage Estimator' },
          { name: 'Data Anonymization Verification Matrix' },
          { name: 'SOC 2 Type II Readiness Scorecard' },
          { name: 'Shadow IT Discovery Audit Formatter' },
          { name: 'Cyber Security Awareness Training Scorer' },
          { name: 'IT Contractor Access Privilege Expiration Log' },
          { name: 'SaaS Vendor Risk Security Checklist' },
          { name: 'IT Incident Severity Level Classifier' },
          { name: 'IT Asset Disposal (ITAD) Security Certificate Builder' },
        ],
      },
      {
        id: 'assets',
        name: 'Assets',
        tagline: 'Hardware, software & recovery',
        description:
          'ITAM and SAM audits, cloud costs, DR RTO/RPO, helpdesk SLAs, depreciation, backups, MDM and downtime costs.',
        tools: [
          { name: 'IT Asset Management (ITAM) Hardware Tracker' },
          { name: 'Software Asset Management (SAM) Audit Tool' },
          { name: 'Cloud Storage Cost Estimator (AWS/Azure/GCP)' },
          { name: 'Disaster Recovery RTO & RPO Calculator' },
          { name: 'IT Helpdesk SLA Resolution Time Calculator' },
          { name: 'Enterprise Software Upgrade Matrix' },
          { name: 'Printer Paper & Toner Cost Per Page Estimator' },
          { name: 'Workstation Depreciation Schedule' },
          { name: 'Database Backup Storage Growth Calculator' },
          { name: 'Mobile Device Management (MDM) Cost Allocator' },
          { name: 'Source Code Repository Storage Estimator' },
          { name: 'IT Staffing to User Ratio Estimator' },
          { name: 'Legacy System Migration Risk Matrix' },
          { name: 'Workstation Imaging Deployment Time Estimator' },
          { name: 'Cloud Egress Fee Risk Estimator' },
          { name: 'System Downtime Financial Loss Calculator' },
        ],
      },
    ],
  },
  {
    id: 'sales-revenue-ops',
    label: 'Module 07',
    name: 'Sales, Account Management & Revenue Ops',
    icon: TrendingUp,
    accent: 'text-blue-600 bg-blue-50 border-blue-200',
    description:
      'Conversion, compensation and retention — pipeline and velocity math, quota and commission planners, and the ARR/NRR metrics behind revenue ops.',
    subcategories: [
      {
        id: 'conversion',
        name: 'Conversion',
        tagline: 'Pipeline, outreach & demos',
        description:
          'Pipeline rate and velocity, lead scoring, ICP fit, demo win rates, email outreach, RFPs, funnels, trials and battle cards.',
        tools: [
          { name: 'Sales Pipeline Conversion Rate Calculator' },
          { name: 'Sales Velocity Calculator' },
          { name: 'Lead Scoring Matrix Builder' },
          { name: 'Ideal Customer Profile (ICP) Fit Scorer' },
          { name: 'Sales Demo Win Rate Analyzer' },
          { name: 'B2B Outbound Email Response Estimator' },
          { name: 'RFP (Request for Proposal) Response Scorecard' },
          { name: 'Sales Funnel Leakage Calculator' },
          { name: 'Sales Lead Decay Estimator' },
          { name: 'B2B Sales Cycle Length Calculator' },
          { name: 'Trial-to-Paid Conversion Rate Estimator' },
          { name: 'Win-Back Campaign Conversion Estimator' },
          { name: 'Lead Response Time Impact Estimator' },
          { name: 'Proposal Win/Loss Analysis Scorecard' },
          { name: 'Product Demonstration Checklist Generator' },
          { name: 'Competitor Battle Card Generator' },
          { name: 'Sales Collateral ROI Calculator' },
        ],
      },
      {
        id: 'compensation',
        name: 'Compensation',
        tagline: 'Quotas, commissions & pricing',
        description:
          'Quota attainment, commissions, approval matrices, territories, SPIFFs, value-based pricing, clawbacks, margins and rep capacity.',
        tools: [
          { name: 'Quota Attainment & Commission Accelerator' },
          { name: 'Deal Discount Approval Matrix' },
          { name: 'Sales Compensation Plan Generator' },
          { name: 'Territory Alignment & Quota Allocation Matrix' },
          { name: 'Sales Incentive SPIFF Budget Allocator' },
          { name: 'Value-Based Pricing Calculator' },
          { name: 'Sales Team Spiff ROI Estimator' },
          { name: 'Territory Travel Cost Estimator' },
          { name: 'Sales Commission Clawback Estimator' },
          { name: 'Enterprise Pricing Tier Matrix Builder' },
          { name: 'Strategic Partner Referral Fee Calculator' },
          { name: 'B2B Discounting Profit Penalty Matrix' },
          { name: 'Field Sales Meeting Density Calculator' },
          { name: 'Sales Channel Partner Margin Calculator' },
          { name: 'Cross-Sell Margin Multiplier' },
          { name: 'Sales Rep Capacity Planner' },
        ],
      },
      {
        id: 'retention',
        name: 'Retention',
        tagline: 'Accounts, ARR & growth',
        description:
          'Key account health, TAM/SAM/SOM, expansion, ARR and NRR, churn, time-to-value, ARPU, forecasting and RevOps alignment.',
        tools: [
          { name: 'Key Account Management (KAM) Health Index' },
          { name: 'Total Addressable Market (TAM / SAM / SOM) Estimator' },
          { name: 'Account Expansion / Upsell Opportunity Matrix' },
          { name: 'Contract Annual Recurring Revenue (ARR) Calculator' },
          { name: 'Net Revenue Retention (NRR) Calculator' },
          { name: 'Sales Call Activity Ratio Calculator' },
          { name: 'Sales Ramp-Up Duration Estimator' },
          { name: 'SaaS Churn Rate (Logo vs Revenue) Calculator' },
          { name: 'Customer Onboarding Time-to-Value (TTV) Estimator' },
          { name: 'Average Revenue Per User (ARPU) Calculator' },
          { name: 'Sales Enablement Content Usage Log' },
          { name: 'Sales Order Fulfillment Tracker' },
          { name: 'Customer Success Manager (CSM) Load Calculator' },
          { name: 'Sales Forecast Accuracy Calculator' },
          { name: 'Key Account Annual Review Agenda Formatter' },
          { name: 'Contract Expansion Payback Period' },
          { name: 'Revenue Operations (RevOps) Alignment Scorer' },
        ],
      },
    ],
  },
  {
    id: 'customer-support-experience',
    label: 'Module 08',
    name: 'Customer Service, Support & Experience',
    icon: Headphones,
    accent: 'text-pink-600 bg-pink-50 border-pink-200',
    description:
      'Satisfaction, operations and support — CSAT and NPS, call-center staffing, FCR and SLA credit math, and retention metrics that run in your browser.',
    subcategories: [
      {
        id: 'satisfaction',
        name: 'Satisfaction',
        tagline: 'Scores, sentiment & loyalty',
        description:
          'CSAT, NPS and CES scores, health and churn-risk indices, sentiment scoring, loyalty tiers, goodwill and re-engagement planning.',
        tools: [
          { name: 'Customer Satisfaction (CSAT) Score Aggregator' },
          { name: 'Net Promoter Score (NPS) Calculator' },
          { name: 'Customer Effort Score (CES) Calculator' },
          { name: 'Customer Health Score Matrix' },
          { name: 'Knowledge Base Article Value Rating' },
          { name: 'Customer Service Agent Occupancy Rate' },
          { name: 'Customer Apology & Goodwill Voucher Allocator' },
          { name: 'Customer Advisory Board (CAB) Feedback Formatter' },
          { name: 'Customer Sentiment Analysis Scorer' },
          { name: 'Customer Loyalty Tier Threshold Calculator' },
          { name: 'Post-Incident Customer Communication Builder' },
          { name: 'Customer Churn Risk Alert Index' },
          { name: 'Customer Feedback Loop Action Item Tracker' },
          { name: 'Customer Re-Engagement Campaign Estimator' },
          { name: 'Customer Survey Response Rate Calculator' },
          { name: 'Community Forum Activity Rate Matrix' },
          { name: 'Service Recovery Paradox Rating' },
        ],
      },
      {
        id: 'operations',
        name: 'Operations',
        tagline: 'Workforce, queues & channels',
        description:
          'AHT, Erlang C staffing, SLA breaches, abandonment and cost-per-contact, QA scorecards, shift plans, chat benchmarks and IVR trees.',
        tools: [
          { name: 'Average Handle Time (AHT) Calculator' },
          { name: 'Call Center Erlang C Staffing Calculator' },
          { name: 'Support Queue SLA Breached Calculator' },
          { name: 'Call Center Abandonment Rate Calculator' },
          { name: 'Customer Service Cost Per Contact Calculator' },
          { name: 'Omnichannel Ticket Queue Balancer' },
          { name: 'Support Agent Training Needs Index' },
          { name: 'Call Center Quality Assurance Scorecard' },
          { name: 'Support Shift Schedule Generator' },
          { name: 'Live Chat Response Speed Benchmarker' },
          { name: 'Helpdesk Software License Requirement Estimator' },
          { name: 'Customer Refund Request Approval Matrix' },
          { name: 'Call Center Peak Hour Volume Predictor' },
          { name: 'Interactive Voice Response (IVR) Tree Planner' },
          { name: 'Multi-Language Support Staffing Calculator' },
          { name: 'Customer Service Representative Turnover Estimator' },
          { name: 'Remote Support Tool Bandwidth Estimator' },
        ],
      },
      {
        id: 'support',
        name: 'Support',
        tagline: 'Tickets, retention & deflections',
        description:
          'FCR and escalation rates, retention cost, self-service deflection, categorisation, SLAs, VIP priority, knowledge gaps and burnout risk.',
        tools: [
          { name: 'First Contact Resolution (FCR) Rate Calculator' },
          { name: 'Support Ticket Escalation Rate Calculator' },
          { name: 'Customer Retention Cost (CRC) Calculator' },
          { name: 'Self-Service Deflection Rate Calculator' },
          { name: 'Support Ticket Categorization Matrix' },
          { name: 'Customer Onboarding Milestone Tracker' },
          { name: 'Feature Request Priority Scorer' },
          { name: 'Customer Offboarding Reason Classifier' },
          { name: 'SLA Credit Refund Calculator' },
          { name: 'VIP Customer Prioritization Matrix' },
          { name: 'Support Documentation Outdated Alert Planner' },
          { name: 'Support Knowledge Gap Finder' },
          { name: 'VIP Service Escalation Hierarchy Builder' },
          { name: 'Support Agent Burnout Index Calculator' },
          { name: 'Customer Success Quarterly Business Review (QBR) Builder' },
          { name: 'Customer Service KPI Summary Dashboard' },
        ],
      },
    ],
  },
  {
    id: 'project-management-agile',
    label: 'Module 09',
    name: 'Project Management, Agile & Quality Control',
    icon: ClipboardList,
    accent: 'text-purple-600 bg-purple-50 border-purple-200',
    description:
      'Agile, tracking and quality — velocity, sprints, EVM and CPM, CPI/SPI, FMEA, defect density and COPQ calculators for delivery teams.',
    subcategories: [
      {
        id: 'agile',
        name: 'Agile',
        tagline: 'Sprints, velocity & flow',
        description:
          'Velocity, sprint capacity, burnups, CFDs, story points, retros, Kanban metrics, ART planning, epics and build success.',
        tools: [
          { name: 'Agile Velocity Calculator' },
          { name: 'Sprint Capacity Planner' },
          { name: 'Sprint Burndown & Burnup Calculator' },
          { name: 'Cumulative Flow Diagram (CFD) Scorer' },
          { name: 'Agile Story Point Estimation Matrix' },
          { name: 'Retrospective Action Item Tracker' },
          { name: 'Scrum of Scrums Coordination Matrix' },
          { name: 'Kanban Lead Time vs Cycle Time Calculator' },
          { name: 'Agile Release Train (ART) Planner' },
          { name: 'Agile Team Happiness Metric Calculator' },
          { name: 'Epic to User Story Breakdown Tool' },
          { name: 'Agile Maturity Assessment Matrix' },
          { name: 'Acceptance Criteria Checklist Generator' },
          { name: 'Feature Flag Deployment Tracker' },
          { name: 'Pair Programming Time Allocator' },
          { name: 'Minimum Viable Product (MVP) Feature Scorer' },
          { name: 'Software Build Success Rate Monitor' },
        ],
      },
      {
        id: 'tracking',
        name: 'Tracking',
        tagline: 'EVM, schedules & resources',
        description:
          'EVM, CPM and PERT, Gantt and WBS, scope creep, CPI/SPI, billing milestones, dependencies, portfolios and RAG reports.',
        tools: [
          { name: 'Earned Value Management (EVM) Calculator' },
          { name: 'Critical Path Method (CPM) Network Calculator' },
          { name: 'Gantt Chart Timeline Generator' },
          { name: 'Project Scope Creep Impact Estimator' },
          { name: 'Work Breakdown Structure (WBS) Code Generator' },
          { name: 'PERT (Program Evaluation Review Technique) Estimator' },
          { name: 'Project Resource Utilization Rate Calculator' },
          { name: 'Project Cost Performance Index (CPI) Calculator' },
          { name: 'Project Schedule Performance Index (SPI) Calculator' },
          { name: 'Project Billing Milestone Allocator' },
          { name: 'Project Dependency Mapper' },
          { name: 'Project Portfolio Prioritization Matrix' },
          { name: 'Resource Levelling Workload Balancer' },
          { name: 'Project Status Report (RAG Status) Generator' },
          { name: 'Time and Materials (T&M) Cap Calculator' },
          { name: 'Project Manager Allocation Matrix' },
          { name: 'Project Change Request (CR) Formatter' },
        ],
      },
      {
        id: 'quality',
        name: 'Quality',
        tagline: 'Defects, risk & DMAIC',
        description:
          'Bug severity, contingency, defect density, root-cause analysis, DMAIC, FMEA, COPQ, risk exposure, DRE and audits.',
        tools: [
          { name: 'Bug Severity & Priority Matrix' },
          { name: 'Risk Contingency Reserve Calculator' },
          { name: 'Defect Density Calculator' },
          { name: 'Root Cause Analysis (5 Whys / Ishikawa) Builder' },
          { name: 'Project Closure Checklist Builder' },
          { name: 'Six Sigma DMAIC Process Formatter' },
          { name: 'Failure Mode and Effects Analysis (FMEA) Calculator' },
          { name: 'Stakeholder Engagement Assessment Matrix' },
          { name: 'Quality Assurance (QA) Pass/Fail Ratio Calculator' },
          { name: 'Cost of Poor Quality (COPQ) Calculator' },
          { name: 'Project Risk Exposure Value Calculator' },
          { name: 'Design Thinking Journey Map Formatter' },
          { name: 'Process Cycle Efficiency (PCE) Calculator' },
          { name: 'Project Post-Mortem Lesson Learned Builder' },
          { name: 'Defect Removal Efficiency (DRE) Calculator' },
          { name: 'PMP Audit Checklist Builder' },
        ],
      },
    ],
  },
  {
    id: 'workplace-safety-facilities',
    label: 'Module 10',
    name: 'Workplace Safety, Facilities & Real Estate',
    icon: Building2,
    accent: 'text-lime-600 bg-lime-50 border-lime-200',
    description:
      'Space, safety and utilities — real estate and desk ratios, evacuation and hazard plans, HVAC, energy, waste and facilities metrics.',
    subcategories: [
      {
        id: 'space',
        name: 'Space',
        tagline: 'Real estate & layouts',
        description:
          'Floor space per employee, CRE leases, hot-desking, parking, relocations, tenant improvements, subleases and consolidation.',
        tools: [
          { name: 'Office Floor Space Per Employee Calculator' },
          { name: 'Commercial Real Estate (CRE) Lease Calculator' },
          { name: 'Desk Sharing / Hot-Desking Ratio Calculator' },
          { name: 'Car Parking Slot Allocation Planner' },
          { name: 'Office Relocation Move Cost Estimator' },
          { name: 'Commercial Lease Termination Penalty Calculator' },
          { name: 'Commercial Tenant Improvement (TI) Allowance' },
          { name: 'Meeting Room Utilization Rate Calculator' },
          { name: 'Commercial Real Estate Sublease Profit Calculator' },
          { name: 'Office Layout Traffic Flow Evaluator' },
          { name: 'Warehouse vs Office Footprint Ratio' },
          { name: 'Commercial Lease Security Deposit Return Estimator' },
          { name: 'Pandemic Office Social Distancing Layout' },
          { name: 'Office Space Consolidation Savings Calculator' },
          { name: 'Disaster Recovery Facility Backup Location' },
          { name: 'Commercial Property Tax Appeal Estimator' },
          { name: 'Standing Desk Converter Requirement Calculator' },
        ],
      },
      {
        id: 'safety',
        name: 'Safety',
        tagline: 'Emergencies, access & hazards',
        description:
          'Evacuation plans, extinguisher and first-aid logs, noise, access cards, hazard matrices, ergonomics, keys and visitor management.',
        tools: [
          { name: 'Emergency Evacuation Assembly Plan Formatter' },
          { name: 'Fire Extinguisher & First Aid Inspection Log' },
          { name: 'Office Noise Level (Decibel) Risk Evaluator' },
          { name: 'Building Access Card Issuance Log' },
          { name: 'Workplace Hazard Identification Matrix' },
          { name: 'Facility Security Guard Shift Allocator' },
          { name: 'Office Furniture Ergonomic Compliance Audit' },
          { name: 'Disability Access Compliance Checklist' },
          { name: 'Emergency Lighting Battery Test Tracker' },
          { name: 'Visitor Management Log Template' },
          { name: 'Key Management & Physical Lock Tracker' },
          { name: 'Workplace Temperature Comfort Index' },
          { name: 'Workplace Violence Prevention Scorecard' },
          { name: 'Facility Contractor Insurance Auditor' },
          { name: 'Roof Leaks & Building Envelope Inspection' },
          { name: 'Gym & Wellness Center Facility Capacity' },
          { name: 'Mailroom Package Volume Allocator' },
        ],
      },
      {
        id: 'utilities',
        name: 'Utilities',
        tagline: 'Energy, cleaning & services',
        description:
          'ACH rates, energy audits, cleaning schedules, recycling, maintenance tickets, solar ROI, water, lighting and EV charging.',
        tools: [
          { name: 'HVAC Air Change Rate (ACH) Estimator' },
          { name: 'Facility Energy Audit Cost Estimator' },
          { name: 'Janitorial & Cleaning Frequency Schedule Builder' },
          { name: 'Waste Management & Recycling Rate Calculator' },
          { name: 'Facility Maintenance Ticket Escalator' },
          { name: 'Solar Panel ROI for Commercial Property' },
          { name: 'Office Plant & Biophilic Design Planner' },
          { name: 'Coffee Machine & Pantry Consumable Estimator' },
          { name: 'E-Waste Disposal Compliance Formatter' },
          { name: 'Building Water Consumption Metric' },
          { name: 'Facility Management Cost Per Sq Ft' },
          { name: 'Smart Building IoT Sensor Density Calculator' },
          { name: 'Corporate EV Charging Station Estimator' },
          { name: 'Building Insurance Premium Allocator' },
          { name: 'Office Lighting Lux Level Calculator' },
          { name: 'Facility Utility Surge Penalty Estimator' },
        ],
      },
    ],
  },
  {
    id: 'international-business-pr',
    label: 'Module 11',
    name: 'International Business, PR & Investor Relations',
    icon: Globe,
    accent: 'text-teal-600 bg-teal-50 border-teal-200',
    description:
      'Public relations, investors and global — media value and crisis scores, cap tables, EPS and AGM checks, FX, tariffs and expat tax.',
    subcategories: [
      {
        id: 'public',
        name: 'Public',
        tagline: 'Media, PR & brand',
        description:
          'Press release costs, AVE, crisis sentiment, media databases, press events, sponsorships, embargoes and SOV tracking.',
        tools: [
          { name: 'Press Release Distribution Cost Estimator' },
          { name: 'Media Impressions to PR Value (AVE) Calculator' },
          { name: 'Crisis PR Sentiment Impact Scorecard' },
          { name: 'Media Relations Journalist Database Indexer' },
          { name: 'Corporate Brand Value Valuation Estimator' },
          { name: 'Press Event / Conference ROI Calculator' },
          { name: 'Corporate Sponsorship ROI Calculator' },
          { name: 'Press Release Embargo Notification Generator' },
          { name: 'PR Media Mentions Sentiment Analyzer' },
          { name: 'Spokesperson Media Training Scorecard' },
          { name: 'PR Crisis Response Time Benchmarker' },
          { name: 'Corporate Award Application Tracker' },
          { name: 'International Trade Show Booth ROI Calculator' },
          { name: 'Press Coverage Share of Voice (SOV) Calculator' },
          { name: 'Corporate Reputation Repair Cost Estimator' },
          { name: 'Media Interview Prep Sheet Builder' },
          { name: 'Global Brand Trademark Registration Planner' },
        ],
      },
      {
        id: 'investors',
        name: 'Investors',
        tagline: 'Capital, shares & reporting',
        description:
          'Earnings calls, cap tables, pitch decks, consensus estimates, 10-K checklists, buybacks, dividends, EPS and AGM checks.',
        tools: [
          { name: 'Investor Relations Earnings Call Agenda Builder' },
          { name: 'Shareholder Cap Table Ownership Percentage' },
          { name: 'Investor Pitch Deck Financial Summary Formatter' },
          { name: 'Analyst Consensus Estimate Variance Calculator' },
          { name: 'Public Company Annual Report (10-K) Checklist' },
          { name: 'Investor Shareholder Inquiries Tracker' },
          { name: 'Investor Data Room Document Indexer' },
          { name: 'Share Repurchase (Buyback) Impact Estimator' },
          { name: 'Institutional Investor Ownership Matrix' },
          { name: 'Dividend Payout Ratio & Yield Calculator' },
          { name: 'Investor Relations Email Newsletter Formatter' },
          { name: 'Shareholder Annual General Meeting (AGM) Quorum Checker' },
          { name: 'Earnings Per Share (EPS) Basic & Diluted Calculator' },
          { name: 'ESG Investor Sustainability Checklist' },
          { name: 'International Chamber of Commerce Dispute Cost' },
          { name: 'Corporate Foundation Grant Allocator' },
        ],
      },
      {
        id: 'global',
        name: 'Global',
        tagline: 'FX, trade & mobility',
        description:
          'FX losses, timezone schedulers, visas, etiquette, expat tax, entity costs, tariffs, PAYROLL providers and SWIFT fees.',
        tools: [
          { name: 'Cross-Border FX Currency Conversion Loss Estimator' },
          { name: 'Global Timezone Meeting Scheduler' },
          { name: 'International Travel Visa Requirements Matrix' },
          { name: 'Cross-Cultural Business Etiquette Checker' },
          { name: 'Global Expat Tax Equalization Calculator' },
          { name: 'Global Entity Formation Cost Matrix' },
          { name: 'International Freight Shipping Insurance Estimator' },
          { name: 'International Tariff & Trade War Risk Estimator' },
          { name: 'Global Currency Exchange Risk Exposure Index' },
          { name: 'International Subsidiary Management Fee Formatter' },
          { name: 'Global Mobility Tax Treaty Checker' },
          { name: 'Global Payroll Provider Cost Comparator' },
          { name: 'Sanctions List Entity Checker' },
          { name: 'Foreign Direct Investment (FDI) Incentive Checker' },
          { name: 'Global Expansion Labor Cost Index' },
          { name: 'International Wire Transfer SWIFT Fee Calculator' },
          { name: 'International Patent (PCT) Filing Cost Estimator' },
        ],
      },
    ],
  },
  {
    id: 'environmental-esg-culture',
    label: 'Module 12',
    name: 'Environmental, ESG & Workplace Culture',
    icon: Leaf,
    accent: 'text-green-600 bg-green-50 border-green-200',
    description:
      'ESG, inclusion and culture — GHG and water footprints, diversity and pay-gap indices, wellness ROI and volunteering trackers.',
    subcategories: [
      {
        id: 'esg',
        name: 'ESG',
        tagline: 'Emissions, energy & waste',
        description:
          'GHG scopes, carbon offsets, paperless metrics, Energy Star, supply chains, water, recycling, RECs and LEED.',
        tools: [
          { name: 'Corporate Greenhouse Gas (GHG) Scope 1, 2, 3 Calculator' },
          { name: 'Office Carbon Offset Cost Estimator' },
          { name: 'Office Paperless Transition Metric' },
          { name: 'Corporate Energy Star Rating Estimator' },
          { name: 'Sustainable Supply Chain Audit Matrix' },
          { name: 'Corporate Water Footprint Calculator' },
          { name: 'Eco-Friendly Office Commute Ratio' },
          { name: 'Single-Use Plastic Office Audit Log' },
          { name: 'Renewable Energy Certificate (REC) Calculator' },
          { name: 'Office Recycling Bin Density Allocator' },
          { name: 'Circular Economy Resource Reusability Index' },
          { name: 'Green Building LEED Point Estimator' },
          { name: 'Corporate Ethical Sourcing Scorecard' },
          { name: 'Office Indoor Plant Oxygen Output Estimator' },
          { name: 'Corporate Carbon Tax Exposure Estimator' },
          { name: 'Employee Commute CO2 Footprint Calculator' },
          { name: 'Supplier Human Rights Compliance Matrix' },
        ],
      },
      {
        id: 'inclusion',
        name: 'Inclusion',
        tagline: 'Diversity, pay & equity',
        description:
          'Diversity indices, EEO-1, pay transparency, accessibility, inclusive language, gender pay gap, flex models and ESG benchmarks.',
        tools: [
          { name: 'Workplace Diversity Index (Blau Index)' },
          { name: 'Equal Employment Opportunity (EEO-1) Formatter' },
          { name: 'Pay Transparency Band Generator' },
          { name: 'Workplace Accessibility Audit Formatter' },
          { name: 'Inclusive Language Document Checker' },
          { name: 'Gender Pay Gap Percentage Calculator' },
          { name: 'Flexible Working Model Ratio Calculator' },
          { name: 'Workplace Parental Leave Return Rate Metric' },
          { name: 'Neurodiversity Workplace Inclusion Matrix' },
          { name: 'Workplace Age Diversity Benchmarker' },
          { name: 'Company ESG Benchmark vs Industry Index' },
          { name: 'Chief Equality Officer KPI Generator' },
          { name: 'Zero Waste to Landfill Progress Tracker' },
          { name: 'Sustainable Packaging Transition Cost' },
          { name: 'Office Solar Thermal Water Heating Metric' },
          { name: 'Corporate Fleet Zero-Emission Transition Plan' },
          { name: 'Fair Trade Coffee & Tea Procurement Tracker' },
        ],
      },
      {
        id: 'culture',
        name: 'Culture',
        tagline: 'Wellbeing, values & climate',
        description:
          'Volunteering hours, psychological safety, charitable matching, burnout, wellness ROI, conflict, isolation and innovation indices.',
        tools: [
          { name: 'Employee Volunteering Hours Tracker' },
          { name: 'Workplace Psychological Safety Scorer' },
          { name: 'Corporate Charitable Matching Budget Estimator' },
          { name: 'Employee Burnout Prevention Matrix' },
          { name: 'Workplace Health & Wellness Program ROI' },
          { name: 'Corporate Social Impact Scorecard' },
          { name: 'Employee Mental Health Benefits Utilization' },
          { name: 'Workplace Microaggression Incident Log' },
          { name: '4-Day Work Week Productivity Index' },
          { name: 'Workplace Conflict Frequency Index' },
          { name: 'Employee Financial Wellness Scorecard' },
          { name: 'Corporate Governance Ethics Hotline Log' },
          { name: 'Remote Worker Isolation Index' },
          { name: 'Workplace Sickness Absence Root Cause Index' },
          { name: 'Employee Idea Innovation Index' },
          { name: 'Work-Life Balance Policy Compliance Scorecard' },
        ],
      },
    ],
  },
]

export interface OfficeToolInfo {
  tool: Tool
  module: OfficeModule
  moduleId: string
  moduleName: string
  moduleLabel: string
  subcategory: OfficeSubcategory
  subcategoryId: string
  subcategoryName: string
}

export const OFFICE_TOOLS: Tool[] = []

const officeIndex = new Map<string, OfficeToolInfo>()

for (const module of officeModules) {
  for (const sub of module.subcategories) {
    for (const meta of sub.tools) {
      const id = slugify(meta.name)
      if (!id) throw new Error(`Office tool produced an empty slug: ${meta.name}`)
      if (officeIndex.has(id)) {
        throw new Error(`Duplicate office tool slug: "${id}" from "${meta.name}"`)
      }
      const tool: Tool = {
        id,
        name: meta.name,
        categoryId: OFFICE_CATEGORY,
        category: OFFICE_CATEGORY_NAME,
        description: `${sub.tagline} A ${sub.name.toLowerCase()} helper for ${module.name.toLowerCase()} workflows — runs 100% in your browser.`,
        keywords: deriveKeywords(meta.name),
        path: `/tools/${OFFICE_CATEGORY}/${id}`,
        icon: 'Briefcase',
        subcategory: sub.name,
      }
      OFFICE_TOOLS.push(tool)
      officeIndex.set(id, {
        tool,
        module,
        moduleId: module.id,
        moduleName: module.name,
        moduleLabel: module.label,
        subcategory: sub,
        subcategoryId: sub.id,
        subcategoryName: sub.name,
      })
    }
  }
}

export const OFFICE_TOTAL_TOOLS = OFFICE_TOOLS.length

export function findOfficeModule(id?: string): OfficeModule | undefined {
  return id ? officeModules.find((m) => m.id === id) : undefined
}

export function findOfficeSubcategory(
  moduleId?: string,
  subId?: string,
): OfficeSubcategory | undefined {
  const module = findOfficeModule(moduleId)
  if (!module) return undefined
  return module.subcategories.find((s) => s.id === subId)
}

export function officeModuleLink(moduleId: string): string {
  return `/office-corporate/${moduleId}`
}

export function officeSubcategoryLink(moduleId: string, subId: string): string {
  return `/office-corporate/${moduleId}/${subId}`
}

export function officeToolsForModule(moduleId: string): Tool[] {
  return OFFICE_TOOLS.filter((t) => officeIndex.get(t.id)?.moduleId === moduleId)
}

export function officeToolsForSubcategory(moduleId: string, subId: string): Tool[] {
  return OFFICE_TOOLS.filter(
    (t) =>
      officeIndex.get(t.id)?.moduleId === moduleId &&
      officeIndex.get(t.id)?.subcategoryId === subId,
  )
}

export function moduleToolCount(moduleId: string): number {
  return officeToolsForModule(moduleId).length
}

export function subcategoryToolCount(moduleId: string, subId: string): number {
  return officeToolsForSubcategory(moduleId, subId).length
}

export function officeToolById(id?: string): OfficeToolInfo | undefined {
  return id ? officeIndex.get(id) : undefined
}