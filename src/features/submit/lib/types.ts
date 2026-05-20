import type { CategoryKey } from "@/config/categories";

export type SubmissionStatus = "pending" | "approved" | "rejected";

export interface PlaceSubmission {
  id: string;
  name: string;
  category: CategoryKey;
  province: string;       // display name
  provinceSlug: string;
  district?: string;
  address?: string;
  description: string;
  lng: number;
  lat: number;
  priceRange?: "$" | "$$" | "$$$" | "$$$$";
  openingHours?: string;
  tags?: string[];
  photos?: string[];      // data URLs (≤ 3, ≤ 1.5MB each)
  submittedBy: string;
  createdAt: number;      // epoch ms
  status: SubmissionStatus;
}
