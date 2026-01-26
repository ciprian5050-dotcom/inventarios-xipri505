# 📱 Guía de Instalación - Mi Negocio App

## 🎯 ¿Qué es esta aplicación?

**Mi Negocio** es una Progressive Web App (PWA) que funciona como una app nativa en tu celular, pero sin necesidad de descargarla desde Google Play o App Store.

---

## 📲 INSTALACIÓN PARA CLIENTES

### 🤖 **En Android (Chrome/Edge)**

1. **Abre el navegador Chrome** en tu celular
2. **Visita la página web:** `https://tu-dominio.vercel.app` (o el link que te compartieron)
3. **Busca el mensaje** que dice "Instalar aplicación" o busca el ícono de **⬇️ Descargar** en la barra superior
4. **Toca "Agregar a pantalla de inicio"** o **"Instalar"**
5. **¡Listo!** Ahora tendrás el ícono de **Mi Negocio** en tu pantalla principal

#### Pasos visuales:
```
📱 Abre Chrome → 🌐 Visita la web → 💾 Busca "Instalar" → ✅ Acepta → 🎉 ¡Instalada!
```

---

### 🍎 **En iPhone (Safari)**

1. **Abre Safari** (el navegador de Apple)
2. **Visita la página web:** `https://tu-dominio.vercel.app`
3. **Toca el botón de compartir** (el cuadrito con la flecha hacia arriba) ⬆️
4. **Desplázate hacia abajo** y busca **"Agregar a pantalla de inicio"**
5. **Toca "Agregar"** en la esquina superior derecha
6. **¡Listo!** La app está en tu pantalla de inicio

#### Pasos visuales:
```
📱 Abre Safari → 🌐 Visita la web → ⬆️ Compartir → ➕ Agregar a inicio → ✅ Listo
```

---

## 🚀 DESPLIEGUE PARA DESARROLLADORES

### **Opción 1: Vercel (Recomendado - 5 minutos)**

#### Método A: Desde Figma Make
1. En Figma Make, busca el botón **"Export"** o **"Download"**
2. Descarga todo el código del proyecto
3. Extrae el archivo ZIP en tu computadora

#### Método B: Desplegar directamente
1. **Crea una cuenta en Vercel:** https://vercel.com
2. **Instala Vercel CLI:**
   ```bash
   npm i -g vercel
   ```

3. **Navega a la carpeta del proyecto:**
   ```bash
   cd mi-proyecto
   ```

4. **Inicia sesión:**
   ```bash
   vercel login
   ```

5. **Despliega:**
   ```bash
   vercel
   ```

