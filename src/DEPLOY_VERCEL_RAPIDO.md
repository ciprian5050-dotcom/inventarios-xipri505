# 🚀 Desplegar en Vercel - Guía Rápida

## ⚡ MÉTODO 1: DESDE FIGMA MAKE (MÁS RÁPIDO)

### Paso 1: Exportar el código
1. En **Figma Make**, busca el botón de menú (3 puntos o hamburguesa)
2. Haz clic en **"Export"** o **"Download Project"**
3. Descarga el archivo **ZIP**
4. **Extrae** el archivo en tu computadora

---

### Paso 2: Subir a GitHub (Opcional pero recomendado)

#### Si no tienes GitHub:
1. Crea cuenta en: https://github.com/signup
2. Verifica tu email

#### Subir el código:
1. Ve a: https://github.com/new
2. **Nombre del repositorio:** `mi-negocio-app`
3. **Privacidad:** Private (para que nadie vea el código)
4. Click en **"Create repository"**
5. En tu computadora, abre la carpeta del proyecto
6. Sigue las instrucciones en GitHub para subir archivos

O más fácil:
1. En la página del nuevo repositorio
2. Click en **"uploading an existing file"**
3. Arrastra toda la carpeta del proyecto
4. Click **"Commit changes"**

---

### Paso 3: Desplegar en Vercel

#### A. Usando la Web (SIN CÓDIGO)
1. **Ve a:** https://vercel.com/signup
2. **Crea cuenta con GitHub** (botón "Continue with GitHub")
3. **Autoriza Vercel** para acceder a GitHub
4. En Vercel, click **"Add New..."** → **"Project"**
5. **Importa tu repositorio** de GitHub (`mi-negocio-app`)
6. Click **"Import"**
7. **Configuración:**
   - Framework Preset: `Vite` (o el que detecte automáticamente)
   - Build Command: `npm run build` (usualmente detecta solo)
   - Output Directory: `dist` (usualmente detecta solo)
8. Click **"Deploy"**
9. **¡Espera 1-2 minutos!** ⏳
10. **¡Listo!** 🎉 Tu app está en: `https://tu-proyecto.vercel.app`

#### B. Usando el CLI (Más control)
```bash
# 1. Instala Vercel CLI
npm install -g vercel

# 2. Ve a la carpeta de tu proyecto
cd /ruta/a/mi-negocio-app

# 3. Inicia sesión
vercel login

# 4. Despliega (automático)
vercel

# 5. Producción (opcional, para link permanente)
vercel --prod
```

---

## ⚙️ CONFIGURACIÓN DE SUPABASE (IMPORTANTE)

Tu app usa Supabase para el backend. Necesitas configurar las variables de entorno.

### Paso 1: Obtener credenciales de Supabase
1. Ve a: https://supabase.com
2. Inicia sesión (o crea cuenta gratis)
3. Crea un **nuevo proyecto** o usa uno existente
4. Ve a **Settings** → **API**
5. Copia:
   - **Project URL** (ejemplo: `https://abcdefgh.supabase.co`)
   - **anon/public key** (una clave larga)

### Paso 2: Agregar variables en Vercel
1. En Vercel, ve a tu proyecto
2. Click en **"Settings"** (arriba)
3. Click en **"Environment Variables"** (izquierda)
4. Agrega estas variables:

**Variable 1:**
- **Key:** `VITE_SUPABASE_URL`
- **Value:** `https://tu-proyecto.supabase.co` (pega tu URL)
- **Environment:** Production, Preview, Development (marca todas)

**Variable 2:**
- **Key:** `VITE_SUPABASE_ANON_KEY`
- **Value:** `eyJhbGc...` (pega tu anon key completa)
- **Environment:** Production, Preview, Development (marca todas)

5. Click **"Save"**
6. **Redeploy** tu aplicación:
   - Ve a **"Deployments"**
   - Click en los 3 puntos del último deployment
   - Click **"Redeploy"**

---

## 🌐 DOMINIO PERSONALIZADO (OPCIONAL)

Si quieres usar tu propio dominio (ej: `www.minegocio.com`):

### Paso 1: Comprar dominio
Opciones económicas:
- **Namecheap:** https://www.namecheap.com ($3-$15/año)
- **Google Domains:** https://domains.google ($12/año)
- **Hostinger:** https://www.hostinger.com ($1-$10/año)

### Paso 2: Configurar en Vercel
1. En tu proyecto en Vercel
2. Click **"Settings"** → **"Domains"**
3. Click **"Add"**
4. Escribe tu dominio: `minegocio.com`
5. Click **"Add"**
6. Vercel te dará instrucciones DNS

