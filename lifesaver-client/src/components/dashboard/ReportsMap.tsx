import { useMemo, type ReactNode } from 'react';
import type { Map as LeafletMap } from 'leaflet';
import L from 'leaflet';
import { MapContainer, Marker, TileLayer } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';

import type { Report } from '../../types.ts';

const urgencyColours: Record<Report['urgency'], string> = {
  low: '#16a34a',
  medium: '#facc15',
  high: '#fb923c',
  critical: '#ef4444'
};

const defaultCenter: [number, number] = [37.7749, -122.4194];

function createMarkerIcon(urgency: Report['urgency'], isActive: boolean) {
  const colour = urgencyColours[urgency];
  const size = isActive ? 22 : 18;

  return L.divIcon({
    className: 'report-marker-icon',
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    html: `<span style="background:${colour};width:${size}px;height:${size}px;" class="marker-dot${
      isActive ? ' marker-dot--active' : ''
    }"></span>`
  });
}

function createClusterIcon(cluster: any) {
  const count = cluster.getChildCount();
  return L.divIcon({
    className: 'report-cluster-icon',
    html: `<div class="cluster-inner">${count}</div>`,
    iconSize: [38, 38]
  });
}

export interface ReportsMapProps {
  reports: Report[];
  selectedReportId: string | null;
  onMarkerClick: (report: Report) => void;
  onMapReady?: (map: LeafletMap) => void;
  children?: ReactNode;
}

export default function ReportsMap({ reports, selectedReportId, onMarkerClick, onMapReady, children }: ReportsMapProps) {
  const initialCenter = useMemo(() => {
    if (selectedReportId) {
      const active = reports.find(report => report.id === selectedReportId);
      if (active) {
        return [active.lat, active.lng] as [number, number];
      }
    }
    if (reports.length > 0) {
      return [reports[0].lat, reports[0].lng] as [number, number];
    }
    return defaultCenter;
  }, [reports, selectedReportId]);

  return (
    <MapContainer
      center={initialCenter}
      zoom={12}
      scrollWheelZoom
      className="h-full w-full rounded-2xl"
      whenCreated={map => onMapReady?.(map)}
    >
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <MarkerClusterGroup chunkedLoading iconCreateFunction={createClusterIcon}>
        {reports.map(report => (
          <Marker
            key={report.id}
            position={[report.lat, report.lng]}
            eventHandlers={{
              click: () => onMarkerClick(report)
            }}
            icon={createMarkerIcon(report.urgency, report.id === selectedReportId)}
          />
        ))}
      </MarkerClusterGroup>
      {children}
    </MapContainer>
  );
}
