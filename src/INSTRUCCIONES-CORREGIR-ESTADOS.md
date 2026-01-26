# 🔧 Solución Rápida: Corregir Estados de Activos

## Problema
Cuando escaneas un código QR, aparece el estado "extraviado" u otro estado inválido.

## Solución Rápida - Método 1: Desde la Consola del Navegador

### Pasos:
1. **Abre la consola del navegador:**
   - Presiona `F12` en tu teclado, o
   - Clic derecho en cualquier parte de la página → "Inspeccionar" → pestaña "Console"

2. **Copia y pega este código completo** en la consola:

```javascript
(function() {
  console.log('🔧 Corrigiendo estados de activos...\n');
  try {
    const activosData = localStorage.getItem('activos');
    if (!activosData) {
      console.log('❌ No hay activos');
      return;
    }
    const activos = JSON.parse(activosData);
    console.log(`📦 ${activos.length} activos encontrados\n`);
    
    const estadosValidos = ['Activo', 'Inactivo', 'En mantenimiento', 'Dado de baja', 'Extraviado'];
    let corregidos = 0;
    
    const activosCorregidos = activos.map(activo => {
      if (!estadosValidos.includes(activo.estado)) {
        console.log(`🔄 ${activo.qr}: "${activo.estado}" → "Activo"`);
        corregidos++;
        return { ...activo, estado: 'Activo' };
      }
      return activo;
    });
    
    localStorage.setItem('activos', JSON.stringify(activosCorregidos));
    
    console.log(`\n✅ ${corregidos} activos corregidos de ${activos.length} totales`);
    
    if (corregidos > 0) {
      console.log('🔄 Recarga la página (F5) para ver los cambios');
      setTimeout(() => window.location.reload(), 2000);
    } else {
      console.log('✨ Todo está correcto');
    }
  } catch (error) {
    console.error('❌ Error:', error);
  }
})();
```

3. **Presiona Enter**

4. **Espera 2 segundos** - La página se recargará automáticamente

5. **Escanea el código QR nuevamente** - Ahora debería aparecer con estado "Activo"

---

## Solución - Método 2: Desde la Aplicación

### Pasos:
1. Ve a la pantalla de **Login** (cierra sesión si es necesario)
2. Desplázate hacia abajo hasta la sección **"Herramienta de Diagnóstico"**
3. Haz clic en el botón azul **"Corregir Estados de Activos"**
4. Revisa el resumen de estados y confirma la corrección
5. La página se recargará automáticamente

---

## Verificación

Después de ejecutar cualquiera de los dos métodos:

1. **Inicia sesión** en la aplicación (admin@empresa.com / admin123)
2. Ve a **Activos Fijos** en el menú lateral
3. Verifica que todos los activos tengan estados válidos:
   - ✅ Activo (verde)
   - ⚪ Inactivo (gris)
   - 🟡 En mantenimiento (amarillo)
   - 🔴 Dado de baja (rojo)
   - 🟠 Extraviado (naranja)

4. **Escanea el código QR** con tu celular
5. La información del activo debería mostrarse correctamente

---

## Estados Válidos

Los estados permitidos en el sistema son:

| Estado | Color | Descripción |
|--------|-------|-------------|
| **Activo** | Verde | Activo en uso normal |
| **Inactivo** | Gris | Temporalmente sin uso |
| **En mantenimiento** | Amarillo | Bajo mantenimiento o reparación |
| **Dado de baja** | Rojo | Activo dado de baja definitivamente |
| **Extraviado** | Naranja | Activo extraviado o perdido |

---

## ¿Necesitas cambiar el estado de un activo?

1. Ve a **Activos Fijos**
2. Haz clic en el icono de editar (lápiz) del activo
3. En el campo **Estado**, selecciona el estado correcto
4. Haz clic en **Guardar Cambios**

---

## Soporte Adicional

Si después de seguir estos pasos el problema persiste:

1. Abre la consola del navegador (F12)
2. Busca mensajes de error en rojo
3. Toma una captura de pantalla de los errores
4. Comparte la información para recibir ayuda específica
