// lifesaver-client/src/pages/Dashboard.tsx
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  MapContainer,
  TileLayer,
  CircleMarker,
  Popup,
  useMap, // <-- for SetMapRef helper
} from 'react-leaflet';
import type { LatLngLiteral, Map as LeafletMap } from 'leaflet';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getReports, updateReport } from '../api';
import LocateMe from '../components/map/LocateMe';

type Urgency = 'low' | 'medium' | 'high' | 'critical';
type Status = 'new' | 'ack' | 'enroute' | 'resolved';

type Report = {
  id: string;
  lat: number | string;
  lng: number | string;
  categories: string[];
  answers: Record<string, boolean>;
  text?: string;
  contact?: string | null;
  score?: number | string;
  urgency: Urgency;
  status: Status;
  createdAt: string;
  photoUrl?: string | null;
};

const FALLBACK_CENTER: LatLngLiteral = { lat: 37.7749, lng: -122.4194 }; // SF

// -------- helpers ----------
const toNum = (v: unknown) =>
  typeof v === 'number' ? v : v == null ? NaN : Number(v);
const isFiniteNum = (v: unknown) => Number.isFinite(toNum(v));
const fmt = (v: unknown, d = 0) => (isFiniteNum(v) ? toNum(v).toFixed(d) : '—');

const colorForUrgency = (u: Urgency) =>
  u === 'critical'
    ? '#ef4444'
    : u === 'high'
    ? '#f59e0b'
    : u === 'medium'
    ? '#eab308'
    : '#22c55e';

