"use client";
import { useEffect, useRef } from "react";
import type {
  Map as MapLibreMap,
  Marker as MapLibreMarker,
  GeoJSONSource,
  MapLayerMouseEvent,
  ExpressionSpecification,
} from "maplibre-gl";
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

const SRC = "places";
const LAYER_CLUSTERS = "clusters";
const LAYER_CLUSTER_COUNT = "cluster-count";
const LAYER_POINTS = "places-points";
const LAYER_POINT_HALO = "places-points-halo";
const LAYER_LABELS = "places-labels";

export interface MapCanvasProps {
  /** Place data for the map source. Falls back to mock if not provided. */
  data?: PlacesFC;
}

export function MapCanvas({ data }: MapCanvasProps = {}) {
  const placesData = data ?? mockPlacesData;
  const { placesById } = useMapData();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const hoverIdRef = useRef<string | null>(null);
  const selectedIdRef = useRef<string | null>(null);
  const userMarkerRef = useRef<MapLibreMarker | null>(null);
  type MaplibreModule = typeof import("maplibre-gl");
  const maplibreRef = useRef<MaplibreModule | null>(null);

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
    const { viewport, styleKey } = useMapStore.getState();

    (async () => {
      const mod = await import("maplibre-gl");
      maplibreRef.current = mod;
      await import("maplibre-gl/dist/maplibre-gl.css");
      if (cancelled || !containerRef.current) return;

      const map = new mod.Map({
        container: containerRef.current,
        style: resolveStyleUrl(styleKey, resolved),
        center: [viewport.lng, viewport.lat],
        zoom: viewport.zoom,
        attributionControl: { compact: true },
      });

      // Install custom layers every time the style finishes loading.
      // `style.load` fires on the very first load. Some MapLibre versions
      // re-fire it on setStyle() too — but to be defensive we also explicitly
      // re-install from the style-swap effects below (using `idle` as a
      // belt-and-suspenders trigger).
      const installAndRestore = () => {
        installPlacesLayers(map, placesData);
        const { filter, selectedPlaceId } = useMapStore.getState();
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
    map.setStyle(resolveStyleUrl(styleKey, resolved));
    reinstallAfterStyleSwap(map);
  }, [resolved]);

  /* ----------------------- Style key change (user-pick) ----------------------- */
  useEffect(() => {
    const unsub = useMapStore.subscribe(
      (s) => s.styleKey,
      (styleKey) => {
        const map = mapRef.current;
        if (!map) return;
        map.setStyle(resolveStyleUrl(styleKey, resolved));
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
        const data =
          filter.size === 0
            ? placesData
            : {
                type: "FeatureCollection" as const,
                features: placesData.features.filter((f) =>
                  filter.has(f.properties.category)
                ),
              };
        src.setData(data);
      }
    );
    return unsub;
  }, []);

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
