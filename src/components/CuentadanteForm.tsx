import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import type { Cuentadante, Dependencia } from '../types';

interface CuentadanteFormProps {
  cuentadante?: Cuentadante;
  dependencias: Dependencia[];
  onSubmit: (cuentadante: Omit<Cuentadante, 'id'>) => void;
  onClose: () => void;
}

export function CuentadanteForm({ cuentadante, dependencias, onSubmit, onClose }: CuentadanteFormProps) {
  // 🔧 MIGRACIÓN: Convertir dependencia antigua (string) a dependencias nuevas (array)
  const getDependenciasArray = (): string[] => {
    if (!cuentadante) return [];
    
    // Si tiene el campo nuevo (dependencias como array)
    if (Array.isArray((cuentadante as any).dependencias)) {
      return (cuentadante as any).dependencias;
    }
    
    // Si tiene el campo antiguo (dependencia como string)
    if ((cuentadante as any).dependencia) {
      return [(cuentadante as any).dependencia];
    }
    
    return [];
  };

  const [formData, setFormData] = useState({
    nombre: cuentadante?.nombre || '',
    cedula: cuentadante?.cedula || '',
    dependencias: getDependenciasArray(),
    cargo: cuentadante?.cargo || '',
    telefono: cuentadante?.telefono || '',
    email: cuentadante?.email || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.dependencias.length === 0) {
      alert('Debes seleccionar al menos una dependencia');
      return;
    }
    onSubmit(formData);
  };

  // ✅ Toggle de dependencias (seleccionar/deseleccionar)
  const toggleDependencia = (dependenciaId: string) => {
    setFormData(prev => ({
      ...prev,
      dependencias: prev.dependencias.includes(dependenciaId)
        ? prev.dependencias.filter(id => id !== dependenciaId)
        : [...prev.dependencias, dependenciaId]
    }));
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <h2 className="text-xl font-semibold text-slate-900">
            {cuentadante ? 'Editar Cuentadante' : 'Nuevo Cuentadante'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Nombre Completo *
              </label>
              <input
                type="text"
                required
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Cédula *
              </label>
              <input
                type="text"
                required
                value={formData.cedula}
                onChange={(e) => setFormData({ ...formData, cedula: e.target.value })}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-3">
                Dependencias * (Selecciona una o más)
              </label>
              <div className="space-y-2 border border-slate-200 rounded-lg p-4 bg-slate-50">
                {dependencias.map((dep) => (
                  <label
                    key={dep.id}
                    className="flex items-center gap-3 p-2 hover:bg-white rounded cursor-pointer transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={formData.dependencias.includes(dep.id)}
                      onChange={() => toggleDependencia(dep.id)}
                      className="w-4 h-4 text-blue-500 border-slate-300 rounded focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="text-sm text-slate-700">{dep.nombre}</span>
                  </label>
                ))}
              </div>
              {formData.dependencias.length === 0 && (
                <p className="text-sm text-red-500 mt-2">⚠️ Selecciona al menos una dependencia</p>
              )}
              {formData.dependencias.length > 0 && (
                <p className="text-sm text-green-600 mt-2">
                  ✅ {formData.dependencias.length} dependencia{formData.dependencias.length > 1 ? 's' : ''} seleccionada{formData.dependencias.length > 1 ? 's' : ''}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Cargo *
              </label>
              <input
                type="text"
                required
                value={formData.cargo}
                onChange={(e) => setFormData({ ...formData, cargo: e.target.value })}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Teléfono
              </label>
              <input
                type="tel"
                value={formData.telefono}
                onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="flex gap-3 justify-end mt-6 pt-6 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={formData.dependencias.length === 0}
              className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:bg-slate-300 disabled:cursor-not-allowed"
            >
              {cuentadante ? 'Actualizar' : 'Crear'} Cuentadante
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
