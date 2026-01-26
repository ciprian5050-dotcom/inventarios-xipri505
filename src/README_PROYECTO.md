# 📦 INVENTARIOS_XIPRI505

> Sistema profesional de gestión de inventarios de activos fijos

![License](https://img.shields.io/badge/license-Private-red)
![React](https://img.shields.io/badge/React-18.2-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.2-blue)
![Tailwind](https://img.shields.io/badge/Tailwind-4.0-38bdf8)

---

## 🎯 Descripción

**INVENTARIOS_XIPRI505** es un sistema completo de gestión de inventarios de activos fijos diseñado para instituciones y empresas colombianas. Ofrece un control detallado de activos, generación de reportes, códigos QR, cálculo de depreciación y mucho más.

---

## ✨ Características Principales

### 📊 Gestión de Activos
- ✅ Registro completo de activos fijos con múltiples campos
- ✅ Sistema de códigos organizados por grupos personalizables
- ✅ Generación automática de códigos QR para cada activo
- ✅ Validación de duplicados en tiempo real
- ✅ Estados de activos (Activo, Inactivo, En mantenimiento, Dado de baja, Extraviado)

### 💰 Sistema de Depreciación
- ✅ Cálculo automático de depreciación (método lineal)
- ✅ Configuración de vida útil por grupo de activos
- ✅ Exportación a Excel con 18 columnas detalladas
- ✅ Cumple con normas colombianas de contabilidad

### 📦 Módulo de Ingresos
- ✅ Registro de compras con datos de factura
- ✅ Información completa del proveedor
- ✅ Tracking de fechas de compra y recepción
- ✅ Asociación automática con activos

### 📑 Reportes PDF
- ✅ Reportes personalizables por cuentadante
- ✅ Exportación a PDF profesional
- ✅ Incluye códigos QR en los reportes
- ✅ Formato adaptado a normas colombianas

### 🔧 Configuración Flexible
- ✅ Gestión de grupos de códigos personalizables
- ✅ Catálogo de marcas con validación de duplicados
- ✅ Catálogo de nombres de activos
- ✅ Gestión de dependencias organizacionales
- ✅ Gestión de cuentadantes

### 💾 Backend Robusto
- ✅ Integración completa con Supabase
- ✅ Sistema de backup y restauración
- ✅ Migración automática de localStorage a Supabase
- ✅ Sincronización en tiempo real

---

## 🛠️ Tecnologías

### Frontend
- **React 18.2** - Framework de UI
- **TypeScript 5.2** - Tipado estático
- **Tailwind CSS 4.0** - Estilos modernos
- **Lucide React** - Iconos
- **React Router 6** - Navegación

### Backend
- **Supabase** - Base de datos y autenticación
- **Supabase Edge Functions** - Serverless functions
- **PostgreSQL** - Base de datos relacional

### Librerías Adicionales
- **jsPDF** - Generación de PDFs
- **QRCode** - Generación de códigos QR
- **XLSX** - Exportación a Excel
- **Recharts** - Gráficas y visualizaciones
- **Sonner** - Notificaciones toast

---

## 🚀 Instalación Local

### Requisitos
- Node.js 18+ 
- npm o yarn
- Cuenta de Supabase (gratuita)

### Pasos

1. **Clonar el repositorio**
```bash
git clone https://github.com/TU-USUARIO/inventarios-xipri505.git
cd inventarios-xipri505
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Configurar variables de entorno**

Crea un archivo `.env` en la raíz:

```env
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu-anon-key
VITE_SUPABASE_SERVICE_ROLE_KEY=tu-service-role-key
```

4. **Iniciar en modo desarrollo**
```bash
npm run dev
```

5. **Abrir en el navegador**
```
http://localhost:5173
```

---

## 📦 Despliegue en Producción

### Opción 1: Vercel (Recomendado)

Consulta la guía completa en: [`GUIA_DESPLIEGUE_VERCEL.md`](./GUIA_DESPLIEGUE_VERCEL.md)

**Resumen rápido:**
1. Sube el código a GitHub
2. Conecta con Vercel
3. Configura variables de entorno
4. ¡Despliega con un clic!

### Opción 2: Build Manual

```bash
npm run build
```

Los archivos compilados estarán en `/dist`

---

## 📖 Estructura del Proyecto

```
inventarios-xipri505/
├── components/           # Componentes React
│   ├── ActivosScreen.tsx
│   ├── ActivoForm.tsx
│   ├── DashboardScreen.tsx
│   ├── ReportesScreen.tsx
│   ├── ConfiguracionScreen.tsx
│   ├── IngresosScreen.tsx
│   └── ...
├── supabase/
│   └── functions/
│       └── server/       # Edge Functions
├── types/                # Definiciones TypeScript
├── utils/                # Utilidades y helpers
│   ├── supabase/         # Cliente de Supabase
│   ├── depreciacion.ts   # Lógica de depreciación
│   └── ...
├── styles/               # Estilos globales
├── App.tsx               # Componente principal
├── index.html            # HTML base
├── vite.config.ts        # Configuración de Vite
└── package.json          # Dependencias

```

---

## 🔐 Seguridad

- ✅ Autenticación con Supabase Auth
- ✅ Variables de entorno protegidas
- ✅ HTTPS automático en Vercel
- ✅ Validación de datos en frontend y backend
- ✅ Políticas de seguridad de Supabase (RLS)

**⚠️ IMPORTANTE:** Nunca compartas tus claves de Supabase públicamente.

---

## 📊 Sistema de Grupos y Códigos

El sistema utiliza grupos personalizables para organizar activos:

| Código | Nombre | Prefijo | Ejemplo |
|--------|--------|---------|---------|
| 2-06 | Equipos de Oficina | OFI- | OFI-2-06 |
| 2-07 | Sistemas y Comunicación | SIS- | SIS-2-07 |
| 2-08 | Muebles y Enseres | MUE- | MUE-2-08 |

Puedes crear tus propios grupos desde Configuración.

---

## 🧮 Cálculo de Depreciación

El sistema calcula depreciación usando el **método lineal**:

```
Depreciación Anual = Valor Original / Vida Útil
```

**Vida útil por defecto (según normativa colombiana):**
- Equipos de Cómputo: 5 años
- Muebles y Enseres: 10 años
- Vehículos: 5 años

Puedes configurar la vida útil de cada grupo en Configuración.

---

## 📄 Licencia y Derechos de Autor

© 2025 XIPRI505. Todos los derechos reservados.

Este software es propiedad privada. No está permitido:
- ❌ Copiar o distribuir el código
- ❌ Usar el código en otros proyectos
- ❌ Modificar y redistribuir

Para licencias comerciales, contacta al autor.

---

## 🤝 Soporte

Para reportar problemas o solicitar características:

1. **GitHub Issues:** Abre un issue en este repositorio
2. **Email:** [Tu email de contacto]
3. **Documentación:** Revisa los archivos `.md` en la raíz del proyecto

---

## 🗺️ Roadmap

### ✅ Completado
- [x] Sistema de gestión de activos
- [x] Integración con Supabase
- [x] Sistema de depreciación
- [x] Módulo de ingresos
- [x] Generación de reportes PDF
- [x] Códigos QR
- [x] Backup y restauración

### 🚧 En desarrollo
- [ ] App móvil nativa
- [ ] Escaneo de QR desde móvil
- [ ] Notificaciones automáticas
- [ ] Dashboard avanzado con BI

### 💡 Futuro
- [ ] Integración con sistemas contables
- [ ] API REST pública
- [ ] Multi-idioma
- [ ] Modo offline

---

## 📸 Screenshots

_(Agrega screenshots de tu aplicación aquí)_

---

## 🏆 Créditos

Desarrollado con ❤️ por **XIPRI505**

Tecnologías utilizadas:
- [React](https://react.dev/)
- [Supabase](https://supabase.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Vercel](https://vercel.com/)

---

## 📞 Contacto

- **Proyecto:** INVENTARIOS_XIPRI505
- **Versión:** 1.0.0
- **Año:** 2025

---

**¿Te gusta este proyecto? ⭐ Dale una estrella en GitHub!**
