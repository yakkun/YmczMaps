// MapLibre style emulating the "Yama-to-Kogen Chizu" (Shobunsha) palette
// on top of GSI experimental vector tiles.
//
// Source: https://github.com/gsi-cyberjapan/gsivectortile-mapbox-gl-js
// Tiles:  https://cyberjapandata.gsi.go.jp/xyz/experimental_bvmap/{z}/{x}/{y}.pbf

const palette = {
  paper: "#F4EAD3",
  paperShade: "#EADFC2",
  water: "#9FC1E0",
  waterDark: "#6B95BD",
  forest: "#D7E1B7",
  forestDark: "#B7C68C",
  rice: "#E7E6BE",
  building: "#D8C7A1",
  buildingEdge: "#A88B5C",
  road: "#7E654A",
  roadCasing: "#B89E78",
  highway: "#C77848",
  highwayCasing: "#8B4A22",
  trail: "#C8362A",
  contour: "#A88661",
  contourIndex: "#7A552E",
  ink: "#4A3A22",
  inkSoft: "#6E5A36",
  inkHalo: "#F6EFDD",
  boundary: "#9A8A7B",
};

export const styleSpec = {
  version: 8,
  name: "Yama-to-Kogen-like",
  glyphs: "https://glyphs.geolonia.com/{fontstack}/{range}.pbf",
  sources: {
    gsi: {
      type: "vector",
      tiles: [
        "https://cyberjapandata.gsi.go.jp/xyz/experimental_bvmap/{z}/{x}/{y}.pbf",
      ],
      minzoom: 4,
      maxzoom: 16,
      attribution:
        '<a href="https://maps.gsi.go.jp/vector/" target="_blank" rel="noopener">地理院地図Vector</a>',
    },
  },
  layers: [
    {
      id: "background",
      type: "background",
      paint: { "background-color": palette.paper },
    },

    // --- Areas ---------------------------------------------------------------
    {
      id: "landform-area",
      type: "fill",
      source: "gsi",
      "source-layer": "landforma",
      paint: {
        "fill-color": [
          "match",
          ["get", "ftCode"],
          7401, "#C8D5B0", // 湿地
          7402, "#D7E1B7",
          7403, "#E2D6B0", // 砂礫地
          palette.forest,
        ],
        "fill-opacity": 0.55,
      },
    },
    {
      id: "waterarea-fill",
      type: "fill",
      source: "gsi",
      "source-layer": "waterarea",
      paint: {
        "fill-color": palette.water,
        "fill-opacity": 0.85,
      },
    },
    {
      id: "lake-fill",
      type: "fill",
      source: "gsi",
      "source-layer": "lake",
      paint: {
        "fill-color": palette.water,
        "fill-opacity": 0.9,
      },
    },
    {
      id: "structurea-fill",
      type: "fill",
      source: "gsi",
      "source-layer": "structurea",
      minzoom: 13,
      paint: {
        "fill-color": "#D6C39A",
        "fill-opacity": 0.7,
      },
    },
    {
      id: "wstructurea-fill",
      type: "fill",
      source: "gsi",
      "source-layer": "wstructurea",
      minzoom: 12,
      paint: {
        "fill-color": "#B6A07A",
        "fill-opacity": 0.8,
      },
    },

    // --- Contours ------------------------------------------------------------
    // altiFlag: 0=計曲線(index), 1=主曲線, 2=補助曲線
    {
      id: "contour-aux",
      type: "line",
      source: "gsi",
      "source-layer": "contour",
      minzoom: 12,
      filter: ["==", ["get", "altiFlag"], 2],
      paint: {
        "line-color": palette.contour,
        "line-opacity": 0.45,
        "line-width": ["interpolate", ["linear"], ["zoom"], 12, 0.3, 16, 0.7],
      },
    },
    {
      id: "contour-main",
      type: "line",
      source: "gsi",
      "source-layer": "contour",
      minzoom: 11,
      filter: ["==", ["get", "altiFlag"], 1],
      paint: {
        "line-color": palette.contour,
        "line-opacity": 0.7,
        "line-width": ["interpolate", ["linear"], ["zoom"], 11, 0.4, 16, 1.1],
      },
    },
    {
      id: "contour-index",
      type: "line",
      source: "gsi",
      "source-layer": "contour",
      minzoom: 10,
      filter: ["==", ["get", "altiFlag"], 0],
      paint: {
        "line-color": palette.contourIndex,
        "line-opacity": 0.9,
        "line-width": ["interpolate", ["linear"], ["zoom"], 10, 0.6, 16, 1.7],
      },
    },
    {
      id: "contour-index-label",
      type: "symbol",
      source: "gsi",
      "source-layer": "contour",
      minzoom: 13,
      filter: ["==", ["get", "altiFlag"], 0],
      layout: {
        "symbol-placement": "line",
        "text-field": [
          "case",
          ["has", "alti"],
          ["concat", ["to-string", ["get", "alti"]], " m"],
          "",
        ],
        "text-font": ["Noto Sans Regular"],
        "text-size": 10,
        "symbol-spacing": 400,
      },
      paint: {
        "text-color": palette.contourIndex,
        "text-halo-color": palette.inkHalo,
        "text-halo-width": 1.2,
      },
    },

    // --- Hydrography lines ---------------------------------------------------
    {
      id: "coastline",
      type: "line",
      source: "gsi",
      "source-layer": "coastline",
      paint: {
        "line-color": palette.waterDark,
        "line-width": ["interpolate", ["linear"], ["zoom"], 5, 0.4, 14, 1.2],
      },
    },
    {
      id: "river",
      type: "line",
      source: "gsi",
      "source-layer": "river",
      paint: {
        "line-color": palette.waterDark,
        "line-opacity": 0.85,
        "line-width": [
          "interpolate",
          ["linear"],
          ["zoom"],
          9, 0.3,
          12, 0.8,
          16, 2.4,
        ],
      },
    },

    // --- Roads (casing + line) ----------------------------------------------
    {
      id: "road-casing",
      type: "line",
      source: "gsi",
      "source-layer": "road",
      minzoom: 9,
      filter: ["!=", ["get", "motorway"], 1],
      layout: { "line-cap": "round", "line-join": "round" },
      paint: {
        "line-color": palette.roadCasing,
        "line-opacity": 0.6,
        "line-width": [
          "interpolate",
          ["linear"],
          ["zoom"],
          10, 0.6,
          14, 2.2,
          17, 6,
        ],
      },
    },
    {
      id: "road",
      type: "line",
      source: "gsi",
      "source-layer": "road",
      minzoom: 9,
      filter: ["!=", ["get", "motorway"], 1],
      layout: { "line-cap": "round", "line-join": "round" },
      paint: {
        "line-color": palette.paper,
        "line-opacity": 0.9,
        "line-width": [
          "interpolate",
          ["linear"],
          ["zoom"],
          10, 0.2,
          14, 1.2,
          17, 4,
        ],
      },
    },
    {
      id: "road-motorway-casing",
      type: "line",
      source: "gsi",
      "source-layer": "road",
      minzoom: 7,
      filter: ["==", ["get", "motorway"], 1],
      layout: { "line-cap": "round", "line-join": "round" },
      paint: {
        "line-color": palette.highwayCasing,
        "line-width": [
          "interpolate",
          ["linear"],
          ["zoom"],
          7, 0.6,
          12, 2.6,
          16, 6,
        ],
      },
    },
    {
      id: "road-motorway",
      type: "line",
      source: "gsi",
      "source-layer": "road",
      minzoom: 7,
      filter: ["==", ["get", "motorway"], 1],
      layout: { "line-cap": "round", "line-join": "round" },
      paint: {
        "line-color": palette.highway,
        "line-width": [
          "interpolate",
          ["linear"],
          ["zoom"],
          7, 0.4,
          12, 1.8,
          16, 4.4,
        ],
      },
    },

    // Narrow trails / footpaths — highlight the way "Yama-to-Kogen Chizu" does.
    // rnkWidth 4 is the narrowest width class; treat very narrow roads as trails.
    {
      id: "trail",
      type: "line",
      source: "gsi",
      "source-layer": "road",
      minzoom: 12,
      filter: [
        "all",
        ["!=", ["get", "motorway"], 1],
        [">=", ["coalesce", ["get", "rnkWidth"], 0], 4],
      ],
      layout: { "line-cap": "round", "line-join": "round" },
      paint: {
        "line-color": palette.trail,
        "line-opacity": 0.9,
        "line-width": [
          "interpolate",
          ["linear"],
          ["zoom"],
          12, 0.8,
          14, 1.4,
          17, 2.6,
        ],
        "line-dasharray": [2, 1.4],
      },
    },

    // --- Structures / Buildings ---------------------------------------------
    {
      id: "structurel",
      type: "line",
      source: "gsi",
      "source-layer": "structurel",
      minzoom: 12,
      paint: {
        "line-color": palette.buildingEdge,
        "line-opacity": 0.55,
        "line-width": 0.6,
      },
    },
    {
      id: "building",
      type: "fill",
      source: "gsi",
      "source-layer": "building",
      minzoom: 13,
      paint: {
        "fill-color": palette.building,
        "fill-outline-color": palette.buildingEdge,
        "fill-opacity": 0.85,
      },
    },

    // --- Boundaries ----------------------------------------------------------
    {
      id: "boundary-pref",
      type: "line",
      source: "gsi",
      "source-layer": "boundary",
      filter: ["in", ["get", "ftCode"], ["literal", [1211, 51212]]],
      paint: {
        "line-color": palette.boundary,
        "line-opacity": 0.55,
        "line-width": 1.0,
        "line-dasharray": [3, 2],
      },
    },
    {
      id: "boundary-muni",
      type: "line",
      source: "gsi",
      "source-layer": "boundary",
      minzoom: 9,
      filter: ["in", ["get", "ftCode"], ["literal", [1212, 1221, 51221]]],
      paint: {
        "line-color": palette.boundary,
        "line-opacity": 0.35,
        "line-width": 0.6,
        "line-dasharray": [2, 2],
      },
    },

    // --- Labels (place names, peak names, etc.) ------------------------------
    // The "symbol" source-layer carries point labels. We render the text from
    // the 'knj' (kanji name) property when available, falling back to 'name'.
    {
      id: "label-place",
      type: "symbol",
      source: "gsi",
      "source-layer": "symbol",
      minzoom: 8,
      filter: ["has", "knj"],
      layout: {
        "text-field": ["get", "knj"],
        "text-font": ["Noto Sans Regular"],
        "text-size": [
          "interpolate",
          ["linear"],
          ["zoom"],
          8, 10,
          12, 12,
          16, 14,
        ],
        "text-anchor": "top",
        "text-offset": [0, 0.6],
        "text-padding": 4,
        "text-allow-overlap": false,
      },
      paint: {
        "text-color": palette.ink,
        "text-halo-color": palette.inkHalo,
        "text-halo-width": 1.4,
      },
    },
  ],
};
