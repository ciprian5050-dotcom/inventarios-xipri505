# 🔧 Solución: QR muestra solo "Extraviado"

## Problema Actual
Cuando escaneas el código QR con tu celular, aparece solo el texto "Extraviado" en una pantalla negra, sin ningún otro contenido.

## Diagnóstico del Problema

Hay dos posibles causas:

### 1. **El activo tiene estado "Extraviado" o inválido**
   - Solución: Corregir el estado del activo

### 2. **El código QR tiene un ID que no coincide con ningún activo**
   - Solución: Regenerar el código QR del activo

---

## 🚀 SOLUCIÓN PASO A PASO

### PASO 1: Diagnosticar el Problema

1. **Abre la aplicación en tu computador**
2. **Presiona F12** (o clic derecho → Inspeccionar)
3. **Ve a la pestaña "Console"**
4. **Copia y pega este comando:**

```javascript
debugQRCodes()
```

5. **Presiona Enter**

Esto te mostrará:
- ✅ Lista de todos tus activos con sus IDs
- ✅ URLs correctas para probar
- ✅ Configuración actual

---

### PASO 2: Corregir Estados de Activos

Si el diagnóstico muestra activos con estado "Extraviado" o inválido:

**En la consola del navegador, copia y pega:**

```javascript
(function() {
  const activos = JSON.parse(localStorage.getItem('activos'));
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
  console.log(`✅ ${corregidos} activos corregidos`);
  
  if (corregidos > 0) {
    setTimeout(() => window.location.reload(), 2000);
  }
})();
```

---

### PASO 3: Verificar IDs de Activos

Para ver la lista completa de IDs:

**En la consola:**

```javascript
listActivoIds()
```

Esto mostrará una tabla con:
- ID del activo
- Código QR
- Nombre
- Estado actual

---

### PASO 4: Probar un Activo Específico

Si quieres probar si un activo específico se carga correctamente:

**En la consola:**

```javascript
testActivoById('AQUI_EL_ID_DEL_ACTIVO')
```

Ejemplo:
```javascript
testActivoById('1732145678901')
```

---

### PASO 5: Regenerar Código QR

Si el problema es que el ID no coincide:

1. **Inicia sesión** en la aplicación
2. Ve a **Activos Fijos**
3. Busca el activo con problema
4. Haz clic en el **ícono de QR** (icono de código QR)
5. Se abrirá un modal con el **nuevo código QR correcto**
6. **Descarga** o **imprime** el nuevo QR
7. Reemplaza el QR físico anterior

---

## 🧪 Probar la Solución

### Método 1: Probar en el Computador

1. En la consola, ejecuta `debugQRCodes()`
2. Copia una de las URLs que se muestran
3. Pégala en una **nueva pestaña** del navegador
4. Deberías ver la información completa del activo

### Método 2: Probar con el Celular

1. Asegúrate de que el activo tenga un estado válido
2. Desde tu computador, ve a **Activos Fijos**
3. Haz clic en el ícono de QR del activo
4. Escanea el QR con tu celular
5. Ahora debería mostrarse correctamente

---

## 📱 Cómo Debería Verse Correctamente

Cuando escaneas un QR funcional, deberías ver:

```
┌─────────────────────────────┐
│  Logo de Empresa            │
│  Nombre de Empresa          │
│  NIT: XXXXXXXXX             │
├─────────────────────────────┤
│                             │
│  📦 Información del Activo  │
│  Código: QR-XXXXX           │
│                             │
│  Nombre: [Nombre del activo]│
│  Marca: [Marca]             │
│  Modelo: [Modelo]           │
│  Serie: [Serie]             │
│  Dependencia: [Dependencia] │
│  Fecha: [Fecha de ingreso]  │
│                             │
│  Estado: [Badge con color]  │
│  ✅ Activo (verde)          │
│  ⚪ Inactivo (gris)         │
│  🟡 En mantenimiento        │
│  🔴 Dado de baja           │
│  🟠 Extraviado             │
│                             │
│  Este documento fue         │
│  generado electrónicamente  │
└─────────────────────────────┘
```

---

## ❓ Si Nada Funciona

Si después de seguir todos los pasos aún tienes problemas:

### 1. Captura los logs de la consola

En la consola del navegador:
```javascript
debugQRCodes()
```

Toma una captura de pantalla del resultado.

### 2. Prueba abrir una URL directamente

Desde el resultado de `debugQRCodes()`, copia una URL completa, por ejemplo:
```
https://tudominio.figma.site/#/public/activo/1732145678901
```

Pégala en el navegador de tu celular y verifica qué error aparece.

### 3. Revisa los logs en tu celular

Cuando abras la URL en tu celular:
1. Abre el navegador Chrome en Android o Safari en iOS
2. Conecta el celular al computador
3. En Chrome desktop: chrome://inspect para Android
4. En Safari desktop: Develop → Dispositivo iOS
5. Revisa los errores en la consola

---

## 📋 Checklist de Verificación

- [ ] Ejecuté `debugQRCodes()` y vi la lista de activos
- [ ] Ejecuté el script de corrección de estados
- [ ] Verifiqué que los IDs coinciden usando `listActivoIds()`
- [ ] Probé abrir una URL pública en el navegador del computador
- [ ] Regeneré el código QR desde el módulo de Activos
- [ ] Escaneé el nuevo código QR con mi celular
- [ ] Ahora se muestra correctamente la información del activo

---

## 💡 Prevención Futura

Para evitar este problema en el futuro:

1. **Siempre genera los códigos QR desde la aplicación**
   - No uses códigos QR antiguos
   - Regenera si cambias el sistema

2. **Verifica antes de imprimir**
   - Prueba el QR escaneándolo antes de imprimir
   - Asegúrate de que muestra la información correcta

3. **Mantén los estados válidos**
   - Solo usa: Activo, Inactivo, En mantenimiento, Dado de baja, Extraviado
   - No edites manualmente los datos en localStorage

4. **Respalda periódicamente**
   - Ve a la Herramienta de Diagnóstico
   - Ejecuta diagnósticos regulares
   - Exporta tus datos importantes
