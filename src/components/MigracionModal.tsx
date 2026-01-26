import { useState } from 'react';
import { X, Upload, Database, AlertTriangle, CheckCircle } from 'lucide-react';
import { projectId, publicAnonKey } from '../utils/supabase/info';

interface MigracionModalProps {
  onClose: () => void;
}

export function MigracionModal({ onClose }: MigracionModalProps) {
  const [status, setStatus] = useState<'idle' | 'migrating' | 'success' | 'error'>('idle');
  const [migrationResult, setMigrationResult] = useState<any>(null);
  const [errorMessage, setErrorMessage] = useState('');

  const handleMigrate = async () => {
    try {
      setStatus('migrating');
      setErrorMessage('');

      console.log('🚀 Iniciando proceso de migración...');

      // PASO 1: Recolectar TODOS los datos del localStorage
      const datosAMigrar = {
        activos: JSON.parse(localStorage.getItem('activos') || '[]'),
        cuentadantes: JSON.parse(localStorage.getItem('cuentadantes') || '[]'),
        dependencias: JSON.parse(localStorage.getItem('dependencias') || '[]'),
        marcas: JSON.parse(localStorage.getItem('marcas') || '[]'),
        nombres_activos: JSON.parse(localStorage.getItem('nombres_activos') || '[]'),
        grupos_activos: JSON.parse(localStorage.getItem('grupos_activos') || '[]'),
        circulares: JSON.parse(localStorage.getItem('circulares') || '[]'),
        configuracionEmpresa: JSON.parse(localStorage.getItem('configuracion_empresa') || '{}')
      };

      console.log('📦 Datos a migrar:', {
        activos: datosAMigrar.activos.length,
        cuentadantes: datosAMigrar.cuentadantes.length,
        dependencias: datosAMigrar.dependencias.length,
        marcas: datosAMigrar.marcas.length,
        nombres_activos: datosAMigrar.nombres_activos.length,
        grupos_activos: datosAMigrar.grupos_activos.length,
        circulares: datosAMigrar.circulares.length
      });

      // PASO 2: Enviar datos al servidor (SIN autenticación)
      console.log('📤 Enviando datos al servidor...');
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-b351c7a3/migrate`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`
          },
          body: JSON.stringify(datosAMigrar)
        }
      );

      console.log('📡 Respuesta de migración:', response.status, response.statusText);
      const result = await response.json();
      console.log('📦 Resultado:', result);

      if (!response.ok) {
        console.error('❌ Error del servidor:', result);
        throw new Error(result.error || result.details || result.message || `Error ${response.status}`);
      }

      console.log('✅ Migración exitosa:', result);
      setMigrationResult(result.migrated);

      // PASO 3: Crear sesión de usuario después de la migración
      console.log('🔐 Creando sesión de usuario...');
      const email = 'admin@empresa.com';
      const password = 'admin123';

      // Intentar login primero
      const loginResponse = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-b351c7a3/auth/signin`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`
          },
          body: JSON.stringify({ email, password })
        }
      );

      const loginResult = await loginResponse.json();
      let accessToken = '';

      if (loginResponse.ok && loginResult.accessToken) {
        accessToken = loginResult.accessToken;
        console.log('✅ Login exitoso');
      } else {
        // Si el login falla, crear cuenta
        console.log('⚠️ Login falló, creando cuenta...');
        const signupResponse = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-b351c7a3/auth/signup`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${publicAnonKey}`
            },
            body: JSON.stringify({
              email,
              password,
              nombre: 'Administrador'
            })
          }
        );

        const signupResult = await signupResponse.json();
        
        if (signupResponse.ok && signupResult.session?.access_token) {
          accessToken = signupResult.session.access_token;
          console.log('✅ Usuario creado exitosamente');
        }
      }

      // Guardar sesión
      if (accessToken) {
        localStorage.setItem('inventory_session', JSON.stringify({
          access_token: accessToken,
          user: { email }
        }));
        console.log('✅ Sesión guardada');
      }

      setStatus('success');

      // Guardar bandera de migración completada
      localStorage.setItem('migration_completed', 'true');
      localStorage.setItem('migration_date', new Date().toISOString());

    } catch (error: any) {
      console.error('❌ Error en migración:', error);
      console.error('❌ Stack:', error.stack);
      setErrorMessage(error.message || 'Error desconocido');
      setStatus('error');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 p-3 rounded-lg">
              <Database className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">Migrar al Backend</h2>
              <p className="text-sm text-slate-600">Transferir datos a la nube de forma segura</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {status === 'idle' && (
            <div className="space-y-6">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-yellow-900 mb-1">Importante</h3>
                    <p className="text-sm text-yellow-800">
                      Esta migración transferirá TODOS tus datos actuales al servidor backend en la nube. 
                      Tus datos estarán seguros y podrás manejar 15,000+ activos con fotos sin problemas.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-blue-900 mb-3">¿Qué se migrará?</h3>
                <ul className="space-y-2 text-sm text-blue-800">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    {JSON.parse(localStorage.getItem('activos') || '[]').length} Activos Fijos
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    {JSON.parse(localStorage.getItem('dependencias') || '[]').length} Dependencias
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    {JSON.parse(localStorage.getItem('cuentadantes') || '[]').length} Cuentadantes
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    {JSON.parse(localStorage.getItem('marcas') || '[]').length} Marcas
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    {JSON.parse(localStorage.getItem('nombres_activos') || '[]').length} Nombres de Activos
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    {JSON.parse(localStorage.getItem('grupos_activos') || '[]').length} Grupos de Activos
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    {JSON.parse(localStorage.getItem('circulares') || '[]').length} Circulares
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    Configuración de Empresa
                  </li>
                </ul>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h3 className="font-semibold text-green-900 mb-2">Beneficios del Backend</h3>
                <ul className="space-y-1 text-sm text-green-800">
                  <li>✅ Capacidad para 15,000+ activos</li>
                  <li>✅ Almacenamiento de múltiples fotos por activo</li>
                  <li>✅ Datos seguros en la nube</li>
                  <li>✅ Backups automáticos</li>
                  <li>✅ Sin límites de almacenamiento</li>
                  <li>✅ Varios usuarios simultáneos</li>
                </ul>
              </div>
            </div>
          )}

          {status === 'migrating' && (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mb-4"></div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">Migrando datos...</h3>
              <p className="text-slate-600 text-center">
                Por favor espera mientras transferimos tus datos de forma segura.<br />
                Esto puede tomar unos segundos.
              </p>
            </div>
          )}

          {status === 'success' && migrationResult && (
            <div className="space-y-6">
              <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-green-100 p-3 rounded-full">
                    <CheckCircle className="w-8 h-8 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-green-900">¡Migración Exitosa!</h3>
                    <p className="text-green-700">Todos tus datos están ahora en la nube</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mt-4">
                  <div className="bg-white rounded-lg p-3">
                    <div className="text-2xl font-bold text-slate-900">{migrationResult.activos}</div>
                    <div className="text-sm text-slate-600">Activos</div>
                  </div>
                  <div className="bg-white rounded-lg p-3">
                    <div className="text-2xl font-bold text-slate-900">{migrationResult.dependencias}</div>
                    <div className="text-sm text-slate-600">Dependencias</div>
                  </div>
                  <div className="bg-white rounded-lg p-3">
                    <div className="text-2xl font-bold text-slate-900">{migrationResult.cuentadantes}</div>
                    <div className="text-sm text-slate-600">Cuentadantes</div>
                  </div>
                  <div className="bg-white rounded-lg p-3">
                    <div className="text-2xl font-bold text-slate-900">{migrationResult.marcas}</div>
                    <div className="text-sm text-slate-600">Marcas</div>
                  </div>
                  <div className="bg-white rounded-lg p-3">
                    <div className="text-2xl font-bold text-slate-900">{migrationResult.nombresActivos}</div>
                    <div className="text-sm text-slate-600">Nombres</div>
                  </div>
                  <div className="bg-white rounded-lg p-3">
                    <div className="text-2xl font-bold text-slate-900">{migrationResult.grupos}</div>
                    <div className="text-sm text-slate-600">Grupos</div>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  <strong>Próximos pasos:</strong> La aplicación ahora usará el backend automáticamente. 
                  Puedes cerrar esta ventana y continuar trabajando normalmente. Tus datos del localStorage 
                  permanecen intactos como respaldo.
                </p>
              </div>
            </div>
          )}

          {status === 'error' && (
            <div className="space-y-4">
              <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="bg-red-100 p-3 rounded-full">
                    <AlertTriangle className="w-8 h-8 text-red-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-red-900">Error en la Migración</h3>
                    <p className="text-red-700">No se pudo completar la migración</p>
                  </div>
                </div>
                <div className="bg-white rounded-lg p-4 mt-4">
                  <p className="text-sm font-mono text-red-900">{errorMessage}</p>
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm text-yellow-800">
                  <strong>No te preocupes:</strong> Tus datos en localStorage están seguros y no se han perdido. 
                  Puedes intentar nuevamente o contactar soporte.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-slate-200 p-6 flex justify-end gap-3">
          {status === 'idle' && (
            <>
              <button
                onClick={onClose}
                className="px-6 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleMigrate}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <Upload className="w-5 h-5" />
                Iniciar Migración
              </button>
            </>
          )}

          {status === 'migrating' && (
            <button
              disabled
              className="px-6 py-2 bg-slate-400 text-white rounded-lg cursor-not-allowed"
            >
              Migrando...
            </button>
          )}

          {(status === 'success' || status === 'error') && (
            <button
              onClick={() => {
                onClose();
                if (status === 'success') {
                  window.location.reload();
                }
              }}
              className="px-6 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              {status === 'success' ? 'Cerrar y Recargar' : 'Cerrar'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}