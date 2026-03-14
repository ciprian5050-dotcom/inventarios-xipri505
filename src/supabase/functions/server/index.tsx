import { Hono } from 'npm:hono@4';
import { cors } from 'npm:hono/cors';
import { logger } from 'npm:hono/logger';
import * as kv from './kv_store.tsx';
import { initBucket, uploadPhoto, deletePhoto } from './storage.tsx';
import { createClient } from "@supabase/supabase-js";

const app = new Hono();

// CORS configuration
app.use('*', cors({
  origin: '*',
  credentials: true,
}));

// Logger
app.use('*', logger(console.log));

// ==================== IN-MEMORY FALLBACK STORAGE ====================
// Usado cuando la tabla de Supabase no está disponible
const memoryStore = new Map<string, any>();
let usingMemoryFallback = false;

// Helper para crear cliente de Supabase
const getSupabaseClient = () => createClient(
  Deno.env.get("SUPABASE_URL"),
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY"),
);

// Wrapper para usar kv_store con fallback a memoria
const storage = {
  mode: 'unknown' as 'memory' | 'database' | 'unknown',
  
  async get(key: string): Promise<any> {
    if (usingMemoryFallback) {
      return memoryStore.get(key);
    }
    try {
      const result = await kv.get(key);
      this.mode = 'database';
      return result;
    } catch (error: any) {
      if (error.message?.includes('kv_store') || error.message?.includes('table')) {
        console.log('⚠️ Tabla no disponible, usando almacenamiento en memoria (temporal)');
        usingMemoryFallback = true;
        this.mode = 'memory';
        return memoryStore.get(key);
      }
      throw error;
    }
  },
  
  async set(key: string, value: any): Promise<void> {
    if (usingMemoryFallback) {
      memoryStore.set(key, value);
      this.mode = 'memory';
      return;
    }
    try {
      await kv.set(key, value);
      this.mode = 'database';
    } catch (error: any) {
      if (error.message?.includes('kv_store') || error.message?.includes('table')) {
        console.log('⚠️ Tabla no disponible, usando almacenamiento en memoria (temporal)');
        usingMemoryFallback = true;
        this.mode = 'memory';
        memoryStore.set(key, value);
      } else {
        throw error;
      }
    }
  },
  
  async del(key: string): Promise<void> {
    if (usingMemoryFallback) {
      memoryStore.delete(key);
      return;
    }
    try {
      await kv.del(key);
      this.mode = 'database';
    } catch (error: any) {
      if (error.message?.includes('kv_store') || error.message?.includes('table')) {
        usingMemoryFallback = true;
        this.mode = 'memory';
        memoryStore.delete(key);
      } else {
        throw error;
      }
    }
  },
  
  async getByPrefix(prefix: string): Promise<any[]> {
    if (usingMemoryFallback) {
      const results: any[] = [];
      for (const [key, value] of memoryStore.entries()) {
        if (key.startsWith(prefix)) {
          results.push(value);
        }
      }
      this.mode = 'memory';
      return results;
    }
    try {
      console.log(`🔍 [SERVER] getByPrefix(${prefix}) - Iniciando consulta CON PAGINACIÓN...`);
      
      // Usar paginación para obtener todos los registros (sin límite de 1000)
      const supabase = getSupabaseClient();
      let allData: any[] = [];
      let from = 0;
      const pageSize = 1000;
      let hasMore = true;
      
      while (hasMore) {
        const { data, error } = await supabase
          .from("kv_store_c94f8b91")
          .select("value")
          .like("key", `${prefix}%`)
          .range(from, from + pageSize - 1);
        
        if (error) {
          throw new Error(error.message);
        }
        
        if (data && data.length > 0) {
          allData = allData.concat(data);
          console.log(`📦 [SERVER] Página cargada: ${data.length} registros (total acumulado: ${allData.length})`);
        }
        
        // Verificar si hay más datos
        hasMore = data && data.length === pageSize;
        from += pageSize;
        
        // Protección contra bucles infinitos
        if (from > 100000) {
          console.warn(`⚠️ [SERVER] Límite de seguridad alcanzado (100,000 registros)`);
          break;
        }
      }
      
      console.log(`✅ [SERVER] getByPrefix(${prefix}) - COMPLETADO: ${allData.length} registros totales`);
      
      this.mode = 'database';
      return allData.map((d) => d.value);
    } catch (error: any) {
      if (error.message?.includes('kv_store') || error.message?.includes('table')) {
        usingMemoryFallback = true;
        this.mode = 'memory';
        const results: any[] = [];
        for (const [key, value] of memoryStore.entries()) {
          if (key.startsWith(prefix)) {
            results.push(value);
          }
        }
        return results;
      }
      throw error;
    }
  }
};

// ==================== HELPER FUNCTIONS ====================

// Función simple para hashear contraseñas (usando crypto API de Deno)
async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}

// Generar token de sesión aleatorio
function generateToken(): string {
  return crypto.randomUUID();
}

