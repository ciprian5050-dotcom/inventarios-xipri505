# 📦 Sistema de Gestión de Activos Fijos con QR

## ✅ Sistema Nuevo - Construido desde Cero

Este es un sistema **completamente nuevo**, simple y funcional para gestión de activos fijos con códigos QR escaneables.

## 🚀 Inicio Rápido (2 minutos)

### 1. Iniciar Sesión
```
Email: admin@empresa.com
Password: admin123
```

### 2. Ver los Activos de Ejemplo
El sistema crea automáticamente 3 activos de ejemplo:
- 💻 Laptop Dell Latitude (COMP-001)
- 🪑 Escritorio Ejecutivo (MOB-001)
- 🖨️ Impresora Multifuncional (IMP-001)

### 3. Generar y Probar QR
1. Ve a **"Gestionar Activos"**
2. Click en el botón **⬇️ (Descargar)** de cualquier activo
3. Se descarga un PNG con el código QR
4. Escanea el QR con tu celular
5. ¡Verás toda la información del activo!

## 📱 Características Principales

### ✅ Gestión Completa de Activos (CRUD)
- **Crear**: Nuevos activos con formulario completo
- **Leer**: Visualizar lista de todos los activos
- **Actualizar**: Editar información de activos existentes
- **Eliminar**: Borrar activos con confirmación

### ✅ Campos de Activos
- Código (autogenerado: ACT-XXXXXX)
- Nombre
- Marca
- Modelo
- Número de Serie
- Categoría
- Valor en COP (Pesos Colombianos)
- Estado (Bueno / Regular / Malo)
- Fecha de Ingreso

### ✅ Códigos QR Funcionales
- Generación automática con alta calidad (800x800px)
- Descarga como PNG con información del activo
- URL pública: `/qr/[id]`
- Escaneable desde celulares

### ✅ Página Pública de QR
- Diseño limpio y profesional
- Muestra toda la información del activo
- Colores según estado (Verde/Amarillo/Rojo)
- Responsive para celulares
- **No requiere login** para ver

### ✅ Dashboard con Estadísticas
- Total de activos
- Total con códigos QR
- Número de categorías
- Acceso rápido a funciones

## 🎨 Tecnologías

- **React** + **TypeScript**
- **React Router** para navegación
- **Tailwind CSS** para estilos
- **qrcode** library para generación de QR
- **sonner** para notificaciones
- **lucide-react** para iconos
- **localStorage** para persistencia de datos

## 📂 Estructura del Proyecto

```
/
├── App.tsx                   # Router principal y autenticación
├── pages/
│   ├── LoginPage.tsx         # Pantalla de login
│   ├── DashboardPage.tsx     # Dashboard con estadísticas
│   ├── ActivosPage.tsx       # CRUD de activos + generación QR
│   └── PublicQRPage.tsx      # Página pública para escanear QR
├── components/
│   └── QRDemo.tsx            # Demo visual de cómo funcionan los QR
└── README.md                 # Este archivo
```

## 🎯 Cómo Funcionan los Códigos QR

### Generación
1. Cada activo tiene un ID único
2. Se genera un QR con URL: `tudominio.com/qr/[id]`
3. El QR se descarga como imagen PNG
4. Incluye código, nombre y serie del activo

### Escaneo
1. Usuario escanea QR con cámara de celular
2. Navega a `/qr/[id]`
3. Se carga la página pública (sin login)
4. Muestra toda la información del activo

### ⚠️ Importante sobre localStorage
Los datos están guardados en **localStorage** del navegador:
- ✅ **Funciona**: Mismo navegador/dispositivo
- ✅ **Funciona**: QR para referencia e impresión
- ⚠️ **Limitación**: QR desde otro celular requiere que ese celular también tenga acceso al sistema

## 🔄 Flujo de Uso Completo

```
1. Login
   ↓
2. Dashboard (ver estadísticas)
   ↓
3. Gestionar Activos
   ↓
4. Crear/Editar Activo
   ↓
5. Generar y Descargar QR
   ↓
6. Imprimir QR
   ↓
7. Pegar en activo físico
   ↓
8. Escanear para ver información
```

## 📊 Casos de Uso

### ✅ Perfecto para:
- Oficinas pequeñas y medianas
- Inventario de equipos de cómputo
- Control de mobiliario
- Gestión de equipos de oficina
- Sistemas internos con un solo punto de acceso

### 🔧 Necesita Backend si:
- Múltiples usuarios simultáneos
- Acceso desde dispositivos externos
- QR escaneables desde cualquier celular sin acceso previo
- Sincronización en tiempo real
- Base de datos centralizada

## 🚀 Mejoras Futuras (Opcional)

### Backend con Supabase
Para hacer que los QR funcionen desde cualquier celular:
1. Crear tabla en Supabase
2. Reemplazar localStorage con API calls
3. Los QR funcionarán universalmente

### Funcionalidades Adicionales
- Reportes en PDF y Excel
- Historial de cambios
- Asignación a responsables
- Mantenimientos programados
- Fotos de activos
- Búsqueda avanzada
- Filtros por categoría/estado

## 📝 Datos de Ejemplo

Al iniciar por primera vez, se crean 3 activos de ejemplo:

| Código | Nombre | Marca | Categoría | Valor | Estado |
|--------|--------|-------|-----------|-------|--------|
| COMP-001 | Laptop Dell Latitude | Dell | Equipos de Cómputo | $3,500,000 | Bueno |
| MOB-001 | Escritorio Ejecutivo | Muebles SA | Mobiliario | $850,000 | Bueno |
| IMP-001 | Impresora Multifuncional | HP | Equipos de Oficina | $1,200,000 | Bueno |

## 🆘 Preguntas Frecuentes

### ¿Por qué el QR no funciona desde otro celular?
Los datos están en localStorage del navegador. Para QR universales, implementa backend.

### ¿Puedo usar esto en producción?
Sí, para uso interno con un solo punto de acceso. Para múltiples usuarios, considera backend.

### ¿Cómo agrego más activos?
Click en "Gestionar Activos" → "Nuevo Activo" → Llenar formulario → "Crear"

### ¿Puedo cambiar los colores/diseño?
Sí, el código usa Tailwind CSS. Modifica las clases según tus necesidades.

### ¿Cómo imprimo los QR?
Descarga el QR como PNG y imprímelo desde cualquier programa (Word, etc.)

### ¿Los datos se pierden al cerrar el navegador?
No, localStorage es persistente. Los datos quedan guardados.

### ¿Puedo exportar los datos?
Actualmente no, pero es fácil de implementar (JSON, CSV, Excel).

## 📖 Documentación Completa

Para más detalles, ver: **INSTRUCCIONES-QR.md**

## ✅ Checklist

- [x] Sistema de login funcional
- [x] Dashboard con estadísticas
- [x] CRUD completo de activos
- [x] Generación de códigos QR
- [x] Descarga de QR como PNG
- [x] Página pública para escanear
- [x] Datos de ejemplo automáticos
- [x] Diseño responsive
- [x] Estados con colores
- [x] Formato de moneda colombiana

## 🎉 ¡Listo para Usar!

El sistema está **100% funcional** y listo para usar inmediatamente.

1. **Login**: admin@empresa.com / admin123
2. **Explora** el dashboard y activos de ejemplo
3. **Genera** tu primer QR
4. **Escanea** y verifica que funciona

---

**Creado**: 2025  
**Versión**: 1.0.0  
**Estado**: ✅ Producción  
**Tech Stack**: React + TypeScript + Tailwind + localStorage
