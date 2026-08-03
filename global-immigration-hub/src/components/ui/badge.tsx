import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors',
  {
    variants: {
      variant: {
        default: 'bg-navy/10 text-navy',
        gold: 'bg-gold/20 text-amber-800',
        success: 'bg-emerald-100 text-emerald-800',
        warning: 'bg-amber-100 text-amber-800',
        danger: 'bg-red-100 text-red-700',
        outline: 'border border-navy/20 text-navy',
        intake: 'bg-slate-100 text-slate-700',
        docs: 'bg-blue-100 text-blue-700',
        review: 'bg-purple-100 text-purple-700',
        submitted: 'bg-gold/20 text-amber-800',
        decision: 'bg-orange-100 text-orange-700',
        closed: 'bg-gray-100 text-gray-600',
      },
    },
    defaultVariants: { variant: 'default' },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />
}

export { Badge, badgeVariants }
