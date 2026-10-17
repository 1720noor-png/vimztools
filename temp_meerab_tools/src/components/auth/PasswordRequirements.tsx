import { CheckCircle2, Circle } from 'lucide-react'

export interface PasswordRuleState {
  id: string
  label: string
  passed: boolean
}

export function checkPasswordComplexity(password: string): {
  isValid: boolean
  passedCount: number
  totalCount: number
  rules: PasswordRuleState[]
} {
  const rules: PasswordRuleState[] = [
    {
      id: 'length',
      label: 'Minimum 8 characters',
      passed: password.length >= 8,
    },
    {
      id: 'uppercase',
      label: 'At least one uppercase letter (A-Z)',
      passed: /[A-Z]/.test(password),
    },
    {
      id: 'lowercase',
      label: 'At least one lowercase letter (a-z)',
      passed: /[a-z]/.test(password),
    },
    {
      id: 'number',
      label: 'At least one number (0-9)',
      passed: /[0-9]/.test(password),
    },
    {
      id: 'special',
      label: 'At least one special character (!@#$%^&* etc.)',
      passed: /[^A-Za-z0-9]/.test(password),
    },
  ]

  const passedCount = rules.filter((r) => r.passed).length
  const isValid = passedCount === rules.length

  return {
    isValid,
    passedCount,
    totalCount: rules.length,
    rules,
  }
}

interface PasswordRequirementsProps {
  password: string
}

export default function PasswordRequirements({ password }: PasswordRequirementsProps) {
  const { rules, passedCount, totalCount } = checkPasswordComplexity(password)
  const isStarted = password.length > 0
  const pct = Math.round((passedCount / totalCount) * 100)

  // Color selection
  let barColor = 'bg-rose-500'
  let strengthLabel = 'Weak'
  if (passedCount >= 5) {
    barColor = 'bg-emerald-500'
    strengthLabel = 'Strong'
  } else if (passedCount >= 3) {
    barColor = 'bg-amber-500'
    strengthLabel = 'Moderate'
  }

  return (
    <div className="mt-2.5 rounded-xl border border-slate-200/90 bg-slate-50/70 p-3 text-xs dark:border-slate-800 dark:bg-slate-900/60">
      <div className="mb-2 flex items-center justify-between text-[11px] font-semibold text-slate-500 dark:text-slate-400">
        <span>Password Complexity</span>
        {isStarted && (
          <span
            className={`font-bold ${
              passedCount === 5
                ? 'text-emerald-600 dark:text-emerald-400'
                : passedCount >= 3
                  ? 'text-amber-600 dark:text-amber-400'
                  : 'text-rose-600 dark:text-rose-400'
            }`}
          >
            {strengthLabel} ({passedCount}/{totalCount})
          </span>
        )}
      </div>

      {/* Progress Bar */}
      <div className="mb-2.5 h-1.5 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
        <div
          className={`h-full transition-all duration-300 ${barColor}`}
          style={{ width: `${isStarted ? pct : 0}%` }}
        />
      </div>

      {/* Rules Checklist */}
      <ul className="space-y-1.5 text-[11px]">
        {rules.map((rule) => {
          const isPassed = rule.passed
          return (
            <li
              key={rule.id}
              className={`flex items-center gap-2 transition-colors ${
                isPassed
                  ? 'font-medium text-emerald-700 dark:text-emerald-400'
                  : 'text-slate-500 dark:text-slate-400'
              }`}
            >
              {isPassed ? (
                <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-500" />
              ) : (
                <Circle className="h-3.5 w-3.5 shrink-0 text-slate-300 dark:text-slate-600" />
              )}
              <span>{rule.label}</span>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
