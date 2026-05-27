"use client";
import { useEffect, useRef } from "react";
import type {
  Map as MapLibreMap,
  Marker as MapLibreMarker,
  GeoJSONSource,
  MapLayerMouseEvent,
  ExpressionSpecification,
} from "maplibre-gl";
import { useLocale } from "next-intl";
import { useMapStore } from "@/stores/map-store";
import { useUIStore } from "@/stores/ui-store";
import { useTheme } from "@/components/theme/ThemeProvider";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";
import {
  placesData as mockPlacesData,
  type PlacesFC,
} from "../lib/places-data";
import { useMapData } from "../context/MapDataContext";
import { resolveStyleUrl, categoryColorExpression } from "../lib/style-helpers";
import { useRealtimePlaces, type NewPlacePayload } from "@/features/realtime/hooks/useRealtimePlaces";
import type { CategoryKey } from "@/config/categories";
import { provinces, PROVINCE_EN_NAMES } from "@/config/regions";

const SRC = "places";
const SRC_PROVINCES = "provinces";        // point centers — labels
const SRC_PROVINCES_POLY = "provinces-poly"; // VN34.geojson — polygons
const LAYER_CLUSTERS = "clusters";
const LAYER_CLUSTER_COUNT = "cluster-count";
const LAYER_POINTS = "places-points";
const LAYER_POINT_HALO = "places-points-halo";
const LAYER_LABELS = "places-labels";
const LAYER_PROVINCE_LABELS = "province-labels";
const LAYER_PROVINCE_FILL = "province-fill";
const LAYER_PROVINCE_LINE = "province-line";
const LAYER_ISLAND_LABELS = "island-labels";
const LAYER_BUILDINGS_3D = "buildings-3d";
const ISLAND_SLUGS = ["hoang-sa", "truong-sa"] as const;
const VN34_URL = "/json/VN34.geojson";
// OpenMapTiles schema source layer name for buildings (used by OpenFreeMap).
const OMT_SOURCE = "openmaptiles";
const OMT_BUILDING_LAYER = "building";

export interface MapCanvasProps {
  /** Place data for the map source. Falls back to mock if not provided. */
  data?: PlacesFC;
}

type RealtimeFeature = {
  type: "Feature";
  id: string;
  geometry: { type: "Point"; coordinates: [number, number] };
  properties: { id: string; slug: string; name: string; category: CategoryKey; province: string };
};

