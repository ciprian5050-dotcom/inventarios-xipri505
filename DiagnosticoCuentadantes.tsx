import { useEffect, useState } from 'react';
import { kvGet } from '../utils/supabase/client';

export function DiagnosticoCuentadantes() {
  const [diagnostico, setDiagnostico] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    runDiagnostico();
  }, []);

  const runDiagnostico = async () => {
    const resultados: any[] = [];

    try {
      // TEST 1: Verificar conexión a Supabase
      resultados.push({
        test: '1. Conexión a Supabase',
        status: 'checking',
        mensaje: 'Verificando...'
      });

      // TEST 2: Cargar dependencias
      try {
        const depData = await kvGet('dependencias');
        const dependencias = depData ? JSON.parse(depData) : [];
        
        resultados.push({
          test: '2. Cargar Dependencias',
          status: Array.isArray(dependencias) ? 'success' : 'error',
          mensaje: `Tipo: ${typeof dependencias}, Es Array: ${Array.isArray(dependencias)}, Cantidad: ${dependencias?.length || 0}`,
          data: dependencias
        });

        // TEST 3: Validar estructura de dependencias
        if (Array.isArray(dependencias) && dependencias.length > 0) {
          const primeraDep = dependencias[0];
          const tieneCampos = primeraDep && 
                              typeof primeraDep === 'object' && 
                              'id' in primeraDep && 
                              'nombre' in primeraDep && 
                              'codigo' in primeraDep;
          
          resultados.push({
            test: '3. Estructura de Dependencias',
            status: tieneCampos ? 'success' : 'error',
            mensaje: tieneCampos 
              ? `✅ Estructura correcta: ${JSON.stringify(primeraDep)}`
              : `❌ Estructura incorrecta: ${JSON.stringify(primeraDep)}`,
            data: primeraDep
          });
        } else {
          resultados.push({
            test: '3. Estructura de Dependencias',
            status: 'error',
            mensaje: '❌ No hay dependencias o no es un array',
            data: dependencias
          });
        }

        // TEST 4: Validar dependencias válidas
        const dependenciasValidas = Array.isArray(dependencias)
          ? dependencias.filter(dep => dep && typeof dep === 'object' && dep.nombre && dep.codigo && dep.id)
          : [];
        
        resultados.push({
          test: '4. Dependencias Válidas',
          status: dependenciasValidas.length > 0 ? 'success' : 'error',
          mensaje: `${dependenciasValidas.length} de ${dependencias?.length || 0} son válidas`,
          data: dependenciasValidas
        });

      } catch (error: any) {
        resultados.push({
          test: '2-4. Error al cargar dependencias',
          status: 'error',
          mensaje: error.message,
          data: error
        });
      }

      // TEST 5: Cargar cuentadantes
      try {
        const cuentaData = await kvGet('cuentadantes');
        const cuentadantes = cuentaData ? JSON.parse(cuentaData) : [];
        
        resultados.push({
          test: '5. Cargar Cuentadantes',
          status: Array.isArray(cuentadantes) ? 'success' : 'error',
          mensaje: `Tipo: ${typeof cuentadantes}, Es Array: ${Array.isArray(cuentadantes)}, Cantidad: ${cuentadantes?.length || 0}`,
          data: cuentadantes
        });
      } catch (error: any) {
        resultados.push({
          test: '5. Error al cargar cuentadantes',
          status: 'error',
          mensaje: error.message,
          data: error
        });
      }

    } catch (error: any) {
      resultados.push({
        test: 'Error General',
        status: 'error',
        mensaje: error.message,
        data: error
      });
    }

    setDiagnostico(resultados);
    setLoading(false);

    // Imprimir en consola
    console.log('═══════════════════════════════════════════');
    console.log('🔍 DIAGNÓSTICO CUENTADANTES');
    console.log('═══════════════════════════════════════════');
    resultados.forEach(r => {
      const icon = r.status === 'success' ? '✅' : '❌';
      console.log(`${icon} ${r.test}`);
      console.log(`   ${r.mensaje}`);
      if (r.data) {
        console.log('   Data:', r.data);
      }
      console.log('───────────────────────────────────────────');
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900 mx-auto mb-4"></div>
          <p className="text-slate-600">Ejecutando diagnóstico...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-slate-900 mb-6">
          🔍 Diagnóstico Módulo Cuentadantes
        </h1>

        <div className="space-y-4">
          {diagnostico.map((resultado, index) => (
            <div
              key={index}
              className={`p-6 rounded-lg border-2 ${
                resultado.status === 'success'
                  ? 'bg-green-50 border-green-500'
                  : resultado.status === 'error'
                  ? 'bg-red-50 border-red-500'
                  : 'bg-yellow-50 border-yellow-500'
              }`}
            >
              <div className="flex items-start gap-3">
                <span className="text-2xl">
                  {resultado.status === 'success' ? '✅' : '❌'}
                </span>
                <div className="flex-1">
                  <h3 className="font-bold text-lg mb-2">{resultado.test}</h3>
                  <p className="text-slate-700 mb-3">{resultado.mensaje}</p>
                  {resultado.data && (
                    <details className="mt-2">
                      <summary className="cursor-pointer text-sm text-slate-600 hover:text-slate-900">
                        Ver datos completos
                      </summary>
                      <pre className="mt-2 p-3 bg-slate-900 text-white text-xs rounded overflow-x-auto">
                        {JSON.stringify(resultado.data, null, 2)}
                      </pre>
                    </details>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 p-6 bg-slate-900 text-white rounded-lg">
          <h3 className="font-bold text-lg mb-2">📋 Instrucciones:</h3>
          <ol className="list-decimal list-inside space-y-2 text-sm">
            <li>Revisa los resultados arriba</li>
            <li>Abre la consola del navegador (F12)</li>
            <li>Busca el diagnóstico completo con datos</li>
            <li>Toma captura de TODA la consola</li>
            <li>Envía la captura para análisis</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
