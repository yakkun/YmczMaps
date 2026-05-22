import { styleSpec } from "./style.js";
import { wireDetailContours } from "./contour-detail.js";

const DEFAULT_VIEW = {
  // Kamikochi / Hotaka, a classic Yama-to-Kogen Chizu subject.
  center: [137.6307, 36.2479],
  zoom: 12.2,
  pitch: 0,
  bearing: 0,
};

const STORAGE_KEY = "ymczmaps:view";

function readSavedView() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const v = JSON.parse(raw);
    if (
      Array.isArray(v.center) &&
      v.center.length === 2 &&
      Number.isFinite(v.center[0]) &&
      Number.isFinite(v.center[1]) &&
      Number.isFinite(v.zoom)
    ) {
      return v;
    }
  } catch {
    /* ignore */
  }
  return null;
}

function saveView(map) {
  const c = map.getCenter();
  const v = {
    center: [c.lng, c.lat],
    zoom: map.getZoom(),
    pitch: map.getPitch(),
    bearing: map.getBearing(),
  };
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(v));
  } catch {
    /* ignore quota errors */
  }
}

const initialView = readSavedView() ?? DEFAULT_VIEW;

const map = new maplibregl.Map({
  container: "map",
  style: styleSpec,
  center: initialView.center,
  zoom: initialView.zoom,
  pitch: initialView.pitch ?? 0,
  bearing: initialView.bearing ?? 0,
  hash: true,
  minZoom: 4,
  maxZoom: 17,
  maxPitch: 0,
  attributionControl: false,
  // Slightly slower zoom for a more "paper-map" feel on PC.
  scrollZoom: { around: "center" },
});

map.addControl(
  new maplibregl.NavigationControl({ visualizePitch: false, showCompass: true }),
  "top-right",
);
map.addControl(
  new maplibregl.ScaleControl({ maxWidth: 140, unit: "metric" }),
  "bottom-left",
);
map.addControl(
  new maplibregl.AttributionControl({ compact: true }),
  "bottom-right",
);
map.addControl(
  new maplibregl.GeolocateControl({
    positionOptions: { enableHighAccuracy: true },
    trackUserLocation: false,
    showAccuracyCircle: true,
  }),
  "top-right",
);
map.addControl(new maplibregl.FullscreenControl(), "top-right");

const coordsEl = document.getElementById("coords");

function fmtCoord(lng, lat, zoom) {
  return `${lat.toFixed(5)}, ${lng.toFixed(5)}  z${zoom.toFixed(1)}`;
}

map.on("mousemove", (e) => {
  coordsEl.textContent = fmtCoord(e.lngLat.lng, e.lngLat.lat, map.getZoom());
});

map.on("moveend", () => {
  const c = map.getCenter();
  coordsEl.textContent = fmtCoord(c.lng, c.lat, map.getZoom());
  saveView(map);
});

map.on("load", () => {
  const c = map.getCenter();
  coordsEl.textContent = fmtCoord(c.lng, c.lat, map.getZoom());
});

wireDetailContours(map);

// Surface tile/source errors during development without spamming the console.
map.on("error", (e) => {
  if (e && e.error) {
    // eslint-disable-next-line no-console
    console.warn("maplibre:", e.error.message ?? e.error);
  }
});
