-- Enable storage extension if not already enabled
create extension if not exists "storage";

-- Création du bucket pour les images des propriétés
do $$
begin
  insert into storage.buckets (id, name, public)
  values ('properties-images', 'properties-images', true)
  on conflict (id) do nothing;
end $$;

-- Politique pour permettre à tous les utilisateurs de voir les images
create policy "Images are publicly accessible"
on storage.objects for select

-- Politique pour permettre aux agents authentifiés d'uploader des images
create policy "Authenticated users can upload images"
on storage.objects for insert
using (
  bucket_id = 'properties-images'
  and auth.role() = 'authenticated'
);

-- Politique pour permettre aux agents de supprimer leurs propres images
create policy "Users can delete their own images"
on storage.objects for delete
using (
  bucket_id = 'properties-images'
  and auth.uid()::text = (storage.foldername(name))[1]
); 