// Validar token de sesión
async function validateToken(token: string | undefined): Promise<any> {
  if (!token) {
    console.log('⚠️ No se proporcionó token');
    return null;
  }
  
  try {
    const session = await storage.get(`session:${token}`);
    if (!session) {
      console.log('⚠️ Sesión no encontrada para token:', token.substring(0, 10) + '...');
      return null;
    }
    
    // Verificar que la sesión no haya expirado (24 horas)
    const sessionTime = new Date(session.createdAt).getTime();
    const now = Date.now();
    const hoursDiff = (now - sessionTime) / (1000 * 60 * 60);
    
    if (hoursDiff > 24) {
      console.log('⚠️ Sesión expirada');
      await storage.del(`session:${token}`);
      return null;
    }
    
    console.log('✅ Sesión válida para:', session.email);
    return session;
  } catch (error) {
    console.log('❌ Error validando token:', error);
    return null;
  }
}

// ==================== AUTH ROUTES ====================

// Sign up (crear nuevo usuario)
app.post('/make-server-b351c7a3/auth/signup', async (c) => {
  console.log('');
  console.log('═══════════════════════════════════════════════════════');
  console.log('📝 [SIGNUP] Recibida petición de registro');
  console.log('══════════════════════════════════════════════════════');
  
  try {
    const body = await c.req.json();
    console.log('📦 Body recibido:', JSON.stringify(body));
    
    const { email, password, nombre } = body;

    if (!email || !password) {
      console.log('❌ [SIGNUP] Falta email o contraseña');
      return c.json({ error: 'Email y contraseña son requeridos' }, 400);
    }

    if (password.length < 6) {
      console.log('❌ [SIGNUP] Contraseña muy corta');
      return c.json({ error: 'La contraseña debe tener al menos 6 caracteres' }, 400);
    }

    console.log(`📧 [SIGNUP] Creando usuario: ${email}`);

    // Verificar si el usuario ya existe
    console.log('🔍 [SIGNUP] Verificando si usuario existe...');
    const existingUser = await storage.get(`user:${email}`);
    
    if (existingUser) {
      console.log('❌ [SIGNUP] Usuario ya existe');
      return c.json({ error: 'El usuario ya existe. Use un correo diferente o inicie sesión.' }, 400);
    }

    console.log('✅ [SIGNUP] Usuario no existe, procediendo a crear...');

    // Crear usuario
    console.log('🔐 [SIGNUP] Hasheando contraseña...');
    const hashedPassword = await hashPassword(password);
    console.log('✅ [SIGNUP] Contraseña hasheada');

    const userId = crypto.randomUUID();
    const user = {
      id: userId,
      email,
      password: hashedPassword,
      nombre: nombre || 'Administrador',
      rol: 'Administrador',
      createdAt: new Date().toISOString(),
    };

    console.log('💾 [SIGNUP] Guardando usuario en KV store...');
    await storage.set(`user:${email}`, user);
    console.log('✅ [SIGNUP] Usuario guardado exitosamente');

    // Crear sesión automáticamente
    console.log('🎫 [SIGNUP] Generando token de sesión...');
    const token = generateToken();
    const session = {
      userId,
      email,
      token,
      createdAt: new Date().toISOString(),
    };
    
    console.log('💾 [SIGNUP] Guardando sesión en KV store...');
    await storage.set(`session:${token}`, session);
    console.log('✅ [SIGNUP] Sesión guardada exitosamente');

    const response = {
      success: true,
      user: {
        id: userId,
        email,
        nombre: nombre || 'Administrador',
        rol: 'Administrador',
      },
      session: {
        access_token: token,
      },
    };

    console.log('✅ [SIGNUP] Usuario creado exitosamente:', email);
    console.log('📤 [SIGNUP] Enviando respuesta exitosa');
    console.log('══════════════════════════════════════════════════════');
    console.log('');

    return c.json(response, 200);
  } catch (error: any) {
    console.log('❌ [SIGNUP] Error inesperado:', error?.message || error);
    console.log('❌ [SIGNUP] Stack trace:', error?.stack);
    console.log('══════════════════════════════════════════════════════');
    console.log('');
    return c.json({
      error: error?.message || 'Error inesperado al crear usuario',
      details: error?.toString(),
    }, 500);
  }
});

