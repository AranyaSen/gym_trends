import { useEffect, useRef, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  useMapEvents,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { X } from "lucide-react";
import { Button } from "./Button";

// ── Fix Leaflet's default icon broken by bundlers ──────────────────────────
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)[
  "_getIconUrl"
];
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

// Custom neon-green pin icon ──────────────────────────────────────────────
const neonIcon = L.divIcon({
  className: "",
  html: `
    <div style="
      position:relative;
      width:28px;
      height:28px;
    ">
      <div style="
        position:absolute;
        inset:0;
        border-radius:50% 50% 50% 0;
        transform:rotate(-45deg);
        background:linear-gradient(135deg,#39ff14,#00c853);
        box-shadow:0 0 12px #39ff14aa, 0 0 24px #39ff1466;
      "></div>
      <div style="
        position:absolute;
        top:6px;
        left:6px;
        width:12px;
        height:12px;
        border-radius:50%;
        background:#0a0f0a;
        box-shadow:inset 0 0 4px #39ff1488;
      "></div>
    </div>`,
  iconSize: [28, 28],
  iconAnchor: [14, 28],
  popupAnchor: [0, -30],
});

// ── Sub-component: pans map to new centre when coordinates arrive ─────────
function MapCenterer({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  const didFly = useRef(false);
  useEffect(() => {
    if (!didFly.current && lat !== 0 && lng !== 0) {
      map.flyTo([lat, lng], 16, { duration: 1.2 });
      didFly.current = true;
    }
  }, [lat, lng, map]);
  return null;
}

// ── Sub-component: listens for map clicks → moves pin ────────────────────
function ClickHandler({
  onMove,
}: {
  onMove: (lat: number, lng: number) => void;
}) {
  useMapEvents({
    click(e) {
      onMove(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

// ── Public props ──────────────────────────────────────────────────────────
export interface GymLocationPickerProps {
  initialLat: number;
  initialLng: number;
  onConfirm: (lat: number, lng: number) => void;
  onClose: () => void;
}

export function GymLocationPicker({
  initialLat,
  initialLng,
  onConfirm,
  onClose,
}: GymLocationPickerProps) {
  const [pin, setPin] = useState({ lat: initialLat, lng: initialLng });
  const defaultCenter: [number, number] =
    initialLat !== 0 ? [initialLat, initialLng] : [20.5937, 78.9629]; // India fallback

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="w-full sm:max-w-lg bg-[#0d1117] border border-[#39ff14]/20 rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden flex flex-col"
        style={{ maxHeight: "90dvh" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
          <div>
            <h2 className="text-sm font-bold text-white tracking-wider uppercase">
              Pin Gym Location
            </h2>
            <p className="text-[10px] text-[#8899a6] mt-0.5">
              Tap anywhere on the map to adjust the pin
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 text-[#8899a6] hover:text-white transition-colors"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Map */}
        <div className="flex-1 relative" style={{ minHeight: 320 }}>
          <MapContainer
            center={defaultCenter}
            zoom={initialLat !== 0 ? 15 : 5}
            style={{ height: "100%", width: "100%", minHeight: 320 }}
            zoomControl
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <MapCenterer lat={pin.lat} lng={pin.lng} />
            <ClickHandler onMove={(lat, lng) => setPin({ lat, lng })} />
            {pin.lat !== 0 && (
              <Marker
                position={[pin.lat, pin.lng]}
                icon={neonIcon}
                draggable
                eventHandlers={{
                  dragend(e) {
                    const m = e.target as L.Marker;
                    const { lat, lng } = m.getLatLng();
                    setPin({ lat, lng });
                  },
                }}
              />
            )}
          </MapContainer>

          {/* Crosshair hint overlay */}
          {pin.lat === 0 && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-[1000]">
              <div className="bg-black/60 backdrop-blur-sm text-[#39ff14] text-xs font-bold px-4 py-2 rounded-full border border-[#39ff14]/30 animate-pulse">
                Tap to place pin
              </div>
            </div>
          )}
        </div>

        {/* Coordinates display */}
        {pin.lat !== 0 && (
          <div className="px-5 py-3 bg-[#0a0f0a] border-t border-white/5 flex items-center gap-4">
            <div className="flex-1 grid grid-cols-2 gap-3">
              <div className="bg-white/5 rounded-lg px-3 py-2">
                <p className="text-[9px] text-[#8899a6] uppercase tracking-widest font-semibold">
                  Latitude
                </p>
                <p className="text-xs font-mono text-white mt-0.5">
                  {pin.lat.toFixed(6)}
                </p>
              </div>
              <div className="bg-white/5 rounded-lg px-3 py-2">
                <p className="text-[9px] text-[#8899a6] uppercase tracking-widest font-semibold">
                  Longitude
                </p>
                <p className="text-xs font-mono text-white mt-0.5">
                  {pin.lng.toFixed(6)}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Footer actions */}
        <div className="px-5 py-4 border-t border-white/5 flex gap-3">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            disabled={pin.lat === 0}
            onClick={() => {
              onConfirm(pin.lat, pin.lng);
              onClose();
            }}
            className="flex-1"
          >
            Save Location
          </Button>
        </div>
      </div>
    </div>
  );
}
