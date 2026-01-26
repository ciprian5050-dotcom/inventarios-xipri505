import { useEffect, useState } from 'react';
import { Activo } from '../types';
import { Package, Calendar, Building, User, DollarSign, AlertCircle } from 'lucide-react';
import { Card } from './ui/card';
import { projectId } from '../utils/supabase/info';

interface ActivoPublicViewProps {
  activoId?: string;
}

interface PublicConfig {
  showQr: boolean;
  showNombre: boolean;
  showMarca: boolean;
  showModelo: boolean;
  showSerie: boolean;
  showDependencia: boolean;
  showCuentadante: boolean;
  showValor: boolean;
  showFechaIngreso: boolean;
  showEstado: boolean;
  showObservaciones: boolean;
}

export function ActivoPublicView({ activoId }: ActivoPublicViewProps) {
  const [activo, setActivo] = useState<Activo | null>(null);
  const [config, setConfig] = useState<PublicConfig>({
    showQr: true,
    showNombre: true,
    showMarca: true,
    showModelo: true,
    showSerie: true,
    showDependencia: true,
    showCuentadante: false,
    showValor: false,
    showFechaIngreso: true,
    showEstado: true,
    showObservaciones: false,
  });
  const [empresaInfo, setEmpresaInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadActivo = async () => {
      try {
        console.log('🔍 [ActivoPublicView] Iniciando carga...');
        console.log('🔍 [ActivoPublicView] activoId recibido:', activoId);
        
        // Verificar que tengamos un ID
        if (!activoId) {
          console.error('❌ [ActivoPublicView] No hay activoId');
          setError('No se proporcionó un ID de activo');
          setLoading(false);
          return;
        }
        
        // Llamar al backend público (NO requiere auth)
        const apiUrl = `https://${projectId}.supabase.co/functions/v1/make-server-b351c7a3/public/activo/${activoId}`;
        console.log('🌐 [ActivoPublicView] Llamando API:', apiUrl);
        
        const response = await fetch(apiUrl, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        console.log('📡 [ActivoPublicView] Respuesta status:', response.status);
        
        if (!response.ok) {
          if (response.status === 404) {
            console.log('❌ [ActivoPublicView] Activo no encontrado');
            setError(`Activo no encontrado (ID: ${activoId})`);
          } else {
            const errorData = await response.json().catch(() => ({ error: 'Error desconocido' }));
            console.log('❌ [ActivoPublicView] Error en respuesta:', errorData);
            setError(errorData.error || 'Error al cargar activo');
          }
          setLoading(false);
          return;
        }

        const data = await response.json();
        console.log('✅ [ActivoPublicView] Datos recibidos:', data);
        
        if (data.activo) {
          setActivo(data.activo);
        }
        
        if (data.configuracion) {
          setConfig({ ...config, ...data.configuracion });
        }
        
        if (data.empresa) {
          setEmpresaInfo(data.empresa);
        }
        
      } catch (err: any) {
        console.error('❌ [ActivoPublicView] Error al cargar activo:', err);
        console.error('❌ [ActivoPublicView] Stack:', err.stack);
        setError(`Error de conexión: ${err.message || 'No se pudo conectar con el servidor'}`);
      } finally {
        console.log('🏁 [ActivoPublicView] Carga finalizada');
        setLoading(false);
      }
    };
    
    loadActivo();
  }, [activoId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <Card className="p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 border-4 border-slate-300 border-t-slate-900 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Cargando información del activo...</p>
        </Card>
      </div>
    );
  }

  if (error || !activo) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <Card className="p-8 max-w-md w-full text-center">
          <AlertCircle className="w-16 h-16 text-slate-400 mx-auto mb-4" />
          <h2 className="text-slate-900 mb-2">Activo no encontrado</h2>
          <p className="text-slate-600 mb-4">
            {error || 'El código QR escaneado no corresponde a ningún activo registrado.'}
          </p>
          <p className="text-slate-500 text-sm">ID buscado: {activoId}</p>
        </Card>
      </div>
    );
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'Activo':
        return 'bg-green-100 text-green-800';
      case 'Inactivo':
        return 'bg-gray-100 text-gray-800';
      case 'En mantenimiento':
        return 'bg-yellow-100 text-yellow-800';
      case 'Dado de baja':
        return 'bg-red-100 text-red-800';
      case 'Extraviado':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-slate-100 text-slate-800';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header con logo de empresa */}
      {empresaInfo && (
        <div className="bg-white border-b border-slate-200 shadow-sm">
          <div className="max-w-4xl mx-auto px-4 py-6 flex items-center gap-4">
            {empresaInfo.logoUrl && (
              <img
                src={empresaInfo.logoUrl}
                alt={empresaInfo.nombreEmpresa}
                className="h-12 w-12 object-contain"
              />
            )}
            <div>
              <h1 className="text-slate-900">{empresaInfo.nombreEmpresa}</h1>
              {empresaInfo.nit && (
                <p className="text-slate-600">NIT: {empresaInfo.nit}</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Información del activo */}
      <div className="max-w-4xl mx-auto p-4 py-8">
        <Card className="p-6 md:p-8">
          {/* Título */}
          <div className="border-b border-slate-200 pb-4 mb-6">
            <div className="flex items-center gap-3 mb-2">
              <Package className="w-8 h-8 text-slate-700" />
              <h2 className="text-slate-900">Información del Activo</h2>
            </div>
            {config.showQr && (
              <p className="text-slate-600">Código: {activo.qr}</p>
            )}
          </div>

          {/* Grid de información */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {config.showNombre && (
              <div className="space-y-1">
                <p className="text-slate-600">Nombre</p>
                <p className="text-slate-900">{activo.nombre}</p>
              </div>
            )}

            {config.showMarca && (
              <div className="space-y-1">
                <p className="text-slate-600">Marca</p>
                <p className="text-slate-900">{activo.marca}</p>
              </div>
            )}

            {config.showModelo && (
              <div className="space-y-1">
                <p className="text-slate-600">Modelo</p>
                <p className="text-slate-900">{activo.modelo}</p>
              </div>
            )}

            {config.showSerie && (
              <div className="space-y-1">
                <p className="text-slate-600">Serie</p>
                <p className="text-slate-900">{activo.serie}</p>
              </div>
            )}

            {config.showDependencia && (
              <div className="space-y-1 flex items-start gap-2">
                <Building className="w-5 h-5 text-slate-600 mt-0.5" />
                <div>
                  <p className="text-slate-600">Dependencia</p>
                  <p className="text-slate-900">{activo.dependencia}</p>
                </div>
              </div>
            )}

            {config.showCuentadante && activo.cuentadante && (
              <div className="space-y-1 flex items-start gap-2">
                <User className="w-5 h-5 text-slate-600 mt-0.5" />
                <div>
                  <p className="text-slate-600">Cuentadante</p>
                  <p className="text-slate-900">{activo.cuentadante}</p>
                </div>
              </div>
            )}

            {config.showValor && (
              <div className="space-y-1 flex items-start gap-2">
                <DollarSign className="w-5 h-5 text-slate-600 mt-0.5" />
                <div>
                  <p className="text-slate-600">Valor</p>
                  <p className="text-slate-900">{formatCurrency(activo.valor)}</p>
                </div>
              </div>
            )}

            {config.showFechaIngreso && (
              <div className="space-y-1 flex items-start gap-2">
                <Calendar className="w-5 h-5 text-slate-600 mt-0.5" />
                <div>
                  <p className="text-slate-600">Fecha de Ingreso</p>
                  <p className="text-slate-900">{formatDate(activo.fechaIngreso)}</p>
                </div>
              </div>
            )}

            {config.showEstado && (
              <div className="space-y-1">
                <p className="text-slate-600">Estado</p>
                <span className={`inline-block px-3 py-1 rounded-full ${getEstadoColor(activo.estado)}`}>
                  {activo.estado}
                </span>
              </div>
            )}
          </div>

          {config.showObservaciones && activo.observaciones && (
            <div className="mt-6 pt-6 border-t border-slate-200">
              <p className="text-slate-600 mb-2">Observaciones</p>
              <p className="text-slate-900">{activo.observaciones}</p>
            </div>
          )}

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-slate-200 text-center">
            <p className="text-slate-600">
              Este documento fue generado electrónicamente
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}