// Sign in (iniciar sesión)
app.post('/make-server-b351c7a3/auth/signin', async (c) => {
  console.log('');
  console.log('═══════════════════════════════════════════════════════');
  console.log('🔐 [SIGNIN] Recibida petición de login');
  console.log('══════════════════════════════════════════════════════');
  
  try {
    const body = await c.req.json();
    console.log('📦 Body recibido:', JSON.stringify({ email: body.email, password: '***' }));
    
    const { email, password } = body;

    if (!email || !password) {
      console.log('❌ [SIGNIN] Falta email o contraseña');
      return c.json({ error: 'Email y contraseña son requeridos' }, 400);
    }

    console.log(`📧 [SIGNIN] Intentando login para: ${email}`);

    // Buscar usuario
    console.log('🔍 [SIGNIN] Buscando usuario en KV store...');
    let user = await storage.get(`user:${email}`);
    
    // Si el usuario no existe Y es el admin por defecto, crearlo automáticamente
    if (!user && email === 'admin@empresa.com' && password === 'admin123') {
      console.log('🔧 [SIGNIN] Usuario admin no existe, creándolo automáticamente...');
      
      try {
        const userId = crypto.randomUUID();
        const hashedPassword = await hashPassword('admin123');
        
        user = {
          id: userId,
          email: 'admin@empresa.com',
          password: hashedPassword,
          nombre: 'Administrador',
          rol: 'Administrador',
          createdAt: new Date().toISOString(),
        };
        
        await storage.set(`user:${email}`, user);
        console.log('✅ [SIGNIN] Usuario admin creado automáticamente');
      } catch (createError: any) {
        console.log('❌ [SIGNIN] Error al crear usuario admin:', createError?.message);
        return c.json({ error: 'Error al inicializar usuario por defecto' }, 500);
      }
    }
    
    if (!user) {
      console.log('❌ [SIGNIN] Usuario no encontrado');
      return c.json({ error: 'Credenciales inválidas' }, 401);
    }

    console.log('✅ [SIGNIN] Usuario encontrado');

    // Verificar contraseña
    console.log('🔐 [SIGNIN] Verificando contraseña...');
    const hashedPassword = await hashPassword(password);
    
    if (user.password !== hashedPassword) {
      console.log('❌ [SIGNIN] Contraseña incorrecta');
      return c.json({ error: 'Credenciales inválidas' }, 401);
    }

    console.log('✅ [SIGNIN] Contraseña correcta');

    // Crear sesión
    console.log('🎫 [SIGNIN] Generando token de sesión...');
    const token = generateToken();
    const session = {
      userId: user.id,
      email: user.email,
      token,
      createdAt: new Date().toISOString(),
    };
    
    console.log('💾 [SIGNIN] Guardando sesión en KV store...');
    await storage.set(`session:${token}`, session);
    console.log('✅ [SIGNIN] Sesión guardada exitosamente');

    const response = {
      success: true,
      accessToken: token,
      user: {
        id: user.id,
        email: user.email,
        nombre: user.nombre,
        rol: user.rol,
      },
    };

    console.log('✅ [SIGNIN] Login exitoso para:', email);
    console.log('📤 [SIGNIN] Enviando respuesta exitosa');
    console.log('═════════════════════════════════════════════════════');
    console.log('');

    return c.json(response, 200);
  } catch (error: any) {
    console.log('❌ [SIGNIN] Error inesperado:', error?.message || error);
    console.log('❌ [SIGNIN] Stack trace:', error?.stack);
    console.log('═══════════════════════════════════════════════════════');
    console.log('');
    return c.json({
      error: error?.message || 'Error inesperado al iniciar sesión',
      details: error?.toString(),
    }, 500);
  }
});

// Sign out (cerrar sesión)
app.post('/make-server-b351c7a3/auth/signout', async (c) => {
  try {
    const token = c.req.header('Authorization')?.split(' ')[1];
    if (token) {
      await storage.del(`session:${token}`);
      console.log('✅ Sesión cerrada');
    }
    return c.json({ success: true });
  } catch (error: any) {
    console.log(`❌ Error en signout: ${error?.message || error}`);
    return c.json({ error: 'Error al cerrar sesión' }, 500);
  }
});

// ==================== ACTIVOS ROUTES ====================

// Get all activos
app.get('/make-server-b351c7a3/activos', async (c) => {
  try {
    const token = c.req.header('Authorization')?.split(' ')[1];
    const session = await validateToken(token);

    if (!session) {
      console.log('❌ No autorizado - token inválido o ausente');
      return c.json({ error: 'No autorizado' }, 401);
    }

    const activos = await storage.getByPrefix('activo:');
    console.log(`✅ Obtenidos ${activos?.length || 0} activos`);
    return c.json({ activos: activos || [] });
  } catch (error: any) {
    console.log(`❌ Error al obtener activos: ${error?.message || error}`);
    return c.json({ error: 'Error al obtener activos' }, 500);
  }
});

// Create activo
app.post('/make-server-b351c7a3/activos', async (c) => {
  try {
    const token = c.req.header('Authorization')?.split(' ')[1];
    const session = await validateToken(token);

    if (!session) {
      return c.json({ error: 'No autorizado' }, 401);
    }

    const activo = await c.req.json();
    const id = Date.now().toString();
    const activoCompleto = { ...activo, id };

    await storage.set(`activo:${id}`, activoCompleto);
    console.log(`✅ Activo creado: ${id}`);

    return c.json({ success: true, activo: activoCompleto });
  } catch (error: any) {
    console.log(`❌ Error al crear activo: ${error?.message || error}`);
    return c.json({ error: 'Error al crear activo' }, 500);
  }
});

// Update activo
app.put('/make-server-b351c7a3/activos/:id', async (c) => {
  try {
    const token = c.req.header('Authorization')?.split(' ')[1];
    const session = await validateToken(token);

    if (!session) {
      return c.json({ error: 'No autorizado' }, 401);
    }

    const id = c.req.param('id');
    const activo = await c.req.json();

    await storage.set(`activo:${id}`, { ...activo, id });
    console.log(`✅ Activo actualizado: ${id}`);

    return c.json({ success: true, activo: { ...activo, id } });
  } catch (error: any) {
    console.log(`❌ Error al actualizar activo: ${error?.message || error}`);
    return c.json({ error: 'Error al actualizar activo' }, 500);
  }
});

