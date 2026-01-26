import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { projectId, publicAnonKey } from './info';

// Singleton instance del cliente de Supabase
let supabaseClient: any = null;

export function createClient() {
  if (!supabaseClient) {
    const supabaseUrl = `https://${projectId}.supabase.co`;
    supabaseClient = createSupabaseClient(supabaseUrl, publicAnonKey);
    console.log('✅ Cliente de Supabase inicializado');
  }
  return supabaseClient;
}

// Función para crear la tabla automáticamente
export async function createTableIfNotExists(): Promise<{ success: boolean; message: string }> {
  const supabase = createClient();
  
  try {
    console.log('🔧 Intentando crear tabla kv_store_b351c7a3...');
    
    // Intentar crear la tabla usando SQL
    const { error } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS kv_store_b351c7a3 (
          key TEXT PRIMARY KEY,
          value JSONB NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        CREATE INDEX IF NOT EXISTS idx_kv_store_key_prefix ON kv_store_b351c7a3 (key text_pattern_ops);
        
        ALTER TABLE kv_store_b351c7a3 ENABLE ROW LEVEL SECURITY;
        
        DROP POLICY IF EXISTS "Allow all operations" ON kv_store_b351c7a3;
        
        CREATE POLICY "Allow all operations"
          ON kv_store_b351c7a3
          FOR ALL
          TO authenticated, anon
          USING (true)
          WITH CHECK (true);
      `
    });
    
    if (error) {
      console.error('❌ Error creando tabla:', error);
      return {
        success: false,
        message: `No se pudo crear la tabla automáticamente. Usa el método manual.`
      };
    }
    
    console.log('✅ Tabla creada exitosamente');
    return {
      success: true,
      message: 'Tabla kv_store_b351c7a3 creada exitosamente'
    };
  } catch (error: any) {
    console.error('❌ Error:', error);
    return {
      success: false,
      message: 'La creación automática no está disponible. Necesitas crear la tabla manualmente.'
    };
  }
}

// Helper para verificar si la tabla existe
export async function checkTableExists(): Promise<boolean> {
  const supabase = createClient();
  
  try {
    console.log('🔍 Verificando si la tabla kv_store_b351c7a3 existe...');
    
    const { data, error } = await supabase
      .from('kv_store_b351c7a3')
      .select('key')
      .limit(1);
    
    if (error) {
      console.log('❌ Error al verificar tabla:', error);
      // Códigos de error comunes:
      // 42P01 = tabla no existe (PostgreSQL)
      // PGRST204 = tabla no encontrada (PostgREST)
      if (error.code === '42P01' || error.message?.includes('does not exist') || error.message?.includes('not found')) {
        console.log('⚠️ La tabla no existe');
        return false;
      }
      
      // Cualquier otro error también asumimos que la tabla no existe
      console.log('⚠️ Error desconocido, asumiendo que la tabla no existe');
      return false;
    }
    
    console.log('✅ Tabla existe');
    return true;
  } catch (error: any) {
    console.error('❌ Error verificando tabla:', error);
    // Si hay error de red o cualquier otro, asumimos que la tabla no existe
    return false;
  }
}

// Helper para acceder directamente a la tabla kv_store_b351c7a3
export async function kvGet(key: string): Promise<any> {
  const supabase = createClient();
  
  try {
    const { data, error } = await supabase
      .from('kv_store_b351c7a3')
      .select('value')
      .eq('key', key)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        // No se encontró el registro
        return null;
      }
      throw error;
    }
    
    return data?.value;
  } catch (error: any) {
    console.error(`Error en kvGet(${key}):`, error);
    throw error;
  }
}

export async function kvSet(key: string, value: any): Promise<void> {
  const supabase = createClient();
  
  try {
    const { error } = await supabase
      .from('kv_store_b351c7a3')
      .upsert({ key, value }, { onConflict: 'key' });
    
    if (error) throw error;
  } catch (error: any) {
    console.error(`Error en kvSet(${key}):`, error);
    throw error;
  }
}

export async function kvGetByPrefix(prefix: string): Promise<any[]> {
  const supabase = createClient();
  
  try {
    console.log(`🔍 kvGetByPrefix(${prefix}) - Iniciando consulta...`);
    
    const { data, error } = await supabase
      .from('kv_store_b351c7a3')
      .select('value')
      .like('key', `${prefix}%`);
    
    if (error) {
      console.error(`❌ Error en la consulta de ${prefix}:`, {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
      throw error;
    }
    
    console.log(`✅ kvGetByPrefix(${prefix}) - Datos recibidos:`, data?.length || 0, 'registros');
    
    return (data || []).map(row => row.value);
  } catch (error: any) {
    console.error(`❌ Error en kvGetByPrefix(${prefix}):`, {
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code
    });
    
    // Si es un error de red, devolver array vacío en lugar de lanzar error
    if (error.message?.includes('Failed to fetch')) {
      console.warn(`⚠️ Error de red detectado. Devolviendo array vacío.`);
      return [];
    }
    
    throw error;
  }
}

export async function kvDel(key: string): Promise<void> {
  const supabase = createClient();
  
  try {
    const { error } = await supabase
      .from('kv_store_b351c7a3')
      .delete()
      .eq('key', key);
    
    if (error) throw error;
  } catch (error: any) {
    console.error(`Error en kvDel(${key}):`, error);
    throw error;
  }
}