import { create } from "zustand";
import { devtools } from "zustand/middleware";

export type SheetSnap = "closed" | "peek" | "half" | "full";

interface UIState {
  sheetSnap: SheetSnap;
  setSheetSnap: (s: SheetSnap) => void;
  searchOpen: boolean;
  setSearchOpen: (open: boolean) => void;
  mobileNavVisible: boolean;
  setMobileNavVisible: (v: boolean) => void;
}

export const useUIStore = create<UIState>()(
  devtools(
    (set) => ({
      sheetSnap: "closed",
      setSheetSnap: (s) => set({ sheetSnap: s }),
      searchOpen: false,
      setSearchOpen: (open) => set({ searchOpen: open }),
      mobileNavVisible: true,
      setMobileNavVisible: (v) => set({ mobileNavVisible: v }),
    }),
    { name: "ui" }
  )
);
