import {
  asSel,
  pctres,
  res,
  sel,
  type DevCloudSpec,
} from './devCloudSpec'

export const SUBJECT = 'Distributed Systems & Fault Tolerance'

export const MOD20_SPECS: DevCloudSpec[] = [
  {
    id: 'raft-paxos-quorum-cluster-sizer',
    name: 'Raft / Paxos Consensus Quorum & Fault Tolerance Sizer',
    subject: SUBJECT,
    blurb: 'Calculate quorum majorities, tolerated node failures, and split-brain resistance for consensus clusters (etcd, Consul, ZooKeeper).',
    tip: 'Always deploy odd numbers of nodes (3, 5, or 7). A 4-node cluster tolerates the exact same number of failures (1) as a 3-node cluster, but with higher network overhead.',
    usage: [
      'Select total consensus cluster node count (3, 5, 7, or 9).',
      'Select cloud region distribution topology.',
      'Inspect required quorum count and maximum simultaneous node failures.',
    ],
    method: [
      'Quorum majority formula: Q = floor(N / 2) + 1.',
      'Fault tolerance: F = floor((N - 1) / 2).',
    ],
    fields: [
      sel('nodeCount', 'Consensus Cluster Size', ['3 Nodes (Standard HA)', '5 Nodes (High Resilience / Large Fleets)', '7 Nodes (Mission-Critical Multi-Datacenter)', '4 Nodes (Even count - Antipattern)']),
      sel('topology', 'Datacenter / Availability Zone Topology', ['3 Availability Zones (AZs) in 1 Region', '2 AZs + 1 Arbiter Witness', 'Multi-Region Global Cluster']),
    ],
    compute: (v) => {
      const nodeStr = asSel(v, 'nodeCount', '3 Nodes')
      const topo = asSel(v, 'topology', '3 AZs')

      let n = 3
      if (nodeStr.startsWith('5')) n = 5
      else if (nodeStr.startsWith('7')) n = 7
      else if (nodeStr.startsWith('4')) n = 4

      const quorum = Math.floor(n / 2) + 1
      const faultTolerated = Math.floor((n - 1) / 2)
      const isEven = n % 2 === 0

      return [
        res('Required Quorum Majority', `${quorum} of ${n} nodes`, 'good', 'Votes required to commit transactions'),
        res('Max Tolerated Node Failures', `${faultTolerated} node${faultTolerated > 1 ? 's' : ''}`, isEven ? 'warn' : 'good', `Cluster survives ${faultTolerated} dead nodes without outage`),
        res('Split-Brain Protection', isEven ? 'Weak (Risk of tie in network partitions)' : 'Guaranteed 100% Split-Brain Proof', isEven ? 'bad' : 'good'),
        pctres('Availability Resilience', isEven ? '65% (Even Antipattern)' : `${Math.round(((n - faultTolerated) / n) * 100)}% Resilience`, isEven ? 65 : 95, isEven ? 'warn' : 'good'),
        res('Recommended Topology', topo, 'neutral'),
      ]
    },
  },
  {
    id: 'cap-theorem-tradeoff-matrix-evaluator',
    name: 'CAP Theorem Architecture Tradeoff Evaluator',
    subject: SUBJECT,
    blurb: 'Map architectural requirements across Consistency (C), Availability (A), and Partition Tolerance (P) to determine CP vs AP database fitness.',
    tip: 'Network partitions (P) are unavoidable in distributed cloud networks; systems must explicitly choose between CP (e.g. Postgres, Spanner) and AP (e.g. DynamoDB, Cassandra).',
    usage: [
      'Select business priority during network split (Prevent stale reads vs Never return 500 errors).',
      'Select write consistency requirement.',
      'Inspect optimal CAP classification and recommended datastore technologies.',
    ],
    method: [
      'Applies Brewer\'s CAP theorem and PACELC trade-off theorems.',
    ],
    fields: [
      sel('partitionBehavior', 'Behavior During Network Partition', ['Strict Consistency: Reject writes if unsure (CP system)', 'High Availability: Always accept writes, sync later (AP system)']),
      sel('readModel', 'Read Latency vs Freshness', ['Linearizable / Strong Reads (Immediate freshness)', 'Eventual Consistency (Sub-5ms local reads, microsecond lag)']),
    ],
    compute: (v) => {
      const part = asSel(v, 'partitionBehavior', 'Strict Consistency')
      const read = asSel(v, 'readModel', 'Linearizable')

      const isCp = part.startsWith('Strict')
      const arch = isCp ? 'CP (Consistent & Partition Tolerant)' : 'AP (Available & Partition Tolerant)'

      const dbs = isCp
        ? 'PostgreSQL (Patroni), Google Cloud Spanner, CockroachDB, etcd, MongoDB (majority write)'
        : 'Amazon DynamoDB, Apache Cassandra, Couchbase, ScyllaDB, Riak'

      return [
        res('Target CAP Classification', arch, 'good', isCp ? 'Prioritizes data correctness' : 'Prioritizes zero-downtime uptime'),
        res('Read Model Consistency', read.split(' ')[0], 'neutral'),
        res('Recommended Datastores', dbs, 'neutral'),
        pctres('Data Freshness Guarantee', isCp ? '100% Strong Consistency' : 'Eventual Consistency (~99.9%)', isCp ? 100 : 85, 'good'),
        res('Tradeoff Incurred', isCp ? 'Potential HTTP 503 / timeouts during cross-datacenter fiber cuts' : 'Temporary dirty reads across replica lag windows', isCp ? 'warn' : 'neutral'),
      ]
    },
  },
]
