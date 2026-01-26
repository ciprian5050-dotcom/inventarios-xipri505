# 📋 Sistema de Gestión de Inventarios de Activos Fijos

## 🎯 Descripción General

Sistema completo de gestión de inventarios de activos fijos desarrollado con React, TypeScript y Supabase. Diseñado con interfaz horizontal y tema neutral blanco/slate-gray para facilitar la administración y control de activos institucionales.

---

## ✨ Características Principales

### 🏷️ **Gestión de Activos**
- ✅ Registro completo con campos: código, nombre, marca, modelo, serie, dependencia, valor (COP), fecha de ingreso y estado
- ✅ Sistema de códigos organizados por grupos con prefijos automáticos (ej: SIS-2-07)
- ✅ Validación de códigos únicos en tiempo real (backend + frontend)
- ✅ Estados: Activo, En reparación, Baja, Extraviado
- ✅ Generación automática de códigos QR para cada activo
- ✅ Vista pública de activos mediante escaneo de QR

### 🔢 **Sistema de Códigos Personalizables**
- ✅ Grupos configurables con prefijos automáticos
- ✅ Ejemplo: Grupo "2-07 Sistemas y Comunicación" → Códigos SIS-2-07
- ✅ Personalización total desde pantalla de Configuración
- ✅ Prevención de códigos duplicados con alertas visuales

### 📦 **Módulo de Ingresos**
- ✅ Registro de compras de activos
- ✅ Captura de datos de factura del proveedor
- ✅ Historial de ingresos con detalles completos
- ✅ Relación entre facturas y activos ingresados

### 📊 **Reportes PDF**
- ✅ Generación de reportes profesionales con logo institucional
- ✅ Filtros por cuentadante, dependencia y estado
- ✅ Incluye prefijos completos de códigos para mayor claridad
- ✅ Texto legible (tamaño de fuente optimizado a 10pt)
- ✅ Formato de valores en pesos colombianos (COP)

### 🔐 **Autenticación y Seguridad**
- ✅ Sistema de login con Supabase Auth
- ✅ Control de acceso por usuarios
- ✅ Protección de rutas y endpoints
- ✅ Sesiones seguras

### 💾 **Backup y Restauración**
- ✅ Sistema completo de respaldo
- ✅ Exportación de datos en formato JSON
- ✅ Importación y restauración desde archivo
- ✅ Preservación de integridad de datos

### 📱 **Gestión de Catálogos**
- ✅ Dependencias: Estructura organizacional
- ✅ Cuentadantes: Responsables de activos
- ✅ Marcas: Catálogo de marcas
- ✅ Nombres de activos: Tipos de activos predefinidos
- ✅ Grupos de códigos: Configuración de prefijos

---

## 🛠️ Tecnologías Utilizadas

### Frontend
- **React 18** - Framework de interfaz de usuario
- **TypeScript** - Tipado estático
- **Tailwind CSS v4** - Estilos y diseño
- **Lucide React** - Iconos modernos
- **jsPDF** - Generación de reportes PDF
- **QRCode.react** - Generación de códigos QR
- **Sonner** - Notificaciones toast

### Backend
- **Supabase** - Backend as a Service
  - PostgreSQL Database
  - Edge Functions (Hono web server)
  - Authentication
  - Storage
- **Deno** - Runtime para Edge Functions

### Arquitectura
```
Frontend (React) → Server (Hono) → Database (PostgreSQL)
                         ↓
                    Storage (Supabase)
```

---

## 📂 Estructura de Módulos

### 🖥️ Pantallas Principales

1. **Activos** (`/components/ActivosScreen.tsx`)
   - Listado completo de activos
   - Búsqueda y filtros avanzados
   - CRUD completo de activos
   - Visualización de códigos QR

2. **Ingresos** (`/components/IngresosScreen.tsx`)
   - Registro de compras
   - Datos de factura y proveedor
   - Historial de ingresos
   - Vista detallada de facturas