export function MapCanvas({ data }: MapCanvasProps = {}) {
  const placesData = data ?? mockPlacesData;
  const locale = useLocale();
  const { placesById } = useMapData();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const hoverIdRef = useRef<string | null>(null);
  const selectedIdRef = useRef<string | null>(null);
  const userMarkerRef = useRef<MapLibreMarker | null>(null);
  type MaplibreModule = typeof import("maplibre-gl");
  const maplibreRef = useRef<MaplibreModule | null>(null);
  // Always-current refs for use inside stable closures
  const placesDataRef = useRef(placesData);
  placesDataRef.current = placesData;
  const realtimeFeaturesRef = useRef<RealtimeFeature[]>([]);

  const setReady = useMapStore((s) => s.setReady);
  const setViewport = useMapStore((s) => s.setViewport);
  const setBounds = useMapStore((s) => s.setBounds);
  const select = useMapStore((s) => s.select);
  const setHover = useMapStore((s) => s.setHover);

  const { resolved } = useTheme();
  const reduceMotion = usePrefersReducedMotion();

  /* ---------------------------- Map initialization ---------------------------- */
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    let cancelled = false;
    const { viewport, styleKey, enable3D } = useMapStore.getState();

    (async () => {
      const mod = await import("maplibre-gl");
      maplibreRef.current = mod;
      await import("maplibre-gl/dist/maplibre-gl.css");
      if (cancelled || !containerRef.current) return;

      const map = new mod.Map({
        container: containerRef.current,
        style: resolveStyleUrl(styleKey, resolved, enable3D),
        center: [viewport.lng, viewport.lat],
        zoom: viewport.zoom,
        pitch: enable3D ? 45 : 0,
        attributionControl: { compact: true },
      });

      // Install custom layers every time the style finishes loading.
      // `style.load` fires on the very first load. Some MapLibre versions
      // re-fire it on setStyle() too — but to be defensive we also explicitly
      // re-install from the style-swap effects below (using `idle` as a
      // belt-and-suspenders trigger).
      const installAndRestore = () => {
        installPlacesLayers(map, placesData);
        installProvinceLayers(map, locale);
        const { filter, selectedPlaceId, enable3D, styleKey } = useMapStore.getState();
        const isDark = styleKey === "dark" || (styleKey == null && resolved === "dark");
        if (enable3D) install3DBuildings(map, isDark);
        if (filter.size > 0) {
          const src = map.getSource(SRC) as GeoJSONSource | undefined;
          src?.setData({
            type: "FeatureCollection",
            features: placesData.features.filter((f) => filter.has(f.properties.category)),
          });
        }
        if (selectedPlaceId) {
          map.setFeatureState({ source: SRC, id: selectedPlaceId }, { selected: true });
        }
      };
      map.on("style.load", installAndRestore);
      // Stash for explicit re-trigger from setStyle effects.
      (map as unknown as { __installAndRestore: () => void }).__installAndRestore = installAndRestore;

      map.on("load", () => {
        setReady(true);
        const b = map.getBounds();
        setBounds({ west: b.getWest(), south: b.getSouth(), east: b.getEast(), north: b.getNorth() });

        window.__mapVN = {
          zoomIn: () => map.zoomTo(map.getZoom() + 1, { duration: reduceMotion ? 0 : 280 }),
          zoomOut: () => map.zoomTo(map.getZoom() - 1, { duration: reduceMotion ? 0 : 280 }),
          flyTo: (lng, lat, zoom) =>
            map.flyTo({
              center: [lng, lat],
              zoom: zoom ?? map.getZoom(),
              duration: reduceMotion ? 0 : 1200,
              essential: true,
            }),
          fitBounds: (b) =>
            map.fitBounds(
              [
                [b.west, b.south],
                [b.east, b.north],
              ],
              {
                padding: { top: 140, right: 100, bottom: 100, left: 100 },
                duration: reduceMotion ? 0 : 1400,
                maxZoom: 12,
              }
            ),
          highlightProvince: (slug) => {
            const prov = provinces.find((p) => p.slug === slug);
            if (!prov) return;
            map.flyTo({
              center: prov.center,
              zoom: 8.2,
              duration: reduceMotion ? 0 : 1100,
              essential: true,
            });
            // Polygon fill (if VN34 loaded) + center pulse (always works)
            if (map.getSource(SRC_PROVINCES_POLY)) {
              map.setFeatureState({ source: SRC_PROVINCES_POLY, id: slug }, { active: true });
              window.setTimeout(() => {
                map.setFeatureState({ source: SRC_PROVINCES_POLY, id: slug }, { active: false });
              }, 5500);
            }
          },
        };
      });

      map.on("moveend", () => {
        const c = map.getCenter();
        setViewport({ lng: c.lng, lat: c.lat, zoom: map.getZoom() });
        const b = map.getBounds();
        setBounds({ west: b.getWest(), south: b.getSouth(), east: b.getEast(), north: b.getNorth() });
      });

      /* -------------------------- Hover / click handlers -------------------------- */
      map.on("mouseenter", LAYER_POINTS, () => (map.getCanvas().style.cursor = "pointer"));
      map.on("mouseleave", LAYER_POINTS, () => (map.getCanvas().style.cursor = ""));
      map.on("mouseenter", LAYER_CLUSTERS, () => (map.getCanvas().style.cursor = "pointer"));
      map.on("mouseleave", LAYER_CLUSTERS, () => (map.getCanvas().style.cursor = ""));

      map.on("mousemove", LAYER_POINTS, (e: MapLayerMouseEvent) => {
        const f = e.features?.[0];
        if (!f) return;
        const id = (f.properties as { id?: string })?.id ?? null;
        if (id === hoverIdRef.current) return;
        if (hoverIdRef.current) {
          map.setFeatureState({ source: SRC, id: hoverIdRef.current }, { hover: false });
        }
        if (id) map.setFeatureState({ source: SRC, id }, { hover: true });
        hoverIdRef.current = id;
        setHover(id);
      });
      map.on("mouseleave", LAYER_POINTS, () => {
        if (hoverIdRef.current) {
          map.setFeatureState({ source: SRC, id: hoverIdRef.current }, { hover: false });
        }
        hoverIdRef.current = null;
        setHover(null);
      });

      map.on("click", LAYER_CLUSTERS, async (e: MapLayerMouseEvent) => {
        if (useUIStore.getState().pickMode) return;
        const f = e.features?.[0];
        if (!f) return;
        const clusterId = (f.properties as { cluster_id?: number })?.cluster_id;
        const src = map.getSource(SRC) as GeoJSONSource | undefined;
        if (!src || clusterId == null) return;
        try {
          const zoom = await src.getClusterExpansionZoom(clusterId);
          const coords = (f.geometry as { type: "Point"; coordinates: [number, number] }).coordinates;
          map.easeTo({
            center: coords,
            zoom: Math.min(zoom + 0.2, 16),
            duration: reduceMotion ? 0 : 600,
            easing: (t: number) => 1 - Math.pow(1 - t, 3),
          });
        } catch {
          // ignore
        }
      });

      map.on("click", LAYER_POINTS, (e: MapLayerMouseEvent) => {
        if (useUIStore.getState().pickMode) return;
        const f = e.features?.[0];
        if (!f) return;
        const id = (f.properties as { id?: string })?.id ?? null;
        if (!id) return;
        // Just select — the subscription below handles fly + center.
        select(id);
      });

      map.on("click", (e: MapLayerMouseEvent) => {
        // Pick mode: capture coords + exit pick mode. Handled here so even
        // clicks on marker layers (which return early above) still trigger picks.
        const ui = useUIStore.getState();
        if (ui.pickMode) {
          ui.setPickedCoords({ lng: e.lngLat.lng, lat: e.lngLat.lat });
          ui.setPickMode(false);
          return;
        }
        const features = map.queryRenderedFeatures(e.point, {
          layers: [LAYER_POINTS, LAYER_CLUSTERS],
        });
        if (features.length === 0) select(null);
      });

      mapRef.current = map;
    })();

    return () => {
      cancelled = true;
      userMarkerRef.current?.remove();
      userMarkerRef.current = null;
      mapRef.current?.remove();
      mapRef.current = null;
      maplibreRef.current = null;
      delete window.__mapVN;
      setReady(false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ------------------------ Re-install after style swap ------------------------ */
  // setStyle() wipes all custom sources/layers. The permanent `style.load`
  // listener SHOULD re-install — but MapLibre 4.x sometimes skips re-firing it.
  // We use `idle` (fires when map finishes rendering after style swap) as a
  // reliable belt-and-suspenders trigger.
  const reinstallAfterStyleSwap = (map: MapLibreMap) => {
    map.once("idle", () => {
      const installAndRestore = (
        map as unknown as { __installAndRestore?: () => void }
      ).__installAndRestore;
      // Only re-install if source got wiped (i.e. style.load listener didn't run).
      if (!map.getSource(SRC)) installAndRestore?.();
    });
  };

  /* ------------------------------- Theme change ------------------------------- */
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const { styleKey } = useMapStore.getState();
    map.setStyle(resolveStyleUrl(styleKey, resolved, useMapStore.getState().enable3D));
    reinstallAfterStyleSwap(map);
  }, [resolved]);

  /* -------------------------------- 3D toggle -------------------------------- */
  useEffect(() => {
    const unsub = useMapStore.subscribe(
      (s) => s.enable3D,
      (enable3D) => {
        const map = mapRef.current;
        if (!map) return;
        const { styleKey } = useMapStore.getState();
        map.setStyle(resolveStyleUrl(styleKey, resolved, enable3D));
        reinstallAfterStyleSwap(map);
        map.easeTo({
          pitch: enable3D ? 45 : 0,
          bearing: enable3D ? -17 : 0,
          duration: reduceMotion ? 0 : 900,
        });
      }
    );
    return unsub;
  }, [resolved, reduceMotion]);

  /* ----------------------- Style key change (user-pick) ----------------------- */
  useEffect(() => {
    const unsub = useMapStore.subscribe(
      (s) => s.styleKey,
      (styleKey) => {
        const map = mapRef.current;
        if (!map) return;
        map.setStyle(resolveStyleUrl(styleKey, resolved, useMapStore.getState().enable3D));
        reinstallAfterStyleSwap(map);
      }
    );
    return unsub;
  }, [resolved]);

  /* ------------------------------- Pick mode cursor ------------------------------- */
  useEffect(() => {
    const unsub = useUIStore.subscribe(
      (s) => s.pickMode,
      (pickMode) => {
        const map = mapRef.current;
        if (!map) return;
        map.getCanvas().style.cursor = pickMode ? "crosshair" : "";
      }
    );
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && useUIStore.getState().pickMode) {
        useUIStore.getState().setPickMode(false);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      unsub();
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  /* ----------------------- Filter change (subscription) ----------------------- */
  useEffect(() => {
    const unsub = useMapStore.subscribe(
      (s) => s.filter,
      (filter) => {
        const map = mapRef.current;
        if (!map) return;
        const src = map.getSource(SRC) as GeoJSONSource | undefined;
        if (!src) return;
        const all = [...placesDataRef.current.features, ...realtimeFeaturesRef.current];
        const data =
          filter.size === 0
            ? { type: "FeatureCollection" as const, features: all }
            : {
              type: "FeatureCollection" as const,
              features: all.filter((f) => filter.has(f.properties.category)),
            };
        src.setData(data);
      }
    );
    return unsub;
  }, []);

  /* ----------------------- Realtime: new approved places ----------------------- */
  useRealtimePlaces((place: NewPlacePayload) => {
    const map = mapRef.current;
    if (!map) return;
    const src = map.getSource(SRC) as GeoJSONSource | undefined;
    if (!src) return;

    realtimeFeaturesRef.current = [
      ...realtimeFeaturesRef.current,
      {
        type: "Feature",
        id: place.id,
        geometry: { type: "Point", coordinates: [place.lng, place.lat] },
        properties: {
          id: place.id,
          slug: place.slug,
          name: locale === "en" ? place.name_en ?? place.name : place.name,
          category: place.category as CategoryKey,
          province: place.province,
        },
      },
    ];

    const { filter } = useMapStore.getState();
    const all = [...placesDataRef.current.features, ...realtimeFeaturesRef.current];
    src.setData({
      type: "FeatureCollection",
      features: filter.size === 0 ? all : all.filter((f) => filter.has(f.properties.category)),
    });
  });

  /* ------------------------------ User location ------------------------------ */
  useEffect(() => {
    const unsub = useMapStore.subscribe(
      (s) => s.userLocation,
      (loc) => {
        const map = mapRef.current;
        if (!map) return;

        if (!loc) {
          userMarkerRef.current?.remove();
          userMarkerRef.current = null;
          return;
        }

        if (!userMarkerRef.current) {
          const mod = maplibreRef.current;
          if (!mod) return;
          const el = document.createElement("div");
          el.className = "user-location-marker";
          el.innerHTML = `
            <div class="user-location-marker__ring"></div>
            <div class="user-location-marker__dot"></div>
          `;
          userMarkerRef.current = new mod.Marker({ element: el, anchor: "center" })
            .setLngLat([loc.lng, loc.lat])
            .addTo(map);
        } else {
          userMarkerRef.current.setLngLat([loc.lng, loc.lat]);
        }
      }
    );
    return unsub;
  }, []);

  /* ----------------------- Selected highlight + fly ----------------------- */
  useEffect(() => {
    const unsub = useMapStore.subscribe(
      (s) => s.selectedPlaceId,
      (selectedId) => {
        const map = mapRef.current;
        if (!map) return;
        if (selectedIdRef.current) {
          map.setFeatureState({ source: SRC, id: selectedIdRef.current }, { selected: false });
        }
        selectedIdRef.current = selectedId;
        if (!selectedId) return;

        map.setFeatureState({ source: SRC, id: selectedId }, { selected: true });

        // Fly to place — center in the visible area (account for side panel + card).
        const place = placesById[selectedId];
        if (!place) return;
        const w = typeof window !== "undefined" ? window.innerWidth : 1024;
        const isLg = w >= 1024;
        map.easeTo({
          center: place.coordinates,
          zoom: Math.max(map.getZoom(), 13),
          duration: reduceMotion ? 0 : 800,
          easing: (t: number) => 1 - Math.pow(1 - t, 3),
          // Padding pushes the geographic centre INTO the visible area
          // unobstructed by chrome (top filter / right side panel / bottom-left card).
          padding: isLg
            ? { top: 140, right: 400, bottom: 32, left: 440 }
            : { top: 140, right: 16, bottom: 480, left: 16 },
        });
      }
    );
    return unsub;
  }, [reduceMotion]);

  // Update province label language when locale changes (e.g. VI ↔ EN toggle).
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const expr = provinceNameExpr(locale);
    for (const layerId of [LAYER_PROVINCE_LABELS, LAYER_ISLAND_LABELS]) {
      if (map.getLayer(layerId)) map.setLayoutProperty(layerId, "text-field", expr);
    }
  }, [locale]);

  return <div ref={containerRef} className="h-full w-full" aria-label="Bản đồ Việt Nam" />;
}

