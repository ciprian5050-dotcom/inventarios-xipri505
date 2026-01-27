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
  const [formData, setFormData] = useState({
    nombre: cuentadante?.nombre || '',
    cedula: cuentadante?.cedula || '',
    dependencias: cuentadante?.dependencias || [] as string[], // ✅ Array de dependencias
    cargo: cuentadante?.cargo || '',
    telefono: cuentadante?.telefono || '',
    email: cuentadante?.email || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
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
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Dependencias * (Selecciona una o más)
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {dependencias.map((dep) => (
                  <button
                    key={dep.id}
                    type="button"
                    onClick={() => toggleDependencia(dep.id)}
                    className={`px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
                      formData.dependencias.includes(dep.id)
                        ? 'bg-blue-500 text-white border-blue-500'
                        : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    {dep.nombre}
                  </button>
                ))}
              </div>
              {formData.dependencias.length === 0 && (
                <p className="text-sm text-red-500 mt-1">Selecciona al menos una dependencia</p>
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
