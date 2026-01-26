/**
 * Script de corrección rápida para ejecutar desde la consola del navegador
 * 
 * INSTRUCCIONES DE USO:
 * 1. Abre la consola del navegador (F12 o clic derecho > Inspeccionar)
 * 2. Ve a la pestaña "Console"
 * 3. Copia y pega este código completo en la consola
 * 4. Presiona Enter
 * 5. Recarga la página (F5)
 */

(function() {
  console.log('🔧 Iniciando corrección de estados de activos...\n');
  
  try {
    const activosData = localStorage.getItem('activos');
    
    if (!activosData) {
      console.log('❌ No se encontraron activos en localStorage');
      return;
    }

    const activos = JSON.parse(activosData);
    console.log(`📦 Encontrados ${activos.length} activos\n`);
    
    // Estadísticas antes de la corrección
    const estadosAntes: Record<string, number> = {};
    activos.forEach((activo: any) => {
      const estado = activo.estado || 'Sin estado';
      estadosAntes[estado] = (estadosAntes[estado] || 0) + 1;
    });
    
    console.log('📊 Estados actuales:');
    Object.entries(estadosAntes).forEach(([estado, cantidad]) => {
      console.log(`  • ${estado}: ${cantidad}`);
    });
    console.log('');
    
    // Corregir estados inválidos
    const estadosValidos = ['Activo', 'Inactivo', 'En mantenimiento', 'Dado de baja', 'Extraviado'];
    let corregidos = 0;
    
    const activosCorregidos = activos.map((activo: any) => {
      if (!estadosValidos.includes(activo.estado)) {
        console.log(`🔄 Corrigiendo ${activo.qr}: "${activo.estado}" → "Activo"`);
        corregidos++;
        return { ...activo, estado: 'Activo' };
      }
      return activo;
    });
    
    // Guardar cambios
    localStorage.setItem('activos', JSON.stringify(activosCorregidos));
    
    // Estadísticas después de la corrección
    const estadosDespues: Record<string, number> = {};
    activosCorregidos.forEach((activo: any) => {
      const estado = activo.estado || 'Sin estado';
      estadosDespues[estado] = (estadosDespues[estado] || 0) + 1;
    });
    
    console.log('\n✅ Corrección completada!');
    console.log(`📝 ${corregidos} activos fueron corregidos de ${activos.length} totales\n`);
    
    console.log('📊 Estados actualizados:');
    Object.entries(estadosDespues).forEach(([estado, cantidad]) => {
      console.log(`  • ${estado}: ${cantidad}`);
    });
    
    if (corregidos > 0) {
      console.log('\n🔄 Por favor, recarga la página (F5) para ver los cambios');
    } else {
      console.log('\n✨ Todos los activos ya tenían estados válidos');
    }
    
  } catch (error) {
    console.error('❌ Error al corregir estados:', error);
  }
})();
