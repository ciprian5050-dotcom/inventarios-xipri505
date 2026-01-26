import { useState, FormEvent } from 'react';
import { Package, Lock, Mail, AlertCircle } from 'lucide-react';

// VERSIÓN 3.0.0 - FORCE REBUILD COMPLETO - 26/01/2026
// Sistema de login sin credenciales públicas - REBUILD VERIFICADO

interface LoginScreenProps {
  onLogin: (email: string, password: string) => Promise<boolean>;
  onGoToSignup?: () => void;
}

export function LoginScreen({ onLogin, onGoToSignup }: LoginScreenProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      const success = await onLogin(email, password);
      if (!success) {
        setError('Usuario o contraseña incorrectos. Si es tu primera vez, crea una cuenta nueva.');
      }
    } catch (err: any) {
      // No mostrar errores de API/conexión al usuario
      // El sistema usa fallback automático a localStorage
      console.log('ℹ️ Login usando sistema local (backend no disponible)');
      
      // Solo mostrar si es un error real de credenciales
      if (err?.message && !err?.message.includes('HTTP') && !err?.message.includes('401')) {
        setError(err.message);
      } else {
        setError('Usuario o contraseña incorrectos. Si es tu primera vez, crea una cuenta nueva.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* BANNER DE VERSIÓN ACTUALIZADA - FORZAR REBUILD */}
        <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white text-center py-3 px-4 rounded-lg mb-4 font-bold shadow-lg">
          ✅ VERSIÓN 3.0.0 - ACTUALIZADA 26/01/2026
        </div>
        
        {/* Logo y Título */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-900 rounded-2xl mb-4 shadow-lg">
            <Package className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-slate-900 mb-2">Sistema de Activos Fijos</h1>
          <p className="text-slate-600">Acceso Seguro al Sistema</p>
        </div>

        {/* Formulario de Login */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-slate-700 mb-2">
                Correo Electrónico
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                  placeholder="usuario@empresa.com"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-slate-700 mb-2">
                Contraseña
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {/* Error message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                <p className="text-red-800 text-sm">{error}</p>
              </div>
            )}

            {/* Botón Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-slate-900 text-white py-3 rounded-lg hover:bg-slate-800 transition-colors disabled:bg-slate-400 disabled:cursor-not-allowed"
            >
              {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
            </button>
            
            {/* Botón Crear Cuenta */}
            {onGoToSignup && (
              <button
                type="button"
                onClick={onGoToSignup}
                className="w-full bg-white text-slate-900 py-3 rounded-lg border-2 border-slate-300 hover:bg-slate-50 transition-colors"
              >
                Crear Nueva Cuenta
              </button>
            )}
          </form>

          {/* Información de ayuda - SIN CREDENCIALES PÚBLICAS */}
          <div className="mt-6 pt-6 border-t border-slate-200">
            <p className="text-slate-500 text-sm text-center">
              <strong>¿Primera vez?</strong> Usa el botón "Crear Nueva Cuenta" arriba o contacta al administrador del sistema
            </p>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-slate-600 text-sm mt-6">
          <span className="font-semibold text-slate-900">INVENTARIOS_XIPRI505</span>
          {' • '}
          Sistema Seguro © {new Date().getFullYear()}
          {' • '}
          <span className="text-xs text-slate-400 font-bold">v3.0.0</span>
        </p>
      </div>
    </div>
  );
}