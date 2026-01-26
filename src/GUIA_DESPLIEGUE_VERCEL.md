# 🚀 Guía de Despliegue en Vercel - INVENTARIOS_XIPRI505

Esta guía te ayudará a desplegar tu sistema de gestión de inventarios en **Vercel**, la plataforma más robusta y profesional para aplicaciones React.

---

## 📋 Requisitos Previos

1. **Cuenta de GitHub** (gratuita): https://github.com
2. **Cuenta de Vercel** (gratuita): https://vercel.com
3. **Proyecto Supabase** activo con tus credenciales

---

## 🎯 Paso 1: Preparar el Código en GitHub

### 1.1 Crear Repositorio en GitHub

1. Ve a https://github.com/new
2. Nombre del repositorio: `inventarios-xipri505`
3. Configuración:
   - ✅ Privado (recomendado para proteger tu código)
   - ✅ No agregar README (ya tienes tu código)
4. Clic en **"Create repository"**

### 1.2 Subir tu Código a GitHub

Desde Figma Make, puedes descargar todo el código y luego subirlo a GitHub usando estos comandos en tu terminal:

```bash
# Navega a la carpeta de tu proyecto
cd /ruta/a/tu/proyecto

# Inicializa Git
git init

# Configura tu usuario
git config user.name "Tu Nombre"
git config user.email "tu@email.com"

# Agrega todos los archivos
git add .

# Crea el primer commit
git commit -m "Versión inicial de INVENTARIOS_XIPRI505"

# Conecta con tu repositorio de GitHub
git remote add origin https://github.com/TU-USUARIO/inventarios-xipri505.git

# Sube el código
git branch -M main
git push -u origin main
```

---

## 🌐 Paso 2: Desplegar en Vercel

### 2.1 Conectar GitHub con Vercel

1. Ve a https://vercel.com y haz clic en **"Sign Up"**
2. Selecciona **"Continue with GitHub"**
3. Autoriza a Vercel para acceder a tus repositorios

### 2.2 Importar tu Proyecto

1. En el dashboard de Vercel, clic en **"New Project"**
2. Busca y selecciona `inventarios-xipri505`
3. Clic en **"Import"**

### 2.3 Configurar las Variables de Entorno

**⚠️ IMPORTANTE:** Antes de desplegar, debes configurar las variables de entorno de Supabase:

1. En la pantalla de configuración, ve a **"Environment Variables"**
2. Agrega estas 3 variables (obtén los valores de tu proyecto Supabase):

```
VITE_SUPABASE_URL = https://TU-PROJECT-ID.supabase.co
VITE_SUPABASE_ANON_KEY = tu-anon-key-aqui
VITE_SUPABASE_SERVICE_ROLE_KEY = tu-service-role-key-aqui
```

**¿Dónde encuentro estos valores?**
- Ve a tu proyecto Supabase: https://supabase.com/dashboard
- Settings → API
- Copia: URL del proyecto, anon/public key, y service_role key

### 2.4 Configuración del Build

Vercel detectará automáticamente que es un proyecto React. Verifica esta configuración:

- **Framework Preset:** Vite
- **Build Command:** `npm run build` (automático)
- **Output Directory:** `dist` (automático)
- **Install Command:** `npm install` (automático)

### 2.5 Desplegar

1. Clic en **"Deploy"**
2. Espera 2-3 minutos mientras Vercel construye tu aplicación
3. ¡Listo! Tu aplicación estará disponible en una URL como:
   ```
   https://inventarios-xipri505.vercel.app
   ```

---

## ✅ Paso 3: Configurar Dominio Personalizado (Opcional)

### 3.1 Usar un Dominio Propio

Si tienes un dominio (ejemplo: `inventarios-xipri505.com`):

1. En Vercel, ve a tu proyecto → **Settings** → **Domains**
2. Clic en **"Add"** e ingresa tu dominio
3. Sigue las instrucciones para configurar los registros DNS

### 3.2 Cambiar el Subdominio de Vercel

Si quieres cambiar la URL gratuita de Vercel:

1. En Vercel, ve a tu proyecto → **Settings** → **Domains**
2. Agrega un nuevo dominio: `tu-nombre-personalizado.vercel.app`
3. El anterior seguirá funcionando pero puedes compartir el nuevo

---

## 🔐 Paso 4: Seguridad y CORS en Supabase

Para que tu aplicación desplegada funcione correctamente:

### 4.1 Configurar CORS en Supabase

