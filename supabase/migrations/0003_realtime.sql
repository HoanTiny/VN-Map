-- Enable Realtime for tables that need live updates
alter publication supabase_realtime add table public.reviews;
alter publication supabase_realtime add table public.places;
alter publication supabase_realtime add table public.place_submissions;
