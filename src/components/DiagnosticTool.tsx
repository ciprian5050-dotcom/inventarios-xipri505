import { useState } from 'react';
import { AlertCircle, CheckCircle, XCircle, Loader, Terminal, Trash2, RefreshCw } from 'lucide-react';
import { fixActivosEstado, reportActivosEstado } from '../utils/fix-activos-estado';

interface DiagnosticResult {
  test: string;
  status: 'success' | 'error' | 'warning';
  message: string;
  details?: any;
}

export function DiagnosticTool() {
  const [results, setResults] = useState<DiagnosticResult[]>([]);
  const [running, setRunning] = useState(false);

  const runDiagnostics = () => {
    setRunning(true);
    const testResults: DiagnosticResult[] = [];

    try {
      // Test 1: Verificar localStorage
      testResults.push({
        test: 'Acceso a LocalStorage',
        status: 'success',
        message: 'LocalStorage está disponible y accesible',
      });

      // Test 2: Verificar usuarios registrados
      const usersData = localStorage.getItem('inventory_users');
      if (usersData) {
        const users = JSON.parse(usersData);
        testResults.push({
          test: 'Usuarios Registrados',
          status: users.length > 0 ? 'success' : 'warning',
          message: `Se encontraron ${users.length} usuario(s) registrado(s)`,
          details: users.map((u: any) => ({
            email: u.email,
            nombre: u.nombre,
            rol: u.rol,
            hasPassword: !!u.password
          })),
        });
      } else {
        testResults.push({
          test: 'Usuarios Registrados',
          status: 'warning',
          message: 'No se encontraron usuarios registrados',
        });
      }

      // Test 3: Verificar sesión actual
      const currentUserData = localStorage.getItem('inventory_current_user');
      if (currentUserData) {
        const currentUser = JSON.parse(currentUserData);
        testResults.push({
          test: 'Sesión Actual',
          status: 'success',
          message: 'Hay una sesión activa',
          details: currentUser,
        });
      } else {
        testResults.push({
          test: 'Sesión Actual',
          status: 'warning',
          message: 'No hay sesión activa',
        });
      }

      // Test 4: Verificar otros datos en localStorage
      const activos = localStorage.getItem('activos');
      const dependencias = localStorage.getItem('dependencias');
      const cuentadantes = localStorage.getItem('cuentadantes');
      const marcas = localStorage.getItem('marcas');

      testResults.push({
        test: 'Datos del Sistema',
        status: 'success',
        message: 'Verificación de datos almacenados',
        details: {
          activos: activos ? JSON.parse(activos).length : 0,
          dependencias: dependencias ? JSON.parse(dependencias).length : 0,
          cuentadantes: cuentadantes ? JSON.parse(cuentadantes).length : 0,
          marcas: marcas ? JSON.parse(marcas).length : 0,
        },
      });

      // Test 5: Verificar usuario por defecto
      if (usersData) {
        const users = JSON.parse(usersData);
        const defaultUser = users.find((u: any) => u.email === 'admin@empresa.com');
        
        if (defaultUser) {
          testResults.push({
            test: 'Usuario por Defecto',
            status: defaultUser.password === 'admin123' ? 'success' : 'warning',
            message: defaultUser.password === 'admin123' 
              ? 'Usuario admin@empresa.com con contraseña admin123 está disponible'
              : 'Usuario admin@empresa.com existe pero la contraseña es diferente',
            details: {
              email: defaultUser.email,
              nombre: defaultUser.nombre,
              correctPassword: defaultUser.password === 'admin123'
            },
          });
        } else {
          testResults.push({
            test: 'Usuario por Defecto',
            status: 'error',
            message: 'No se encontró el usuario por defecto admin@empresa.com',
          });
        }
      }

    } catch (error: any) {
      testResults.push({
        test: 'Error General',
        status: 'error',
        message: `Error al ejecutar diagnósticos: ${error.message}`,
        details: error,
      });
    }

    setResults(testResults);
    setRunning(false);
  };

  const resetAllData = () => {
    if (window.confirm('⚠️ ADVERTENCIA: Esto eliminará TODOS los datos y cerrará la sesión. ¿Está seguro?')) {
      localStorage.clear();
      window.location.reload();
    }
  };

  const resetOnlyUsers = () => {
    if (window.confirm('¿Está seguro de resetear los usuarios? Se creará el usuario por defecto (admin@empresa.com / admin123)')) {
      localStorage.removeItem('inventory_users');
      localStorage.removeItem('inventory_current_user');
      
      // Crear usuario por defecto
      const defaultUser = {
        email: 'admin@empresa.com',
        password: 'admin123',
        nombre: 'Administrador',
        rol: 'Administrador'
      };
      localStorage.setItem('inventory_users', JSON.stringify([defaultUser]));
      
      alert('✓ Usuario por defecto creado. Por favor inicie sesión nuevamente.');
      window.location.reload();
    }
  };

  const handleFixActivosEstado = () => {
    // Mostrar reporte antes de corregir
    const reporte = reportActivosEstado();
    
    if (Object.keys(reporte).length === 0) {
      alert('No hay activos registrados en el sistema.');
      return;
    }

    const mensaje = `Estados actuales:\n${Object.entries(reporte)
      .map(([estado, cantidad]) => `• ${estado}: ${cantidad}`)
      .join('\n')}\n\n¿Desea corregir activos con estados inválidos a "Activo"?`;

    if (window.confirm(mensaje)) {
      const result = fixActivosEstado();
      
      if (result.error) {
        alert(`❌ Error al corregir estados: ${result.error}`);
      } else if (result.updated === 0) {
        alert('✅ Todos los activos ya tienen estados válidos. No se requirieron cambios.');
      } else {
        alert(`✅ Corrección completada:\n${result.updated} de ${result.total} activos actualizados.\n\nPor favor, recargue la página para ver los cambios.`);
        window.location.reload();
      }
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-600" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-yellow-600" />;
      default:
        return <AlertCircle className="w-5 h-5 text-slate-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'bg-green-50 border-green-200';
      case 'error':
        return 'bg-red-50 border-red-200';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200';
      default:
        return 'bg-slate-50 border-slate-200';
    }
  };

  return (
    <div className="bg-slate-50 rounded-lg p-4">
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-2">
          <Terminal className="w-5 h-5 text-slate-700" />
          <h3 className="text-slate-900">Herramienta de Diagnóstico</h3>
        </div>
        <p className="text-slate-600 text-sm">
          Verifica el estado del sistema de autenticación local
        </p>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        <button
          onClick={runDiagnostics}
          disabled={running}
          className="px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors disabled:bg-slate-400 disabled:cursor-not-allowed flex items-center gap-2 text-sm"
        >
          {running ? (
            <>
              <Loader className="w-4 h-4 animate-spin" />
              Diagnosticando...
            </>
          ) : (
            <>
              <Terminal className="w-4 h-4" />
              Ejecutar Diagnóstico
            </>
          )}
        </button>

        <button
          onClick={handleFixActivosEstado}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 text-sm"
        >
          <RefreshCw className="w-4 h-4" />
          Corregir Estados de Activos
        </button>

        <button
          onClick={resetOnlyUsers}
          className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors flex items-center gap-2 text-sm"
        >
          <AlertCircle className="w-4 h-4" />
          Resetear Usuarios
        </button>

        <button
          onClick={resetAllData}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2 text-sm"
        >
          <Trash2 className="w-4 h-4" />
          Borrar Todo
        </button>
      </div>

      {results.length > 0 && (
        <div className="space-y-3">
          {results.map((result, index) => (
            <div
              key={index}
              className={`border rounded-lg p-3 ${getStatusColor(result.status)}`}
            >
              <div className="flex items-start gap-2">
                {getStatusIcon(result.status)}
                <div className="flex-1 min-w-0">
                  <p className="text-slate-900 text-sm mb-1">{result.test}</p>
                  <p className="text-slate-600 text-xs mb-1">{result.message}</p>
                  {result.details && (
                    <details className="text-xs text-slate-500">
                      <summary className="cursor-pointer hover:text-slate-700">
                        Ver detalles
                      </summary>
                      <pre className="mt-1 p-2 bg-white rounded border border-slate-200 overflow-x-auto text-xs">
                        {JSON.stringify(result.details, null, 2)}
                      </pre>
                    </details>
                  )}
                </div>
              </div>
            </div>
          ))}

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-4">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0" />
              <div>
                <h4 className="text-blue-900 text-sm mb-1">Resumen</h4>
                <p className="text-blue-700 text-xs">
                  {results.filter((r) => r.status === 'success').length} de {results.length}{' '}
                  pruebas exitosas.
                </p>
                {results.some((r) => r.status === 'error') && (
                  <p className="text-blue-700 text-xs mt-2">
                    ⚠️ Si hay errores, use el botón "Resetear Usuarios" para crear el usuario por defecto.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}