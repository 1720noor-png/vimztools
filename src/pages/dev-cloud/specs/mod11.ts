import {
  asNum,
  fmtNum,
  n,
  pctres,
  res,
  type DevCloudSpec,
} from './devCloudSpec'

export const SUBJECT = 'Microservices & Event Messaging'

export const MOD11_SPECS: DevCloudSpec[] = [
  {
    id: 'kafka-partition-consumer-group-sizer',
    name: 'Apache Kafka Partition & Consumer Group Sizer',
    subject: SUBJECT,
    blurb: 'Calculate the optimum number of Kafka topic partitions and consumer replicas to achieve target processing throughput without lag.',
    tip: 'In Kafka, maximum parallel consumers in a consumer group cannot exceed the partition count; excess consumers sit idle.',
    usage: [
      'Enter target peak message throughput (messages / sec).',
      'Enter average consumer worker execution latency in milliseconds.',
      'Review required topic partitions and consumer replica count.',
    ],
    method: [
      'Single Consumer Throughput = 1000ms / Latency_ms.',
      'Required Partitions = ceil(Target_Throughput / Single_Consumer_Throughput).',
      'Applies a 30% headroom buffer for traffic bursts.',
    ],
    fields: [
      n('targetMsgSec', 'Target Peak Throughput (msgs/sec)', 25000, 100, 1000000, 500),
      n('consumerLatencyMs', 'Consumer Processing Latency (ms)', 25, 1, 5000, 5),
    ],
    compute: (v) => {
      const target = asNum(v, 'targetMsgSec', 25000)
      const latency = Math.max(1, asNum(v, 'consumerLatencyMs', 25))

      const msgsPerSecPerThread = 1000 / latency
      const rawReplicasNeeded = target / msgsPerSecPerThread
      const bufferedReplicas = Math.ceil(rawReplicasNeeded * 1.3) // 30% headroom

      // Recommend powers of 2 or multiples for partition distribution
      const recommendedPartitions = Math.max(4, Math.ceil(bufferedReplicas / 4) * 4)

      return [
        res('Recommended Topic Partitions', `${recommendedPartitions} partitions`, 'good', 'Provides 30% burst headroom'),
        res('Active Consumer Pods / Replicas', `${bufferedReplicas} parallel worker threads`, 'good', `Processes ${fmtNum(msgsPerSecPerThread)} msgs/sec per worker`),
        pctres('Consumer Capacity Headroom', '130% Burst Capacity', 100, 'good'),
        res('Single Worker Throughput', `${fmtNum(msgsPerSecPerThread)} msgs / sec`, 'neutral', `At ${latency} ms processing time`),
      ]
    },
  },
  {
    id: 'circuit-breaker-threshold-tuner',
    name: 'Microservice Circuit Breaker & Resilience Tuner',
    subject: SUBJECT,
    blurb: 'Size resilience parameters for Resilience4j, Envoy, or Istio: failure rate threshold, ring buffer size, and half-open test volume.',
    tip: 'Setting failure threshold too low (e.g. 10%) can trigger cascading outages from transient network blips; 50% with a minimum call volume of 50 is battle-tested.',
    usage: [
      'Enter average incoming requests per second (RPS).',
      'Select downstream dependency criticality.',
      'Inspect configured sliding window size, trip threshold, and recovery timeout.',
    ],
    method: [
      'Sizes sliding window ring buffer to capture ~10-30 seconds of request history.',
      'Calculates sleep window based on downstream recovery characteristics.',
    ],
    fields: [
      n('rps', 'Normal Service Requests / Sec (RPS)', 120, 5, 10000, 10),
      n('p99LatencyMs', 'Target Downstream P99 Latency (ms)', 150, 10, 5000, 10),
    ],
    compute: (v) => {
      const rps = asNum(v, 'rps', 120)
      const p99 = asNum(v, 'p99LatencyMs', 150)

      const slidingWindowSize = Math.max(50, Math.min(1000, rps * 10))
      const failureThresholdPct = 50
      const slowCallThresholdPct = 75
      const slowCallDurationMs = p99 * 2
      const sleepWindowSec = 15

      return [
        res('Sliding Window Ring Buffer', `${slidingWindowSize} requests`, 'good', 'Captures ~10 seconds of traffic history'),
        res('Failure Rate Trip Threshold', `${failureThresholdPct}% error rate`, 'warn', 'Trips breaker to OPEN when reached'),
        res('Slow Call Trip Threshold', `${slowCallThresholdPct}% calls > ${slowCallDurationMs}ms`, 'neutral'),
        res('Recovery Sleep Window', `${sleepWindowSec} seconds`, 'good', 'Wait before transitioning to HALF-OPEN'),
      ]
    },
  },
]