// -------- component ----------
export default function DashboardPage() {
  const [filters, setFilters] = useState<{
    category?: string;
    urgency?: Urgency | '';
    status?: Status | '';
  }>({});

  const mapRef = useRef<LeafletMap | null>(null);
  const qc = useQueryClient();

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['reports', filters],
    queryFn: () => getReports(filters),
    refetchInterval: 5000,
  });

  // sanitize incoming data so UI never sees undefined/strings for numbers
  const reports = useMemo(() => {
    const src: Report[] = Array.isArray(data) ? (data as any) : [];
    return src
      .map((r) => ({
        ...r,
        lat: toNum(r.lat),
        lng: toNum(r.lng),
        score: toNum((r as any).score ?? 0),
      }))
      .filter((r) => isFiniteNum(r.lat) && isFiniteNum(r.lng)) as Report[];
  }, [data]);

  const mutation = useMutation({
    mutationFn: (p: { id: string; status: Status }) =>
      updateReport(p.id, { status: p.status }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['reports'] }),
  });

  useEffect(() => {
    document.title = 'Life Saver — Dashboard';
  }, []);

  return (
    <div className="container mx-auto max-w-6xl p-4 sm:p-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* LEFT: filters + list */}
        <div className="lg:col-span-1 space-y-4">
          <div className="card bg-base-200 shadow">
            <div className="card-body gap-3">
              <h2 className="card-title text-lg">Filters</h2>

              <div className="form-control">
                <label className="label">
                  <span className="label-text">Category</span>
                </label>
                <select
                  className="select select-bordered"
                  value={filters.category ?? ''}
                  onChange={(e) =>
                    setFilters((f) => ({
                      ...f,
                      category: e.target.value || undefined,
                    }))
                  }
                >
                  <option value="">All</option>
                  {[
                    'Medical',
                    'Trapped',
                    'Missing person',
                    'Flooded',
                    'Fire',
                    'Supply need',
                  ].map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text">Urgency</span>
                </label>
                <select
                  className="select select-bordered"
                  value={filters.urgency ?? ''}
                  onChange={(e) =>
                    setFilters((f) => ({
                      ...f,
                      urgency: (e.target.value as Urgency) || undefined,
                    }))
                  }
                >
                  <option value="">All</option>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text">Status</span>
                </label>
                <select
                  className="select select-bordered"
                  value={filters.status ?? ''}
                  onChange={(e) =>
                    setFilters((f) => ({
                      ...f,
                      status: (e.target.value as Status) || undefined,
                    }))
                  }
                >
                  <option value="">All</option>
                  <option value="new">New</option>
                  <option value="ack">Acknowledged</option>
                  <option value="enroute">En-route</option>
                  <option value="resolved">Resolved</option>
                </select>
              </div>
            </div>
          </div>

          <div className="card bg-base-200 shadow max-h-[70vh] overflow-auto">
            <div className="card-body gap-3">
              <h2 className="card-title text-lg">Reports</h2>

              {isLoading && <div className="loading loading-spinner" />}

              {isError && (
                <div className="alert alert-error">
                  {(error as any)?.message || 'Failed to load reports.'}
                </div>
              )}

              {!isLoading && !isError && reports.length === 0 && (
                <div className="text-sm opacity-70">No reports found.</div>
              )}

              <div className="space-y-3">
                {reports.map((r) => (
                  <div
                    key={r.id}
                    className="rounded-xl border border-base-300 bg-base-100 p-3"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex flex-wrap items-center gap-2">
                        {r.categories?.map((c) => (
                          <span key={c} className="badge badge-ghost badge-sm">
                            {c}
                          </span>
                        ))}
                      </div>
                      <span
                        className="badge"
                        style={{
                          backgroundColor: colorForUrgency(r.urgency),
                          color: '#111',
                          border: 'none',
                        }}
                      >
                        {r.urgency}
                      </span>
                    </div>

                    <div className="mt-2 text-sm opacity-80 line-clamp-2">
                      {r.text || '—'}
                    </div>

                    <div className="mt-2 text-xs opacity-70">
                      {fmt(r.lat, 4)}, {fmt(r.lng, 4)} · score{' '}
                      {isFiniteNum(r.score)
                        ? Math.round(toNum(r.score))
                        : '—'}
                    </div>

                    <div className="mt-2 flex flex-wrap gap-2">
                      {(['new', 'ack', 'enroute', 'resolved'] as const).map(
                        (s) => (
                          <button
                            key={s}
                            className={`btn btn-xs ${
                              r.status === s ? 'btn-primary' : 'btn-outline'
                            }`}
                            onClick={() =>
                              mutation.mutate({ id: r.id, status: s })
                            }
                          >
                            {s}
                          </button>
                        )
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT: map */}
        <div className="lg:col-span-2">
          <div className="card bg-base-200 shadow h-[80vh]">
            <div className="card-body p-0">
              <MapContainer
                center={[FALLBACK_CENTER.lat, FALLBACK_CENTER.lng]}
                zoom={12}
                className="h-full w-full rounded-xl overflow-hidden"
                
                scrollWheelZoom
              >
                <TileLayer
                  attribution="&copy; OpenStreetMap contributors"
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {/* Admin locate overlay */}
                <LocateMe follow={false} />

                {reports.map((r) => {
                  const lat = toNum(r.lat);
                  const lng = toNum(r.lng);
                  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
                  const color = colorForUrgency(r.urgency);
                  return (
                    <CircleMarker
                      key={r.id}
                      center={[lat, lng]}
                      radius={8}
                      pathOptions={{
                        color,
                        fillColor: color,
                        fillOpacity: 0.85,
                      }}
                    >
                      <Popup>
                        <div className="space-y-1 text-sm">
                          <div className="font-semibold">
                            {r.categories?.join(', ') || 'Report'}
                          </div>
                          <div>{r.text || '—'}</div>
                          <div className="opacity-70 text-xs">
                            {fmt(lat, 4)}, {fmt(lng, 4)} · score{' '}
                            {isFiniteNum(r.score)
                              ? Math.round(toNum(r.score))
                              : '—'}
                          </div>
                          <div className="mt-2 flex gap-1 flex-wrap">
                            {(['new', 'ack', 'enroute', 'resolved'] as const).map(
                              (s) => (
                                <button
                                  key={s}
                                  className={`btn btn-xs ${
                                    r.status === s ? 'btn-primary' : 'btn-outline'
                                  }`}
                                  onClick={() =>
                                    mutation.mutate({ id: r.id, status: s })
                                  }
                                >
                                  {s}
                                </button>
                              )
                            )}
                          </div>
                        </div>
                      </Popup>
                    </CircleMarker>
                  );
                })}
              </MapContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
