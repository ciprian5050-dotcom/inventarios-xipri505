# Changelog - INVENTARIOS_XIPRI505

## [3.0.0] - 2026-01-26 - FORCE REBUILD 🔒

### 🚨 ACTUALIZACIÓN DE SEGURIDAD CRÍTICA

**CAMBIO IMPORTANTE:** Esta versión elimina completamente las credenciales públicas de la pantalla de login.

### ✅ Cambios de Seguridad

- ❌ **ELIMINADAS** las credenciales públicas visibles (admin@empresa.com / admin123)
- ✅ **AGREGADO** sistema de creación de cuentas nuevas
- ✅ **MEJORADO** mensaje de ayuda para nuevos usuarios
- ✅ **ACTUALIZADO** banner de versión a v3.0.0 con gradiente verde

### 🔧 Mejoras Técnicas

- Corregidos imports faltantes en CircularesScreen.tsx
- Agregado `useState` y `useEffect` donde faltaban
- Definidas interfaces TypeScript `Circular` y `Dependencia`
- Force cache-bust para garantizar actualización en producción

### 📝 Archivos Modificados

- `/App.tsx` - Actualizado a v3.0.0 con logs de consola
- `/components/LoginScreen.tsx` - Eliminadas credenciales, nuevo banner
- `/components/CircularesScreen.tsx` - Corregidos imports y tipos
- `/index.html` - Meta tags anti-cache actualizados
- `/package.json` - Versión 3.0.0
- `/version.json` - Nuevo sistema de versiones

### 🎯 Verificación de Deploy

Para verificar que estás usando la versión correcta:

1. ✅ El login debe mostrar banner verde: **"VERSIÓN 3.0.0 - ACTUALIZADA 26/01/2026"**
2. ❌ NO debe mostrar credenciales (admin@empresa.com)
3. ✅ Debe tener botón "Crear Nueva Cuenta"
4. ✅ Footer debe decir **v3.0.0**

---

## [2.0.1] - 2026-01-23

### Cambios

- Migración completa a Supabase
- Sistema de backup y restauración
- Módulo de ingresos implementado
- Corrección de listas desplegables
- Sistema de depreciación según normas colombianas

---

## [1.0.0] - 2024

### Lanzamiento Inicial

- Sistema base de gestión de activos
- Módulos de Cuentadantes, Dependencias, Reportes
- Integración con localStorage
