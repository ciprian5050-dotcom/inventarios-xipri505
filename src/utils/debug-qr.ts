/**
 * Script de depuración para QR codes
 * Ejecutar en la consola del navegador para diagnosticar problemas con códigos QR
 */

export function debugQRCodes() {
  console.log('🔍 DIAGNÓSTICO DE CÓDIGOS QR\n');
  console.log('='.repeat(50));
  
  try {
    // 1. Verificar activos
    const activosData = localStorage.getItem('activos');
    if (!activosData) {
      console.log('❌ No hay activos en localStorage');
      return;
    }

    const activos = JSON.parse(activosData);
    console.log(`\n📦 Total de activos: ${activos.length}\n`);

    // 2. Mostrar información de cada activo
    console.log('📋 LISTA DE ACTIVOS:');
    console.log('-'.repeat(50));
    
    activos.forEach((activo: any, index: number) => {
      console.log(`\n${index + 1}. ${activo.nombre}`);
      console.log(`   ID: ${activo.id}`);
      console.log(`   QR: ${activo.qr}`);
      console.log(`   Estado: ${activo.estado}`);
      console.log(`   URL: ${window.location.origin}/#/public/activo/${activo.id}`);
    });

    // 3. Verificar configuración de QR público
    const qrConfig = localStorage.getItem('qr_public_config');
    console.log('\n⚙️ CONFIGURACIÓN DE CAMPOS PÚBLICOS:');
    console.log('-'.repeat(50));
    if (qrConfig) {
      console.log(JSON.parse(qrConfig));
    } else {
      console.log('⚠️ No hay configuración personalizada (usando valores por defecto)');
    }

    // 4. Verificar configuración de empresa
    const empresaConfig = localStorage.getItem('empresa_config');
    console.log('\n🏢 CONFIGURACIÓN DE EMPRESA:');
    console.log('-'.repeat(50));
    if (empresaConfig) {
      const empresa = JSON.parse(empresaConfig);
      console.log(`Nombre: ${empresa.nombreEmpresa || 'No configurado'}`);
      console.log(`NIT: ${empresa.nit || 'No configurado'}`);
    } else {
      console.log('⚠️ No hay configuración de empresa');
    }

    // 5. Generar URLs de prueba
    console.log('\n🔗 URLs PARA PROBAR:');
    console.log('-'.repeat(50));
    console.log('Copia y pega estas URLs en tu navegador para probar:\n');
    
    activos.slice(0, 3).forEach((activo: any, index: number) => {
      console.log(`${index + 1}. ${activo.nombre}:`);
      console.log(`   ${window.location.origin}/#/public/activo/${activo.id}\n`);
    });

    console.log('\n' + '='.repeat(50));
    console.log('✅ Diagnóstico completado');
    
    return {
      totalActivos: activos.length,
      activos: activos,
      tieneConfigQR: !!qrConfig,
      tieneConfigEmpresa: !!empresaConfig
    };

  } catch (error) {
    console.error('❌ Error en diagnóstico:', error);
    return null;
  }
}

/**
 * Probar un activo específico por ID
 */
export function testActivoById(activoId: string) {
  console.log(`\n🧪 PROBANDO ACTIVO ID: ${activoId}`);
  console.log('='.repeat(50));
  
  try {
    const activosData = localStorage.getItem('activos');
    if (!activosData) {
      console.log('❌ No hay activos');
      return;
    }

    const activos = JSON.parse(activosData);
    const activo = activos.find((a: any) => a.id === activoId);

    if (!activo) {
      console.log('❌ No se encontró activo con ese ID');
      console.log('\n💡 IDs disponibles:');
      activos.forEach((a: any) => {
        console.log(`   - ${a.id} (${a.nombre})`);
      });
      return;
    }

    console.log('\n✅ Activo encontrado:');
    console.log(JSON.stringify(activo, null, 2));
    
    console.log(`\n🔗 URL pública:`);
    console.log(`${window.location.origin}/#/public/activo/${activo.id}`);

    return activo;

  } catch (error) {
    console.error('❌ Error:', error);
    return null;
  }
}

/**
 * Listar todos los IDs de activos
 */
export function listActivoIds() {
  console.log('\n📋 LISTA DE IDS DE ACTIVOS');
  console.log('='.repeat(50));
  
  try {
    const activosData = localStorage.getItem('activos');
    if (!activosData) {
      console.log('❌ No hay activos');
      return [];
    }

    const activos = JSON.parse(activosData);
    const ids = activos.map((a: any) => ({
      id: a.id,
      qr: a.qr,
      nombre: a.nombre,
      estado: a.estado
    }));

    console.table(ids);
    return ids;

  } catch (error) {
    console.error('❌ Error:', error);
    return [];
  }
}

// Exportar funciones al objeto window para fácil acceso desde consola
if (typeof window !== 'undefined') {
  (window as any).debugQRCodes = debugQRCodes;
  (window as any).testActivoById = testActivoById;
  (window as any).listActivoIds = listActivoIds;
}
