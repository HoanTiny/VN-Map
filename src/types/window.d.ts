declare global {
  interface Window {
    __mapVN?: {
      zoomIn: () => void;
      zoomOut: () => void;
      flyTo: (lng: number, lat: number, zoom?: number) => void;
      fitBounds: (bounds: { west: number; south: number; east: number; north: number }) => void;
    };
  }
}

export {};
