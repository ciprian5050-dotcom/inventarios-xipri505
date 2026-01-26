import { useState, FormEvent } from 'react';
import { Package, Lock, Mail, User, AlertCircle, CheckCircle } from 'lucide-react';

interface SignupScreenProps {
  onSignup: (email: string, password: string, nombre: string) => Promise<{ success: boolean; error?: string }>;
  onGoToLogin: () => void;
}

export function SignupScreen({ onSignup, onGoToLogin }: SignupScreenProps) {
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    // Validaciones
    if (nombre.trim().length < 3) {
      setError('El nombre debe tener al menos 3 caracteres');
      return;
    }

    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    setLoading(true);
    
    try {
      const result = await onSignup(email, password, nombre);
      
      if (result.success) {
        setSuccess(true);
        // Limpiar formulario
        setNombre('');
        setEmail('');
        setPassword('');
        setConfirmPassword('');
        
        // Redirigir al login después de 2 segundos
        setTimeout(() => {
          onGoToLogin();
        }, 2000);
      } else {
        setError(result.error || 'Error al crear la cuenta');
      }
    } catch (err: any) {
      setError(err.message || 'Error al crear la cuenta');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo y Título */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-900 rounded-2xl mb-4 shadow-lg">
            <Package className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-slate-900 mb-2">Crear Nueva Cuenta</h1>
          <p className="text-slate-600">Complete el formulario para registrarse</p>
        </div>

        {/* Formulario de Registro */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          {success ? (
            <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
              <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-3" />
              <h3 className="text-green-900 font-semibold mb-2">¡Cuenta creada exitosamente!</h3>
              <p className="text-green-700 text-sm">Redirigiendo al inicio de sesión...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Nombre Completo */}
              <div>
                <label className="block text-slate-700 mb-2">
                  Nombre Completo
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                    placeholder="Juan Pérez"
                    minLength={3}
                  />
                </div>
              </div>

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
                    placeholder="Mínimo 6 caracteres"
                    minLength={6}
                  />
                </div>
              </div>

              {/* Confirmar Password */}
              <div>
                <label className="block text-slate-700 mb-2">
                  Confirmar Contraseña
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                    placeholder="Repita la contraseña"
                    minLength={6}
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
                {loading ? 'Creando cuenta...' : 'Crear Cuenta'}
              </button>
              
              {/* Botón Volver a Login */}
              <button
                type="button"
                onClick={onGoToLogin}
                className="w-full bg-white text-slate-900 py-3 rounded-lg border-2 border-slate-300 hover:bg-slate-50 transition-colors"
              >
                Ya tengo cuenta - Iniciar Sesión
              </button>
            </form>
          )}

          {/* Info de seguridad */}
          <div className="mt-6 pt-6 border-t border-slate-200">
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
              <p className="text-slate-700 text-xs text-center">
                🔒 <strong>Seguro:</strong> Tu información se guarda localmente en tu navegador
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-slate-600 text-sm mt-6">
          <span className="font-semibold text-slate-900">INVENTARIOS_XIPRI505</span>
          {' • '}
          © {new Date().getFullYear()} Todos los derechos reservados
        </p>
      </div>
    </div>
  );
}