6. **Sigue las preguntas:**
   - Set up and deploy? → **Y** (Yes)
   - Which scope? → Selecciona tu cuenta
   - Link to existing project? → **N** (No)
   - Project name? → **mi-negocio** (o el nombre que quieras)
   - In which directory is your code? → **./** (presiona Enter)
   - Build settings? → **Y** (Yes)
   - Framework? → **Vite** o **Create React App** (según tu proyecto)
   
7. **¡Listo!** Te dará una URL como: `https://mi-negocio-abc123.vercel.app`

#### Configurar dominio propio (Opcional)
1. Ve a tu proyecto en https://vercel.com/dashboard
2. Click en **"Settings"** → **"Domains"**
3. Agrega tu dominio: `tunegocio.com`
4. Sigue las instrucciones para configurar DNS

---

### **Opción 2: Netlify**

1. **Crea cuenta en Netlify:** https://netlify.com
2. **Conecta con GitHub:**
   - Sube tu código a GitHub
   - En Netlify: "New site from Git"
   - Selecciona tu repositorio
3. **Configuración de build:**
   - Build command: `npm run build` o `vite build`
   - Publish directory: `dist` o `build`
4. **Deploy!** 

Tu sitio estará en: `https://tu-sitio.netlify.app`

---

### **Opción 3: Firebase Hosting**

```bash
# 1. Instala Firebase CLI
npm install -g firebase-tools

# 2. Inicia sesión
firebase login

# 3. Inicializa Firebase
firebase init hosting

# 4. Selecciona opciones:
# - Crea nuevo proyecto o usa existente
# - Public directory: dist
# - Single-page app: Yes
# - GitHub deployments: No

# 5. Construye el proyecto
npm run build

# 6. Despliega
firebase deploy
```

Tu app estará en: `https://tu-proyecto.web.app`

---

## 🔧 CONFIGURACIÓN ADICIONAL

### **1. Personalizar nombre e íconos**

#### Editar nombre de la app:
Abre `/public/manifest.json`:
```json
{
  "name": "TU NEGOCIO AQUÍ",
  "short_name": "Tu Negocio",
  "description": "Descripción de tu negocio"
}
```

#### Crear íconos de la app:
1. **Crea un ícono cuadrado de 512x512px** (puede ser tu logo)
2. **Usa un generador gratuito:**
   - https://realfavicongenerator.net/
   - https://www.pwabuilder.com/imageGenerator
3. **Descarga los íconos generados:**
   - `icon-192.png` (192x192px)
   - `icon-512.png` (512x512px)
4. **Colócalos en la carpeta `/public/`**

---

### **2. Conectar Supabase**

Tu app ya tiene el backend de Supabase configurado. Solo necesitas:

1. **Credenciales de Supabase:**
   - Ve a https://supabase.com
   - Crea un proyecto (gratis)
   - Copia tu `SUPABASE_URL` y `SUPABASE_ANON_KEY`

2. **Configura variables de entorno:**

Para Vercel:
```
Settings → Environment Variables → Agregar:

VITE_SUPABASE_URL=tu-url-aqui
VITE_SUPABASE_ANON_KEY=tu-key-aqui
```

Para Netlify:
```
Site settings → Environment variables → Agregar las mismas
```

3. **Redeploy** tu aplicación

---

## 📊 VERIFICAR QUE LA PWA FUNCIONA

### En Chrome DevTools:
1. Abre tu app en Chrome
2. Presiona **F12** para abrir DevTools
3. Ve a la pestaña **"Application"**
4. Revisa:
   - ✅ **Manifest:** Debe mostrar tu `manifest.json`
   - ✅ **Service Workers:** Debe estar "activated"
   - ✅ **Cache Storage:** Debe tener archivos cacheados

### Lighthouse Audit:
1. En DevTools → **"Lighthouse"**
2. Selecciona **"Progressive Web App"**
3. Click **"Generate report"**
4. **Objetivo:** Mínimo 90/100 puntos

---

## 🎨 PERSONALIZACIÓN DE COLORES

Para cambiar el tema de la app, edita estos archivos:

**`/public/manifest.json`:**
```json
{
  "theme_color": "#TU_COLOR_AQUI",
  "background_color": "#ffffff"
}
```

**`/components/PWAHead.tsx`:**
```typescript
{ name: 'theme-color', content: '#TU_COLOR_AQUI' },
```

Colores sugeridos:
- 🔵 Azul profesional: `#3b82f6`
- 🟢 Verde negocio: `#10b981`
- 🟣 Morado moderno: `#8b5cf6`
- 🔴 Rojo energético: `#ef4444`
- ⚫ Negro elegante: `#1f2937`

---

## 📱 CARACTERÍSTICAS DE LA PWA

✅ **Funciona offline** (gracias al Service Worker)  
✅ **Se instala en el celular** como app nativa  
✅ **Icono en pantalla de inicio**  
✅ **Pantalla completa** (sin barras del navegador)  
✅ **Notificaciones push** (configuración adicional)  
✅ **Actualizaciones automáticas**  
✅ **Funciona en Android e iOS**  

---

## 🆘 SOLUCIÓN DE PROBLEMAS

### "No aparece el botón de instalar"
- ✅ Verifica que estés usando **HTTPS** (no HTTP)
- ✅ Comprueba que el `manifest.json` esté accesible
- ✅ Revisa que el Service Worker esté registrado
- ✅ En iOS, solo funciona en Safari

### "La app no funciona offline"
- ✅ Verifica que el Service Worker esté activo
- ✅ Revisa la consola del navegador por errores
- ✅ Asegúrate de que `service-worker.js` esté en `/public/`

### "Los cambios no se ven"
- ✅ **Hard refresh:** Ctrl+Shift+R (o Cmd+Shift+R en Mac)
- ✅ Limpia el cache del navegador
- ✅ Desinstala y reinstala la app
- ✅ Cambia el nombre de `CACHE_NAME` en `service-worker.js`

---

## 📞 SOPORTE

Si tienes problemas:
1. Revisa la consola del navegador (F12)
2. Verifica que todos los archivos estén subidos
3. Asegúrate de usar HTTPS
4. Consulta la documentación de PWA: https://web.dev/progressive-web-apps/

---

## ✅ CHECKLIST DE LANZAMIENTO

Antes de compartir tu app con clientes:

- [ ] Cambiar nombre en `manifest.json`
- [ ] Agregar íconos personalizados (192px y 512px)
- [ ] Configurar credenciales de Supabase
- [ ] Desplegar en Vercel/Netlify
- [ ] Probar instalación en Android
- [ ] Probar instalación en iOS
- [ ] Verificar que funciona offline
- [ ] Lighthouse score > 90
- [ ] Crear instrucciones para clientes
- [ ] Opcional: Configurar dominio propio

---

## 🎉 ¡LISTO!

Tu aplicación **Mi Negocio** ahora es una PWA completa y profesional.

Comparte el link con tus clientes y ellos podrán instalarla en sus celulares como una app nativa. 📱✨

**Link para compartir:** `https://tu-dominio.vercel.app`

---

**Última actualización:** Noviembre 2025  
**Versión:** 1.0.0
