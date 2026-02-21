interface PhotoPickerProps {
  value: File | null;
  previewUrl: string | null;
  onChange: (file: File | null) => void;
  disabled?: boolean;
}

export default function PhotoPicker({ value, previewUrl, onChange, disabled }: PhotoPickerProps) {
  return (
    <div className="space-y-3">
      <label className="form-control">
        <div className="label">
          <span className="label-text">Attach a photo (optional)</span>
          <span className="label-text-alt text-xs text-base-content/60">Max 2MB</span>
        </div>
        <input
          type="file"
          accept="image/*"
          className="file-input file-input-bordered"
          onChange={event => {
            const file = event.target.files?.[0] ?? null;
            onChange(file);
          }}
          disabled={disabled}
        />
      </label>
      {previewUrl ? (
        <div className="overflow-hidden rounded-2xl border border-base-300 bg-base-100 shadow-sm">
          <img src={previewUrl} alt="Selected upload preview" className="h-48 w-full object-cover" />
          <div className="border-t border-base-300 p-3 text-right">
            <button type="button" className="btn btn-sm btn-ghost" onClick={() => onChange(null)} disabled={disabled}>
              Remove photo
            </button>
          </div>
        </div>
      ) : null}
      {value ? (
        <p className="text-xs text-base-content/60">{(value.size / (1024 * 1024)).toFixed(2)} MB selected</p>
      ) : null}
    </div>
  );
}