3. **Reportes** (`/components/ReportesScreen.tsx`)
   - Generación de informes PDF
   - Filtros: cuentadante, dependencia, estado
   - Exportación personalizada

4. **Configuración** (`/components/ConfiguracionScreen.tsx`)
   - Gestión de dependencias
   - Gestión de cuentadantes
   - Gestión de marcas
   - Gestión de nombres de activos
   - **Configuración de grupos y códigos**

5. **QR** (`/components/QRConfigScreen.tsx`)
   - Generación masiva de códigos QR
   - Impresión de etiquetas
   - Vista previa

6. **Circulares** (`/components/CircularesScreen.tsx`)
   - Comunicaciones oficiales del Almacén General
   - Notificaciones de inventario a dependencias
   - Generación de PDFs con formato oficial

7. **Backup** (`/components/BackendAdminScreen.tsx`)
   - Exportación de datos
   - Importación y restauración
   - Gestión de respaldos
   - Estadísticas del sistema

---

## 🗄️ Modelo de Datos

### Activo
```typescript
{
  id: string
  codigo: string           // Único con prefijo (ej: SIS-2-07)
  nombre: string
  marca: string
  modelo: string
  serie: string
  dependencia: string
  valorCOP: number        // Valor en pesos colombianos
  fechaIngreso: string    // ISO date
  estado: 'activo' | 'en_reparacion' | 'baja' | 'extraviado'
  grupoId?: string
}
```

### Ingreso (Factura)
```typescript
{
  id: string
  numeroFactura: string
  proveedor: string
  fecha: string
  valorTotal: number
  descripcion?: string
  activos: Activo[]       // Activos asociados
}
```

### Grupo de Códigos
```typescript
{
  id: string
  codigo: string          // ej: "2-07"
  nombre: string          // ej: "Sistemas y Comunicación"
  prefijo: string         // ej: "SIS" (auto-generado)
}
```

### Dependencia / Cuentadante / Marca
```typescript
{
  id: string
  nombre: string
}
```

---

## 🚀 Funcionalidades Implementadas

### ✅ Sistema de Códigos
- [x] Generación automática de prefijos desde nombre del grupo
- [x] Validación de códigos únicos (backend + frontend)
- [x] Alertas visuales en tiempo real para códigos duplicados
- [x] Formato: PREFIJO-CODIGO (ej: SIS-2-07)

### ✅ Gestión de Activos
- [x] Formulario completo de registro
- [x] Edición y eliminación
- [x] Búsqueda y filtros
- [x] Cambio de estado
- [x] Vista detallada

### ✅ Códigos QR
- [x] Generación automática por activo
- [x] Vista pública sin login
- [x] Información de contacto en caso de extravío
- [x] Descarga individual
- [x] Generación masiva

### ✅ Reportes
- [x] PDF con formato profesional
- [x] Filtros múltiples
- [x] Logo institucional
- [x] Prefijos completos en códigos
- [x] Valores en COP formateados
- [x] Tamaño de fuente legible (10pt)

### ✅ Ingresos
- [x] Registro de facturas
- [x] Asociación con activos
- [x] Historial de compras
- [x] Vista detallada de factura

### ✅ Backup y Restauración
- [x] Exportación completa a JSON
- [x] Importación desde archivo
- [x] Validación de datos
- [x] Preservación de estructura

### ✅ Base de Datos
- [x] Migración completa de localStorage a Supabase
- [x] KV Store para datos flexibles
- [x] Edge Functions para lógica de negocio
- [x] Autenticación integrada

---

## 📋 Catálogos Disponibles

1. **Dependencias** - Áreas organizacionales
2. **Cuentadantes** - Responsables (solo en Reportes)
3. **Marcas** - Fabricantes de activos
4. **Nombres de Activos** - Tipos predefinidos
5. **Grupos de Códigos** - Configuración de prefijos personalizados

---

## 🎨 Diseño

