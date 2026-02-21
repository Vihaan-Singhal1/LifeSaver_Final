interface YesNoChipProps {
  label: string;
  value: boolean;
  onChange: (value: boolean) => void;
  description?: string;
}

export default function YesNoChip({ label, value, onChange, description }: YesNoChipProps) {
  return (
    <div className="rounded-2xl border border-base-300 bg-base-100 p-4 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-base font-semibold text-base-content">{label}</p>
          {description ? (
            <p className="text-sm text-base-content/70">{description}</p>
          ) : null}
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            className={`btn btn-sm ${value ? 'btn-primary text-primary-content' : 'btn-ghost'}`}
            onClick={() => onChange(true)}
            aria-pressed={value}
          >
            Yes
          </button>
          <button
            type="button"
            className={`btn btn-sm ${!value ? 'btn-primary btn-outline' : 'btn-ghost'}`}
            onClick={() => onChange(false)}
            aria-pressed={!value}
          >
            No
          </button>
        </div>
      </div>
    </div>
  );
}