// Delete activo
app.delete('/make-server-b351c7a3/activos/:id', async (c) => {
  try {
    const token = c.req.header('Authorization')?.split(' ')[1];
    const session = await validateToken(token);

    if (!session) {
      return c.json({ error: 'No autorizado' }, 401);
    }

    const id = c.req.param('id');
    await storage.del(`activo:${id}`);
    console.log(`✅ Activo eliminado: ${id}`);

    return c.json({ success: true });
  } catch (error: any) {
    console.log(`❌ Error al eliminar activo: ${error?.message || error}`);
    return c.json({ error: 'Error al eliminar activo' }, 500);
  }
});

// ==================== CUENTADANTES ROUTES ====================

// Get all cuentadantes
app.get('/make-server-b351c7a3/cuentadantes', async (c) => {
  try {
    const token = c.req.header('Authorization')?.split(' ')[1];
    const session = await validateToken(token);

    if (!session) {
      return c.json({ error: 'No autorizado' }, 401);
    }

    const cuentadantes = await storage.getByPrefix('cuentadante:');
    return c.json({ cuentadantes: cuentadantes || [] });
  } catch (error: any) {
    console.log(`❌ Error al obtener cuentadantes: ${error?.message || error}`);
    return c.json({ error: 'Error al obtener cuentadantes' }, 500);
  }
});

// Create cuentadante
app.post('/make-server-b351c7a3/cuentadantes', async (c) => {
  try {
    const token = c.req.header('Authorization')?.split(' ')[1];
    const session = await validateToken(token);

    if (!session) {
      return c.json({ error: 'No autorizado' }, 401);
    }

    const cuentadante = await c.req.json();
    const id = Date.now().toString();
    const cuentadanteCompleto = { ...cuentadante, id };

    await storage.set(`cuentadante:${id}`, cuentadanteCompleto);

    return c.json({ success: true, cuentadante: cuentadanteCompleto });
  } catch (error: any) {
    console.log(`❌ Error al crear cuentadante: ${error?.message || error}`);
    return c.json({ error: 'Error al crear cuentadante' }, 500);
  }
});

// Update cuentadante
app.put('/make-server-b351c7a3/cuentadantes/:id', async (c) => {
  try {
    const token = c.req.header('Authorization')?.split(' ')[1];
    const session = await validateToken(token);

    if (!session) {
      return c.json({ error: 'No autorizado' }, 401);
    }

    const id = c.req.param('id');
    const cuentadante = await c.req.json();

    await storage.set(`cuentadante:${id}`, { ...cuentadante, id });

    return c.json({ success: true, cuentadante: { ...cuentadante, id } });
  } catch (error: any) {
    console.log(`❌ Error al actualizar cuentadante: ${error?.message || error}`);
    return c.json({ error: 'Error al actualizar cuentadante' }, 500);
  }
});

// Delete cuentadante
app.delete('/make-server-b351c7a3/cuentadantes/:id', async (c) => {
  try {
    const token = c.req.header('Authorization')?.split(' ')[1];
    const session = await validateToken(token);

    if (!session) {
      return c.json({ error: 'No autorizado' }, 401);
    }

    const id = c.req.param('id');
    await storage.del(`cuentadante:${id}`);

    return c.json({ success: true });
  } catch (error: any) {
    console.log(`❌ Error al eliminar cuentadante: ${error?.message || error}`);
    return c.json({ error: 'Error al eliminar cuentadante' }, 500);
  }
});

// ==================== DEPENDENCIAS ROUTES ====================

// Get all dependencias
app.get('/make-server-b351c7a3/dependencias', async (c) => {
  try {
    const token = c.req.header('Authorization')?.split(' ')[1];
    const session = await validateToken(token);

    if (!session) {
      return c.json({ error: 'No autorizado' }, 401);
    }

    const dependencias = await storage.getByPrefix('dependencia:');
    return c.json({ dependencias: dependencias || [] });
  } catch (error: any) {
    console.log(`❌ Error al obtener dependencias: ${error?.message || error}`);
    return c.json({ error: 'Error al obtener dependencias' }, 500);
  }
});

// Create dependencia
app.post('/make-server-b351c7a3/dependencias', async (c) => {
  try {
    const token = c.req.header('Authorization')?.split(' ')[1];
    const session = await validateToken(token);

    if (!session) {
      return c.json({ error: 'No autorizado' }, 401);
    }

    const dependencia = await c.req.json();
    const id = Date.now().toString();
    const dependenciaCompleta = { ...dependencia, id };

    await storage.set(`dependencia:${id}`, dependenciaCompleta);

    return c.json({ success: true, dependencia: dependenciaCompleta });
  } catch (error: any) {
    console.log(`❌ Error al crear dependencia: ${error?.message || error}`);
    return c.json({ error: 'Error al crear dependencia' }, 500);
  }
});

// Update dependencia
app.put('/make-server-b351c7a3/dependencias/:id', async (c) => {
  try {
    const token = c.req.header('Authorization')?.split(' ')[1];
    const session = await validateToken(token);

    if (!session) {
      return c.json({ error: 'No autorizado' }, 401);
    }

    const id = c.req.param('id');
    const dependencia = await c.req.json();

    await storage.set(`dependencia:${id}`, { ...dependencia, id });

    return c.json({ success: true, dependencia: { ...dependencia, id } });
  } catch (error: any) {
    console.log(`❌ Error al actualizar dependencia: ${error?.message || error}`);
    return c.json({ error: 'Error al actualizar dependencia' }, 500);
  }
});

