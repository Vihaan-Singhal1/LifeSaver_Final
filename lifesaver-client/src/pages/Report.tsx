import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import { LatLngLiteral, Marker as LeafletMarker } from 'leaflet';
import { z } from 'zod';
import { createReport } from '../api'; // ← adjust path if needed

// Fallback center (any city works)
const FALLBACK: LatLngLiteral = { lat: 37.7749, lng: -122.4194 };

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

  // Get user location once; fall back if denied/unavailable
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
    setSubmitting(true);
    setError(null);
    try {
      const form = new FormData(e.currentTarget);

      // Collect categories (checkboxes named "categories")
      const categories = form.getAll('categories') as string[];

      // Map yes/no checkboxes to booleans
      const answers = answersSchema.parse({
        breathing: form.get('breathing') === 'on',
        bleeding: form.get('bleeding') === 'on',
        trapped: form.get('trapped') === 'on',
        water: form.get('water') === 'on',
        fire: form.get('fire') === 'on',
        vulnerable: form.get('vulnerable') === 'on',
        alone: form.get('alone') === 'on',
      });

      const text = String(form.get('text') || '').slice(0, 280);
      const contact = String(form.get('contact') || '').trim() || undefined;
      const photo = (form.get('photo') as File | null) || null;

      const coords = pos ?? FALLBACK; // guarantees numbers

      const payload =
        photo && photo.size > 0
          ? (() => {
              const fd = new FormData();
              fd.set('lat', String(coords.lat));
              fd.set('lng', String(coords.lng));
              categories.forEach(c => fd.append('categories[]', c));
              Object.entries(answers).forEach(([k, v]) => fd.set(`answers[${k}]`, String(v)));
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
      // TODO: show success toast / first-aid card
      e.currentTarget.reset();
    } catch (err: any) {
      setError(err?.message || 'Failed to submit report.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="space-y-4">
      <div className="h-80 w-full overflow-hidden rounded-xl">
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
          {/* Render marker only when we truly have coords */}
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

      {/* Minimal form: keep or replace with your styled form */}
      <form onSubmit={onSubmit} className="space-y-3">
        {/* Example categories; ensure name="categories" on each */}
        <div className="flex flex-wrap gap-2">
          {['Medical','Trapped','Missing person','Flooded','Fire','Supply need'].map(c => (
            <label key={c} className="label cursor-pointer gap-2">
              <input type="checkbox" name="categories" value={c} className="checkbox checkbox-sm" />
              <span className="label-text">{c}</span>
            </label>
          ))}
        </div>

        {/* Example yes/no */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {['breathing','bleeding','trapped','water','fire','vulnerable','alone'].map(k => (
            <label key={k} className="label cursor-pointer gap-2">
              <input type="checkbox" name={k} className="checkbox checkbox-sm" />
              <span className="label-text capitalize">{k}</span>
            </label>
          ))}
        </div>

        <textarea name="text" maxLength={280} className="textarea textarea-bordered w-full" placeholder="Details (optional)" />
        <input name="contact" className="input input-bordered w-full" placeholder="Contact (optional)" />
        <input name="photo" type="file" accept="image/*" />

        <button disabled={submitting} className="btn btn-primary">
          {submitting ? 'Submitting...' : 'Submit report'}
        </button>
        {error && <div className="alert alert-error mt-2">{error}</div>}
      </form>
    </section>
  );
}
