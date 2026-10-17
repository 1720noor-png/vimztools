import {
  asNum,
  fmtBytes,
  fmtNum,
  n,
  pctres,
  res,
  type CyberSpec,
} from './cyberSpec'

export const SUBJECT = 'Zero-Knowledge & Privacy Protocols'

export const MOD08_SPECS: CyberSpec[] = [
  {
    id: 'shamir-secret-sharing-threshold-sizer',
    name: 'Shamir Secret Sharing (k-of-n) Threshold Sizer',
    subject: SUBJECT,
    blurb: 'Calculate polynomial degree, share distribution, and information-theoretic privacy guarantees for Shamir Secret Sharing schemes.',
    tip: 'Any $k-1$ shares reveal zero information about the secret, mathematically guaranteed by Lagrange polynomial interpolation over finite fields.',
    usage: [
      'Enter total authorized custodians / share recipients ($n$).',
      'Enter minimum threshold of shares required to reconstruct the secret ($k$).',
      'Inspect polynomial degree, collusion tolerance, and quorum safety.',
    ],
    method: [
      'Polynomial degree = $k - 1$.',
      'Tolerated rogue shares (collusion resistance) = $k - 1$.',
      'Tolerated lost shares (resilience) = $n - k$.',
    ],
    fields: [
      n('totalShares', 'Total Custodians (n)', 5, 2, 50, 1),
      n('threshold', 'Reconstruction Threshold (k)', 3, 2, 50, 1),
    ],
    compute: (v) => {
      const nTotal = asNum(v, 'totalShares', 5)
      const k = Math.min(nTotal, asNum(v, 'threshold', 3))

      const polynomialDegree = k - 1
      const rogueCollusionTolerated = k - 1
      const lostSharesTolerated = nTotal - k

      return [
        res('Threshold Scheme', `${k}-of-${nTotal} Shamir Threshold`, 'good', `Requires any ${k} of ${nTotal} parts`),
        res('Polynomial Degree', `Degree ${polynomialDegree} polynomial in GF(2^256)`, 'neutral'),
        res('Loss Fault Tolerance', `${lostSharesTolerated} lost share${lostSharesTolerated > 1 ? 's' : ''}`, 'good', `Secret recoverable if ${lostSharesTolerated} shares are destroyed`),
        res('Collusion Resistance', `${rogueCollusionTolerated} rogue custodians`, 'good', 'Zero data leaked with fewer than k shares'),
        pctres('Quorum Resilience', `${Math.round((k / nTotal) * 100)}% Quorum`, Math.round((k / nTotal) * 100), 'good'),
      ]
    },
  },
  {
    id: 'merkle-tree-inclusion-proof-sizer',
    name: 'Merkle Tree Inclusion Proof & Audit Path Sizer',
    subject: SUBJECT,
    blurb: 'Calculate Merkle tree depth, logarithmic proof size, and cryptographic verification overhead for zero-knowledge proofs and blockchain state audits.',
    tip: 'Merkle proofs allow proving membership in a dataset of 1,000,000,000 items with only 30 hash operations and under 1 KB of bandwidth.',
    usage: [
      'Enter total leaves / records in the cryptographic tree.',
      'Review tree depth, proof hashes count, and wire size in bytes.',
      'Compare audit proof efficiency against full dataset verification.',
    ],
    method: [
      'Tree Depth = ceil(log2(Leaves)).',
      'Proof Size = Depth * 32 bytes (SHA-256 hash length).',
    ],
    fields: [
      n('leaves', 'Total Dataset Leaves / Records', 1000000, 2, 10000000000, 10000),
    ],
    compute: (v) => {
      const leaves = asNum(v, 'leaves', 1000000)

      const depth = Math.ceil(Math.log2(leaves))
      const proofHashes = depth
      const proofBytes = proofHashes * 32 // 32 bytes per SHA-256 hash
      const fullDatasetMb = (leaves * 256) / (1024 * 1024) // assuming avg 256 byte record

      const compressionRatio = Math.round((1 - (proofBytes / (fullDatasetMb * 1024 * 1024))) * 100)

      return [
        res('Tree Depth', `${depth} levels`, 'good', `Binary balanced tree for ${fmtNum(leaves)} leaves`),
        res('Inclusion Proof Size', `${proofBytes} bytes (${proofHashes} hashes)`, 'good', 'Extremely compact logarithmic proof'),
        pctres('Bandwidth Efficiency', `${compressionRatio}% Reduction`, compressionRatio, 'good'),
        res('Full Dataset Size', fmtBytes(fullDatasetMb * 1024 * 1024), 'neutral', 'Saved by verifying with Merkle branch'),
      ]
    },
  },
]
