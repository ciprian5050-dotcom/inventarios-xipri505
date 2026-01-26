// Tipos compartidos de la aplicación

export interface Activo {
  id: string;
  qr: string;
  nombre: string;
  marca: string;
  modelo: string;
  serie: string;
  dependencia: string;
  cuentadante?: string;
  valor: number;
  fechaIngreso: string;
  estado: 'Activo' | 'Inactivo' | 'En mantenimiento' | 'Dado de baja' | 'Extraviado';
  observaciones?: string;
  grupo?: string;
}

export interface Cuentadante {
  id: string;
  nombre: string;
  cedula: string;
  cargo: string;
  dependencia: string;
  email?: string;
  telefono?: string;
}

export interface Dependencia {
  id: string;
  nombre: string;
  codigo: string;
  responsable?: string;
  ubicacion?: string;
}

export interface Marca {
  id: string;
  nombre: string;
  descripcion?: string;
}

export interface NombreActivo {
  id: string;
  nombre: string;
  descripcion?: string;
}

export interface ConfiguracionEmpresa {
  nombreEmpresa: string;
  nit: string;
  direccion: string;
  telefono: string;
  logoUrl: string;
}

export interface Credenciales {
  usuario: string;
  password: string;
}

export interface Circular {
  id: string;
  numero: string;
  fecha: string;
  para: string; // Dependencia destinataria
  asunto: string;
  contenido: string; // Cuerpo del mensaje
  estado: 'Pendiente' | 'Enviada' | 'Archivada';
}

export interface GrupoActivo {
  codigo: string;
  nombre: string;
  prefijo: string;
  vidaUtil: number; // Años de vida útil
  tasaDepreciacion: number; // Porcentaje anual (0-100)
}

export interface DepreciacionCalculada {
  valorOriginal: number;
  vidaUtilAnios: number;
  tasaDepreciacion: number;
  aniosTranscurridos: number;
  depreciacionAnual: number;
  depreciacionAcumulada: number;
  valorActual: number;
  porcentajeDepreciado: number;
}