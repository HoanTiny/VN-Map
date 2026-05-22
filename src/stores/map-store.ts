import { create } from "zustand";
import { devtools, subscribeWithSelector } from "zustand/middleware";
import { VN_CENTER } from "@/lib/constants";
import type { CategoryKey } from "@/config/categories";

export interface Viewport {
  lng: number;
  lat: number;
  zoom: number;
  bearing: number;
  pitch: number;
}

export type MapStyleKey = "light" | "dark" | "satellite";

interface MapState {
  viewport: Viewport;
  bounds: { west: number; south: number; east: number; north: number } | null;
  selectedPlaceId: string | null;
  hoverId: string | null;
  ready: boolean;
  filter: Set<CategoryKey>;
  styleKey: MapStyleKey | null; // null = follow theme
  enable3D: boolean;
  userLocation: { lng: number; lat: number; accuracy?: number } | null;
  setViewport: (v: Partial<Viewport>) => void;
  setBounds: (b: MapState["bounds"]) => void;
  select: (id: string | null) => void;
  setHover: (id: string | null) => void;
  setReady: (ready: boolean) => void;
  toggleCategory: (key: CategoryKey) => void;
  clearFilter: () => void;
  setStyleKey: (s: MapStyleKey | null) => void;
  setEnable3D: (v: boolean) => void;
  setUserLocation: (loc: MapState["userLocation"]) => void;
}

export const useMapStore = create<MapState>()(
  devtools(
    subscribeWithSelector((set) => ({
      viewport: { ...VN_CENTER, bearing: 0, pitch: 0 },
      bounds: null,
      selectedPlaceId: null,
      hoverId: null,
      ready: false,
      filter: new Set<CategoryKey>(),
      styleKey: null,
      enable3D: false,
      userLocation: null,
      setViewport: (v) => set((s) => ({ viewport: { ...s.viewport, ...v } })),
      setBounds: (b) => set({ bounds: b }),
      select: (id) => set({ selectedPlaceId: id }),
      setHover: (id) => set({ hoverId: id }),
      setReady: (ready) => set({ ready }),
      toggleCategory: (key) =>
        set((s) => {
          const next = new Set(s.filter);
          if (next.has(key)) next.delete(key);
          else next.add(key);
          return { filter: next };
        }),
      clearFilter: () => set({ filter: new Set() }),
      setStyleKey: (s) => set({ styleKey: s }),
      setEnable3D: (v) => set({ enable3D: v }),
      setUserLocation: (loc) => set({ userLocation: loc }),
    })),
    { name: "map" }
  )
);
