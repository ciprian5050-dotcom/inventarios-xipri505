# 🚀 Inicio Rápido - 3 Pasos

## ✅ Problema Resuelto
Los códigos QR ahora funcionan desde **cualquier celular** gracias al backend con Supabase.

---

## 📋 Paso 1: Crear Cuenta (Primera Vez)

1. Abre la aplicación
2. Verás la pantalla de configuración inicial
3. Llena los datos:
   - **Nombre:** Tu nombre (opcional, puedes dejarlo vacío)
   - **Email:** `admin@empresa.com` (o el que prefieras)
   - **Contraseña:** `admin123` (o la que prefieras, mínimo 6 caracteres)
   - **Confirmar:** `admin123` (la misma contraseña)
4. Clic en **"Crear Cuenta y Continuar"**
5. ✅ Listo! Ya estás dentro

---

## 📋 Paso 2: Esperar Migración Automática

Cuando inicies sesión por primera vez:
- El sistema detecta automáticamente si tienes datos antiguos en tu navegador
- Los migra a la nube sin que hagas nada
- Puedes ver el progreso en la consola del navegador (F12)
- Espera unos segundos hasta que termine

**No cierres la ventana mientras migra.**

---

## 📋 Paso 3: Probar los QR

### A. Crear un activo de prueba
1. Ve a **"Activos Fijos"** en el menú
2. Clic en **"Nuevo Activo"**
3. Llena los datos básicos:
   - Nombre: "Laptop de Prueba"
   - Marca: HP
   - Modelo: EliteBook
   - Serie: TEST123
   - Estado: Activo
4. Guarda

### B. Generar el código QR
1. En la lista de activos, encuentra tu "Laptop de Prueba"
2. Clic en el botón **"Ver QR"** o el icono de QR
3. Se abrirá un modal con el código QR
4. Puedes:
   - **Descargar** el QR como imagen
   - **Imprimir** el QR
   - **Copiar** la URL que aparece debajo

### C. Probar desde tu celular
1. **Opción A:** Escanea el QR con la cámara de tu celular
2. **Opción B:** Copia la URL y ábrela en el navegador del celular
3. ✅ **¡Debería mostrar toda la información del activo!**

---

## 🎉 Resultado Esperado

Al escanear el QR desde tu celular, deberías ver:

```
┌─────────────────────────────┐
│  📦 Información del Activo  │
├─────────────────────────────┤
│ Código: ACT-001             │
│ Nombre: Laptop de Prueba    │
│ Marca: HP                   │
│ Modelo: EliteBook           │
│ Serie: TEST123              │
│ Dependencia: TI             │
│ Estado: Activo ●            │
└─────────────────────────────┘
```

---

## 🔑 Credenciales de Prueba

Si solo quieres probar rápidamente:

**Email:** admin@empresa.com  
**Contraseña:** admin123

**⚠️ IMPORTANTE:** Debes **crear la cuenta primero** con estos datos. No existe por defecto.

---

## ❓ Problemas Comunes

### "Credenciales inválidas" al hacer login
**Solución:** Primero debes crear la cuenta. Usa el botón "Ya tengo una cuenta" para volver a login después de crear tu cuenta.

### Los QR salen en blanco
**Solución:** 
1. Verifica que hayas iniciado sesión
2. Espera a que termine la migración automática
3. Crea un activo nuevo para probar
4. Verifica tu conexión a internet

### "Error de conexión"
**Solución:** El backend requiere internet. Verifica tu conexión.

---

## 🔍 Para Verificar que Todo Funciona

**1. Abre la consola del navegador (F12)**

Deberías ver mensajes como:
```
🔐 Iniciando sesión en backend: admin@empresa.com
✅ Login exitoso
📦 Iniciando migración automática de datos...
✅ Migración completada exitosamente
```

**2. Verifica tu sesión**
En la consola, ejecuta:
```javascript
console.log(localStorage.getItem('inventory_access_token'));
// Debería mostrar un token largo
```

**3. Prueba un QR**
- Crea un activo
- Genera su QR
- Escanéalo desde tu celular
- ✅ Si ves los datos, **¡todo funciona!**

---

## 📱 Usar en Múltiples Dispositivos

Para acceder desde otro dispositivo:

1. Abre la aplicación en el nuevo dispositivo
2. Inicia sesión con las **mismas credenciales**
3. ✅ Verás todos tus datos sincronizados

---

## 💡 Consejos

- ✅ La sesión dura **24 horas**
- ✅ Puedes cerrar el navegador, tu sesión se mantiene
- ✅ Los datos se guardan **automáticamente en la nube**
- ✅ Los cambios se **sincronizan en tiempo real**
- ✅ Los QR **no requieren login** para verlos

---

## 🆘 ¿Algo no funciona?

1. **Abre la consola (F12)**
2. **Busca mensajes con emojis:** 🔐, ✅, ❌, 📦, etc.
3. **Los mensajes te dirán exactamente qué está pasando**

Ejemplo:
```
❌ Error al iniciar sesión: Credenciales inválidas
// Esto significa que debes crear la cuenta primero
```

---

**¡Listo! Tu sistema de inventarios está completamente funcional.** 🎊

**Los códigos QR ahora funcionan desde cualquier celular en el mundo.** 🌍
