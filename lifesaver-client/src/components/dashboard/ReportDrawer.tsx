import { AlertTriangle, Clock, MapPin, Phone, UserCheck, X } from 'lucide-react';

import type { Answers, Report, Status } from '../../types.ts';
import UrgencyBadge from './UrgencyBadge.tsx';

const answerLabels: Record<keyof Answers, string> = {
  breathing: 'Breathing issue',
  bleeding: 'Heavy bleeding',
  trapped: 'Trapped',
  water: 'Rising water',
  fire: 'Fire nearby',
  vulnerable: 'Child or elderly',
  alone: 'Responder alone'
};

const statusActions: Array<{ value: Status; label: string }> = [
  { value: 'new', label: 'New' },
  { value: 'ack', label: 'Acknowledge' },
  { value: 'enroute', label: 'En-route' },
  { value: 'resolved', label: 'Resolved' }
];

export interface ReportDrawerProps {
  report: Report | null;
  open: boolean;
  onClose: () => void;
  onChangeStatus: (status: Status) => void;
  isUpdating: boolean;
}

export default function ReportDrawer({ report, open, onClose, onChangeStatus, isUpdating }: ReportDrawerProps) {
  if (!report) {
    return null;
  }

  return (
    <div className={`fixed inset-0 z-40 transition ${open ? 'pointer-events-auto' : 'pointer-events-none'}`}>
      <div
        className={`absolute inset-0 bg-base-300/50 backdrop-blur-sm transition-opacity ${open ? 'opacity-100' : 'opacity-0'}`}
        onClick={onClose}
      />
      <aside
        className={`absolute right-0 top-0 h-full w-full max-w-md transform border-l border-base-300 bg-base-100 shadow-2xl transition-transform duration-300 ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between border-b border-base-300 px-6 py-4">
          <div className="space-y-1">
            <p className="text-sm uppercase tracking-wide text-base-content/70">Ticket #{report.id.slice(-6)}</p>
            <h2 className="text-2xl font-semibold text-base-content">Incident overview</h2>
          </div>
          <button type="button" className="btn btn-ghost btn-sm" onClick={onClose} aria-label="Close details">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="space-y-6 overflow-y-auto px-6 py-6">
          {report.photoUrl ? (
            <div className="overflow-hidden rounded-xl border border-base-300">
              <img src={report.photoUrl} alt="Incident attachment" className="h-56 w-full object-cover" />
            </div>
          ) : null}
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-3">
              <UrgencyBadge urgency={report.urgency}>
                {report.urgency.toUpperCase()} • {report.score}
              </UrgencyBadge>
              <span className="badge badge-outline uppercase">{report.status}</span>
              {report.assignedTo ? (
                <span className="badge badge-ghost flex items-center gap-1 text-xs uppercase">
                  <UserCheck className="h-3 w-3" /> {report.assignedTo}
                </span>
              ) : null}
            </div>
            <p className="text-base font-medium text-base-content">
              {report.text && report.text.length > 0 ? report.text : 'Awaiting field summary'}
            </p>
            {report.categories.length > 0 ? (
              <div className="flex flex-wrap gap-2 text-xs uppercase">
                {report.categories.map(category => (
                  <span key={category} className="badge badge-outline">
                    {category.replace(/-/g, ' ')}
                  </span>
                ))}
              </div>
            ) : null}
            <div className="grid gap-3 text-sm text-base-content/70">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4" /> {report.lat.toFixed(4)}, {report.lng.toFixed(4)}
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" /> Opened {new Date(report.createdAt).toLocaleString()}
              </div>
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" /> Updated {new Date(report.updatedAt).toLocaleString()}
              </div>
              {report.contact ? (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4" /> {report.contact}
                </div>
              ) : null}
            </div>
          </div>
          <div className="space-y-3">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-base-content/70">Rapid triage</h3>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {(Object.keys(answerLabels) as Array<keyof Answers>).map(key => {
                const value = report.answers[key];
                return (
                  <div
                    key={key}
                    className={`flex items-center justify-between rounded-xl border px-4 py-3 text-sm ${
                      value ? 'border-primary/60 bg-primary/10 text-primary' : 'border-base-300 bg-base-200/60 text-base-content/70'
                    }`}
                  >
                    <span>{answerLabels[key]}</span>
                    <span className={`badge ${value ? 'badge-primary' : 'badge-ghost'}`}>{value ? 'Yes' : 'No'}</span>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="space-y-3">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-base-content/70">Update status</h3>
            <div className="flex flex-wrap gap-2">
              {statusActions.map(action => (
                <button
                  key={action.value}
                  type="button"
                  className={`btn btn-sm ${
                    report.status === action.value ? 'btn-primary' : 'btn-outline'
                  }`}
                  onClick={() => onChangeStatus(action.value)}
                  disabled={isUpdating}
                >
                  {action.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}
