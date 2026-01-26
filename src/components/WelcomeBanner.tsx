import { useState } from 'react';
import { X, CheckCircle, Info, AlertCircle } from 'lucide-react';

export function WelcomeBanner() {
  const [isVisible, setIsVisible] = useState(() => {
    const dismissed = localStorage.getItem('auth-mode-banner-dismissed');
    return !dismissed;
  });

  const handleDismiss = () => {
    localStorage.setItem('auth-mode-banner-dismissed', 'true');
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4 mb-6 relative">
      <button
        onClick={handleDismiss}
        className="absolute top-3 right-3 text-slate-400 hover:text-slate-600 transition-colors"
        title="Cerrar"
      >
        <X className="w-5 h-5" />
      </button>

      <div className="flex gap-3">
        <div className="flex-shrink-0">
          <CheckCircle className="w-6 h-6 text-blue-600" />
        </div>
        
        <div className="flex-1 pr-8">
          <h3 className="text-slate-900 mb-1 flex items-center gap-2">
            ✅ Sistema de Activos Fijos Listo
          </h3>
          
          <p className="text-slate-600 text-sm mb-3">
            Tu sistema está funcionando correctamente. Los datos se guardan en tu navegador de forma segura.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            <div className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-slate-700"><strong>Listo para usar</strong></p>
                <p className="text-slate-500 text-xs">Sin configuración adicional</p>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-slate-700"><strong>Códigos QR</strong></p>
                <p className="text-slate-500 text-xs">Generación automática</p>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-slate-700"><strong>CRUD completo</strong></p>
                <p className="text-slate-500 text-xs">Crear, editar, eliminar activos</p>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-slate-700"><strong>Reportes</strong></p>
                <p className="text-slate-500 text-xs">Exportar a PDF y Excel</p>
              </div>
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-slate-200 flex items-center gap-2 text-xs text-slate-500">
            <Info className="w-4 h-4" />
            <span>Para activar QR desde celulares externos, configura el backend en Supabase (opcional).</span>
          </div>
        </div>
      </div>
    </div>
  );
}