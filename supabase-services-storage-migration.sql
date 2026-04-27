-- Services storage bucket (apply in Supabase Dashboard → Storage)
insert into storage.buckets (id, name, public)
values ('services', 'services', true)
on conflict (id) do nothing;

create policy "Service files are public"
on storage.objects for select
using (bucket_id = 'services');

create policy "Authenticated users can upload service files"
on storage.objects for insert
with check (bucket_id = 'services' and auth.uid() is not null);

create policy "Owners can delete own service files"
on storage.objects for delete
using (bucket_id = 'services' and auth.uid()::text = (storage.foldername(name))[1]);
