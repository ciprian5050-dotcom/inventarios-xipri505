# 🔧 Guía de Debugging - Sistema de Activos Fijos

## 🐛 Cómo ver los errores en la consola

### 1. Abrir la Consola del Navegador
- **Chrome/Edge:** Presione `F12` o `Ctrl + Shift + I` (Windows) / `Cmd + Option + I` (Mac)
- **Firefox:** Presione `F12` o `Ctrl + Shift + K`
- **Safari:** `Cmd + Option + C`

### 2. Ir a la pestaña "Console"
Verá todos los mensajes de error aquí en tiempo real.

---

## 🔍 Errores Comunes y Soluciones

### ❌ Error: "Error al iniciar sesión: undefined"

**Causa:** El usuario no existe en Supabase o hay un problema con las credenciales.

**Solución:**
1. **Primera vez usando el sistema:**
   - Regrese a la **pantalla de configuración inicial**
   - Cree una nueva cuenta con email y contraseña
   - Después podrá iniciar sesión

2. **Ya creé una cuenta pero no funciona:**
   - Verifique que esté usando el **email correcto** (case-sensitive)
   - Verifique la **contraseña** (mínimo 6 caracteres)
   - Si usó las credenciales por defecto: `admin@empresa.com` / `admin123`

3. **Revisar logs del servidor:**
   - Abra la consola
   - Busque mensajes que digan "Error al iniciar sesión:"
   - El mensaje debe tener más detalles sobre qué falló

---

### ❌ Error: "No autorizado" al cargar datos

**Causa:** El token de autenticación no se guardó correctamente.

**Solución:**
1. Cierre sesión completamente
2. Vuelva a iniciar sesión
3. Si persiste, limpie el localStorage:
   ```javascript
   // En la consola del navegador:
   localStorage.clear();
   location.reload();
   ```

---

### ❌ Error: "Error al crear usuario: User already registered"

**Causa:** Ya existe un usuario con ese email.

**Solución:**
1. Click en **"Ya tengo una cuenta"**
2. Use sus credenciales existentes para iniciar sesión
3. O use un email diferente para crear otra cuenta

---

### ❌ Error: "Error al obtener activos/cuentadantes/dependencias"

**Causa:** Problema de conectividad con Supabase.

**Solución:**
1. Verifique su conexión a internet
2. Recargue la página
3. Cierre sesión y vuelva a iniciar sesión
4. Si persiste, puede ser un problema temporal del servidor

---

## 🧪 Probar la conexión con Supabase

Ejecute estos comandos en la **Consola del Navegador**:

### 1. Verificar la URL del servidor
```javascript
console.log('URL del servidor:', `https://${projectId}.supabase.co/functions/v1/make-server-b351c7a3`);
```

### 2. Probar el health check
```javascript
fetch('https://kdeznsqesckoiziguvdg.supabase.co/functions/v1/make-server-b351c7a3/health')
  .then(res => res.json())
  .then(data => console.log('Health check:', data))
  .catch(err => console.error('Error en health check:', err));
```

**Respuesta esperada:**
```json
{
  "status": "ok",
  "message": "Sistema de inventario funcionando correctamente"
}
```

### 3. Probar login (solo después de crear usuario)
```javascript
fetch('https://kdeznsqesckoiziguvdg.supabase.co/functions/v1/make-server-b351c7a3/auth/signin', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: 'admin@empresa.com', password: 'admin123' })
})
  .then(res => res.json())
  .then(data => console.log('Login response:', data))
  .catch(err => console.error('Error en login:', err));
```

**Respuesta esperada (exitosa):**
```json
{
  "success": true,
  "accessToken": "ey...",
  "user": {
    "id": "...",
    "email": "admin@empresa.com",
    "nombre": "Administrador"
  }
}
```

**Respuesta esperada (fallo):**
```json
{
  "error": "Credenciales inválidas"
}
```

---

## 📋 Checklist de Debugging

Antes de reportar un problema, verifique:

- [ ] Abrí la consola del navegador (F12)
- [ ] Vi los mensajes de error en la pestaña Console
- [ ] Copié los mensajes de error completos
- [ ] Probé cerrar sesión y volver a iniciar sesión
- [ ] Verifiqué mi conexión a internet
- [ ] Probé en modo incógnito (para descartar problemas de caché)
- [ ] Revisé que el email y contraseña sean correctos
- [ ] Intenté crear una cuenta nueva si es la primera vez

---

## 📞 Información para Soporte

Si necesita reportar un error, incluya:

1. **Mensaje de error completo** (de la consola)
2. **Pasos para reproducir** el error
3. **Captura de pantalla** de la consola
4. **Navegador y versión** (Chrome 120, Firefox 121, etc.)
5. **¿Primera vez usando el sistema?** (Sí/No)

---

## 🎯 Flujo Normal de Primer Uso

**Para referencia, este es el flujo correcto:**

1. **Primera vez → Pantalla de Configuración Inicial**
   - Crear cuenta con email/password
   - Click en "Crear Cuenta y Continuar"
   - ✅ Mensaje de éxito

2. **Redireccionado al Login**
   - Ingresar mismo email/password
   - Click en "Iniciar Sesión"
   - ✅ Cargando datos...

3. **Dashboard**
   - Ver estadísticas
   - Ver banner de bienvenida a Supabase
   - ✅ Sistema funcionando

---

## 💡 Tips Adicionales

### Limpiar todo y empezar de cero:
```javascript
// En la consola del navegador:
localStorage.clear();
sessionStorage.clear();
location.reload();
```

### Ver qué hay en localStorage:
```javascript
console.log('localStorage:', {
  configuracionEmpresa: localStorage.getItem('configuracionEmpresa'),
  activos: localStorage.getItem('activos'),
  'supabase-welcome-dismissed': localStorage.getItem('supabase-welcome-dismissed')
});
```

### Ver el token actual:
```javascript
// Después de iniciar sesión
console.log('Token guardado en memoria:', window.accessToken ? 'Sí' : 'No');
```

---

**Última actualización:** Noviembre 2025
