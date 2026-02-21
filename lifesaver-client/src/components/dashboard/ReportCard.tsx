import { Activity, MapPin } from 'lucide-react';

import type { Report } from '../../types.ts';
import UrgencyBadge from './UrgencyBadge.tsx';

export interface ReportCardProps {
  report: Report;
  relativeCreatedAt: string;
  onSelect: (report: Report) => void;
  isActive: boolean;
}

const categoryLabels: Record<string, string> = {
  medical: 'Medical',
  trapped: 'Trapped',
  'missing-person': 'Missing person',
  flooded: 'Flooded',
  fire: 'Fire',
  'supply-need': 'Supply need'
};

export default function ReportCard({ report, relativeCreatedAt, onSelect, isActive }: ReportCardProps) {
  const positives = Object.entries(report.answers)
    .filter(([, value]) => Boolean(value))
    .map(([key]) => key);

  return (
    <button
      type="button"
      onClick={() => onSelect(report)}
      className={`card w-full border text-left transition ${
        isActive ? 'border-primary shadow-xl ring-2 ring-primary/40' : 'border-base-300 shadow-md hover:border-primary/60'
      }`}
    >
      <div className="card-body space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-base-content">
              {report.text && report.text.length > 0 ? report.text : 'Awaiting field summary'}
            </h3>
            <div className="flex flex-wrap gap-2 text-xs">
              {report.categories.map(category => (
                <span key={category} className="badge badge-outline capitalize">
                  {categoryLabels[category] ?? category.replace('-', ' ')}
                </span>
              ))}
            </div>
          </div>
          <div className="flex flex-col items-end gap-2 text-sm">
            <UrgencyBadge urgency={report.urgency}>
              {report.urgency.toUpperCase()} • {report.score}
            </UrgencyBadge>
            <span className="badge badge-outline text-[0.7rem] uppercase">
              {report.status}
            </span>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3 text-sm text-base-content/70">
          <span className="flex items-center gap-1">
            <MapPin className="h-4 w-4" />
            {report.lat.toFixed(3)}, {report.lng.toFixed(3)}
          </span>
          <span className="flex items-center gap-1">
            <Activity className="h-4 w-4" />
            {relativeCreatedAt}
          </span>
        </div>
        {positives.length > 0 ? (
          <div className="flex flex-wrap gap-2 text-[0.7rem] uppercase text-primary">
            {positives.map(key => (
              <span key={key} className="badge badge-primary badge-outline">
                {key.replace(/-/g, ' ')}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-sm text-base-content/60">No critical flags raised.</p>
        )}
      </div>
    </button>
  );
}
