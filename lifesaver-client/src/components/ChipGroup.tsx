import type { ReactNode } from 'react';

export interface ChipOption {
  value: string;
  label: string;
  icon?: ReactNode;
}

interface ChipGroupProps {
  options: ChipOption[];
  selected: string[];
  onToggle: (value: string) => void;
}

export default function ChipGroup({ options, selected, onToggle }: ChipGroupProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map(option => {
        const isActive = selected.includes(option.value);
        return (
          <button
            key={option.value}
            type="button"
            className={`btn btn-sm rounded-full border border-base-300 ${
              isActive ? 'btn-primary text-primary-content shadow-lg' : 'btn-ghost'
            }`}
            onClick={() => onToggle(option.value)}
            aria-pressed={isActive}
          >
            <span className="flex items-center gap-1">
              {option.icon}
              {option.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
