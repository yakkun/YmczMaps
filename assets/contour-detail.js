// Pulls GSI experimental_bvmap z=14 tiles, decodes the `contour` layer to
// GeoJSON, and pushes it into the "gsiContourDetail" GeoJSON source so the
// z=12–13.99 zoom band can render the full z=14 contour density instead of
// the server's pre-thinned mid-zoom set.

import Pbf from "https://esm.run/pbf@4";
import { VectorTile } from "https://esm.run/@mapbox/vector-tile@2";

const TILE_BASE = "https://cyberjapandata.gsi.go.jp/xyz/experimental_bvmap";
const DETAIL_Z = 14;
const MIN_VISIBLE_Z = 11.9;
const MAX_VISIBLE_Z = 14;
const MAX_TILES_PER_UPDATE = 36;

const tileCache = new Map();

function lonLatToTile(lon, lat, z) {
  const n = 2 ** z;
  const x = Math.floor(((lon + 180) / 360) * n);
  const latRad = (lat * Math.PI) / 180;
  const y = Math.floor(
    ((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2) * n,
  );
  return [x, y];
}

function fetchTileFeatures(z, x, y) {
  const key = `${z}/${x}/${y}`;
  const cached = tileCache.get(key);
  if (cached) return cached;
  const p = (async () => {
    const res = await fetch(`${TILE_BASE}/${z}/${x}/${y}.pbf`);
    if (!res.ok) return [];
    const buf = await res.arrayBuffer();
    const tile = new VectorTile(new Pbf(new Uint8Array(buf)));
    const layer = tile.layers.contour;
    if (!layer) return [];
    const out = new Array(layer.length);
    for (let i = 0; i < layer.length; i++) {
      out[i] = layer.feature(i).toGeoJSON(x, y, z);
    }
    return out;
  })().catch(() => []);
  tileCache.set(key, p);
  return p;
}

let updateSeq = 0;

export async function updateDetailContours(map) {
  const source = map.getSource("gsiContourDetail");
  if (!source) return;
  const zoom = map.getZoom();
  if (zoom < MIN_VISIBLE_Z || zoom >= MAX_VISIBLE_Z) {
    source.setData({ type: "FeatureCollection", features: [] });
    return;
  }
  const seq = ++updateSeq;
  const b = map.getBounds();
  const [x0, y0] = lonLatToTile(b.getWest(), b.getNorth(), DETAIL_Z);
  const [x1, y1] = lonLatToTile(b.getEast(), b.getSouth(), DETAIL_Z);
  const tiles = [];
  for (let x = x0; x <= x1; x++) {
    for (let y = y0; y <= y1; y++) {
      tiles.push([DETAIL_Z, x, y]);
    }
  }
  if (tiles.length > MAX_TILES_PER_UPDATE) {
    console.warn(
      `contour-detail: skipping update (${tiles.length} tiles > ${MAX_TILES_PER_UPDATE})`,
    );
    return;
  }
  const feats = await Promise.all(
    tiles.map(([z, x, y]) => fetchTileFeatures(z, x, y)),
  );
  if (seq !== updateSeq) return;
  const flat = [];
  for (const arr of feats) for (const f of arr) flat.push(f);
  source.setData({ type: "FeatureCollection", features: flat });
}

export function wireDetailContours(map) {
  const trigger = () => {
    updateDetailContours(map);
  };
  map.on("moveend", trigger);
  map.on("zoomend", trigger);
  if (map.loaded()) trigger();
  else map.once("load", trigger);
}