### Paso 3: Configurar DNS
1. Ve a tu proveedor de dominio (Namecheap, etc.)
2. Busca **"DNS Settings"** o **"Manage DNS"**
3. Agrega estos registros:

**Registro A:**
- Type: `A`
- Host: `@`
- Value: `76.76.21.21` (IP de Vercel)

**Registro CNAME:**
- Type: `CNAME`
- Host: `www`
- Value: `cname.vercel-dns.com`

4. **Guarda** los cambios
5. **Espera 1-24 horas** (usualmente 5-30 minutos)
6. ¡Listo! Tu app estará en `https://www.minegocio.com`

---

## 📱 VERIFICAR LA PWA

Después de desplegar:

### En tu celular:
1. **Abre Chrome** (Android) o **Safari** (iPhone)
2. **Visita:** `https://tu-proyecto.vercel.app`
3. **Espera** el mensaje "Instalar aplicación"
4. **Instala** la app
5. **Verifica** que funcione correctamente

### En Chrome DevTools:
1. Abre tu app en Chrome Desktop
2. Presiona **F12**
3. Ve a **"Application"** tab
4. Verifica:
   - ✅ **Manifest:** Debe mostrar tu app
   - ✅ **Service Workers:** Debe estar activo
   - ✅ **Lighthouse:** Corre un test PWA (90+ score)

---

## 🔄 ACTUALIZAR LA APP

Cuando hagas cambios al código:

### Método 1: Desde GitHub
1. **Sube los cambios** a GitHub
2. **Vercel detectará automáticamente** el push
3. **Se desplegará solo** (1-2 minutos)
4. **¡Listo!** Los cambios estarán en vivo

### Método 2: Desde Vercel CLI
```bash
# En la carpeta del proyecto
vercel --prod
```

### Método 3: Manual en Vercel
1. Ve a **"Deployments"** en Vercel
2. Click **"Redeploy"** en el último deployment

---

## 📊 ANALYTICS (OPCIONAL)

Para ver cuántas personas usan tu app:

### Vercel Analytics (Gratis)
1. En tu proyecto en Vercel
2. Click **"Analytics"** (izquierda)
3. Click **"Enable Analytics"**
4. ¡Listo! Verás visitantes, páginas, etc.

### Google Analytics (Gratis)
1. Crea cuenta en: https://analytics.google.com
2. Obtén tu **Measurement ID** (ejemplo: `G-XXXXXXXXXX`)
3. Agrega a tu app (en el `<head>` del HTML)

---

## ✅ CHECKLIST FINAL

Antes de compartir con clientes:

- [ ] App desplegada en Vercel
- [ ] Variables de Supabase configuradas
- [ ] PWA funciona (probaste instalación)
- [ ] Íconos configurados
- [ ] Dominio configurado (opcional)
- [ ] App funciona offline
- [ ] Lighthouse score > 90
- [ ] Probado en Android
- [ ] Probado en iPhone
- [ ] Credenciales de login funcionan

---

## 🆘 SOLUCIÓN DE PROBLEMAS

### "Build failed" al desplegar
**Problema:** Error en el código o dependencias

**Solución:**
```bash
# Prueba construir localmente primero
npm install
npm run build

# Si funciona, sube los cambios a GitHub
# Vercel volverá a intentar el build
```

### "Environment variables not working"
**Problema:** Las variables no se leen

**Solución:**
1. Verifica que empiecen con `VITE_` (importante)
2. Asegúrate de marcar todos los entornos
3. Redeploy después de agregar variables

### "Page not found (404)"
**Problema:** Rutas de React no funcionan

**Solución:**
Crea un archivo `vercel.json` en la raíz:
```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

### "Service Worker not registering"
**Problema:** PWA no funciona

**Solución:**
1. Verifica que `service-worker.js` esté en `/public/`
2. Asegúrate de usar **HTTPS** (Vercel lo hace automático)
3. Limpia el cache del navegador

---

## 🎉 ¡FELICIDADES!

Tu app **Mi Negocio** ahora está en vivo y accesible desde cualquier lugar del mundo. 🌍

**Link para compartir:**
```
https://tu-proyecto.vercel.app
```

Copia este link y compártelo con tus clientes. Ellos podrán instalar la app en sus celulares siguiendo las instrucciones de `INSTRUCCIONES_CLIENTE.md`.

---

## 📞 RECURSOS ÚTILES

- **Documentación Vercel:** https://vercel.com/docs
- **PWA Checklist:** https://web.dev/pwa-checklist/
- **Supabase Docs:** https://supabase.com/docs
- **Vercel Community:** https://github.com/vercel/vercel/discussions

---

**Tiempo estimado total:** 15-30 minutos  
**Costo:** $0 (100% gratis con Vercel Free Tier)  
**Última actualización:** Noviembre 2025
