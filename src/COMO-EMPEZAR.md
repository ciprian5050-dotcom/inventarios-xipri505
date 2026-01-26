# 🚀 Cómo Empezar - ERROR 401 SOLUCIONADO

## ✅ ¿Qué se arregló?

El error **HTTP 401** ocurría porque estabas intentando iniciar sesión pero **no existía ninguna cuenta en el backend**.

Ahora el sistema:
1. ✅ Crea automáticamente un usuario por defecto al iniciar el servidor
2. ✅ Tiene un botón "Crear Nueva Cuenta" en la pantalla de login
3. ✅ Muestra mensajes de error más claros

---

## 📋 SOLUCIÓN RÁPIDA (2 minutos)

### **Opción 1: Usar cuenta por defecto** (Recomendado)

El servidor ahora crea automáticamente esta cuenta:

```
Email: admin@empresa.com
Contraseña: admin123
```

**Pasos:**
1. Abre la aplicación
2. En la pantalla de login, ingresa:
   - **Email:** `admin@empresa.com`
   - **Contraseña:** `admin123`
3. Haz clic en "Iniciar Sesión"
4. ✅ **¡Listo! Deberías entrar directamente**

---

### **Opción 2: Crear tu propia cuenta**

**Pasos:**
1. En la pantalla de login, haz clic en **"Crear Nueva Cuenta"**
2. Llena el formulario:
   - **Nombre:** Tu nombre (opcional)
   - **Email:** Tu email
   - **Contraseña:** Mínimo 6 caracteres
   - **Confirmar:** La misma contraseña
3. Haz clic en **"Crear Cuenta y Continuar"**
4. ✅ **¡Listo! Entrarás automáticamente**

---

## 🔍 Verificar que Funciona

### 1. Abre la Consola (F12)

Deberías ver mensajes como:

```
🔧 Creando usuario por defecto...
✅ Usuario por defecto creado: admin@empresa.com
✅ Contraseña: admin123
```

### 2. Intenta hacer login

Al iniciar sesión, deberías ver:

```
🔐 [SIGNIN] Intentando login para: admin@empresa.com
✅ [SIGNIN] Usuario encontrado
✅ [SIGNIN] Contraseña correcta
✅ [SIGNIN] Login exitoso
```

### 3. Si entras correctamente

✅ Verás el dashboard con tus activos
✅ La migración automática se ejecutará si tienes datos antiguos
✅ Podrás usar toda la aplicación normalmente

---

## ❌ Si Aún No Funciona

### Error: "Usuario o contraseña incorrectos"

**Causa:** El servidor no se ha iniciado o no creó el usuario por defecto.

**Solución:**
1. Verifica que el servidor se haya iniciado correctamente
2. Busca en los logs del servidor (consola de Supabase) estos mensajes:
   ```
   🚀 Servidor de inventario iniciado correctamente
   ✅ Usuario por defecto creado: admin@empresa.com
   ```
3. Si no ves esos mensajes, el servidor no se inició
4. Crea una cuenta nueva usando la Opción 2

### Error: "Error de conexión"

**Causa:** No hay internet o Supabase está caído.

**Solución:**
1. Verifica tu conexión a internet
2. Intenta recargar la página
3. Espera unos minutos y vuelve a intentar

### Error: "El usuario ya existe"

**Causa:** Ya creaste una cuenta con ese email.

**Solución:**
1. Usa el botón "Ya tengo una cuenta" para volver al login
2. Ingresa con las credenciales que creaste antes

---

## 🎯 Resumen

### ✅ Lo que cambió:
- El servidor ahora crea automáticamente `admin@empresa.com` con contraseña `admin123`
- Hay un botón "Crear Nueva Cuenta" en el login
- Los mensajes de error son más claros
- Puedes elegir entre usar la cuenta por defecto o crear una nueva

### 🚀 Para empezar:
1. Intenta login con `admin@empresa.com` / `admin123`
2. Si no funciona, crea una cuenta nueva
3. Disfruta tu aplicación funcionando

---

## 📱 Después de Entrar

Una vez dentro:
1. ✅ Crea un activo de prueba
2. ✅ Genera su código QR
3. ✅ **Escanéalo desde tu celular**
4. ✅ Debería funcionar perfectamente

---

## 🆘 ¿Necesitas más ayuda?

Abre la consola del navegador (F12) y:

1. **Ve los logs del backend:**
   - Los mensajes con emojis (🔐, ✅, ❌) te dirán qué está pasando

2. **Revisa tu sesión:**
   ```javascript
   console.log(localStorage.getItem('inventory_access_token'));
   // Si ves un token largo, estás logueado
   ```

3. **Prueba el health check:**
   ```javascript
   fetch('TU_URL_SUPABASE/functions/v1/make-server-b351c7a3/health')
     .then(r => r.json())
     .then(console.log);
   // Debería decir "ok"
   ```

---

**¡El error 401 está resuelto! Ahora puedes usar la aplicación normalmente.** 🎉
