# 🚨 ACCIÓN REQUERIDA - Crear Tabla en Supabase

## ❌ Error Actual

```
Error: Could not find the table 'public.kv_store_c94f8b91'
HTTP 401
```

**Causa:** La tabla de base de datos no existe en tu proyecto de Supabase.

---

## ✅ SOLUCIÓN (2 minutos)

### 1. Abre Supabase Dashboard
Ve a: **https://supabase.com/dashboard**

### 2. Ve al SQL Editor
En el menú izquierdo: **SQL Editor**

### 3. Ejecuta este código:

```sql
CREATE TABLE IF NOT EXISTS kv_store_c94f8b91 (
  key TEXT NOT NULL PRIMARY KEY,
  value JSONB NOT NULL
);
```

### 4. Haz clic en "Run"

### 5. Recarga tu aplicación

---

## 🎯 Después de Crear la Tabla

1. Recarga la página de tu app (F5)
2. El servidor creará automáticamente el usuario: `admin@empresa.com` / `admin123`
3. Haz login con esas credenciales
4. ✅ **¡Todo funcionará!**

---

## 📖 Más Detalles

Lee el archivo **CREAR-TABLA-SUPABASE.md** para instrucciones detalladas con imágenes.

---

**Solo necesitas hacer esto UNA VEZ. Después todo funcionará automáticamente.** 🚀