1. Ve a tu proyecto Supabase → **Settings** → **API**
2. En "Site URL", agrega: `https://inventarios-xipri505.vercel.app`
3. En "Redirect URLs", agrega:
   ```
   https://inventarios-xipri505.vercel.app/*
   ```

### 4.2 Configurar Edge Function

Si tu Edge Function tiene CORS configurado (ya lo tienes), no necesitas cambios adicionales.

---

## 🔄 Paso 5: Actualizaciones Automáticas

Una vez configurado, **cada vez que subas cambios a GitHub**, Vercel automáticamente:

1. ✅ Detecta el cambio
2. ✅ Construye la nueva versión
3. ✅ La despliega sin downtime
4. ✅ Te notifica por email

Para hacer cambios:

```bash
# Haz tus cambios en el código
# ...

# Guarda los cambios
git add .
git commit -m "Descripción de los cambios"
git push

# ¡Vercel se encarga del resto!
```

---

## 📱 Características de Vercel

✅ **SSL/HTTPS automático** - Tu sitio es seguro  
✅ **CDN global** - Velocidad rápida en todo el mundo  
✅ **99.99% uptime** - Siempre disponible  
✅ **Backups automáticos** - Cada despliegue se guarda  
✅ **Preview deployments** - Prueba cambios antes de publicar  
✅ **Analytics gratuito** - Estadísticas de uso  
✅ **Soporte para custom domains** - Usa tu propio dominio  

---

## 🐛 Solución de Problemas Comunes

### Error: "Build failed"

**Causa:** Falta instalar dependencias o hay errores en el código.

**Solución:**
1. Revisa el log de errores en Vercel
2. Verifica que tu código funcione localmente: `npm run build`
3. Asegúrate de que todas las dependencias estén en `package.json`

### Error: "Cannot connect to Supabase"

**Causa:** Variables de entorno mal configuradas.

**Solución:**
1. Ve a Vercel → Settings → Environment Variables
2. Verifica que las 3 variables estén correctas
3. Redespliega: Deployments → ... → Redeploy

### Error: "CORS policy blocked"

**Causa:** Supabase no permite peticiones desde tu dominio Vercel.

**Solución:**
1. Ve a Supabase → Settings → API
2. Agrega tu URL de Vercel en "Site URL" y "Redirect URLs"
3. Espera 1 minuto y recarga tu aplicación

---

## 📊 Monitoreo y Análisis

### Ver Logs de la Aplicación

1. Ve a tu proyecto en Vercel
2. Clic en **"Functions"** o **"Deployments"**
3. Clic en cualquier despliegue para ver los logs

### Analytics

1. En Vercel, ve a **"Analytics"**
2. Verás:
   - Visitantes únicos
   - Páginas vistas
   - Rendimiento
   - Errores

---

## 💰 Costos

**Plan Gratuito de Vercel incluye:**

- ✅ Despliegues ilimitados
- ✅ 100GB de ancho de banda/mes
- ✅ HTTPS automático
- ✅ Preview deployments
- ✅ 1 usuario
- ✅ Dominio personalizado

**Suficiente para:**
- Prototipos
- Uso interno de empresa pequeña/mediana
- Hasta ~10,000 visitantes/mes

**Si necesitas más:**
- Plan Pro: $20 USD/mes
- Incluye más ancho de banda, analytics avanzados, y soporte prioritario

---

## 🎓 Recursos Adicionales

- 📖 Documentación de Vercel: https://vercel.com/docs
- 💬 Comunidad de Vercel: https://vercel.com/community
- 🎥 Tutoriales en YouTube: Busca "Deploy React to Vercel"
- 📧 Soporte de Vercel: support@vercel.com

---

## ✨ Resumen Rápido

1. ✅ Sube tu código a GitHub
2. ✅ Conecta GitHub con Vercel
3. ✅ Configura variables de entorno (Supabase)
4. ✅ Despliega con un clic
5. ✅ Comparte tu URL: `https://inventarios-xipri505.vercel.app`

---

## 🏆 Ventajas de Usar Vercel

✅ **Profesional:** URL limpia y segura (HTTPS)  
✅ **Confiable:** 99.99% de disponibilidad  
✅ **Rápido:** CDN global optimizado  
✅ **Automático:** Despliegues en cada cambio  
✅ **Gratis:** Plan gratuito muy generoso  
✅ **Escalable:** Crece con tu negocio  

---

**¿Necesitas ayuda?** Si tienes problemas con el despliegue, revisa los logs en Vercel o consulta la documentación oficial.

¡Tu sistema **INVENTARIOS_XIPRI505** estará disponible 24/7 para acceso desde cualquier lugar! 🎉
