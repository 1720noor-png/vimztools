import type { SVGProps } from 'react'
import {
  VIMZ_CHECKMARK_PATH,
  VIMZ_TEXT_PATH,
  VIMZ_LOGO_VIEWBOX,
  VIMZ_CHECK_VIEWBOX,
} from './logoPaths'

interface LogoProps extends SVGProps<SVGSVGElement> {
  variant?: 'full' | 'mark'
  textClassName?: string
  markColor?: string
}

export default function Logo({
  variant = 'full',
  className = 'h-8 w-auto',
  textClassName = 'text-[#808080] dark:text-slate-300',
  markColor = '#9D388A',
  ...props
}: LogoProps) {
  if (variant === 'mark') {
    return (
      <svg
        viewBox={VIMZ_CHECK_VIEWBOX}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        aria-label="vimz.ai logo mark"
        {...props}
      >
        <path d={VIMZ_CHECKMARK_PATH} fill={markColor} />
      </svg>
    )
  }

  return (
    <svg
      viewBox={VIMZ_LOGO_VIEWBOX}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="vimz.ai logo"
      {...props}
    >
      <path d={VIMZ_CHECKMARK_PATH} fill={markColor} />
      <path
        d={VIMZ_TEXT_PATH}
        fill="currentColor"
        className={textClassName}
      />
    </svg>
  )
}