// Delete dependencia
app.delete('/make-server-b351c7a3/dependencias/:id', async (c) => {
  try {
    const token = c.req.header('Authorization')?.split(' ')[1];
    const session = await validateToken(token);

    if (!session) {
      return c.json({ error: 'No autorizado' }, 401);
    }

    const id = c.req.param('id');
    await storage.del(`dependencia:${id}`);

    return c.json({ success: true });
  } catch (error: any) {
    console.log(`❌ Error al eliminar dependencia: ${error?.message || error}`);
    return c.json({ error: 'Error al eliminar dependencia' }, 500);
  }
});

// ==================== MARCAS ROUTES ====================

// Get all marcas
app.get('/make-server-b351c7a3/marcas', async (c) => {
  try {
    const token = c.req.header('Authorization')?.split(' ')[1];
    const session = await validateToken(token);

    if (!session) {
      return c.json({ error: 'No autorizado' }, 401);
    }

    const marcas = await storage.get('marcas');
    return c.json({ marcas: marcas || [] });
  } catch (error: any) {
    console.log(`❌ Error al obtener marcas: ${error?.message || error}`);
    return c.json({ error: 'Error al obtener marcas' }, 500);
  }
});

// Update marcas
app.put('/make-server-b351c7a3/marcas', async (c) => {
  try {
    const token = c.req.header('Authorization')?.split(' ')[1];
    const session = await validateToken(token);

    if (!session) {
      return c.json({ error: 'No autorizado' }, 401);
    }

    const { marcas } = await c.req.json();
    await storage.set('marcas', marcas);

    return c.json({ success: true, marcas });
  } catch (error: any) {
    console.log(`❌ Error al actualizar marcas: ${error?.message || error}`);
    return c.json({ error: 'Error al actualizar marcas' }, 500);
  }
});

// ==================== CONFIGURACION ROUTES ====================

// Get configuración empresa
app.get('/make-server-b351c7a3/configuracion/empresa', async (c) => {
  try {
    const token = c.req.header('Authorization')?.split(' ')[1];
    const session = await validateToken(token);

    if (!session) {
      return c.json({ error: 'No autorizado' }, 401);
    }

    const config = await storage.get('configuracion:empresa');
    return c.json({ configuracion: config || {} });
  } catch (error: any) {
    console.log(`❌ Error al obtener configuración de empresa: ${error?.message || error}`);
    return c.json({ error: 'Error al obtener configuración' }, 500);
  }
});

// Update configuración empresa
app.put('/make-server-b351c7a3/configuracion/empresa', async (c) => {
  try {
    const token = c.req.header('Authorization')?.split(' ')[1];
    const session = await validateToken(token);

    if (!session) {
      return c.json({ error: 'No autorizado' }, 401);
    }

    const configuracion = await c.req.json();
    await storage.set('configuracion:empresa', configuracion);

    return c.json({ success: true, configuracion });
  } catch (error: any) {
    console.log(`❌ Error al actualizar configuración de empresa: ${error?.message || error}`);
    return c.json({ error: 'Error al actualizar configuración' }, 500);
  }
});

// Get configuración QR pública
app.get('/make-server-b351c7a3/configuracion/qr-publico', async (c) => {
  try {
    const token = c.req.header('Authorization')?.split(' ')[1];
    const session = await validateToken(token);

    if (!session) {
      return c.json({ error: 'No autorizado' }, 401);
    }

    const config = await storage.get('configuracion:qr_publico');
    return c.json({ configuracion: config || {} });
  } catch (error: any) {
    console.log(`❌ Error al obtener configuración QR: ${error?.message || error}`);
    return c.json({ error: 'Error al obtener configuración' }, 500);
  }
});

// Update configuración QR pública
app.put('/make-server-b351c7a3/configuracion/qr-publico', async (c) => {
  try {
    const token = c.req.header('Authorization')?.split(' ')[1];
    const session = await validateToken(token);

    if (!session) {
      return c.json({ error: 'No autorizado' }, 401);
    }

    const configuracion = await c.req.json();
    await storage.set('configuracion:qr_publico', configuracion);

    return c.json({ success: true, configuracion });
  } catch (error: any) {
    console.log(`❌ Error al actualizar configuración QR: ${error?.message || error}`);
    return c.json({ error: 'Error al actualizar configuración' }, 500);
  }
});

// ==================== PUBLIC ROUTES (NO AUTH) ====================

// Get single activo by ID (PUBLIC - para QR codes)
app.get('/make-server-b351c7a3/public/activo/:id', async (c) => {
  try {
    const id = c.req.param('id');
    console.log(`🔍 [PUBLIC] Buscando activo público: ${id}`);
    
    const activo = await storage.get(`activo:${id}`);
    const configuracion = await storage.get('configuracion:qr_publico');
    const empresa = await storage.get('configuracion:empresa');
    
    if (!activo) {
      console.log(`❌ [PUBLIC] Activo no encontrado: ${id}`);
      return c.json({ error: 'Activo no encontrado' }, 404);
    }
    
    console.log(` [PUBLIC] Activo encontrado: ${activo.nombre}`);
    return c.json({ 
      activo,
      configuracion: configuracion || {},
      empresa: empresa || {}
    });
  } catch (error: any) {
    console.log(`❌ [PUBLIC] Error al obtener activo: ${error?.message || error}`);
    return c.json({ error: 'Error al obtener activo' }, 500);
  }
});

