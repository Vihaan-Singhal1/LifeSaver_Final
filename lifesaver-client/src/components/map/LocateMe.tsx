import { useEffect, useRef, useState } from 'react';
import { useMap, Circle, CircleMarker, LayerGroup } from 'react-leaflet';

type Props = {
  follow?: boolean;
};

export default function LocateMe({ follow = false }: Props) {
  const map = useMap();
  const [loading, setLoading] = useState(false);
  const [pos, setPos] = useState<GeolocationPosition | null>(null);
  const watchIdRef = useRef<number | null>(null);
  const lastUpdateRef = useRef<number>(0);

  // start/stop following
  useEffect(() => {
    if (!follow) {
      if (watchIdRef.current != null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
      return;
    }
    if (!('geolocation' in navigator)) return;

    watchIdRef.current = navigator.geolocation.watchPosition(
      (p) => {
        const now = Date.now();
        const prev = lastUpdateRef.current;
        const movedEnough =
          !pos ||
          distanceMeters(
            pos.coords.latitude,
            pos.coords.longitude,
            p.coords.latitude,
            p.coords.longitude
          ) >= 25;
        if (movedEnough && now - prev >= 500) {
          lastUpdateRef.current = now;
          setPos(p);
          map.setView(
            [p.coords.latitude, p.coords.longitude],
            Math.max(map.getZoom(), 15)
          );
        }
      },
      () => {},
      { enableHighAccuracy: true, maximumAge: 0, timeout: 10000 }
    );

    return () => {
      if (watchIdRef.current != null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [follow]);

  function locateOnce() {
    if (!('geolocation' in navigator)) {
      toast('Geolocation not available in this browser');
      return;
    }
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (p) => {
        setLoading(false);
        setPos(p);
        map.setView(
          [p.coords.latitude, p.coords.longitude],
          Math.max(map.getZoom(), 15)
        );
      },
      (err) => {
        setLoading(false);
        let msg = 'Unable to get your location.';
        if (err.code === err.PERMISSION_DENIED)
          msg = 'Location permission denied. Enable it in your browser settings.';
        else if (err.code === err.TIMEOUT) msg = 'Location request timed out.';
        toast(msg);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  }

  return (
    <>
      {/* Floating button */}
      <div className="absolute top-3 right-3 z-[500] pointer-events-none">
        <button
          onClick={locateOnce}
          className={`btn btn-circle pointer-events-auto ${loading ? 'btn-disabled' : ''}`}
          title="Locate me"
        >
          {loading ? (
            <span className="loading loading-spinner" />
          ) : (
            // simple target glyph
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 8a4 4 0 100 8 4 4 0 000-8zm9 3h-2.07a7.002 7.002 0 00-5.93-5.93V3h-2v2.07A7.002 7.002 0 005.07 11H3v2h2.07a7.002 7.002 0 005.93 5.93V21h2v-2.07a7.002 7.002 0 005.93-5.93H21v-2z" />
            </svg>
          )}
        </button>
      </div>

      {/* Blue dot + accuracy ring (non-interactive so it never steals clicks) */}
      {pos && (
        <LayerGroup>
          <Circle
            center={[pos.coords.latitude, pos.coords.longitude]}
            radius={Math.max(15, pos.coords.accuracy)}
            pathOptions={{ color: '#3b82f6', fillColor: '#3b82f6', fillOpacity: 0.15 }}
            interactive={false}
          />
          <CircleMarker
            center={[pos.coords.latitude, pos.coords.longitude]}
            radius={6}
            pathOptions={{ color: '#2563eb', fillColor: '#2563eb', fillOpacity: 1 }}
            interactive={false}
          />
        </LayerGroup>
      )}
    </>
  );
}

// tiny helper
function distanceMeters(lat1: number, lon1: number, lat2: number, lon2: number) {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const R = 6371000;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

// super lightweight toast bridge (optional; harmless if unused)
function toast(text: string) {
  try {
    window.dispatchEvent(new CustomEvent('toast', { detail: { type: 'info', text } }));
  } catch {
    // eslint-disable-next-line no-alert
    alert(text);
  }
}
