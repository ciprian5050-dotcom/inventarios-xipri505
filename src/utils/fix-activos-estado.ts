/**
 * Utilidad para corregir el estado de los activos existentes en localStorage
 * Cambia todos los activos con estado "Extraviado" o valores inválidos a "Activo"
 */

export function fixActivosEstado() {
  try {
    const activosData = localStorage.getItem('activos');
    
    if (!activosData) {
      console.log('No hay activos para corregir');
      return { updated: 0, total: 0 };
    }

    const activos = JSON.parse(activosData);
    let updatedCount = 0;
    
    const estadosValidos = ['Activo', 'Inactivo', 'En mantenimiento', 'Dado de baja', 'Extraviado'];
    
    const activosCorregidos = activos.map((activo: any) => {
      // Si el activo tiene estado "Extraviado" o un estado inválido
      if (!estadosValidos.includes(activo.estado)) {
        console.log(`Corrigiendo activo ${activo.qr}: estado "${activo.estado}" -> "Activo"`);
        updatedCount++;
        return { ...activo, estado: 'Activo' };
      }
      return activo;
    });

    // Guardar los activos corregidos
    localStorage.setItem('activos', JSON.stringify(activosCorregidos));
    
    console.log(`✅ Corrección completada: ${updatedCount} de ${activos.length} activos actualizados`);
    
    return { updated: updatedCount, total: activos.length };
  } catch (error) {
    console.error('Error al corregir estados de activos:', error);
    return { updated: 0, total: 0, error };
  }
}

/**
 * Obtiene un reporte de los estados actuales de los activos
 */
export function reportActivosEstado() {
  try {
    const activosData = localStorage.getItem('activos');
    
    if (!activosData) {
      console.log('No hay activos registrados');
      return {};
    }

    const activos = JSON.parse(activosData);
    const reporte: Record<string, number> = {};
    
    activos.forEach((activo: any) => {
      const estado = activo.estado || 'Sin estado';
      reporte[estado] = (reporte[estado] || 0) + 1;
    });

    console.log('📊 Reporte de estados de activos:');
    Object.entries(reporte).forEach(([estado, cantidad]) => {
      console.log(`  ${estado}: ${cantidad}`);
    });
    
    return reporte;
  } catch (error) {
    console.error('Error al generar reporte:', error);
    return {};
  }
}
