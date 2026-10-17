import {
  asNum,
  asSel,
  asStr,
  docres,
  fmtBytes,
  fmtNum,
  n,
  pctres,
  res,
  sel,
  txt,
  type DevCloudSpec,
} from './devCloudSpec'

export const SUBJECT = 'Database Architecture & SQL'

export const MOD04_SPECS: DevCloudSpec[] = [
  {
    id: 'sql-btree-index-size-estimator',
    name: 'SQL B-Tree Index Disk & RAM Sizer',
    subject: SUBJECT,
    blurb: 'Estimate physical disk footprint and required buffer cache RAM for PostgreSQL and MySQL B-Tree indexes.',
    tip: 'Keep the active "working set" of B-Tree indexes 100% inside RAM buffer pool to avoid disk I/O seek bottlenecks.',
    usage: [
      'Enter total table row count (e.g. 10,000,000 rows).',
      'Select indexed column datatype and fill factor.',
      'Review index size and minimum recommended database RAM.',
    ],
    method: [
      'Index Leaf Page = (Row_Count * (Col_Bytes + 8 bytes tuple overhead)) / Fill_Factor.',
      'Adds 15% intermediate B-Tree node branch overhead.',
    ],
    fields: [
      n('rowCount', 'Total Table Rows', 5000000, 1000, 1000000000, 100000),
      sel('colType', 'Indexed Key Type', ['BIGINT / UUID v4 (8-16 bytes)', 'INT (4 bytes)', 'VARCHAR(64) string (avg 32 bytes)', 'Composite (2x BIGINT, 16 bytes)']),
      n('fillFactor', 'Fill Factor %', 90, 50, 100, 5),
    ],
    compute: (v) => {
      const rows = asNum(v, 'rowCount', 5000000)
      const col = asSel(v, 'colType', 'BIGINT / UUID v4 (8-16 bytes)')
      const fill = asNum(v, 'fillFactor', 90) / 100

      let colBytes = 16
      if (col.startsWith('INT')) colBytes = 4
      else if (col.startsWith('VARCHAR')) colBytes = 36
      else if (col.startsWith('Composite')) colBytes = 24

      // 8 bytes row pointer (ItemPointerData in Postgres)
      const tupleBytes = colBytes + 8
      const rawIndexBytes = (rows * tupleBytes) / fill
      const totalIndexBytes = rawIndexBytes * 1.15 // branch pages

      const ramNeeded = totalIndexBytes * 1.25 // working set buffer

      return [
        res('Estimated Index Size on Disk', fmtBytes(totalIndexBytes), totalIndexBytes > 2 * 1024 * 1024 * 1024 ? 'warn' : 'good'),
        res('Recommended Buffer Pool RAM', fmtBytes(ramNeeded), 'good', 'Keeps 100% of index pages in memory'),
        pctres('B-Tree Page Utilization', `${Math.round(fill * 100)}% Fill Factor`, Math.round(fill * 100), 'good'),
        res('Tuples Processed', `${fmtNum(rows)} indexed rows`, 'neutral'),
      ]
    },
  },
  {
    id: 'database-connection-pool-sizer',
    name: 'Database Connection Pool Sizer (HikariCP Formula)',
    subject: SUBJECT,
    blurb: 'Calculate optimum PostgreSQL / MySQL connection pool size to prevent CPU thread starvation and lock contention.',
    tip: 'Counterintuitively, smaller connection pools (e.g. 10-20 connections) frequently outperform pools of 200+ by eliminating context switching.',
    usage: [
      'Enter database server CPU core count.',
      'Enter disk spindle / SSD concurrent I/O channel count.',
      'View optimum pool size formula result.',
    ],
    method: [
      'Applies the classic PostgreSQL & HikariCP formula: Pool = (CPU_Cores * 2) + Effective_Spindle_Count.',
    ],
    fields: [
      n('cpuCores', 'Database Server CPU Cores', 8, 1, 128, 1),
      sel('storageKind', 'Disk Storage Architecture', ['Fast NVMe SSD (4 effective channels)', 'Cloud EBS / Persistent Disk (2 effective channels)', 'Spinning HDD (1 effective channel)']),
    ],
    compute: (v) => {
      const cores = asNum(v, 'cpuCores', 8)
      const storage = asSel(v, 'storageKind', 'Fast NVMe SSD')

      let spindles = 4
      if (storage.startsWith('Cloud EBS')) spindles = 2
      else if (storage.startsWith('Spinning')) spindles = 1

      const optimalPool = (cores * 2) + spindles
      const maxAppInstances = 4
      const perInstancePool = Math.max(2, Math.floor(optimalPool / maxAppInstances))

      return [
        res('Optimum DB Server Pool', `${optimalPool} maximum connections`, 'good', 'Prevents CPU thread contention'),
        res('Per-App Replica Allocation', `${perInstancePool} connections / app instance`, 'good', `Calculated for ~${maxAppInstances} microservice replicas`),
        res('Core Sizing Multiplier', `${cores * 2} core threads + ${spindles} I/O spindle channels`, 'neutral'),
        pctres('CPU Thread Efficiency', '98% Ideal Saturation', 98, 'good'),
      ]
    },
  },
  {
    id: 'sql-partition-range-generator',
    name: 'SQL Declarative Range Partition DDL Generator',
    subject: SUBJECT,
    blurb: 'Generate declarative partition table DDL for PostgreSQL or MySQL to divide multi-million row time-series tables into manageable chunks.',
    tip: 'Partitioning speeds up analytical queries by partition pruning and makes data purging instant via `DROP TABLE` instead of heavy `DELETE`.',
    usage: [
      'Specify base table name, partition key column, and target year.',
      'Select partition cadence (Monthly vs Quarterly).',
      'Copy production DDL script with automated constraints.',
    ],
    method: [
      'Generates PostgreSQL 11+ `PARTITION BY RANGE` schema with child partition tables.',
    ],
    fields: [
      txt('tableName', 'Base Table Name', 'audit_logs', 1),
      txt('partKey', 'Partition Key Column', 'created_at', 1),
      sel('cadence', 'Partition Interval Cadence', ['Monthly Partitions (12 tables / year)', 'Quarterly Partitions (4 tables / year)']),
      n('year', 'Target Calendar Year', 2025, 2020, 2035, 1),
    ],
    compute: (v) => {
      const table = asStr(v, 'tableName', 'logs').replace(/[^a-zA-Z0-9_]/g, '') || 'logs'
      const col = asStr(v, 'partKey', 'created_at').replace(/[^a-zA-Z0-9_]/g, '') || 'created_at'
      const cadence = asSel(v, 'cadence', 'Monthly Partitions')
      const year = asNum(v, 'year', 2025)

      let ddl = `-- 1. Master Partition Table\nCREATE TABLE ${table} (\n  id BIGSERIAL,\n  tenant_id UUID NOT NULL,\n  ${col} TIMESTAMPTZ NOT NULL,\n  payload JSONB\n) PARTITION BY RANGE (${col});\n\n-- 2. Range Partitions for ${year}\n`

      if (cadence.startsWith('Monthly')) {
        for (let m = 1; m <= 12; m++) {
          const mStr = String(m).padStart(2, '0')
          const nextYear = m === 12 ? year + 1 : year
          const nextMStr = m === 12 ? '01' : String(m + 1).padStart(2, '0')
          ddl += `CREATE TABLE ${table}_y${year}m${mStr} PARTITION OF ${table}\n` +
            `  FOR VALUES FROM ('${year}-${mStr}-01 00:00:00+00') TO ('${nextYear}-${nextMStr}-01 00:00:00+00');\n`
        }
      } else {
        const quarters = [
          { q: 'q1', s: `${year}-01-01`, e: `${year}-04-01` },
          { q: 'q2', s: `${year}-04-01`, e: `${year}-07-01` },
          { q: 'q3', s: `${year}-07-01`, e: `${year}-10-01` },
          { q: 'q4', s: `${year}-10-01`, e: `${year + 1}-01-01` },
        ]
        for (const q of quarters) {
          ddl += `CREATE TABLE ${table}_${year}_${q.q} PARTITION OF ${table}\n` +
            `  FOR VALUES FROM ('${q.s} 00:00:00+00') TO ('${q.e} 00:00:00+00');\n`
        }
      }

      return [
        res('Target Base Table', table, 'good'),
        res('Cadence', cadence, 'neutral'),
        res('Partition Key', col, 'neutral'),
        docres('Generated Partition DDL Script', ddl, `PostgreSQL 11+ RANGE syntax for ${year}`),
      ]
    },
  },
]