- **Tema**: Neutral blanco/slate-gray
- **Layout**: Horizontal con sidebar
- **Responsive**: Adaptable a diferentes dispositivos
- **Iconos**: Lucide React
- **Componentes**: Shadcn UI
- **Tipografía**: Sistema de fuentes optimizado

---

## 🔄 Flujo de Trabajo Típico

1. **Configuración inicial**
   - Crear grupos de códigos con prefijos personalizados
   - Agregar dependencias
   - Agregar marcas
   - Definir nombres de activos

2. **Registro de ingreso**
   - Crear registro de factura en "Ingresos"
   - Capturar datos del proveedor
   - Asociar activos comprados

3. **Agregar activos**
   - Seleccionar grupo de código
   - Completar información
   - Sistema valida código único
   - Genera QR automáticamente

4. **Generar reportes**
   - Seleccionar filtros
   - Elegir cuentadante
   - Exportar PDF

5. **Gestión continua**
   - Actualizar estados
   - Editar información
   - Realizar respaldos periódicos

---

## 🔒 Seguridad

- ✅ Autenticación requerida para acceso
- ✅ Tokens JWT para sesiones
- ✅ API protegida con validación de tokens
- ✅ Service Role Key protegido en backend
- ✅ CORS configurado correctamente
- ✅ Validación de datos en servidor

---

## 📦 Rutas del Servidor

```
POST   /make-server-b351c7a3/signup          - Registro de usuario
POST   /make-server-b351c7a3/validate-codigo - Validar código único
GET    /make-server-b351c7a3/*               - Rutas KV Store
POST   /make-server-b351c7a3/*               - Rutas KV Store
DELETE /make-server-b351c7a3/*               - Rutas KV Store
```

---

## 🎯 Estado del Proyecto

### ✅ Completado
- Sistema completo de gestión de activos
- Migración a Supabase
- Sistema de códigos personalizables
- Validación de códigos únicos
- Módulo de Ingresos
- Reportes PDF optimizados
- Backup y Restauración
- Autenticación
- QR codes con vista pública

### 🚀 Listo para Producción
- Todas las funcionalidades principales implementadas
- Base de datos en la nube
- Sistema de respaldo funcional
- Validaciones completas
- Interfaz intuitiva y profesional

---

## 📝 Notas Importantes

1. **Grupos de Códigos**: Completamente personalizables desde Configuración
2. **Prefijos Automáticos**: Se generan desde las primeras letras del nombre del grupo
3. **Validación en Tiempo Real**: El sistema verifica códigos duplicados al escribir
4. **Cuentadante**: Solo disponible en pantalla de Reportes para selección al generar PDF
5. **Valores**: Siempre en pesos colombianos (COP)
6. **Respaldos**: Recomendado realizar exportaciones periódicas

---

## 🎓 Tecnologías Avanzadas

- **Edge Functions**: Lógica de servidor sin servidor tradicional
- **KV Store**: Sistema de almacenamiento clave-valor flexible
- **Real-time Validation**: Validación de datos en tiempo real
- **PDF Generation**: Reportes profesionales desde el navegador
- **QR Public View**: Acceso público sin autenticación para activos
- **TypeScript Strict**: Tipado fuerte para prevenir errores

---

## 📞 Información de Contacto

El sistema incluye información de contacto institucional que aparece en:
- Vista pública de activos (QR scan)
- Reportes PDF
- Notificaciones de activos extraviados

---

## 🏆 Logros Técnicos

✅ Migración exitosa localStorage → Supabase  
✅ Sistema de códigos con validación dual (backend + frontend)  
✅ Prevención de duplicados en tiempo real  
✅ Reportes PDF con formato profesional  
✅ Sistema completo de backup/restore  
✅ Módulo de Ingresos con gestión de facturas  
✅ Vista pública QR sin autenticación  
✅ Arquitectura escalable de tres capas  

---

**Desarrollado con ❤️ para la gestión eficiente de activos fijos institucionales**