/* --------------------------------------------------------------------------- */
/*                         Layer installation helpers                          */
/* --------------------------------------------------------------------------- */

function installPlacesLayers(map: MapLibreMap, placesData: PlacesFC) {
  if (map.getSource(SRC)) return;

  map.addSource(SRC, {
    type: "geojson",
    data: placesData,
    promoteId: "id",
    cluster: true,
    clusterMaxZoom: 12,
    clusterRadius: 50,
  });

  map.addLayer({
    id: LAYER_CLUSTERS,
    type: "circle",
    source: SRC,
    filter: ["has", "point_count"],
    paint: {
      "circle-color": "#FFFFFF",
      "circle-opacity": 0.92,
      "circle-radius": [
        "step",
        ["get", "point_count"],
        18,
        5, 22,
        15, 28,
        30, 34,
      ],
      "circle-stroke-color": "#DA251D",
      "circle-stroke-width": 2,
      "circle-stroke-opacity": 0.9,
    },
  });

  map.addLayer({
    id: LAYER_CLUSTER_COUNT,
    type: "symbol",
    source: SRC,
    filter: ["has", "point_count"],
    layout: {
      "text-field": ["get", "point_count_abbreviated"],
      "text-font": ["Open Sans Bold"],
      "text-size": 12,
    },
    paint: {
      "text-color": "#1A1A1A",
    },
  });

  map.addLayer({
    id: LAYER_POINT_HALO,
    type: "circle",
    source: SRC,
    filter: ["!", ["has", "point_count"]],
    paint: {
      "circle-radius": [
        "case",
        ["boolean", ["feature-state", "selected"], false], 22,
        ["boolean", ["feature-state", "hover"], false], 18,
        0,
      ],
      "circle-color": "#DA251D",
      "circle-opacity": [
        "case",
        ["boolean", ["feature-state", "selected"], false], 0.22,
        ["boolean", ["feature-state", "hover"], false], 0.14,
        0,
      ],
      "circle-blur": 0.4,
    },
  });

  map.addLayer({
    id: LAYER_POINTS,
    type: "circle",
    source: SRC,
    filter: ["!", ["has", "point_count"]],
    paint: {
      "circle-color": categoryColorExpression as unknown as ExpressionSpecification,
      "circle-radius": [
        "case",
        ["boolean", ["feature-state", "selected"], false], 10,
        ["boolean", ["feature-state", "hover"], false], 9,
        7,
      ],
      "circle-stroke-color": "#FFFFFF",
      "circle-stroke-width": [
        "case",
        ["boolean", ["feature-state", "selected"], false], 3,
        2,
      ],
      "circle-translate": [0, -1],
    },
  });


  map.addLayer({
    id: LAYER_LABELS,
    type: "symbol",
    source: SRC,
    filter: ["!", ["has", "point_count"]],
    minzoom: 9,
    layout: {
      "text-field": ["get", "name"],
      "text-font": ["Open Sans Regular"],
      "text-size": 12,
      "text-offset": [0, 1.4],
      "text-anchor": "top",
      "text-allow-overlap": false,
      "text-optional": true,
    },
    paint: {
      "text-color": "#1A1A1A",
      "text-halo-color": "#FFFFFF",
      "text-halo-width": 1.5,
      "text-halo-blur": 0.5,
    },
  });
}