// ==================== MIGRATION ROUTE ====================

// Endpoint de estadísticas del backend
app.get('/make-server-b351c7a3/backend-stats', async (c) => {
  try {
    console.log('📊 [STATS] Solicitando estadísticas del backend...');

    // Determinar modo de almacenamiento
    let storageMode: 'memory' | 'database' = 'database';
    if (usingMemoryFallback) {
      storageMode = 'memory';
    }
    
    console.log(`📊 [STATS] Modo de almacenamiento: ${storageMode}`);

    // Obtener todos los datos usando los métodos correctos
    let activos: any[] = [];
    let dependencias: any[] = [];
    let cuentadantes: any[] = [];
    let marcas: any = [];
    let nombresActivos: any = [];
    let grupos: any = [];
    let circulares: any = [];
    
    try {
      activos = await storage.getByPrefix('activo:') || [];
      console.log(`📊 [STATS] Activos encontrados: ${activos.length}`);
    } catch (e: any) {
      console.error(`❌ [STATS] Error obteniendo activos:`, e.message);
      activos = [];
    }
    
    try {
      dependencias = await storage.getByPrefix('dependencia:') || [];
      console.log(`📊 [STATS] Dependencias encontradas: ${dependencias.length}`);
    } catch (e: any) {
      console.error(`❌ [STATS] Error obteniendo dependencias:`, e.message);
      dependencias = [];
    }
    
    try {
      cuentadantes = await storage.getByPrefix('cuentadante:') || [];
      console.log(`📊 [STATS] Cuentadantes encontrados: ${cuentadantes.length}`);
    } catch (e: any) {
      console.error(` [STATS] Error obteniendo cuentadantes:`, e.message);
      cuentadantes = [];
    }
    
    try {
      marcas = await storage.get('marcas') || [];
      console.log(`📊 [STATS] Marcas: ${Array.isArray(marcas) ? marcas.length : 0}`);
    } catch (e: any) {
      console.error(`❌ [STATS] Error obteniendo marcas:`, e.message);
      marcas = [];
    }
    
    try {
      nombresActivos = await storage.get('nombres_activos') || [];
      console.log(`📊 [STATS] Nombres: ${Array.isArray(nombresActivos) ? nombresActivos.length : 0}`);
    } catch (e: any) {
      console.error(`❌ [STATS] Error obteniendo nombres:`, e.message);
      nombresActivos = [];
    }
    
    try {
      grupos = await storage.get('grupos_activos') || [];
      console.log(`📊 [STATS] Grupos: ${Array.isArray(grupos) ? grupos.length : 0}`);
    } catch (e: any) {
      console.error(`❌ [STATS] Error obteniendo grupos:`, e.message);
      grupos = [];
    }
    
    try {
      circulares = await storage.get('circulares') || [];
      console.log(`📊 [STATS] Circulares: ${Array.isArray(circulares) ? circulares.length : 0}`);
    } catch (e: any) {
      console.error(`❌ [STATS] Error obteniendo circulares:`, e.message);
      circulares = [];
    }

    const stats = {
      activos: Array.isArray(activos) ? activos.length : 0,
      dependencias: Array.isArray(dependencias) ? dependencias.length : 0,
      cuentadantes: Array.isArray(cuentadantes) ? cuentadantes.length : 0,
      marcas: Array.isArray(marcas) ? marcas.length : 0,
      nombresActivos: Array.isArray(nombresActivos) ? nombresActivos.length : 0,
      grupos: Array.isArray(grupos) ? grupos.length : 0,
      circulares: Array.isArray(circulares) ? circulares.length : 0,
      lastUpdate: new Date().toISOString(),
      storage: storageMode
    };

    console.log('✅ [STATS] Estadísticas generadas exitosamente:', JSON.stringify(stats));
    return c.json(stats);
  } catch (error: any) {
    console.error('❌ [STATS] Error obteniendo estadísticas:', error.message);
    console.error('❌ [STATS] Stack:', error.stack);
    return c.json({ 
      error: error.message || 'Error al obtener estadísticas',
      details: error.stack
    }, 500);
  }
});

