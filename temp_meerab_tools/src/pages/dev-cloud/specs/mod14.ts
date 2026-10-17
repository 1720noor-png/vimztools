import {
  asNum,
  asStr,
  docres,
  fmtBytes,
  fmtNum,
  n,
  pctres,
  res,
  txt,
  type DevCloudSpec,
} from './devCloudSpec'

export const SUBJECT = 'Modern API Protocols'

export const MOD14_SPECS: DevCloudSpec[] = [
  {
    id: 'graphql-query-depth-complexity-limiter',
    name: 'GraphQL Query Depth & DoS Complexity Limiter',
    subject: SUBJECT,
    blurb: 'Calculate the nesting depth and AST field complexity score of a GraphQL query to protect servers against exponential DoS amplification attacks.',
    tip: 'Enforce a maximum query depth of 5 to 7 in production; malicious actors can nest cyclic queries like `user { friends { friends { friends }}}` to crash databases.',
    usage: [
      'Paste your GraphQL query document.',
      'Review calculated maximum nesting depth and field count.',
      'Inspect security risk verdict and recommended server depth limit.',
    ],
    method: [
      'Tokenizes query braces `{` and `}` to compute max depth.',
      'Tallies total requested fields and applies depth-weighted complexity scoring.',
    ],
    fields: [
      txt('query', 'GraphQL Query Document', 'query GetUserProfile {\n  user(id: "usr_99") {\n    id\n    name\n    email\n    orders {\n      id\n      total\n      items {\n        id\n        product {\n          title\n          price\n        }\n      }\n    }\n  }\n}', 8),
    ],
    compute: (v) => {
      const q = asStr(v, 'query', '')

      let currentDepth = 0
      let maxDepth = 0
      let fieldCount = 0

      const lines = q.split('\n')
      for (const line of lines) {
        const trimmed = line.trim()
        if (trimmed.startsWith('#')) continue

        for (const char of trimmed) {
          if (char === '{') {
            currentDepth++
            if (currentDepth > maxDepth) maxDepth = currentDepth
          } else if (char === '}') {
            if (currentDepth > 0) currentDepth--
          }
        }

        const words = trimmed.replace(/[{}(),:]/g, ' ').split(/\s+/).filter(Boolean)
        fieldCount += words.filter((w) => !['query', 'mutation', 'subscription', 'fragment', 'on'].includes(w)).length
      }

      // Depth 1 is operation root, so nesting depth is maxDepth - 1
      const effectiveDepth = Math.max(1, maxDepth - 1)
      const complexityScore = effectiveDepth * 3 + fieldCount

      const isDangerous = effectiveDepth > 6 || complexityScore > 100
      const tone = isDangerous ? 'bad' : effectiveDepth >= 4 ? 'warn' : 'good'

      return [
        res('Nesting Depth', `${effectiveDepth} levels`, tone, isDangerous ? 'Dangerously deep nesting' : 'Within normal query limits'),
        res('Total Fields Requested', `${fieldCount} fields`, 'neutral'),
        res('Complexity Cost Score', `${complexityScore} points`, tone, 'Field weighted complexity'),
        res('Query Security Verdict', isDangerous ? 'Reject (Exceeds Max Depth)' : 'Approved for Execution', tone),
        docres('Server Protection Rule', `// graphql-depth-limit middleware\nconst depthLimit = require('graphql-depth-limit');\napp.use('/graphql', graphqlHTTP({\n  validationRules: [depthLimit(6)]\n}));`, 'Drop into Express / Apollo Server'),
      ]
    },
  },
  {
    id: 'grpc-http2-frame-overhead-sizer',
    name: 'gRPC HTTP/2 Framing & Multiplexing Sizer',
    subject: SUBJECT,
    blurb: 'Simulate connection reuse and HTTP/2 binary frame overhead for high-concurrency microservice RPC communications.',
    tip: 'HTTP/2 multiplexes hundreds of concurrent RPC streams over a single TCP connection, eliminating costly TCP three-way handshakes and TLS renegotiation.',
    usage: [
      'Enter concurrent RPC requests per second.',
      'Enter average request payload size in bytes.',
      'Compare TCP connection counts and TLS handshake savings.',
    ],
    method: [
      'HTTP/1.1 requires 1 TCP connection per concurrent in-flight request.',
      'gRPC / HTTP/2 shares a single persistent TLS connection across all streams.',
    ],
    fields: [
      n('concurrency', 'Concurrent In-Flight RPC Calls', 250, 10, 10000, 25),
      n('payloadBytes', 'Average Payload Size (Bytes)', 800, 50, 100000, 50),
    ],
    compute: (v) => {
      const conc = asNum(v, 'concurrency', 250)
      const bytes = asNum(v, 'payloadBytes', 800)

      const http1Connections = conc
      const grpcConnections = Math.max(1, Math.ceil(conc / 200)) // Max 200 streams / connection recommended

      const tlsHandshakeSaved = http1Connections - grpcConnections
      // TLS 1.3 handshake ~5KB per handshake + 1 RTT
      const handshakeBandwidthSaved = tlsHandshakeSaved * 5120

      return [
        res('gRPC TCP Connections', `${grpcConnections} persistent TCP sockets`, 'good', 'Multiplexed HTTP/2 streams'),
        res('Legacy HTTP/1.1 Sockets', `${http1Connections} separate TCP connections`, 'warn', 'Prone to connection pool exhaustion'),
        pctres('Socket Reduction Ratio', `${Math.round(((http1Connections - grpcConnections) / http1Connections) * 100)}% Fewer Sockets`, Math.round(((http1Connections - grpcConnections) / http1Connections) * 100), 'good'),
        res('TLS Handshake Data Saved', fmtBytes(handshakeBandwidthSaved), 'good', `Eliminates ${fmtNum(tlsHandshakeSaved)} TLS handshakes`),
        res('Average RPC Payload', `${fmtBytes(bytes)} / call`, 'neutral'),
      ]
    },
  },
]
