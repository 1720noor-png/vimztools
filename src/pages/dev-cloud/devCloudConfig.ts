import type { LucideIcon } from 'lucide-react'
import {
  Activity,
  Binary,
  Boxes,
  CheckCircle2,
  Cloud,
  Cpu,
  Database,
  GitBranch,
  Globe,
  KeyRound,
  Layers,
  Layout,
  Network,
  Repeat,
  Search,
  Server,
  ShieldCheck,
  Smartphone,
  Terminal,
  Zap,
} from 'lucide-react'
import type { Tool } from '../../lib/catalog'
import { devCloudSpecs } from './specs'

export interface DevCloudSubcategory {
  id: string
  title: string
  tagline: string
  description: string
  icon: LucideIcon
  accent: string
  toolIds: string[]
}

export const DEV_CLOUD_CATEGORY = 'dev-cloud'
export const DEV_CLOUD_CATEGORY_NAME = 'Developer Ecosystem, Cloud & DevOps'

export const devCloudSubcategories: DevCloudSubcategory[] = [
  {
    id: 'api-webhooks',
    title: 'API & Webhook Engineering',
    tagline: 'Client syntax generation, HMAC signing & breaking change detection',
    description: 'Transform cURL into Fetch/Requests code, verify HMAC-SHA256 signatures, and inspect breaking API changes.',
    icon: Globe,
    accent: '#06B6D4',
    toolIds: ['curl-to-fetch-python-converter', 'webhook-hmac-signature-builder', 'api-payload-diff-inspector'],
  },
  {
    id: 'schema-serialization',
    title: 'Data Serialization & Schemas',
    tagline: 'Type generation, wire size benchmarking & schema validation',
    description: 'Generate strongly-typed TypeScript definitions and benchmark Protobuf and MessagePack serialization.',
    icon: Binary,
    accent: '#06B6D4',
    toolIds: ['json-to-typescript-interface-generator', 'protobuf-binary-overhead-sizer'],
  },
  {
    id: 'containers-orchestration',
    title: 'Containers & Orchestration',
    tagline: 'Multi-stage Dockerfile slimming & Kubernetes resource sizing',
    description: 'Optimize Docker layer caching and size Pod CPU/memory requests and limits with safety headroom.',
    icon: Layers,
    accent: '#06B6D4',
    toolIds: ['dockerfile-slimming-optimizer', 'kubernetes-resource-limits-sizer'],
  },
  {
    id: 'database-sql',
    title: 'Database Architecture & SQL',
    tagline: 'B-Tree index footprint, connection pool & range partition sizing',
    description: 'Estimate physical B-Tree index RAM, size connection pools using the HikariCP formula, and generate partition DDL.',
    icon: Database,
    accent: '#06B6D4',
    toolIds: ['sql-btree-index-size-estimator', 'database-connection-pool-sizer', 'sql-partition-range-generator'],
  },
  {
    id: 'git-cicd',
    title: 'Git Workflows & CI/CD Pipelines',
    tagline: 'SemVer release calculation & GitHub Actions runner billing',
    description: 'Compute next Semantic Version numbers and audit monthly GitHub Actions CI runner minute billing.',
    icon: GitBranch,
    accent: '#06B6D4',
    toolIds: ['semver-release-version-calculator', 'github-actions-runner-minutes-budgeter'],
  },
  {
    id: 'networking-dns',
    title: 'Networking, DNS & CIDR',
    tagline: 'IPv4/IPv6 CIDR subnet masks & RFC 1035 zone file records',
    description: 'Calculate network bounds, broadcast, and usable host ranges, and build RFC 1035 BIND zone files.',
    icon: Network,
    accent: '#06B6D4',
    toolIds: ['ipv4-ipv6-cidr-subnet-calculator', 'dns-record-zone-file-builder'],
  },
  {
    id: 'security-headers',
    title: 'Web Security & HTTP Headers',
    tagline: 'Content Security Policy (CSP) & CORS origin hardening',
    description: 'Build hardened Content Security Policy headers and format production CORS origin and preflight rules.',
    icon: ShieldCheck,
    accent: '#06B6D4',
    toolIds: ['content-security-policy-csp-builder', 'cors-origin-rule-validator'],
  },
  {
    id: 'web-performance',
    title: 'Core Web Vitals & Web Performance',
    tagline: 'LCP/INP/CLS evaluation & Brotli vs Gzip compression modeling',
    description: 'Assess 75th-percentile Core Web Vitals against Google search thresholds and simulate asset compression.',
    icon: Zap,
    accent: '#06B6D4',
    toolIds: ['core-web-vitals-lcp-inp-cls-calculator', 'brotli-gzip-compression-ratio-simulator'],
  },
  {
    id: 'webassembly-binary',
    title: 'WebAssembly & Low-Level Byte Math',
    tagline: 'Wasm memory pages sizing & canonical hex dump inspection',
    description: 'Calculate 64 KiB Wasm linear memory pages and inspect raw binary byte strings in canonical hexdump format.',
    icon: Cpu,
    accent: '#06B6D4',
    toolIds: ['wasm-binary-module-size-estimator', 'hex-dump-to-ascii-byte-inspector'],
  },
  {
    id: 'cloud-finops',
    title: 'Cloud FinOps & Infrastructure Sizing',
    tagline: 'Multi-cloud egress fee arbitrage & AWS S3 lifecycle tiers',
    description: 'Model cloud egress bandwidth line items across AWS, Azure, and GCP, and model S3 tier lifecycle savings.',
    icon: Cloud,
    accent: '#06B6D4',
    toolIds: ['multi-cloud-egress-cost-estimator', 'aws-s3-tier-transition-planner'],
  },
  {
    id: 'microservices-messaging',
    title: 'Microservices & Event Messaging',
    tagline: 'Kafka partition sizing & circuit breaker failure thresholds',
    description: 'Size Apache Kafka consumer groups for burst throughput and tune microservice circuit breaker sliding windows.',
    icon: Repeat,
    accent: '#06B6D4',
    toolIds: ['kafka-partition-consumer-group-sizer', 'circuit-breaker-threshold-tuner'],
  },
  {
    id: 'linux-sysadmin',
    title: 'Linux Systems & Shell Operations',
    tagline: 'Chmod octal permissions & production Systemd service units',
    description: 'Calculate POSIX file permissions in octal/symbolic formats and generate hardened systemd `.service` files.',
    icon: Terminal,
    accent: '#06B6D4',
    toolIds: ['chmod-octal-symbolic-permission-generator', 'systemd-service-unit-generator'],
  },
  {
    id: 'frontend-rendering',
    title: 'Frontend Architecture & Rendering',
    tagline: 'Hydration CPU overhead & Vite bundle manual chunk splitting',
    description: 'Compare SSR vs SSG vs Islands hydration costs and plan vendor manual chunks to prevent mega-bundle warnings.',
    icon: Layout,
    accent: '#06B6D4',
    toolIds: ['hydration-budget-rendering-strategy-planner', 'bundle-chunk-splitting-budgeter'],
  },
  {
    id: 'graphql-grpc',
    title: 'Modern API Protocols',
    tagline: 'GraphQL query depth protection & gRPC HTTP/2 multiplexing',
    description: 'Analyze GraphQL query nesting depth to stop DoS attacks and calculate gRPC HTTP/2 framing savings.',
    icon: Server,
    accent: '#06B6D4',
    toolIds: ['graphql-query-depth-complexity-limiter', 'grpc-http2-frame-overhead-sizer'],
  },
  {
    id: 'auth-identity',
    title: 'Identity & Access Management',
    tagline: 'OAuth2 PKCE S256 code challenge & JWT claim expiration auditor',
    description: 'Generate RFC 7636 PKCE code challenges for SPAs and inspect JWT payload claims with real-time expiration countdown.',
    icon: KeyRound,
    accent: '#06B6D4',
    toolIds: ['oauth2-pkce-verifier-challenge-generator', 'jwt-claim-decoder-expiry-auditor'],
  },
  {
    id: 'observability-logging',
    title: 'Observability & Log Management',
    tagline: 'Log ingest GB/day bill forecasting & OpenTelemetry trace sampling',
    description: 'Calculate log ingestion volume across Datadog/CloudWatch and size tail-based distributed trace sampling.',
    icon: Activity,
    accent: '#06B6D4',
    toolIds: ['log-volume-gb-day-indexing-cost-calculator', 'opentelemetry-trace-sampling-budgeter'],
  },
  {
    id: 'mobile-pwa',
    title: 'Mobile & Progressive Web Apps',
    tagline: 'W3C manifest.json generation & offline CacheStorage budget sizer',
    description: 'Build installable Progressive Web App manifests and size offline Service Worker cache budgets for mobile Safari.',
    icon: Smartphone,
    accent: '#06B6D4',
    toolIds: ['pwa-web-manifest-generator', 'service-worker-cache-budget-sizer'],
  },
  {
    id: 'code-quality-refactoring',
    title: 'Code Quality & Complexity',
    tagline: 'McCabe cyclomatic complexity & tech debt velocity drag sizer',
    description: 'Scan code functions for branching decision complexity and model the financial drag of engineering technical debt.',
    icon: CheckCircle2,
    accent: '#06B6D4',
    toolIds: ['cyclomatic-complexity-estimator', 'technical-debt-interest-calculator'],
  },
  {
    id: 'regex-lexing',
    title: 'RegEx, Parsing & Tokenizers',
    tagline: 'ReDoS catastrophic backtracking & string tokenizer throughput',
    description: 'Detect exponential regular expression backtracking vulnerabilities and benchmark high-throughput string tokenizers.',
    icon: Search,
    accent: '#06B6D4',
    toolIds: ['regex-redos-vulnerability-evaluator', 'string-tokenization-benchmark-sizer'],
  },
  {
    id: 'distributed-consensus',
    title: 'Distributed Systems & Fault Tolerance',
    tagline: 'Raft/Paxos quorum majority & CAP theorem architecture matrix',
    description: 'Calculate consensus quorum thresholds for etcd/ZooKeeper and map CP vs AP database trade-offs.',
    icon: Boxes,
    accent: '#06B6D4',
    toolIds: ['raft-paxos-quorum-cluster-sizer', 'cap-theorem-tradeoff-matrix-evaluator'],
  },
]

export function findDevCloudSubcategory(id: string): DevCloudSubcategory | undefined {
  return devCloudSubcategories.find((s) => s.id === id)
}

export const DEV_CLOUD_TOOLS: Tool[] = devCloudSpecs.map((spec) => {
  const sub = devCloudSubcategories.find((s) => s.toolIds.includes(spec.id))
  return {
    id: spec.id,
    name: spec.name,
    categoryId: DEV_CLOUD_CATEGORY,
    category: DEV_CLOUD_CATEGORY_NAME,
    description: spec.blurb,
    keywords: [
      'developer',
      'devops',
      'cloud',
      'engineering',
      ...(sub ? [sub.id, sub.title.toLowerCase()] : []),
      ...spec.name.toLowerCase().split(/\s+/),
    ],
    path: `/dev-cloud/${sub?.id ?? 'general'}/${spec.id}`,
    icon: 'Terminal',
    subcategory: spec.subject,
  }
})
