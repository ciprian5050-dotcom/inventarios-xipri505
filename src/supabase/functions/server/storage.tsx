// Storage handler para manejo de imágenes
import { createClient } from 'jsr:@supabase/supabase-js@2';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

export const supabase = createClient(supabaseUrl, supabaseKey);

const BUCKET_NAME = 'make-b351c7a3-activos';

// Inicializar bucket de fotos
export async function initBucket() {
  try {
    const { data: buckets } = await supabase.storage.listBuckets();
    const bucketExists = buckets?.some(bucket => bucket.name === BUCKET_NAME);
    
    if (!bucketExists) {
      const { error } = await supabase.storage.createBucket(BUCKET_NAME, {
        public: false,
        fileSizeLimit: 5242880 // 5MB por imagen
      });
      
      if (error) {
        console.log('❌ Error creando bucket:', error.message);
      } else {
        console.log('✅ Bucket de fotos creado exitosamente');
      }
    } else {
      console.log('✅ Bucket de fotos ya existe');
    }
  } catch (error: any) {
    console.log('⚠️ Error al inicializar bucket:', error.message);
  }
}

// Subir foto
export async function uploadPhoto(fileData: string, fileName: string): Promise<string | null> {
  try {
    // Convertir base64 a blob
    const base64Data = fileData.split(',')[1];
    const mimeType = fileData.match(/data:([^;]+);/)?.[1] || 'image/jpeg';
    
    const byteCharacters = atob(base64Data);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(fileName, byteArray, {
        contentType: mimeType,
        upsert: true
      });
    
    if (error) {
      console.log('❌ Error subiendo foto:', error.message);
      return null;
    }
    
    // Crear URL firmada (válida por 1 año)
    const { data: urlData } = await supabase.storage
      .from(BUCKET_NAME)
      .createSignedUrl(fileName, 31536000); // 1 año
    
    return urlData?.signedUrl || null;
  } catch (error: any) {
    console.log('❌ Error en uploadPhoto:', error.message);
    return null;
  }
}

// Eliminar foto
export async function deletePhoto(fileName: string): Promise<boolean> {
  try {
    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .remove([fileName]);
    
    if (error) {
      console.log('❌ Error eliminando foto:', error.message);
      return false;
    }
    
    return true;
  } catch (error: any) {
    console.log('❌ Error en deletePhoto:', error.message);
    return false;
  }
}
