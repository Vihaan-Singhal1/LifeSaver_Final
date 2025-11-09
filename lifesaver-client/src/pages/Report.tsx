import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import { LatLngLiteral, Marker as LeafletMarker } from 'leaflet';
import { z } from 'zod';
import { createReport } from '../api'; // adjust path if different

// Fallback center if geolocation is denied/unavailable
const FALLBACK: LatLngLiteral = { lat: 37.7749, lng: -122.4194 };

const CATEGORY_OPTIONS = [
  'Medical',
  'Trapped',
  'Missing person',
  'Flooded',
  'Fire',
  'Supply need',
] as const;

type AnswersForm = {
  breathing?: boolean;
  bleeding?: boolean;
  trapped?: boolean;
  water?: boolean;
  fire?: boolean;
  vulnerable?: boolean;
  alone?: boolean;
};

const BOOL_FLAGS: { name: keyof AnswersForm; label: string }[] = [
  { name: 'breathing', label: 'Breathing' },
  { name: 'bleeding', label: 'Bleeding' },
  { name: 'trapped', label: 'Trapped' },
  { name: 'water', label: 'Water' },
  { name: 'fire', label: 'Fire' },
  { name: 'vulnerable', label: 'Vulnerable' },
  { name: 'alone', label: 'Alone' },
];

const answersSchema = z.object({
  breathing: z.boolean().optional().default(false),
  bleeding: z.boolean().optional().default(false),
  trapped: z.boolean().optional().default(false),
  water: z.boolean().optional().default(false),
  fire: z.boolean().optional().default(false),
  vulnerable: z.boolean().optional().default(false),
  alone: z.boolean().optional().default(false),
});

export default function ReportPage() {
  const [pos, setPos] = useState<LatLngLiteral | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // get user position once; fall back gracefully
  useEffect(() => {
    let cancelled = false;
    if (!navigator.geolocation) { setPos(FALLBACK); return; }
    navigator.geolocation.getCurrentPosition(
      (p) => { if (!cancelled) setPos({ lat: p.coords.latitude, lng: p.coords.longitude }); },
      () => { if (!cancelled) setPos(FALLBACK); },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
    return () => { cancelled = true; };
  }, []);

  const center: LatLngLiteral = pos ?? FALLBACK;

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formEl = e.currentTarget as HTMLFormElement; // keep a stable ref
    setSubmitting(true);
    setError(null);
    try {
      const form = new FormData(formEl);

      // collect chips (checkboxes named "categories")
      const categories = form.getAll('categories') as string[];

      // collect yes/no toggles
      const answers = answersSchema.parse(
        Object.fromEntries(
          BOOL_FLAGS.map(({ name }) => [name, form.get(name) === 'on'])
        )
      );

      const text = String(form.get('text') || '').slice(0, 280);
      const contact = String(form.get('contact') || '').trim() || undefined;
      const photo = (form.get('photo') as File | null) || null;
      const coords = pos ?? FALLBACK; // always numbers

      const payload =
        photo && photo.size > 0
          ? (() => {
              const fd = new FormData();
              fd.set('lat', String(coords.lat));
              fd.set('lng', String(coords.lng));
              categories.forEach((c) => fd.append('categories[]', c));
              Object.entries(answers).forEach(([k, v]) =>
                fd.set(`answers[${k}]`, String(v))
              );
              if (text) fd.set('text', text);
              if (contact) fd.set('contact', contact);
              fd.set('photo', photo);
              return fd;
            })()
          : {
              lat: coords.lat,
              lng: coords.lng,
              categories,
              answers,
              text,
              contact,
            };

      await createReport(payload);
      formEl.reset();      // ✔️ resets all inputs now
      // optional: toast success
    } catch (err: any) {
      setError(err?.message || 'Failed to submit report.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="container mx-auto max-w-5xl p-4 sm:p-6">
      <form onSubmit={onSubmit} className="card bg-base-200 shadow-xl">
        <div className="card-body gap-6">
          <h1 className="card-title text-2xl">Report an incident</h1>

          {/* Location */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold">Incident location</h2>
              <span className="text-xs opacity-70">Drag the pin if needed</span>
            </div>
            <div className="rounded-2xl overflow-hidden shadow">
              <div className="h-80 w-full">
                <MapContainer
                  center={[center.lat, center.lng]}
                  zoom={pos ? 15 : 12}
                  className="h-full w-full"
                  scrollWheelZoom
                >
                  <TileLayer
                    attribution='&copy; OpenStreetMap contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  {pos && (
                    <Marker
                      position={[pos.lat, pos.lng]}
                      draggable
                      eventHandlers={{
                        dragend: (e) => {
                          const m = e.target as LeafletMarker;
                          const ll = m.getLatLng();
                          setPos({ lat: ll.lat, lng: ll.lng });
                        },
                      }}
                    />
                  )}
                </MapContainer>
              </div>
            </div>
          </div>

          <div className="divider my-0" />

          {/* Categories as chips */}
          <div className="space-y-3">
            <h2 className="font-semibold">Category</h2>
            <div className="flex flex-wrap gap-2">
              {CATEGORY_OPTIONS.map((c) => (
                <label key={c} className="cursor-pointer">
                  <input type="checkbox" name="categories" value={c} className="peer hidden" />
                  <span className="btn btn-sm btn-outline rounded-full normal-case peer-checked:btn-primary peer-checked:text-primary-content">
                    {c}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Urgency toggles */}
          <div className="space-y-3">
            <h2 className="font-semibold">Urgency signals</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {BOOL_FLAGS.map(({ name, label }) => (
                <label key={name} className="flex items-center justify-between gap-3 rounded-xl border border-base-300 bg-base-100 px-4 py-3">
                  <span className="text-sm">{label}</span>
                  <input type="checkbox" name={name} className="toggle toggle-primary" />
                </label>
              ))}
            </div>
          </div>

          {/* Details & Contact */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="form-control">
              <label className="label"><span className="label-text">Details (optional)</span></label>
              <textarea name="text" maxLength={280} className="textarea textarea-bordered w-full" placeholder="What’s happening? Helpful context, landmarks, people involved…" />
              <label className="label"><span className="label-text-alt opacity-60">Max 280 characters</span></label>
            </div>

            <div className="form-control">
              <label className="label"><span className="label-text">Contact (optional)</span></label>
              <input name="contact" className="input input-bordered w-full" placeholder="Phone or email (optional)" />
              <label className="label"><span className="label-text">Photo (optional)</span></label>
              <input name="photo" type="file" accept="image/*" className="file-input file-input-bordered w-full" />
            </div>
          </div>

          {error && <div className="alert alert-error">{error}</div>}

          <div className="card-actions justify-end">
            <button disabled={submitting} className="btn btn-primary" type="submit">
              {submitting ? 'Submitting…' : 'Submit report'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
