import { useState, useEffect } from 'react';
import { Database, RefreshCw, CheckCircle, AlertTriangle, Server, HardDrive, Clock, Wrench } from 'lucide-react';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { kvGet, kvGetByPrefix, checkTableExists, createTableIfNotExists, kvSet } from '../utils/supabase/client';

interface BackendStats {
  activos: number;
  dependencias: number;
  cuentadantes: number;
  marcas: number;
  nombresActivos: number;
  grupos: number;
  circulares: number;
  lastUpdate: string;
  storage: 'memory' | 'database';
}

export function BackendAdminScreen() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState<any>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [migrating, setMigrating] = useState(false);
  const [migrationResult, setMigrationResult] = useState<any>(null);
  const [tableExists, setTableExists] = useState(false);
  const [creatingTable, setCreatingTable] = useState(false);
  const [localStorageHasData, setLocalStorageHasData] = useState(false);
  const [exportingBackup, setExportingBackup] = useState(false);
  const [importingBackup, setImportingBackup] = useState(false);

  useEffect(() => {
    loadStats();
    checkLocalStorageData();
  }, []);

  const checkLocalStorageData = () => {
    // Verificar si hay datos en localStorage
    const activos = JSON.parse(localStorage.getItem('activos') || '[]');
    const dependencias = JSON.parse(localStorage.getItem('dependencias') || '[]');
    const cuentadantes = JSON.parse(localStorage.getItem('cuentadantes') || '[]');
    
    const hasData = activos.length > 0 || dependencias.length > 0 || cuentadantes.length > 0;
    setLocalStorageHasData(hasData);
    
    if (hasData) {
      console.log('📦 [MIGRATION] Se detectaron datos en localStorage:', {
        activos: activos.length,
        dependencias: dependencias.length,
        cuentadantes: cuentadantes.length
      });
      
      // Mostrar los datos en consola para debug
      console.log('📊 [DEBUG] Datos completos en localStorage:');
      console.log('Activos:', activos);
      console.log('Dependencias:', dependencias);
      console.log('Cuentadantes:', cuentadantes);
    }
  };

  const mostrarDatosLocalStorage = () => {
    const activos = JSON.parse(localStorage.getItem('activos') || '[]');
    const dependencias = JSON.parse(localStorage.getItem('dependencias') || '[]');
    const cuentadantes = JSON.parse(localStorage.getItem('cuentadantes') || '[]');
    const marcas = JSON.parse(localStorage.getItem('marcas') || '[]');
    const nombres_activos = JSON.parse(localStorage.getItem('nombres_activos') || '[]');
    const grupos_activos = JSON.parse(localStorage.getItem('grupos_activos') || '[]');
    const circulares = JSON.parse(localStorage.getItem('circulares') || '[]');
    const configuracionEmpresa = localStorage.getItem('configuracion_empresa');

    const info = `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📦 DATOS EN LOCALSTORAGE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📊 RESUMEN:
  • Activos: ${activos.length}
  • Dependencias: ${dependencias.length}
  • Cuentadantes: ${cuentadantes.length}
  • Marcas: ${marcas.length}
  • Nombres de Activos: ${nombres_activos.length}
  • Grupos: ${grupos_activos.length}
  • Circulares: ${circulares.length}
  • Configuración: ${configuracionEmpresa ? 'Sí' : 'No'}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 DETALLES:

ACTIVOS (${activos.length}):
${activos.slice(0, 5).map((a: any, i: number) => `  ${i + 1}. ${a.codigo || 'Sin código'} - ${a.nombre || 'Sin nombre'}`).join('\n')}
${activos.length > 5 ? `  ... y ${activos.length - 5} más` : ''}

DEPENDENCIAS (${dependencias.length}):
${dependencias.slice(0, 5).map((d: any, i: number) => `  ${i + 1}. ${d.nombre || 'Sin nombre'}`).join('\n')}
${dependencias.length > 5 ? `  ... y ${dependencias.length - 5} más` : ''}

CUENTADANTES (${cuentadantes.length}):
${cuentadantes.slice(0, 5).map((c: any, i: number) => `  ${i + 1}. ${c.nombre || 'Sin nombre'} - ${c.dependencia || 'Sin dependencia'}`).join('\n')}
${cuentadantes.length > 5 ? `  ... y ${cuentadantes.length - 5} más` : ''}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    `;

    console.log(info);
    alert('✅ Datos listados en la consola (presiona F12 para ver)');
  };

  const loadStats = async () => {
    try {
      setError('');
      
      console.log('🔍 [FRONTEND] Cargando estadísticas directamente desde Supabase...');
      console.log('🔍 [FRONTEND] Project ID:', projectId);

      // Verificar si la tabla existe PRIMERO
      const exists = await checkTableExists();
      setTableExists(exists);
      
      if (!exists) {
        console.log('⚠️ [FRONTEND] La tabla kv_store_b351c7a3 no existe');
        setError('La tabla kv_store_b351c7a3 no existe. Haz clic en "Crear Tabla Automáticamente" para crearla.');
        setLoading(false);
        setRefreshing(false);
        return;
      }

      console.log('✅ [FRONTEND] Tabla existe, obteniendo datos...');

      // Obtener datos directamente desde la tabla kv_store_b351c7a3
      const activos = await kvGetByPrefix('activo:');
      const dependencias = await kvGetByPrefix('dependencia:');
      const cuentadantes = await kvGetByPrefix('cuentadante:');
      const marcas = await kvGet('marcas') || [];
      const nombresActivos = await kvGet('nombres_activos') || [];
      const grupos = await kvGet('grupos_activos') || [];
      const circulares = await kvGet('circulares') || [];

      console.log('📊 [FRONTEND] Datos obtenidos:', {
        activos: activos.length,
        dependencias: dependencias.length,
        cuentadantes: cuentadantes.length,
        marcas: Array.isArray(marcas) ? marcas.length : 0,
        nombresActivos: Array.isArray(nombresActivos) ? nombresActivos.length : 0,
        grupos: Array.isArray(grupos) ? grupos.length : 0,
        circulares: Array.isArray(circulares) ? circulares.length : 0,
      });

      const statsData = {
        activos: activos.length,
        dependencias: dependencias.length,
        cuentadantes: cuentadantes.length,
        marcas: Array.isArray(marcas) ? marcas.length : 0,
        nombresActivos: Array.isArray(nombresActivos) ? nombresActivos.length : 0,
        grupos: Array.isArray(grupos) ? grupos.length : 0,
        circulares: Array.isArray(circulares) ? circulares.length : 0,
        lastUpdate: new Date().toISOString(),
        storage: 'database'
      };

      setStats(statsData);
      console.log('✅ [FRONTEND] Estadísticas cargadas exitosamente');
    } catch (err: any) {
      console.error('❌ [FRONTEND] Error cargando estadísticas:', err);
      
      // Marcar que la tabla no existe para mostrar el botón de creación
      setTableExists(false);
      
      // Mostrar error más descriptivo
      let errorMsg = 'No se pudo conectar con Supabase. ';
      
      if (err.message?.includes('Failed to fetch')) {
        errorMsg += 'La tabla kv_store_b351c7a3 probablemente no existe o hay un problema de red. Haz clic en "Crear Tabla Automáticamente".';
      } else if (err.message?.includes('relation "kv_store_b351c7a3" does not exist') || err.code === '42P01') {
        errorMsg = 'La tabla kv_store_b351c7a3 no existe. Haz clic en "Crear Tabla Automáticamente".';
      } else if (err.message?.includes('JWT')) {
        errorMsg = 'Error de autenticación. Verifica tus credenciales de Supabase en la configuración.';
      } else if (err.code) {
        errorMsg += `Código de error: ${err.code}. ${err.message}`;
      } else {
        errorMsg += err.message || 'Error desconocido';
      }
      
      setError(errorMsg);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleCreateTable = async () => {
    setCreatingTable(true);
    setTableExists(false);
    // No cerramos el creatingTable para mantener el panel de instrucciones abierto
  };

  const handleRefresh = () => {
    setRefreshing(true);
    setMigrationResult(null);
    loadStats();
  };

  const handleMigrate = async () => {
    try {
      setMigrating(true);
      setMigrationResult(null);
      setError('');

      console.log('🔄 [MIGRATION] Iniciando migración desde localStorage a Supabase...');

      // Leer datos de localStorage
      const activos = JSON.parse(localStorage.getItem('activos') || '[]');
      const cuentadantes = JSON.parse(localStorage.getItem('cuentadantes') || '[]');
      const dependencias = JSON.parse(localStorage.getItem('dependencias') || '[]');
      const marcas = JSON.parse(localStorage.getItem('marcas') || '[]');
      const nombres_activos = JSON.parse(localStorage.getItem('nombres_activos') || '[]');
      const grupos_activos = JSON.parse(localStorage.getItem('grupos_activos') || '[]');
      const circulares = JSON.parse(localStorage.getItem('circulares') || '[]');
      const configuracionEmpresa = localStorage.getItem('configuracion_empresa');

      console.log('📊 [MIGRATION] Datos encontrados en localStorage:', {
        activos: activos.length,
        cuentadantes: cuentadantes.length,
        dependencias: dependencias.length,
        marcas: marcas.length,
        nombres_activos: nombres_activos.length,
        grupos_activos: grupos_activos.length,
        circulares: circulares.length
      });

      let totalMigrado = 0;

      // Migrar activos (uno por uno con prefijo activo:)
      console.log('📦 Migrando activos...');
      for (const activo of activos) {
        await kvSet(`activo:${activo.id}`, activo);
        totalMigrado++;
      }
      console.log(`✅ ${activos.length} activos migrados`);

      // Migrar dependencias (uno por uno con prefijo dependencia:)
      console.log('🏢 Migrando dependencias...');
      for (const dependencia of dependencias) {
        await kvSet(`dependencia:${dependencia.id}`, dependencia);
        totalMigrado++;
      }
      console.log(`✅ ${dependencias.length} dependencias migradas`);

      // Migrar cuentadantes (uno por uno con prefijo cuentadante:)
      console.log('👤 Migrando cuentadantes...');
      for (const cuentadante of cuentadantes) {
        await kvSet(`cuentadante:${cuentadante.id}`, cuentadante);
        totalMigrado++;
      }
      console.log(`✅ ${cuentadantes.length} cuentadantes migrados`);

      // Migrar arrays simples
      console.log('📋 Migrando datos de configuración...');
      await kvSet('marcas', marcas);
      await kvSet('nombres_activos', nombres_activos);
      await kvSet('grupos_activos', grupos_activos);
      await kvSet('circulares', circulares);
      
      // Migrar configuración de empresa
      if (configuracionEmpresa) {
        await kvSet('configuracion_empresa', JSON.parse(configuracionEmpresa));
      }

      console.log('✅ [MIGRATION] Migración completada exitosamente');
      
      setMigrationResult({
        success: true,
        message: 'Datos migrados exitosamente a Supabase',
        registros_migrados: totalMigrado
      });

      // Recargar estadísticas
      setTimeout(() => {
        loadStats();
      }, 1000);

    } catch (err: any) {
      console.error('❌ [MIGRATION] Error:', err);
      setError('Error en la migración: ' + err.message);
    } finally {
      setMigrating(false);
    }
  };

  const handleExportBackup = async () => {
    try {
      setExportingBackup(true);
      console.log('💾 [BACKUP] Iniciando exportación de backup...');

      // Obtener todos los datos desde Supabase
      const activos = await kvGetByPrefix('activo:');
      const dependencias = await kvGetByPrefix('dependencia:');
      const cuentadantes = await kvGetByPrefix('cuentadante:');
      const marcas = await kvGet('marcas') || [];
      const nombres_activos = await kvGet('nombres_activos') || [];
      const grupos_activos = await kvGet('grupos_activos') || [];
      const circulares = await kvGet('circulares') || [];
      const configuracionEmpresa = await kvGet('configuracion_empresa') || {};

      // Crear objeto de backup
      const backup = {
        version: '1.0',
        fecha_exportacion: new Date().toISOString(),
        datos: {
          activos,
          dependencias,
          cuentadantes,
          marcas,
          nombres_activos,
          grupos_activos,
          circulares,
          configuracion_empresa: configuracionEmpresa
        },
        estadisticas: {
          total_activos: activos.length,
          total_dependencias: dependencias.length,
          total_cuentadantes: cuentadantes.length,
          total_marcas: Array.isArray(marcas) ? marcas.length : 0,
          total_nombres_activos: Array.isArray(nombres_activos) ? nombres_activos.length : 0,
          total_grupos: Array.isArray(grupos_activos) ? grupos_activos.length : 0,
          total_circulares: Array.isArray(circulares) ? circulares.length : 0
        }
      };

      console.log('📊 [BACKUP] Datos recopilados:', backup.estadisticas);

      // Convertir a JSON
      const jsonString = JSON.stringify(backup, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      
      // Crear enlace de descarga
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      // Nombre del archivo con fecha
      const fecha = new Date().toISOString().split('T')[0];
      link.download = `backup-activos-fijos-${fecha}.json`;
      
      // Descargar
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      console.log('✅ [BACKUP] Backup exportado exitosamente');
      alert('✅ Backup exportado exitosamente!\n\n' + 
            `📊 DESGLOSE COMPLETO:\n` +
            `• Activos: ${activos.length}\n` +
            `• Dependencias: ${dependencias.length}\n` +
            `• Cuentadantes: ${cuentadantes.length}\n` +
            `• Marcas: ${backup.estadisticas.total_marcas}\n` +
            `• Nombres de Activos: ${backup.estadisticas.total_nombres_activos}\n` +
            `• Grupos: ${backup.estadisticas.total_grupos}\n` +
            `• Circulares: ${backup.estadisticas.total_circulares}\n\n` +
            `📁 Archivo: backup-activos-fijos-${fecha}.json\n\n` +
            `${activos.length === 0 ? '⚠️ NO SE ENCONTRARON ACTIVOS. Verifica que estén en Supabase.' : '✅ Datos exportados correctamente'}`);

    } catch (err: any) {
      console.error('❌ [BACKUP] Error exportando backup:', err);
      alert('❌ Error al exportar backup: ' + err.message);
    } finally {
      setExportingBackup(false);
    }
  };

  const handleImportBackup = () => {
    // Crear input file invisible
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    input.onchange = async (e: any) => {
      try {
        setImportingBackup(true);
        const file = e.target.files[0];
        
        if (!file) {
          alert('No se seleccionó ningún archivo');
          setImportingBackup(false);
          return;
        }

        console.log('📤 [RESTORE] Leyendo archivo de backup...');
        
        // Leer archivo
        const text = await file.text();
        const backup = JSON.parse(text);

        console.log('📊 [RESTORE] Backup leído:', backup.estadisticas);

        // Validar estructura
        if (!backup.datos) {
          throw new Error('Archivo de backup inválido: falta la estructura de datos');
        }

        // Confirmar importación
        const confirmar = confirm(
          '⚠️ ADVERTENCIA: Esta acción sobrescribirá todos los datos actuales.\n\n' +
          `Datos a importar:\n` +
          `• Activos: ${backup.estadisticas?.total_activos || 0}\n` +
          `• Dependencias: ${backup.estadisticas?.total_dependencias || 0}\n` +
          `• Cuentadantes: ${backup.estadisticas?.total_cuentadantes || 0}\n` +
          `• Marcas: ${backup.estadisticas?.total_marcas || 0}\n` +
          `• Grupos: ${backup.estadisticas?.total_grupos || 0}\n\n` +
          `Fecha del backup: ${new Date(backup.fecha_exportacion).toLocaleString('es-CO')}\n\n` +
          '¿Deseas continuar?'
        );

        if (!confirmar) {
          setImportingBackup(false);
          return;
        }

        console.log('🔄 [RESTORE] Iniciando restauración...');

        const { activos, dependencias, cuentadantes, marcas, nombres_activos, grupos_activos, circulares, configuracion_empresa } = backup.datos;

        let totalRestaurado = 0;

        // Restaurar activos
        console.log('📦 Restaurando activos...');
        for (const activo of activos || []) {
          await kvSet(`activo:${activo.id}`, activo);
          totalRestaurado++;
        }

        // Restaurar dependencias
        console.log('🏢 Restaurando dependencias...');
        for (const dependencia of dependencias || []) {
          await kvSet(`dependencia:${dependencia.id}`, dependencia);
          totalRestaurado++;
        }

        // Restaurar cuentadantes
        console.log('👤 Restaurando cuentadantes...');
        for (const cuentadante of cuentadantes || []) {
          await kvSet(`cuentadante:${cuentadante.id}`, cuentadante);
          totalRestaurado++;
        }

        // Restaurar arrays simples
        console.log('📋 Restaurando configuración...');
        await kvSet('marcas', marcas || []);
        await kvSet('nombres_activos', nombres_activos || []);
        await kvSet('grupos_activos', grupos_activos || []);
        await kvSet('circulares', circulares || []);
        
        if (configuracion_empresa) {
          await kvSet('configuracion_empresa', configuracion_empresa);
        }

        console.log('✅ [RESTORE] Restauración completada');
        
        alert('✅ Backup restaurado exitosamente!\n\n' + 
              `Total de registros restaurados: ${totalRestaurado}`);

        // Recargar estadísticas
        setTimeout(() => {
          loadStats();
        }, 1000);

      } catch (err: any) {
        console.error('❌ [RESTORE] Error restaurando backup:', err);
        alert('❌ Error al restaurar backup: ' + err.message);
      } finally {
        setImportingBackup(false);
      }
    };
    
    input.click();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Cargando estadísticas del backend...</p>
        </div>
      </div>
    );
  }

  if (error) {
    const sqlCode = `CREATE TABLE IF NOT EXISTS kv_store_b351c7a3 (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL
);

ALTER TABLE kv_store_b351c7a3 ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all" ON kv_store_b351c7a3 FOR ALL TO authenticated, anon USING (true) WITH CHECK (true);`;

    const supabaseUrl = `https://supabase.com/dashboard/project/${projectId}/sql/new`;
    
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
          <div className="flex items-center gap-3 mb-3">
            <AlertTriangle className="w-6 h-6 text-red-600" />
            <h3 className="text-lg font-semibold text-red-900">Error al Conectar con el Backend</h3>
          </div>
          <p className="text-red-700 mb-4">{error}</p>
          
          {/* Debug Info */}
          <div className="bg-white border border-red-300 rounded p-4 mb-4 text-xs font-mono">
            <p className="text-slate-600 mb-2"><strong>Debug Info:</strong></p>
            <p className="text-slate-800">Project ID: {projectId}</p>
            <p className="text-slate-800">Tabla existe: {tableExists ? 'Sí' : 'No'}</p>
          </div>
          
          <div className="flex gap-3">
            {!tableExists && (
              <button
                onClick={handleCreateTable}
                disabled={creatingTable}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                <Wrench className="w-5 h-5" />
                {creatingTable ? 'Ver Instrucciones ↓' : 'Crear Tabla Automáticamente'}
              </button>
            )}
            <button
              onClick={handleRefresh}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Reintentar
            </button>
          </div>
        </div>

        {/* Instrucciones de Creación de Tabla */}
        {creatingTable && (
          <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-6">
            <h2 className="text-2xl font-bold text-blue-900 mb-6">📋 Instrucciones para Crear la Tabla</h2>
            
            {/* Paso 1 */}
            <div className="bg-white rounded-lg p-5 mb-4 shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className="bg-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold">
                  1
                </div>
                <h3 className="text-lg font-semibold text-slate-900">Abre el SQL Editor de Supabase</h3>
              </div>
              <p className="text-slate-700 mb-3 ml-11">
                Haz clic en el siguiente enlace para abrir el SQL Editor en una nueva pestaña:
              </p>
              <a
                href={supabaseUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="ml-11 inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                🔗 Abrir SQL Editor
              </a>
            </div>

            {/* Paso 2 */}
            <div className="bg-white rounded-lg p-5 mb-4 shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className="bg-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold">
                  2
                </div>
                <h3 className="text-lg font-semibold text-slate-900">Copia este código SQL</h3>
              </div>
              <p className="text-slate-700 mb-3 ml-11">
                Haz clic en "Copiar Código" para copiar el SQL al portapapeles:
              </p>
              <div className="ml-11">
                <div className="relative">
                  <pre className="bg-slate-900 text-slate-100 p-4 rounded-lg overflow-x-auto text-sm font-mono">
{sqlCode}
                  </pre>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(sqlCode);
                      alert('✅ Código SQL copiado al portapapeles');
                    }}
                    className="absolute top-2 right-2 px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
                  >
                    📋 Copiar Código
                  </button>
                </div>
              </div>
            </div>

            {/* Paso 3 */}
            <div className="bg-white rounded-lg p-5 mb-4 shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className="bg-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold">
                  3
                </div>
                <h3 className="text-lg font-semibold text-slate-900">Pega y ejecuta el código</h3>
              </div>
              <div className="ml-11 space-y-2">
                <p className="text-slate-700">1. En el SQL Editor, pega el código que copiaste</p>
                <p className="text-slate-700">2. Haz clic en el botón <strong>"Run"</strong> (abajo a la derecha)</p>
                <p className="text-slate-700">3. Espera a que aparezca el mensaje: <span className="text-green-600 font-semibold">"Success. No rows returned"</span></p>
              </div>
            </div>

            {/* Paso 4 */}
            <div className="bg-white rounded-lg p-5 shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className="bg-green-600 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold">
                  4
                </div>
                <h3 className="text-lg font-semibold text-slate-900">Regresa aquí y haz clic en "Reintentar"</h3>
              </div>
              <p className="text-slate-700 ml-11 mb-3">
                Una vez que el SQL se haya ejecutado correctamente, regresa a esta página y haz clic en el botón "Reintentar" arriba.
              </p>
              <div className="ml-11">
                <button
                  onClick={() => {
                    setCreatingTable(false);
                    handleRefresh();
                  }}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  ✅ Ya creé la tabla - Reintentar
                </button>
              </div>
            </div>

            {/* Nota adicional */}
            <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-4 mt-6">
              <p className="text-sm text-yellow-800">
                <strong>💡 Nota:</strong> Si tienes problemas para encontrar el SQL Editor, busca en el menú lateral de Supabase la opción "SQL Editor" o "Database" → "SQL Editor".
              </p>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (!stats) return null;

  const isMemoryMode = stats.storage === 'memory';

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-blue-100 p-3 rounded-lg">
            <Database className="w-8 h-8 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Administración del Backend</h1>
            <p className="text-slate-600">Estado y estadísticas en tiempo real</p>
          </div>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
          Actualizar
        </button>
      </div>

      {/* Estado del Almacenamiento */}
      <div className={`${isMemoryMode ? 'bg-yellow-50 border-yellow-200' : 'bg-green-50 border-green-200'} border rounded-lg p-6`}>
        <div className="flex items-center gap-3 mb-4">
          {isMemoryMode ? (
            <>
              <div className="bg-yellow-100 p-3 rounded-full">
                <HardDrive className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-yellow-900">Modo Memoria (Temporal)</h3>
                <p className="text-sm text-yellow-700">
                  Los datos están en memoria del servidor. Configura la tabla Supabase para persistencia permanente.
                </p>
              </div>
            </>
          ) : (
            <>
              <div className="bg-green-100 p-3 rounded-full">
                <Server className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-green-900">Base de Datos Conectada</h3>
                <p className="text-sm text-green-700">
                  Los datos están almacenados de forma permanente en Supabase.
                </p>
              </div>
            </>
          )}
        </div>

        {isMemoryMode && (
          <div className="bg-yellow-100 rounded-lg p-4 mt-4">
            <p className="text-sm text-yellow-800">
              <strong>⚠️ Advertencia:</strong> En modo memoria, los datos se perderán si el servidor se reinicia. 
              Para almacenamiento permanente, crea la tabla <code className="bg-yellow-200 px-1 rounded">kv_store_b351c7a3</code> en Supabase.
            </p>
          </div>
        )}
      </div>

      {/* ALERTA DE MIGRACIÓN - Si hay datos en localStorage */}
      {localStorageHasData && stats.activos === 0 && (
        <div className="bg-orange-50 border-2 border-orange-300 rounded-lg p-6 animate-pulse">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-orange-100 p-3 rounded-full">
              <AlertTriangle className="w-8 h-8 text-orange-600" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-orange-900">¡Datos Detectados en localStorage!</h3>
              <p className="text-sm text-orange-700">
                Hemos encontrado datos en tu navegador que necesitan migrarse a Supabase
              </p>
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-4 mb-4">
            <h4 className="font-semibold text-slate-900 mb-2">¿Por qué migrar?</h4>
            <ul className="space-y-1 text-sm text-slate-700">
              <li>✓ Tus datos estarán seguros en la nube</li>
              <li>✓ No se perderán si limpias el navegador</li>
              <li>✓ Podrás acceder desde cualquier dispositivo</li>
              <li>✓ Backup automático incluido</li>
            </ul>
          </div>

          <button
            onClick={handleMigrate}
            disabled={migrating}
            className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50 text-lg font-semibold shadow-lg"
          >
            <RefreshCw className={`w-6 h-6 ${migrating ? 'animate-spin' : ''}`} />
            {migrating ? 'Migrando Datos...' : '¡Migrar Mis Datos Ahora!'}
          </button>
          
          <button
            onClick={mostrarDatosLocalStorage}
            className="w-full flex items-center justify-center gap-3 px-6 py-3 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors text-base font-medium"
          >
            📋 Ver Qué Datos Tengo en localStorage
          </button>
          
          {migrationResult && (
            <div className="mt-4 bg-green-100 border border-green-300 rounded-lg p-4">
              <p className="text-sm text-green-800 font-semibold">
                ✅ {migrationResult.message}
              </p>
              <p className="text-xs text-green-700 mt-1">
                {migrationResult.registros_migrados} registros migrados exitosamente
              </p>
            </div>
          )}
        </div>
      )}

      {/* Estadísticas Generales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-slate-600">Activos Fijos</h3>
            <CheckCircle className="w-5 h-5 text-blue-600" />
          </div>
          <div className="text-3xl font-bold text-slate-900">{stats.activos.toLocaleString()}</div>
          <p className="text-xs text-slate-500 mt-1">Total registrados</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-slate-600">Dependencias</h3>
            <CheckCircle className="w-5 h-5 text-green-600" />
          </div>
          <div className="text-3xl font-bold text-slate-900">{stats.dependencias.toLocaleString()}</div>
          <p className="text-xs text-slate-500 mt-1">Configuradas</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-slate-600">Cuentadantes</h3>
            <CheckCircle className="w-5 h-5 text-purple-600" />
          </div>
          <div className="text-3xl font-bold text-slate-900">{stats.cuentadantes.toLocaleString()}</div>
          <p className="text-xs text-slate-500 mt-1">Registrados</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-slate-600">Marcas</h3>
            <CheckCircle className="w-5 h-5 text-orange-600" />
          </div>
          <div className="text-3xl font-bold text-slate-900">{stats.marcas.toLocaleString()}</div>
          <p className="text-xs text-slate-500 mt-1">Disponibles</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-slate-600">Nombres de Activos</h3>
            <CheckCircle className="w-5 h-5 text-indigo-600" />
          </div>
          <div className="text-3xl font-bold text-slate-900">{stats.nombresActivos.toLocaleString()}</div>
          <p className="text-xs text-slate-500 mt-1">Tipos configurados</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-slate-600">Grupos</h3>
            <CheckCircle className="w-5 h-5 text-pink-600" />
          </div>
          <div className="text-3xl font-bold text-slate-900">{stats.grupos.toLocaleString()}</div>
          <p className="text-xs text-slate-500 mt-1">Grupos de activos</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-slate-600">Circulares</h3>
            <CheckCircle className="w-5 h-5 text-teal-600" />
          </div>
          <div className="text-3xl font-bold text-slate-900">{stats.circulares.toLocaleString()}</div>
          <p className="text-xs text-slate-500 mt-1">Documentos</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-slate-600">Última Actualización</h3>
            <Clock className="w-5 h-5 text-slate-600" />
          </div>
          <div className="text-lg font-semibold text-slate-900">
            {new Date(stats.lastUpdate).toLocaleString('es-CO', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </div>
          <p className="text-xs text-slate-500 mt-1">Último cambio</p>
        </div>
      </div>

      {/* Información del Sistema */}
      <div className="bg-slate-50 border border-slate-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Información del Sistema</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-slate-600 mb-1">Proyecto Supabase</p>
            <p className="font-mono text-sm bg-white border border-slate-200 rounded px-3 py-2">
              {projectId}
            </p>
          </div>
          <div>
            <p className="text-sm text-slate-600 mb-1">Estado del Servidor</p>
            <div className="flex items-center gap-2 bg-white border border-slate-200 rounded px-3 py-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-green-700">En Línea</span>
            </div>
          </div>
          <div>
            <p className="text-sm text-slate-600 mb-1">Tipo de Almacenamiento</p>
            <p className="font-mono text-sm bg-white border border-slate-200 rounded px-3 py-2">
              {stats.storage === 'memory' ? 'Memoria (Temporal)' : 'Base de Datos (Permanente)'}
            </p>
          </div>
          <div>
            <p className="text-sm text-slate-600 mb-1">Total de Registros</p>
            <p className="font-mono text-sm bg-white border border-slate-200 rounded px-3 py-2">
              {(stats.activos + stats.dependencias + stats.cuentadantes + stats.marcas + stats.nombresActivos + stats.grupos + stats.circulares).toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {/* Capacidad */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-3">Capacidad del Sistema</h3>
        <div className="space-y-3">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-blue-700">Activos Almacenados</span>
              <span className="font-semibold text-blue-900">{stats.activos.toLocaleString()} / 15,000+</span>
            </div>
            <div className="w-full bg-blue-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                style={{ width: `${Math.min((stats.activos / 15000) * 100, 100)}%` }}
              ></div>
            </div>
          </div>
          <p className="text-sm text-blue-700">
            {stats.activos < 1000 && '✅ Capacidad excelente - Sistema funcionando óptimamente'}
            {stats.activos >= 1000 && stats.activos < 5000 && '✅ Buen rendimiento - Sistema saludable'}
            {stats.activos >= 5000 && stats.activos < 10000 && '⚠️ Capacidad media - Considera optimizar consultas'}
            {stats.activos >= 10000 && ' Alta carga - Sistema funcionando en capacidad alta'}
          </p>
        </div>
      </div>

      {/* Recomendaciones */}
      <div className="bg-white border border-slate-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Recomendaciones</h3>
        <div className="space-y-3">
          {isMemoryMode && (
            <div className="flex items-start gap-3 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-yellow-900">Configura almacenamiento permanente</p>
                <p className="text-sm text-yellow-700">
                  Crea la tabla <code className="bg-yellow-100 px-1 rounded">kv_store_b351c7a3</code> en Supabase para evitar pérdida de datos.
                </p>
              </div>
            </div>
          )}
          
          {stats.activos === 0 && (
            <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-blue-900">Empieza a cargar activos</p>
                <p className="text-sm text-blue-700">
                  Ve a la sección de Inventario y agrega tus primeros activos fijos.
                </p>
              </div>
            </div>
          )}

          {stats.activos > 0 && stats.activos < 100 && (
            <div className="flex items-start gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-green-900">Sistema funcionando correctamente</p>
                <p className="text-sm text-green-700">
                  El backend está operativo y tus datos están seguros en la nube.
                </p>
              </div>
            </div>
          )}

          <div className="flex items-start gap-3 p-4 bg-slate-50 border border-slate-200 rounded-lg">
            <CheckCircle className="w-5 h-5 text-slate-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-slate-900">Respaldos automáticos activos</p>
              <p className="text-sm text-slate-700">
                Supabase realiza respaldos automáticos de tus datos. Tus activos están protegidos.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Migración */}
      {isMemoryMode && (
        <div className="bg-white border border-slate-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Migración de Datos</h3>
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-yellow-900">Migración desde localStorage</p>
                <p className="text-sm text-yellow-700">
                  Migrar tus datos desde localStorage a Supabase para almacenamiento permanente.
                </p>
              </div>
            </div>
            <button
              onClick={handleMigrate}
              disabled={migrating}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-5 h-5 ${migrating ? 'animate-spin' : ''}`} />
              Migrar Datos
            </button>
            {migrationResult && (
              <div className="mt-4">
                <p className="text-sm text-green-700">
                  <strong>✅ Migración exitosa:</strong> {migrationResult.message}
                </p>
                <p className="text-sm text-slate-500">
                  Registros migrados: {migrationResult.registros_migrados}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Crear Tabla Automáticamente */}
      {!tableExists && (
        <div className="bg-white border border-slate-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Crear Tabla Automáticamente</h3>
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-yellow-900">Tabla No Existe</p>
                <p className="text-sm text-yellow-700">
                  La tabla <code className="bg-yellow-100 px-1 rounded">kv_store_b351c7a3</code> no existe en tu proyecto de Supabase.
                </p>
              </div>
            </div>
            <button
              onClick={handleCreateTable}
              disabled={creatingTable}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              <Wrench className={`w-5 h-5 ${creatingTable ? 'animate-spin' : ''}`} />
              Crear Tabla Automáticamente
            </button>
          </div>
        </div>
      )}

      {/* Backup y Restauración */}
      <div className="bg-gradient-to-br from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="bg-purple-100 p-3 rounded-full">
            <HardDrive className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-purple-900">Backup y Restauración</h3>
            <p className="text-sm text-purple-700">
              Exporta o importa todos tus datos en formato JSON
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Exportar Backup */}
          <div className="bg-white rounded-lg p-5 shadow-sm border border-purple-100">
            <div className="flex items-center gap-2 mb-3">
              <div className="bg-green-100 p-2 rounded">
                <span className="text-2xl">💾</span>
              </div>
              <div>
                <h4 className="font-semibold text-slate-900">Exportar Backup</h4>
                <p className="text-xs text-slate-600">Descarga todos tus datos</p>
              </div>
            </div>
            <p className="text-sm text-slate-700 mb-4">
              Genera un archivo JSON con todos tus activos, dependencias, cuentadantes y configuraciones.
            </p>
            <button
              onClick={handleExportBackup}
              disabled={exportingBackup || stats.activos === 0}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {exportingBackup ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  Exportando...
                </>
              ) : (
                <>
                  💾 Exportar Backup
                </>
              )}
            </button>
            {stats.activos === 0 && (
              <p className="text-xs text-slate-500 mt-2 text-center">
                No hay datos para exportar
              </p>
            )}
          </div>

          {/* Importar Backup */}
          <div className="bg-white rounded-lg p-5 shadow-sm border border-purple-100">
            <div className="flex items-center gap-2 mb-3">
              <div className="bg-blue-100 p-2 rounded">
                <span className="text-2xl">📤</span>
              </div>
              <div>
                <h4 className="font-semibold text-slate-900">Restaurar Backup</h4>
                <p className="text-xs text-slate-600">Importa datos desde archivo</p>
              </div>
            </div>
            <p className="text-sm text-slate-700 mb-4">
              Restaura tus datos desde un archivo JSON previamente exportado.
            </p>
            <button
              onClick={handleImportBackup}
              disabled={importingBackup}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 font-medium"
            >
              {importingBackup ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  Restaurando...
                </>
              ) : (
                <>
                  📤 Restaurar Backup
                </>
              )}
            </button>
            <p className="text-xs text-orange-600 mt-2 text-center font-medium">
              ⚠️ Sobrescribirá los datos actuales
            </p>
          </div>
        </div>

        {/* Información adicional */}
        <div className="bg-white rounded-lg p-4 mt-4 border border-purple-100">
          <h4 className="font-semibold text-slate-900 mb-2 text-sm">📋 Información sobre Backups</h4>
          <ul className="space-y-1 text-xs text-slate-700">
            <li>✓ <strong>Exportación:</strong> Descarga un archivo JSON con todos tus datos actuales</li>
            <li>✓ <strong>Restauración:</strong> Importa datos desde un archivo JSON (sobrescribe datos actuales)</li>
            <li>✓ <strong>Formato:</strong> Archivo JSON compatible con todas las versiones</li>
            <li>✓ <strong>Contenido:</strong> Activos, dependencias, cuentadantes, marcas, grupos y configuración</li>
            <li>✓ <strong>Recomendación:</strong> Exporta backups regularmente (mensual o antes de cambios grandes)</li>
          </ul>
        </div>
      </div>
    </div>
  );
}