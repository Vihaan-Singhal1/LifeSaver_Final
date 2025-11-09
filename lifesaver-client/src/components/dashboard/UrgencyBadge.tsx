import type { PropsWithChildren } from 'react';

import type { Urgency } from '../../types.ts';

const urgencyStyles: Record<Urgency, string> = {
  low: 'badge badge-success text-success-content',
  medium: 'badge badge-warning text-warning-content',
  high: 'badge bg-orange-500 text-white',
  critical: 'badge badge-error text-error-content'
};

export default function UrgencyBadge({ urgency, children }: PropsWithChildren<{ urgency: Urgency }>) {
  return <span className={`${urgencyStyles[urgency]} px-3 py-2 text-xs uppercase`}>{children}</span>;
}
