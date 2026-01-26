# 🔧 SOLUCIÓN: Crear Tabla en Supabase

## ❌ Problema Actual

El error dice:
```
Could not find the table 'public.kv_store_c94f8b91' in the schema cache
```

Esto significa que **la tabla no existe en tu base de datos de Supabase**.

---

## ✅ SOLUCIÓN (5 minutos)

### Paso 1: Abrir Dashboard de Supabase

1. Ve a: https://supabase.com/dashboard
2. Inicia sesión en tu cuenta
3. Selecciona tu proyecto (el que estás usando para esta app)

### Paso 2: Ir al Editor SQL

1. En el menú izquierdo, busca **"SQL Editor"** o **"Editor SQL"**
2. Haz clic en él
3. Verás un editor de código SQL

### Paso 3: Ejecutar este SQL

Copia y pega este código **EXACTAMENTE** como está:

```sql
CREATE TABLE IF NOT EXISTS kv_store_c94f8b91 (
  key TEXT NOT NULL PRIMARY KEY,
  value JSONB NOT NULL
);
```

### Paso 4: Ejecutar

1. Haz clic en el botón **"Run"** o **"Ejecutar"** (normalmente abajo a la derecha)
2. Deberías ver un mensaje de éxito
3. ✅ **¡Listo! La tabla está creada**

---

## 🔍 Verificar que Funcionó

### Opción A: Desde el Dashboard de Supabase

1. Ve a **"Table Editor"** en el menú izquierdo
2. Busca la tabla **`kv_store_c94f8b91`**
3. Si la ves en la lista, ✅ **funciona**

### Opción B: Desde tu App

1. Recarga tu aplicación (F5)
2. Intenta hacer login con `admin@empresa.com` / `admin123`
3. Si entras, ✅ **funciona**

---

## 📋 Pasos Completos Después de Crear la Tabla

1. **Recarga la página de tu aplicación** (F5)
2. El servidor se reiniciará y creará el usuario por defecto
3. En la consola deberías ver:
   ```
   ✅ Usuario por defecto creado: admin@empresa.com
   ```
4. **Intenta hacer login:**
   - Email: `admin@empresa.com`
   - Contraseña: `admin123`
5. ✅ **¡Deberías entrar sin problemas!**

---

## 🎯 Explicación Simple

La aplicación necesita una tabla en Supabase para guardar datos. Esa tabla se llama `kv_store_c94f8b91` (es como un almacén de datos).

- **Antes:** La tabla no existía → Error 401
- **Después:** La tabla existe → Todo funciona ✅

---

## ❓ Preguntas Frecuentes

### ¿Por qué no se creó automáticamente?

Supabase no permite que las aplicaciones creen tablas automáticamente por seguridad. Debes crearla manualmente una sola vez.

### ¿Solo necesito hacerlo una vez?

**Sí**, solo una vez. Después la tabla permanece ahí para siempre.

### ¿Puedo borrar la tabla después?

No, si la borras, la aplicación dejará de funcionar. Déjala ahí.

### ¿Qué pasa con mis datos?

Una vez creada la tabla, todos tus datos (activos, cuentadantes, etc.) se guardarán ahí automáticamente.

---

## 🆘 Si Algo Sale Mal

### Error: "permission denied"

**Causa:** No tienes permisos para crear tablas.

**Solución:** 
1. Verifica que estás en TU proyecto de Supabase
2. Verifica que eres el propietario del proyecto
3. Si es un proyecto de otra persona, pídele que cree la tabla

### No encuentro el SQL Editor

**Solución:**
1. Busca en el menú: "SQL Editor", "Database", o "Editor SQL"
2. Si no lo encuentras, ve a: Database → SQL Editor

### El SQL no se ejecuta

**Solución:**
1. Copia el código exactamente como está (con el punto y coma al final)
2. Asegúrate de no agregar espacios extra
3. Haz clic en "Run" o presiona Ctrl+Enter

---

## 📸 Guía Visual Rápida

```
1. Dashboard de Supabase
   ↓
2. SQL Editor (en el menú izquierdo)
   ↓
3. Pegar código SQL
   ↓
4. Botón "Run"
   ↓
5. Ver mensaje de éxito ✅
   ↓
6. Recargar tu aplicación
   ↓
7. Login: admin@empresa.com / admin123
   ↓
8. ¡Funciona! 🎉
```

---

## ✨ Después de Crear la Tabla

Todo funcionará:
- ✅ Login y registro
- ✅ Guardar activos en la nube
- ✅ Códigos QR funcionando
- ✅ Sincronización automática
- ✅ Acceso desde múltiples dispositivos

---

**Crea la tabla ahora y en 5 minutos tendrás todo funcionando!** 🚀
