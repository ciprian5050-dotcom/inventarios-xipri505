import { Component, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: any;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('🚨 ERROR CAPTURADO POR ERROR BOUNDARY:', error);
    console.error('📍 Stack:', errorInfo);
    this.setState({ error, errorInfo });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
          <div className="max-w-2xl w-full bg-white rounded-xl shadow-xl border border-red-200 overflow-hidden">
            <div className="bg-red-50 border-b border-red-200 px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="bg-red-100 p-2 rounded-lg">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-red-900">
                    🚨 Error en la Aplicación
                  </h1>
                  <p className="text-red-700 text-sm mt-1">
                    La aplicación encontró un error inesperado
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6">
              <div className="mb-6">
                <h2 className="text-slate-900 font-semibold mb-2">
                  ¿Qué pasó?
                </h2>
                <p className="text-slate-700">
                  Ocurrió un error interno que impidió que la aplicación funcione correctamente. 
                  Esto puede deberse a datos faltantes o corruptos en la base de datos.
                </p>
              </div>

              <div className="mb-6 bg-slate-50 border border-slate-200 rounded-lg p-4">
                <h3 className="text-slate-900 font-semibold mb-2 flex items-center gap-2">
                  📋 Detalles técnicos:
                </h3>
                <div className="bg-slate-900 text-white p-3 rounded font-mono text-xs overflow-x-auto">
                  <div className="mb-2">
                    <span className="text-red-400">Error:</span>{' '}
                    <span className="text-slate-200">{this.state.error?.message || 'Error desconocido'}</span>
                  </div>
                  {this.state.error?.stack && (
                    <div className="text-slate-400 text-xs mt-2 whitespace-pre-wrap">
                      {this.state.error.stack.substring(0, 500)}
                    </div>
                  )}
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-slate-900 font-semibold mb-3">
                  💡 Soluciones sugeridas:
                </h3>
                <ul className="space-y-2 text-slate-700">
                  <li className="flex items-start gap-2">
                    <span className="text-slate-400 mt-1">1.</span>
                    <span>
                      <strong>Recargar la página:</strong> Haz clic en el botón "Recargar Aplicación" abajo.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-slate-400 mt-1">2.</span>
                    <span>
                      <strong>Limpiar caché:</strong> Presiona <kbd className="bg-slate-200 px-2 py-0.5 rounded text-sm">Ctrl+Shift+Delete</kbd> 
                      {' '}y borra los datos del sitio.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-slate-400 mt-1">3.</span>
                    <span>
                      <strong>Verificar dependencias:</strong> Ve a Configuración y asegúrate de que existan dependencias configuradas.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-slate-400 mt-1">4.</span>
                    <span>
                      <strong>Contactar soporte:</strong> Si el error persiste, envía los detalles técnicos al administrador.
                    </span>
                  </li>
                </ul>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={this.handleReset}
                  className="flex-1 bg-slate-900 text-white px-6 py-3 rounded-lg hover:bg-slate-800 transition-colors flex items-center justify-center gap-2 font-medium"
                >
                  <RefreshCw className="w-5 h-5" />
                  Recargar Aplicación
                </button>
                <button
                  onClick={() => window.location.href = '/'}
                  className="px-6 py-3 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors font-medium"
                >
                  Ir al Inicio
                </button>
              </div>

              <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-blue-900 text-sm">
                  <strong>💾 Nota:</strong> Tus datos están seguros en Supabase. 
                  Este error es temporal y no afecta la información almacenada.
                </p>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
