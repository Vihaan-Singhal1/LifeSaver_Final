import type { ChangeEvent } from 'react';

import type { Status, Urgency } from '../../types.ts';

const categoryOptions = [
  { value: 'medical', label: 'Medical' },
  { value: 'trapped', label: 'Trapped' },
  { value: 'missing-person', label: 'Missing person' },
  { value: 'flooded', label: 'Flooded' },
  { value: 'fire', label: 'Fire' },
  { value: 'supply-need', label: 'Supply need' }
];

const urgencyOptions: Array<{ value: '' | Urgency; label: string }> = [
  { value: '', label: 'All urgency levels' },
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'critical', label: 'Critical' }
];

const statusOptions: Array<{ value: '' | Status; label: string }> = [
  { value: '', label: 'All statuses' },
  { value: 'new', label: 'New' },
  { value: 'ack', label: 'Acknowledged' },
  { value: 'enroute', label: 'En-route' },
  { value: 'resolved', label: 'Resolved' }
];

export interface FiltersPanelProps {
  selectedCategories: string[];
  onCategoriesChange: (categories: string[]) => void;
  urgency: '' | Urgency;
  onUrgencyChange: (urgency: '' | Urgency) => void;
  status: '' | Status;
  onStatusChange: (status: '' | Status) => void;
  unassignedOnly: boolean;
  onToggleUnassigned: (value: boolean) => void;
}

export default function FiltersPanel({
  selectedCategories,
  onCategoriesChange,
  urgency,
  onUrgencyChange,
  status,
  onStatusChange,
  unassignedOnly,
  onToggleUnassigned
}: FiltersPanelProps) {
  const handleCategoryChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const values = Array.from(event.target.selectedOptions).map(option => option.value);
    onCategoriesChange(values);
  };

  return (
    <aside className="space-y-4 rounded-2xl border border-base-300 bg-base-100 p-5 shadow-lg">
      <div>
        <h2 className="text-lg font-semibold text-base-content">Filters</h2>
        <p className="text-sm text-base-content/70">Refine the live feed to focus on the calls that matter right now.</p>
      </div>
      <div className="form-control">
        <label htmlFor="category-filter" className="label">
          <span className="label-text font-medium">Categories</span>
        </label>
        <select
          id="category-filter"
          multiple
          className="select select-bordered h-36 w-full"
          value={selectedCategories}
          onChange={handleCategoryChange}
        >
          {categoryOptions.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <span className="mt-2 text-xs text-base-content/60">Use Ctrl/Cmd + click to select multiple categories.</span>
      </div>
      <div className="form-control">
        <label htmlFor="urgency-filter" className="label">
          <span className="label-text font-medium">Urgency</span>
        </label>
        <select
          id="urgency-filter"
          className="select select-bordered"
          value={urgency}
          onChange={event => onUrgencyChange(event.target.value as '' | Urgency)}
        >
          {urgencyOptions.map(option => (
            <option key={option.value || 'all'} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
      <div className="form-control">
        <label htmlFor="status-filter" className="label">
          <span className="label-text font-medium">Status</span>
        </label>
        <select
          id="status-filter"
          className="select select-bordered"
          value={status}
          onChange={event => onStatusChange(event.target.value as '' | Status)}
        >
          {statusOptions.map(option => (
            <option key={option.value || 'all'} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
      <label className="label cursor-pointer justify-start gap-3 rounded-xl border border-base-300 bg-base-200/50 px-4 py-3">
        <input
          type="checkbox"
          className="checkbox checkbox-primary"
          checked={unassignedOnly}
          onChange={event => onToggleUnassigned(event.target.checked)}
        />
        <span className="text-sm font-medium text-base-content">Unassigned only</span>
      </label>
    </aside>
  );
}
