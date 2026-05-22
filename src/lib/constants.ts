export const VN_BBOX = {
  west: 102.144,
  south: 8.18,
  east: 109.469,
  north: 23.393,
} as const;

export const VN_CENTER = { lng: 107.5, lat: 16.0, zoom: 5.2 } as const;

// Free, no-key vector tile styles hosted by CartoCDN.
// See https://github.com/CartoDB/basemap-styles
export const MAP_STYLE_URL = {
  light: "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json",
  dark: "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json",
  bright: "https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json",
  // OpenFreeMap (OpenMapTiles schema) — includes building heights for 3D extrusion.
  ofmLiberty: "https://tiles.openfreemap.org/styles/liberty",
  ofmPositron: "https://tiles.openfreemap.org/styles/positron",
  ofmDark: "https://tiles.openfreemap.org/styles/dark",
} as const;

export const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  "2xl": 1440,
} as const;
