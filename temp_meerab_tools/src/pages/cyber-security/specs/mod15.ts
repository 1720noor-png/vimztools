import {
  asStr,
  docres,
  res,
  txt,
  type CyberSpec,
} from './cyberSpec'

export const SUBJECT = 'Cloud IAM & Privilege Escalation'

export const MOD15_SPECS: CyberSpec[] = [
  {
    id: 'aws-iam-policy-least-privilege-auditor',
    name: 'AWS IAM Policy Least-Privilege & Wildcard Auditor',
    subject: SUBJECT,
    blurb: 'Scan AWS IAM Policy JSON documents to detect dangerous wildcard permissions (`Action: "*"`), pass-role escalation risks, and resource misconfigurations.',
    tip: 'Granting `iam:PassRole` combined with `ec2:RunInstances` or `lambda:CreateFunction` allows unprivileged users to escalate directly to AdministratorAccess.',
    usage: [
      'Paste your candidate AWS IAM Policy JSON document.',
      'Inspect detected privilege escalation vulnerabilities and broad wildcards.',
      'Copy the hardened least-privilege policy alternative.',
    ],
    method: [
      'Parses JSON Statement array and matches actions against known AWS privilege escalation vectors.',
    ],
    fields: [
      txt('policyJson', 'AWS IAM Policy JSON', '{\n  "Version": "2012-10-17",\n  "Statement": [\n    {\n      "Effect": "Allow",\n      "Action": "*",\n      "Resource": "*"\n    }\n  ]\n}', 8),
    ],
    compute: (v) => {
      const raw = asStr(v, 'policyJson', '')

      try {
        const policy = JSON.parse(raw)
        const statements = Array.isArray(policy.Statement) ? policy.Statement : [policy.Statement]

        const findings: string[] = []
        let hasStarAction = false
        let hasStarResource = false
        let hasPassRole = false

        for (const stmt of statements) {
          if (stmt.Effect !== 'Allow') continue

          const actions = Array.isArray(stmt.Action) ? stmt.Action : [stmt.Action]
          const resources = Array.isArray(stmt.Resource) ? stmt.Resource : [stmt.Resource]

          if (actions.includes('*')) {
            hasStarAction = true
            findings.push('CRITICAL: Full administrative wildcard `Action: "*"` detected')
          }
          if (resources.includes('*')) {
            hasStarResource = true
            findings.push('HIGH: Broad resource scope `Resource: "*"` violates least privilege')
          }
          if (actions.some((a: string) => typeof a === 'string' && a.includes('iam:PassRole'))) {
            hasPassRole = true
            findings.push('PRIVILEGE ESCALATION: `iam:PassRole` allows attaching admin roles to compute services')
          }
        }

        const isCritical = hasStarAction || hasPassRole
        const tone = isCritical ? 'bad' : hasStarResource ? 'warn' : 'good'

        return [
          res('Policy Security Rating', isCritical ? 'CRITICAL RISK (Admin / Escalation)' : hasStarResource ? 'Medium Risk (Broad Resource Scope)' : 'Hardened Least-Privilege', tone),
          res('Total Statements Evaluated', `${statements.length} policy statements`, 'neutral'),
          res('Security Findings', findings.length > 0 ? findings.join('; ') : 'No high-risk wildcard permissions detected', tone),
          docres('Hardened Policy Template', '{\n  "Version": "2012-10-17",\n  "Statement": [\n    {\n      "Sid": "RestrictedS3Access",\n      "Effect": "Allow",\n      "Action": [\n        "s3:GetObject",\n        "s3:PutObject"\n      ],\n      "Resource": "arn:aws:s3:::my-production-bucket/*"\n    }\n  ]\n}', 'Scoped to specific actions and ARNs'),
        ]
      } catch (e) {
        return [res('JSON Syntax Error', (e as Error).message, 'bad')]
      }
    },
  },
]
