/**
 * Database type stub.
 *
 * In production this file is **auto-generated** by Supabase CLI:
 *   npx supabase gen types typescript --project-id <your-id> > src/lib/supabase/types.ts
 *
 * The stub below mirrors the schema in `supabase/migrations/0001_init.sql`
 * so TypeScript compiles before you wire a real project. Re-generate after
 * any schema change.
 */

import type { CategoryKey } from "@/config/categories";

export type PriceRange = "$" | "$$" | "$$$" | "$$$$";
export type SubmissionStatus = "pending" | "approved" | "rejected";
export type ReviewStatus = "pending" | "approved" | "rejected";
export type UserRole = "user" | "editor" | "mod" | "admin";
export type PlaceSource = "seed" | "community";
export type Companion = "family" | "friends" | "couple" | "solo" | "work";

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          display_name: string;
          avatar_url: string | null;
          role: UserRole;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["profiles"]["Row"]> & {
          id: string;
          display_name: string;
        };
        Update: Partial<Database["public"]["Tables"]["profiles"]["Row"]>;
      };

      places: {
        Row: {
          id: string;
          slug: string;
          name: string;
          province: string;
          province_slug: string;
          district: string | null;
          address: string | null;
          category: CategoryKey;
          cover: string;
          rating: number;
          review_count: number;
          highlight: string | null;
          price_range: PriceRange | null;
          opening_hours: string | null;
          tags: string[] | null;
          source: PlaceSource;
          submitted_by: string | null;
          lng: number;
          lat: number;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["places"]["Row"],
          "id" | "created_at" | "updated_at"
        > & { id?: string };
        Update: Partial<Database["public"]["Tables"]["places"]["Row"]>;
      };

      reviews: {
        Row: {
          id: string;
          place_slug: string;
          author_id: string;
          author_name: string;
          rating: number;
          title: string | null;
          body: string;
          photos: string[] | null;
          companion: Companion | null;
          visited_at: string | null;
          status: ReviewStatus;
          created_at: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["reviews"]["Row"],
          "id" | "created_at" | "status"
        > & { id?: string; status?: ReviewStatus };
        Update: Partial<Database["public"]["Tables"]["reviews"]["Row"]>;
      };

      saved_places: {
        Row: {
          user_id: string;
          place_slug: string;
          created_at: string;
        };
        Insert: { user_id: string; place_slug: string };
        Update: never;
      };

      trips: {
        Row: {
          id: string;
          owner_id: string;
          name: string;
          description: string | null;
          cover: string | null;
          destinations: string[];
          days: { label: string; date?: string; placeSlugs: string[]; note?: string }[];
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["trips"]["Row"],
          "id" | "created_at" | "updated_at"
        > & { id?: string };
        Update: Partial<Database["public"]["Tables"]["trips"]["Row"]>;
      };

      place_submissions: {
        Row: {
          id: string;
          name: string;
          category: CategoryKey;
          province: string;
          province_slug: string;
          district: string | null;
          address: string | null;
          description: string;
          lng: number;
          lat: number;
          price_range: PriceRange | null;
          opening_hours: string | null;
          tags: string[] | null;
          photos: string[] | null;
          submitted_by: string;
          submitter_id: string | null;
          status: SubmissionStatus;
          rejection_reason: string | null;
          created_at: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["place_submissions"]["Row"],
          "id" | "created_at" | "status"
        > & { id?: string; status?: SubmissionStatus };
        Update: Partial<Database["public"]["Tables"]["place_submissions"]["Row"]>;
      };
    };

    Functions: {
      places_in_bbox: {
        Args: { west: number; south: number; east: number; north: number };
        Returns: Database["public"]["Tables"]["places"]["Row"][];
      };
    };
  };
}
