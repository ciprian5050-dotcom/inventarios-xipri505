# 🚨 ARREGLO RÁPIDO - Pantalla en Blanco

Si ves una pantalla en blanco, sigue estos pasos:

## Paso 1: Abre la consola del navegador

1. Presiona **F12** en tu teclado
2. Haz clic en la pestaña **"Console"**
3. Verás errores en color rojo (si los hay)

## Paso 2: Limpia la caché y recarga

Presiona **Ctrl + Shift + R** (Windows) o **Cmd + Shift + R** (Mac)

Esto recarga la página sin caché.

## Paso 3: Si aún no funciona, corre esto en la consola:

Copia y pega este código COMPLETO en la consola y presiona Enter:

```javascript
(function() {
  try {
    // Limpiar errores
    console.clear();
    console.log('🔧 Iniciando corrección de emergencia...');
    
    // Corregir estados de activos
    const activosData = localStorage.getItem('activos');
    if (activosData) {
      const activos = JSON.parse(activosData);
      const estadosValidos = ['Activo', 'Inactivo', 'En mantenimiento', 'Dado de baja', 'Extraviado'];
      
      const activosCorregidos = activos.map(activo => {
        if (!estadosValidos.includes(activo.estado)) {
          console.log(`✅ Corrigiendo: ${activo.nombre} - "${activo.estado}" → "Activo"`);
          return { ...activo, estado: 'Activo' };
        }
        return activo;
      });
      
      localStorage.setItem('activos', JSON.stringify(activosCorregidos));
      console.log('✅ Estados corregidos');
    }
    
    // Crear configuración QR si no existe
    if (!localStorage.getItem('qr_public_config')) {
      const defaultConfig = {
        showQr: true,
        showNombre: true,
        showMarca: true,
        showModelo: true,
        showSerie: true,
        showDependencia: true,
        showCuentadante: false,
        showValor: false,
        showFechaIngreso: true,
        showEstado: true,
        showObservaciones: false,
      };
      localStorage.setItem('qr_public_config', JSON.stringify(defaultConfig));
      console.log('✅ Configuración QR creada');
    }
    
    console.log('✅ CORRECCIÓN COMPLETADA');
    console.log('🔄 Recargando en 2 segundos...');
    
    setTimeout(() => {
      window.location.reload();
    }, 2000);
    
  } catch (error) {
    console.error('❌ Error:', error);
    console.log('💡 Por favor, envía una captura de este error');
  }
})();
```

## Paso 4: Después de que recargue

La página debería funcionar normalmente.

Inicia sesión con:
- **Email:** admin@empresa.com
- **Contraseña:** admin123

---

## Si TODAVÍA no funciona

### Opción 1: Resetear completamente

```javascript
localStorage.clear();
window.location.reload();
```

Esto borrará TODOS los datos y empezarás desde cero.

### Opción 2: Ver qué error está causando el problema

En la consola (F12), busca cualquier mensaje en **ROJO**.

Toma una captura de pantalla del error completo y envíamelo.

---

## Notas

- La pantalla en blanco normalmente se debe a un error de JavaScript
- Los navegadores modernos (Chrome, Edge, Firefox) funcionan mejor
- Si usas un navegador antiguo, actualízalo

---

## Prueba rápida sin corregir nada

Si quieres probar si el QR funciona sin iniciar sesión:

1. Abre esta URL en tu navegador (reemplaza `TU_ID_ACTIVO` con el ID real):

```
TU_URL_DE_FIGMA/#/public/activo/TU_ID_ACTIVO
```

2. Si ves la información del activo, el QR funciona
3. Si ves "Activo no encontrado", el ID no existe
4. Si ves pantalla en blanco, hay un error de JavaScript

Para ver los IDs de tus activos:

```javascript
JSON.parse(localStorage.getItem('activos')).forEach(a => {
  console.log(`${a.nombre}: ID = ${a.id}`);
});
```
