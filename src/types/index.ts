// múltiples dependencias por cuentadante (1/3)

export interface Activo {
  id: string;
  codigo: string;
  nombre: string;
  marca: string;
  modelo: string;
  serie: string;
  dependencia: string;
  valor: number;
  fechaIngreso: string;
  estado: string;
  observaciones?: string;
  grupo?: string;
  cuentadante?: string;
  placa?: string;
}

export interface Dependencia {
  id: string;
  nombre: string;
  codigo: string;
}

export interface Cuentadante {
  id: string;
  nombre: string;
  cedula: string;
  dependencias: string[]; // ✅ CAMBIO: ahora es array para múltiples dependencias
  cargo: string;
  telefono?: string;
  email?: string;
}

export interface Grupo {
  id: string;
  nombre: string;
  prefijo: string;
  descripcion?: string;
}

export interface MovimientoInventario {
  id: string;
  tipo: 'ingreso' | 'traslado' | 'baja' | 'ajuste';
  fecha: string;
  descripcion: string;
  usuario: string;
  activosAfectados: string[];
  detalles?: any;
}

export interface Usuario {
  id: string;
  username: string;
  passwordHash: string;
  nombre: string;
  rol: 'admin' | 'usuario';
  activo: boolean;
  fechaCreacion: string;
}
