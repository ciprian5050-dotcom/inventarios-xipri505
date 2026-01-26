import { Activo, GrupoActivo, DepreciacionCalculada } from '../types';

/**
 * Calcula la depreciación de un activo según el método lineal
 * basado en las normas contables colombianas
 */
export function calcularDepreciacion(
  activo: Activo,
  grupo: GrupoActivo | undefined
): DepreciacionCalculada {
  const valorOriginal = activo.valor;
  
  // Si no hay grupo definido, usar valores por defecto (10 años, 10%)
  const vidaUtilAnios = grupo?.vidaUtil || 10;
  const tasaDepreciacion = grupo?.tasaDepreciacion || 10;
  
  // Calcular años transcurridos desde la fecha de ingreso
  const fechaIngreso = new Date(activo.fechaIngreso);
  const fechaActual = new Date();
  const milisegundosTranscurridos = fechaActual.getTime() - fechaIngreso.getTime();
  const aniosTranscurridos = milisegundosTranscurridos / (1000 * 60 * 60 * 24 * 365.25);
  
  // Depreciación anual = Valor original × Tasa de depreciación
  const depreciacionAnual = valorOriginal * (tasaDepreciacion / 100);
  
  // Depreciación acumulada = Depreciación anual × Años transcurridos
  // No puede superar la vida útil del activo
  const aniosParaDepreciar = Math.min(aniosTranscurridos, vidaUtilAnios);
  const depreciacionAcumulada = depreciacionAnual * aniosParaDepreciar;
  
  // Valor actual = Valor original - Depreciación acumulada
  // No puede ser negativo
  const valorActual = Math.max(0, valorOriginal - depreciacionAcumulada);
  
  // Porcentaje depreciado
  const porcentajeDepreciado = valorOriginal > 0 
    ? (depreciacionAcumulada / valorOriginal) * 100 
    : 0;
  
  return {
    valorOriginal,
    vidaUtilAnios,
    tasaDepreciacion,
    aniosTranscurridos: Math.max(0, aniosTranscurridos),
    depreciacionAnual,
    depreciacionAcumulada,
    valorActual,
    porcentajeDepreciado: Math.min(100, porcentajeDepreciado)
  };
}

/**
 * Formatea un valor en pesos colombianos
 */
export function formatearMoneda(valor: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(valor);
}

/**
 * Valores estándar de depreciación según normativa colombiana
 */
export const TASAS_DEPRECIACION_ESTANDAR = {
  'Edificaciones': { vidaUtil: 20, tasa: 5 },
  'Maquinaria y Equipo': { vidaUtil: 10, tasa: 10 },
  'Muebles y Enseres': { vidaUtil: 10, tasa: 10 },
  'Equipos de Oficina': { vidaUtil: 5, tasa: 20 },
  'Equipos de Cómputo y Comunicación': { vidaUtil: 5, tasa: 20 },
  'Sistemas y Comunicación': { vidaUtil: 5, tasa: 20 },
  'Vehículos': { vidaUtil: 5, tasa: 20 }
};