function provinceNameExpr(locale: string): ExpressionSpecification {
  if (locale !== "en") return ["get", "name"];
  const pairs: (string | ExpressionSpecification)[] = [];
  for (const [slug, nameEn] of Object.entries(PROVINCE_EN_NAMES)) {
    pairs.push(slug, nameEn);
  }
  return ["match", ["get", "slug"], ...pairs, ["get", "name"]] as unknown as ExpressionSpecification;
}

function installProvinceLayers(map: MapLibreMap, locale: string) {
  if (map.getSource(SRC_PROVINCES)) return;

  const beforeHalo = map.getLayer(LAYER_POINT_HALO) ? LAYER_POINT_HALO : undefined;

  // Point source for labels (uses center coords from regions.ts — always available)
  map.addSource(SRC_PROVINCES, {
    type: "geojson",
    promoteId: "slug",
    data: {
      type: "FeatureCollection",
      features: provinces.map((p) => ({
        type: "Feature",
        id: p.slug,
        geometry: { type: "Point", coordinates: p.center },
        properties: {
          slug: p.slug,
          name: p.name,
          isCity: !!p.isCity,
          isIsland: (ISLAND_SLUGS as readonly string[]).includes(p.slug),
        },
      })),
    },
  });

  // Polygon source from public/json/VN34.geojson — boundaries + highlight fill
  map.addSource(SRC_PROVINCES_POLY, {
    type: "geojson",
    promoteId: "slug",
    data: VN34_URL,
  });

  // Subtle fill — invisible by default, brand color when active.
  // Islands always carry a permanent patriotic tint.
  map.addLayer(
    {
      id: LAYER_PROVINCE_FILL,
      type: "fill",
      source: SRC_PROVINCES_POLY,
      filter: ["!", ["in", ["get", "slug"], ["literal", [...ISLAND_SLUGS]]]],
      paint: {
        "fill-color": "#DA251D",
        "fill-opacity": [
          "case",
          ["boolean", ["feature-state", "active"], false], 0.18,
          0,
        ],
      },
    },
    beforeHalo
  );

  // Province boundary lines — always faintly visible, thicker when active
  map.addLayer(
    {
      id: LAYER_PROVINCE_LINE,
      type: "line",
      source: SRC_PROVINCES_POLY,
      filter: ["!", ["in", ["get", "slug"], ["literal", [...ISLAND_SLUGS]]]],
      paint: {
        "line-color": [
          "case",
          ["boolean", ["feature-state", "active"], false], "#DA251D",
          "#94a3b8",
        ],
        "line-width": [
          "interpolate", ["linear"], ["zoom"],
          4, ["case", ["boolean", ["feature-state", "active"], false], 2, 0.4],
          8, ["case", ["boolean", ["feature-state", "active"], false], 3, 0.8],
          12, ["case", ["boolean", ["feature-state", "active"], false], 4, 1.2],
        ],
        "line-opacity": [
          "interpolate", ["linear"], ["zoom"],
          4, 0.35,
          7, 0.55,
          10, 0.7,
        ],
      },
    },
    beforeHalo
  );

  // Province name labels — visible at low/medium zoom, hidden when zoomed in.
  // Excludes islands (they have their own always-on layer below).
  map.addLayer({
    id: LAYER_PROVINCE_LABELS,
    type: "symbol",
    source: SRC_PROVINCES,
    filter: ["!", ["boolean", ["get", "isIsland"], false]],
    minzoom: 4.5,
    maxzoom: 9,
    layout: {
      "text-field": provinceNameExpr(locale),
      "text-font": ["Open Sans Bold"],
      "text-size": [
        "interpolate", ["linear"], ["zoom"],
        4.5, 10,
        6, 12,
        8, 14,
      ],
      "text-anchor": "center",
      "text-allow-overlap": false,
      "text-padding": 4,
      "text-letter-spacing": 0.02,
    },
    paint: {
      "text-color": [
        "case",
        ["boolean", ["get", "isCity"], false], "#0F172A",
        "#334155",
      ],
      "text-halo-color": "#FFFFFF",
      "text-halo-width": 1.6,
      "text-halo-blur": 0.3,
      "text-opacity": [
        "interpolate", ["linear"], ["zoom"],
        4.4, 0,
        4.8, 1,
        8.5, 1,
        9, 0,
      ],
    },
  });

  // ── Island star markers (Hoàng Sa & Trường Sa) ──────────────────────────────
  // Draw a 5-pointed star on a canvas and register it as a map icon so we can
  // use a symbol layer — no external image files needed.
  const STAR_PX = 32; // canvas size; pixelRatio:2 → renders at 16 logical px

  const drawStar = (color: string): ImageData => {
    const canvas = document.createElement("canvas");
    canvas.width = STAR_PX;
    canvas.height = STAR_PX;
    const ctx = canvas.getContext("2d")!;
    const cx = STAR_PX / 2;
    const cy = STAR_PX / 2;
    const outerR = STAR_PX / 2 - 2;
    const innerR = outerR * 0.42;
    ctx.beginPath();
    for (let i = 0; i < 10; i++) {
      const r = i % 2 === 0 ? outerR : innerR;
      const angle = (i * Math.PI) / 5 - Math.PI / 2;
      const x = cx + r * Math.cos(angle);
      const y = cy + r * Math.sin(angle);
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();
    ctx.strokeStyle = "#FFFFFF";
    ctx.lineWidth = 2;
    ctx.stroke();
    return ctx.getImageData(0, 0, STAR_PX, STAR_PX);
  };

  if (!map.hasImage("island-star-hoang-sa"))
    map.addImage("island-star-hoang-sa", drawStar("#DA251D"), { pixelRatio: 2 });
  if (!map.hasImage("island-star-truong-sa"))
    map.addImage("island-star-truong-sa", drawStar("#DA251D"), { pixelRatio: 2 });

  // Single symbol layer: star icon + name label to the right, always visible
  map.addLayer({
    id: LAYER_ISLAND_LABELS,
    type: "symbol",
    source: SRC_PROVINCES,
    filter: ["boolean", ["get", "isIsland"], false],
    minzoom: 3,
    layout: {
      "icon-image": ["concat", "island-star-", ["get", "slug"]],
      "icon-size": [
        "interpolate", ["linear"], ["zoom"],
        3, 0.55,
        6, 0.80,
        10, 1.00,
      ],
      "icon-allow-overlap": true,
      "icon-anchor": "center",
      "text-field": provinceNameExpr(locale),
      "text-font": ["Open Sans Bold"],
      "text-size": [
        "interpolate", ["linear"], ["zoom"],
        3, 9,
        5, 11,
        8, 13,
      ],
      "text-anchor": "left",
      "text-offset": [1.1, 0],
      "text-allow-overlap": true,
      "text-optional": true,
      "text-letter-spacing": 0.02,
    },
    paint: {
      "text-color": "#DA251D",
      "text-halo-color": "#FFFFFF",
      "text-halo-width": 2,
      "text-halo-blur": 0.3,
    },
  });
}

/**
 * Insert a fill-extrusion buildings layer using the `openmaptiles` source
 * shipped by OpenFreeMap styles. No-ops when the source/layer is absent
 * (e.g. CartoCDN basemaps don't carry building geometry).
 */
function install3DBuildings(map: MapLibreMap, isDark = false) {
  if (map.getLayer(LAYER_BUILDINGS_3D)) return;
  if (!map.getSource(OMT_SOURCE)) return;

  // Insert before our points layer so markers stay on top.
  const beforeId = map.getLayer(LAYER_POINT_HALO) ? LAYER_POINT_HALO : undefined;

  const colorRamp = isDark
    ? ([
      "interpolate",
      ["linear"],
      ["get", "render_height"],
      0, "#3a3d44",
      50, "#4a4e57",
      200, "#5c616c",
    ] as const)
    : ([
      "interpolate",
      ["linear"],
      ["get", "render_height"],
      0, "#d6d6d6",
      50, "#c0c0c0",
      200, "#a0a0a0",
    ] as const);

  map.addLayer(
    {
      id: LAYER_BUILDINGS_3D,
      type: "fill-extrusion",
      source: OMT_SOURCE,
      "source-layer": OMT_BUILDING_LAYER,
      minzoom: 14,
      filter: ["all", ["!=", ["get", "hide_3d"], true]],
      paint: {
        "fill-extrusion-color": colorRamp as never,
        "fill-extrusion-height": [
          "interpolate",
          ["linear"],
          ["zoom"],
          14, 0,
          15.05, ["get", "render_height"],
        ],
        "fill-extrusion-base": [
          "interpolate",
          ["linear"],
          ["zoom"],
          14, 0,
          15.05, ["get", "render_min_height"],
        ],
        "fill-extrusion-opacity": 0.85,
      },
    },
    beforeId
  );
}
