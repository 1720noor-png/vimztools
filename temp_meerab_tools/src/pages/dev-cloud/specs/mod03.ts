import {
  asNum,
  asSel,
  asStr,
  docres,
  n,
  res,
  sel,
  txt,
  type DevCloudSpec,
} from './devCloudSpec'

export const SUBJECT = 'Containers & Orchestration'

export const MOD03_SPECS: DevCloudSpec[] = [
  {
    id: 'dockerfile-slimming-optimizer',
    name: 'Dockerfile Layer & Multi-Stage Slimming Optimizer',
    subject: SUBJECT,
    blurb: 'Detect bloated base images, redundant apt caches, uncombined RUN layers, and generate a slim production multi-stage Dockerfile.',
    tip: 'Combine package installation with `rm -rf /var/lib/apt/lists/*` in a single RUN command to avoid persisting cache in image layers.',
    usage: [
      'Select your application runtime (Node.js, Python, Go, Rust).',
      'Paste your draft or legacy Dockerfile.',
      'Copy the optimized multi-stage production Dockerfile.',
    ],
    method: [
      'Identifies missing `.dockerignore` candidates, build tools left in final image, and unpinned base tags.',
      'Generates builder -> runner distroless or alpine multi-stage architecture.',
    ],
    fields: [
      sel('runtime', 'Application Runtime', ['Node.js (TypeScript / Vite / Next)', 'Python (FastAPI / Flask)', 'Go (Golang binary)', 'Rust (Cargo)']),
      txt('dockerfileInput', 'Draft Dockerfile', 'FROM node:20\nWORKDIR /app\nCOPY . .\nRUN npm install\nRUN npm run build\nEXPOSE 3000\nCMD ["npm", "start"]'),
    ],
    compute: (v) => {
      const rt = asSel(v, 'runtime', 'Node.js (TypeScript / Vite / Next)')
      const input = asStr(v, 'dockerfileInput', '')

      const findings: string[] = []
      if (input.includes('node:latest') || input.includes('python:latest') || !input.match(/:\d+/)) {
        findings.push('Unpinned latest base image detected')
      }
      if (input.match(/RUN npm install(?!\s+--production)/) && !input.includes('npm ci')) {
        findings.push('Prefer `npm ci` over `npm install` for deterministic container builds')
      }
      if (input.includes('COPY . .') && !input.includes('COPY package*.json')) {
        findings.push('Cache busting: Copy dependencies manifest before copying all source code')
      }
      if (!input.includes('AS builder') && !input.includes('as builder')) {
        findings.push('Single stage build leaves devDependencies and build tools in image')
      }

      let optimized = ''
      if (rt.startsWith('Node')) {
        optimized = `# Stage 1: Build dependencies\nFROM node:20-alpine AS builder\nWORKDIR /app\nCOPY package*.json ./\nRUN npm ci\nCOPY . .\nRUN npm run build\n\n# Stage 2: Minimal Production Runtime\nFROM node:20-alpine AS runner\nWORKDIR /app\nENV NODE_ENV=production\nUSER node\nCOPY --from=builder /app/package*.json ./\nCOPY --from=builder /app/node_modules ./node_modules\nCOPY --from=builder /app/dist ./dist\nEXPOSE 3000\nCMD ["node", "dist/index.js"]`
      } else if (rt.startsWith('Python')) {
        optimized = `# Stage 1: Builder\nFROM python:3.12-slim AS builder\nWORKDIR /app\nRUN apt-get update && apt-get install -y --no-install-recommends gcc && rm -rf /var/lib/apt/lists/*\nCOPY requirements.txt .\nRUN pip install --no-cache-dir --user -r requirements.txt\n\n# Stage 2: Runner\nFROM python:3.12-slim\nWORKDIR /app\nRUN useradd -m appuser && chown -R appuser /app\nUSER appuser\nCOPY --from=builder /root/.local /home/appuser/.local\nCOPY . .\nENV PATH=/home/appuser/.local/bin:$PATH\nEXPOSE 8000\nCMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]`
      } else {
        optimized = `# Stage 1: Compile\nFROM golang:1.23-alpine AS builder\nWORKDIR /src\nCOPY go.mod go.sum ./\nRUN go mod download\nCOPY . .\nRUN CGO_ENABLED=0 GOOS=linux go build -ldflags="-s -w" -o /bin/server .\n\n# Stage 2: Scratch Distroless\nFROM scratch\nCOPY --from=builder /bin/server /server\nEXPOSE 8080\nENTRYPOINT ["/server"]`
      }

      const issuesCount = findings.length
      const tone = issuesCount === 0 ? 'good' : issuesCount <= 2 ? 'warn' : 'bad'

      return [
        res('Optimization Score', issuesCount === 0 ? '100% Production Ready' : `${issuesCount} Issues Flagged`, tone),
        res('Detected Anti-Patterns', findings.length > 0 ? findings.join('; ') : 'None detected!', tone),
        res('Est. Image Reduction', '60% - 85% size savings', 'good', 'Switching to Alpine/Distroless multi-stage'),
        docres('Production Multi-Stage Dockerfile', optimized, `Hardened for ${rt}`),
      ]
    },
  },
  {
    id: 'kubernetes-resource-limits-sizer',
    name: 'Kubernetes Pod CPU & Memory Limit / Request Sizer',
    subject: SUBJECT,
    blurb: 'Calculate exact Kubernetes YAML `requests` and `limits` with safety headroom to prevent CPU throttling and OOMKilled evictions.',
    tip: 'Never set CPU limits too close to requests in latency-sensitive services, as CFS quota enforcement triggers artificial latency spikes.',
    usage: [
      'Enter baseline measured memory in MB and CPU in millicores (m).',
      'Select workload profile (Critical Web Service vs Batch Worker).',
      'Copy the ready-to-paste Kubernetes resources block.',
    ],
    method: [
      'Requests represent the guaranteed reservation for the scheduler.',
      'Limits define the hard ceiling before kernel OOMKill (Memory) or throttling (CPU).',
    ],
    fields: [
      n('baselineCpu', 'Measured Baseline CPU (m / millicores)', 250, 50, 8000, 50),
      n('baselineRam', 'Measured Baseline Memory (MB)', 512, 64, 65536, 64),
      sel('profile', 'Workload Profile', ['Critical Web API (1.5x Memory headroom, 2.5x CPU)', 'Batch Worker (1.2x Memory headroom, 2.0x CPU)', 'Lightweight Sidecar (1.2x Memory headroom, 1.5x CPU)']),
    ],
    compute: (v) => {
      const cpu = asNum(v, 'baselineCpu', 250)
      const ram = asNum(v, 'baselineRam', 512)
      const profile = asSel(v, 'profile', 'Critical Web API')

      let ramMultiplier = 1.5
      let cpuMultiplier = 2.5
      if (profile.startsWith('Batch')) {
        ramMultiplier = 1.25
        cpuMultiplier = 2.0
      } else if (profile.startsWith('Lightweight')) {
        ramMultiplier = 1.2
        cpuMultiplier = 1.5
      }

      const reqCpu = Math.round(cpu * 1.1)
      const limitCpu = Math.round(cpu * cpuMultiplier)
      const reqRam = Math.round(ram * 1.1)
      const limitRam = Math.round(ram * ramMultiplier)

      const yaml = `resources:\n` +
        `  requests:\n` +
        `    cpu: "${reqCpu}m"\n` +
        `    memory: "${reqRam}Mi"\n` +
        `  limits:\n` +
        `    cpu: "${limitCpu}m"\n` +
        `    memory: "${limitRam}Mi"`

      return [
        res('Guaranteed CPU Request', `${reqCpu}m (${(reqCpu / 1000).toFixed(2)} cores)`, 'good'),
        res('Guaranteed Memory Request', `${reqRam} MiB`, 'good'),
        res('OOM Hard Memory Ceiling', `${limitRam} MiB`, 'warn', `OOMKilled triggers above ${limitRam}Mi`),
        res('Max CPU Limit', `${limitCpu}m (${(limitCpu / 1000).toFixed(2)} cores)`, 'neutral'),
        docres('Kubernetes YAML Manifest Block', yaml, 'Paste inside pod.spec.containers[i]'),
      ]
    },
  },
]
