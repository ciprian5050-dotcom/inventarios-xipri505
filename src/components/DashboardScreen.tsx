import { useState, useEffect } from 'react';
import { Activo, Cuentadante, Dependencia } from '../types';
import { Package, Building2, FileText, Database } from 'lucide-react';
import { kvGetByPrefix, kvGet } from '../utils/supabase/client';
import { ImageWithFallback } from './figma/ImageWithFallback';

export function DashboardScreen() {
  const [activos, setActivos] = useState<Activo[]>([]);
  const [dependencias, setDependencias] = useState<Dependencia[]>([]);
  const [marcas, setMarcas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Cargar datos desde Supabase
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const loadedActivos = await kvGetByPrefix('activo:') || [];
      const loadedDependencias = await kvGetByPrefix('dependencia:') || [];
      const loadedMarcas = await kvGet('marcas') || [];

      setActivos(Array.isArray(loadedActivos) ? loadedActivos : []);
      setDependencias(Array.isArray(loadedDependencias) ? loadedDependencias : []);
      setMarcas(Array.isArray(loadedMarcas) ? loadedMarcas : []);
    } catch (error) {
      console.error('Error cargando datos:', error);
      setActivos([]);
      setDependencias([]);
      setMarcas([]);
    } finally {
      setLoading(false);
    }
  };

  const totalActivos = activos.length;
  const totalDependencias = dependencias.length;
  const totalMarcas = marcas.length;

  const stats = [
    {
      label: 'Total Activos',
      value: totalActivos.toString(),
      icon: Package,
      color: 'from-blue-500 to-blue-600',
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600'
    },
    {
      label: 'Dependencias',
      value: totalDependencias.toString(),
      icon: Building2,
      color: 'from-purple-500 to-purple-600',
      iconBg: 'bg-purple-100',
      iconColor: 'text-purple-600'
    },
    {
      label: 'Marcas',
      value: totalMarcas.toString(),
      icon: FileText,
      color: 'from-green-500 to-green-600',
      iconBg: 'bg-green-100',
      iconColor: 'text-green-600'
    },
    {
      label: 'Sistema',
      value: 'Activo',
      icon: Database,
      color: 'from-slate-500 to-slate-600',
      iconBg: 'bg-slate-100',
      iconColor: 'text-slate-600'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Hero Section con Imagen */}
      <div className="relative h-96 overflow-hidden">
        <ImageWithFallback
          src="https://images.unsplash.com/photo-1768796372478-f3c46af523a9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3YXJlaG91c2UlMjBpbnZlbnRvcnklMjBtYW5hZ2VtZW50fGVufDF8fHx8MTc2ODk0Njg0MXww&ixlib=rb-4.1.0&q=80&w=1080"
          alt="Gestión de Inventarios"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900/90 via-slate-900/70 to-slate-900/50" />
        
        {/* Contenido del Hero */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center px-6">
            <h1 className="text-6xl md:text-7xl font-bold text-white mb-4 tracking-tight">
              INVENTARIOS_XIPRI505
            </h1>
            <p className="text-xl md:text-2xl text-slate-200 font-light">
              Sistema de Gestión de Activos Fijos
            </p>
            <div className="mt-6 flex items-center justify-center gap-2">
              <div className="h-1 w-16 bg-blue-500 rounded-full" />
              <div className="h-1 w-16 bg-purple-500 rounded-full" />
              <div className="h-1 w-16 bg-green-500 rounded-full" />
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="max-w-7xl mx-auto px-6 -mt-20 relative z-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {loading ? (
            // Skeleton loading
            Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="bg-white rounded-2xl shadow-xl p-6 animate-pulse">
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-slate-200 w-12 h-12 rounded-xl" />
                </div>
                <div className="h-4 bg-slate-200 rounded w-20 mb-2" />
                <div className="h-8 bg-slate-200 rounded w-16" />
              </div>
            ))
          ) : (
            stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div
                  key={index}
                  className="bg-white rounded-2xl shadow-xl p-6 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className={`${stat.iconBg} p-3 rounded-xl`}>
                      <Icon className={`w-6 h-6 ${stat.iconColor}`} />
                    </div>
                  </div>
                  <p className="text-slate-600 text-sm font-medium mb-1">{stat.label}</p>
                  <p className={`text-3xl font-bold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}>
                    {stat.value}
                  </p>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Bienvenida */}
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl mb-6">
              <Package className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Bienvenido al Sistema de Gestión
            </h2>
            <p className="text-lg text-slate-600 leading-relaxed mb-8">
              INVENTARIOS_XIPRI505 es tu solución completa para la administración y control de activos fijos institucionales. 
              Gestiona, controla y genera reportes de manera eficiente y profesional.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-xl mb-3">
                  <Package className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="font-semibold text-slate-900 mb-2">Gestión Completa</h3>
                <p className="text-sm text-slate-600">
                  Administra todos tus activos con códigos únicos y QR
                </p>
              </div>
              
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-purple-100 rounded-xl mb-3">
                  <Building2 className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="font-semibold text-slate-900 mb-2">Por Dependencias</h3>
                <p className="text-sm text-slate-600">
                  Organiza activos por áreas y responsables
                </p>
              </div>
              
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 rounded-xl mb-3">
                  <FileText className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="font-semibold text-slate-900 mb-2">Reportes PDF</h3>
                <p className="text-sm text-slate-600">
                  Genera informes profesionales en segundos
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}