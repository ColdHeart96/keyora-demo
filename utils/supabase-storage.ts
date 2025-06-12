import { supabase } from './supabase';

const STORAGE_BUCKET = 'properties-images';

export async function uploadPropertyImage(file: File, propertyId: string): Promise<string> {
  try {
    // Créer un nom de fichier unique
    const fileExt = file.name.split('.').pop();
    const fileName = `${propertyId}/${Date.now()}.${fileExt}`;

    // Upload du fichier
    const { data, error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      throw error;
    }

    // Récupérer l'URL publique
    const { data: { publicUrl } } = supabase.storage
      .from(STORAGE_BUCKET)
      .getPublicUrl(fileName);

    return publicUrl;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
}

export async function deletePropertyImage(imageUrl: string): Promise<void> {
  try {
    // Extraire le chemin du fichier de l'URL
    const filePathMatch = imageUrl.match(/properties-images\/(.*)/);
    if (!filePathMatch) {
      throw new Error('Invalid image URL');
    }

    const filePath = filePathMatch[1];
    const { error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .remove([filePath]);

    if (error) {
      throw error;
    }
  } catch (error) {
    console.error('Error deleting image:', error);
    throw error;
  }
}

export async function deletePropertyImages(propertyId: string): Promise<void> {
  try {
    const { data, error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .list(propertyId);

    if (error) {
      throw error;
    }

    if (data && data.length > 0) {
      const filesToDelete = data.map(file => `${propertyId}/${file.name}`);
      const { error: deleteError } = await supabase.storage
        .from(STORAGE_BUCKET)
        .remove(filesToDelete);

      if (deleteError) {
        throw deleteError;
      }
    }
  } catch (error) {
    console.error('Error deleting property images:', error);
    throw error;
  }
} 