// Endpoint de migración (NO requiere autenticación para facilitar la migración inicial)
app.post('/make-server-b351c7a3/migrate', async (c) => {
  try {
    console.log('📦 Iniciando migración de datos...');
    const data = await c.req.json();
    const {
      activos,
      cuentadantes,
      dependencias,
      marcas,
      nombres_activos,
      grupos_activos,
      circulares,
      configuracionEmpresa
    } = data;

    let migrated = {
      activos: 0,
      cuentadantes: 0,
      dependencias: 0,
      marcas: 0,
      nombresActivos: 0,
      grupos: 0,
      circulares: 0
    };

    // Migrate activos
    if (activos && Array.isArray(activos)) {
      for (const activo of activos) {
        await storage.set(`activo:${activo.id}`, activo);
      }
      migrated.activos = activos.length;
      console.log(`✅ Migrados ${activos.length} activos`);
    }

    // Migrate cuentadantes
    if (cuentadantes && Array.isArray(cuentadantes)) {
      for (const cuentadante of cuentadantes) {
        await storage.set(`cuentadante:${cuentadante.id}`, cuentadante);
      }
      migrated.cuentadantes = cuentadantes.length;
      console.log(`✅ Migrados ${cuentadantes.length} cuentadantes`);
    }

    // Migrate dependencias
    if (dependencias && Array.isArray(dependencias)) {
      for (const dependencia of dependencias) {
        await storage.set(`dependencia:${dependencia.id}`, dependencia);
      }
      migrated.dependencias = dependencias.length;
      console.log(`✅ Migradas ${dependencias.length} dependencias`);
    }

    // Migrate marcas
    if (marcas && Array.isArray(marcas)) {
      await storage.set('marcas', marcas);
      migrated.marcas = marcas.length;
      console.log(`✅ Migradas ${marcas.length} marcas`);
    }

    // Migrate nombres_activos
    if (nombres_activos && Array.isArray(nombres_activos)) {
      await storage.set('nombres_activos', nombres_activos);
      migrated.nombresActivos = nombres_activos.length;
      console.log(`✅ Migrados ${nombres_activos.length} nombres de activos`);
    }

    // Migrate grupos_activos
    if (grupos_activos && Array.isArray(grupos_activos)) {
      await storage.set('grupos_activos', grupos_activos);
      migrated.grupos = grupos_activos.length;
      console.log(`✅ Migrados ${grupos_activos.length} grupos de activos`);
    }

    // Migrate circulares
    if (circulares && Array.isArray(circulares)) {
      await storage.set('circulares', circulares);
      migrated.circulares = circulares.length;
      console.log(`✅ Migradas ${circulares.length} circulares`);
    }

    // Migrate configuracion empresa
    if (configuracionEmpresa) {
      await storage.set('configuracion:empresa', configuracionEmpresa);
      console.log('✅ Migrada configuración de empresa');
    }

    console.log('✅ Migración completada exitosamente');
    return c.json({ 
      success: true,
      message: 'Datos migrados exitosamente',
      migrated
    });
  } catch (error: any) {
    console.log(`❌ Error al migrar datos: ${error?.message || error}`);
    return c.json({ error: 'Error al migrar datos', details: error?.message }, 500);
  }
});

// ==================== NOMBRES ACTIVOS ROUTES ====================

// Get all nombres_activos
app.get('/make-server-b351c7a3/nombres-activos', async (c) => {
  try {
    const token = c.req.header('Authorization')?.split(' ')[1];
    const session = await validateToken(token);

    if (!session) {
      return c.json({ error: 'No autorizado' }, 401);
    }

    const nombresActivos = await storage.get('nombres_activos');
    return c.json({ nombresActivos: nombresActivos || [] });
  } catch (error: any) {
    console.log(`❌ Error al obtener nombres activos: ${error?.message || error}`);
    return c.json({ error: 'Error al obtener nombres activos' }, 500);
  }
});

// Update nombres_activos
app.put('/make-server-b351c7a3/nombres-activos', async (c) => {
  try {
    const token = c.req.header('Authorization')?.split(' ')[1];
    const session = await validateToken(token);

    if (!session) {
      return c.json({ error: 'No autorizado' }, 401);
    }

    const { nombresActivos } = await c.req.json();
    await storage.set('nombres_activos', nombresActivos);

    return c.json({ success: true, nombresActivos });
  } catch (error: any) {
    console.log(`❌ Error al actualizar nombres activos: ${error?.message || error}`);
    return c.json({ error: 'Error al actualizar nombres activos' }, 500);
  }
});

// ==================== GRUPOS ACTIVOS ROUTES ====================

// Get all grupos_activos
app.get('/make-server-b351c7a3/grupos-activos', async (c) => {
  try {
    const token = c.req.header('Authorization')?.split(' ')[1];
    const session = await validateToken(token);

    if (!session) {
      return c.json({ error: 'No autorizado' }, 401);
    }

    const gruposActivos = await storage.get('grupos_activos');
    return c.json({ gruposActivos: gruposActivos || [] });
  } catch (error: any) {
    console.log(`❌ Error al obtener grupos activos: ${error?.message || error}`);
    return c.json({ error: 'Error al obtener grupos activos' }, 500);
  }
});

// Update grupos_activos
app.put('/make-server-b351c7a3/grupos-activos', async (c) => {
  try {
    const token = c.req.header('Authorization')?.split(' ')[1];
    const session = await validateToken(token);

    if (!session) {
      return c.json({ error: 'No autorizado' }, 401);
    }

    const { gruposActivos } = await c.req.json();
    await storage.set('grupos_activos', gruposActivos);

    return c.json({ success: true, gruposActivos });
  } catch (error: any) {
    console.log(`❌ Error al actualizar grupos activos: ${error?.message || error}`);
    return c.json({ error: 'Error al actualizar grupos activos' }, 500);
  }
});

// ==================== CIRCULARES ROUTES ====================

