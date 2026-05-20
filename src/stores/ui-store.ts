import { create } from "zustand";
import { devtools, subscribeWithSelector } from "zustand/middleware";

export type SheetSnap = "closed" | "peek" | "half" | "full";

interface UIState {
  sheetSnap: SheetSnap;
  setSheetSnap: (s: SheetSnap) => void;
  searchOpen: boolean;
  setSearchOpen: (open: boolean) => void;
  mobileNavVisible: boolean;
  setMobileNavVisible: (v: boolean) => void;
  // Map "pick a location" mode for community contribution
  pickMode: boolean;
  setPickMode: (v: boolean) => void;
  pickedCoords: { lng: number; lat: number } | null;
  setPickedCoords: (c: { lng: number; lat: number } | null) => void;
  /**
   * Trip-pick mode — when navigating /explore from TripPlanner to add existing
   * places to a specific day. Cleared on "Xong" or back-nav.
   */
  tripPickContext: { tripId: string; dayIndex: number } | null;
  setTripPickContext: (c: { tripId: string; dayIndex: number } | null) => void;
}

export const useUIStore = create<UIState>()(
  devtools(
    subscribeWithSelector((set) => ({
      sheetSnap: "closed",
      setSheetSnap: (s) => set({ sheetSnap: s }),
      searchOpen: false,
      setSearchOpen: (open) => set({ searchOpen: open }),
      mobileNavVisible: true,
      setMobileNavVisible: (v) => set({ mobileNavVisible: v }),
      pickMode: false,
      setPickMode: (v) => set({ pickMode: v }),
      pickedCoords: null,
      setPickedCoords: (c) => set({ pickedCoords: c }),
      tripPickContext: null,
      setTripPickContext: (c) => set({ tripPickContext: c }),
    })),
    { name: "ui" }
  )
);