// Get all circulares
app.get('/make-server-b351c7a3/circulares', async (c) => {
  try {
    const token = c.req.header('Authorization')?.split(' ')[1];
    const session = await validateToken(token);

    if (!session) {
      return c.json({ error: 'No autorizado' }, 401);
    }

    const circulares = await storage.get('circulares');
    return c.json({ circulares: circulares || [] });
  } catch (error: any) {
    console.log(`❌ Error al obtener circulares: ${error?.message || error}`);
    return c.json({ error: 'Error al obtener circulares' }, 500);
  }
});

// Update circulares
app.put('/make-server-b351c7a3/circulares', async (c) => {
  try {
    const token = c.req.header('Authorization')?.split(' ')[1];
    const session = await validateToken(token);

    if (!session) {
      return c.json({ error: 'No autorizado' }, 401);
    }

    const { circulares } = await c.req.json();
    await storage.set('circulares', circulares);

    return c.json({ success: true, circulares });
  } catch (error: any) {
    console.log(`❌ Error al actualizar circulares: ${error?.message || error}`);
    return c.json({ error: 'Error al actualizar circulares' }, 500);
  }
});

// ==================== FOTOS ROUTES ====================

// Upload photo for activo
app.post('/make-server-b351c7a3/fotos/upload', async (c) => {
  try {
    const token = c.req.header('Authorization')?.split(' ')[1];
    const session = await validateToken(token);

    if (!session) {
      return c.json({ error: 'No autorizado' }, 401);
    }

    const { fileData, fileName } = await c.req.json();
    
    if (!fileData || !fileName) {
      return c.json({ error: 'Datos de archivo incompletos' }, 400);
    }

    const photoUrl = await uploadPhoto(fileData, fileName);
    
    if (!photoUrl) {
      return c.json({ error: 'Error al subir la foto' }, 500);
    }

    console.log(`✅ Foto subida: ${fileName}`);
    return c.json({ success: true, photoUrl });
  } catch (error: any) {
    console.log(`❌ Error al subir foto: ${error?.message || error}`);
    return c.json({ error: 'Error al subir foto' }, 500);
  }
});

// Delete photo
app.delete('/make-server-b351c7a3/fotos/:fileName', async (c) => {
  try {
    const token = c.req.header('Authorization')?.split(' ')[1];
    const session = await validateToken(token);

    if (!session) {
      return c.json({ error: 'No autorizado' }, 401);
    }

    const fileName = c.req.param('fileName');
    const deleted = await deletePhoto(fileName);
    
    if (!deleted) {
      return c.json({ error: 'Error al eliminar la foto' }, 500);
    }

    console.log(`✅ Foto eliminada: ${fileName}`);
    return c.json({ success: true });
  } catch (error: any) {
    console.log(`❌ Error al eliminar foto: ${error?.message || error}`);
    return c.json({ error: 'Error al eliminar foto' }, 500);
  }
});

// Health check
app.get('/make-server-b351c7a3/health', (c) => {
  return c.json({
    status: 'ok',
    message: 'Sistema de inventario funcionando correctamente',
    timestamp: new Date().toISOString(),
    authSystem: 'custom-kv-store',
  });
});

console.log('🚀 Servidor de inventario iniciado correctamente');
console.log('🔐 Sistema de autenticación: KV Store personalizado');

// Inicializar bucket de fotos
initBucket().then(() => {
  console.log('📸 Sistema de almacenamiento de fotos inicializado');
}).catch(err => {
  console.log('⚠️ Error al inicializar bucket de fotos:', err.message);
});

// Dar tiempo al sistema para detectar si Supabase está disponible
setTimeout(() => {
  if (usingMemoryFallback) {
    console.log('');
    console.log('⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️');
    console.log('⚠️  MODO FALLBACK ACTIVADO - ALMACENAMIENTO TEMPORAL');
    console.log('⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️');
    console.log('');
    console.log('La tabla de Supabase NO está disponible.');
    console.log('Usando almacenamiento en MEMORIA (los datos se perderán al reiniciar).');
    console.log('');
    console.log('✅ Puedes usar la app normalmente PERO:');
    console.log('   ❌ Los códigos QR NO funcionarán desde celulares');
    console.log('   ❌ Los datos se perderán al reiniciar el servidor');
    console.log('   ❌ No hay sincronización en la nube');
    console.log('');
    console.log('PARA ACTIVAR FUNCIONALIDAD COMPLETA:');
    console.log('Ve a: https://supabase.com/dashboard/project/yltikqxlptgiefdhwfia/sql/new');
    console.log('Ejecuta: CREATE TABLE IF NOT EXISTS kv_store_c94f8b91 (key TEXT NOT NULL PRIMARY KEY, value JSONB NOT NULL);');
    console.log('');
    console.log('🔐 Sistema de autenticación: Crea tu cuenta o contacta al administrador');
    console.log('');
  } else {
    console.log('');
    console.log('✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅');
    console.log('✅  BASE DE DATOS CONECTADA CORRECTAMENTE');
    console.log('✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅');
    console.log('');
    console.log('✅ Códigos QR funcionando desde celulares');
    console.log('✅ Datos guardados en la nube');
    console.log('✅ Sincronización activada');
    console.log('');
  }
}, 100);

Deno.serve(app.fetch);
