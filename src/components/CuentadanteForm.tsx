import { useState, FormEvent } from 'react';
import { Cuentadante, Dependencia } from '../types';
import { X } from 'lucide-react';

interface CuentadanteFormProps {
  cuentadante: Cuentadante | null;
  dependencias: Dependencia[];
  onSave?: (cuentadante: Cuentadante | Omit<Cuentadante, 'id'>) => void;
  onSubmit?: (cuentadante: Cuentadante | Omit<Cuentadante, 'id'>) => void;
  onCancel: () => void;
}

export function CuentadanteForm({ cuentadante, dependencias, onSave, onSubmit, onCancel }: CuentadanteFormProps) {
  const [formData, setFormData] = useState({
    nombre: cuentadante?.nombre || '',
    cedula: cuentadante?.cedula || '',
    cargo: cuentadante?.cargo || '',
    dependencia: cuentadante?.dependencia || '',
    dependencias: cuentadante?.dependencias || [cuentadante?.dependencia].filter(Boolean) || [],
    email: cuentadante?.email || '',
    telefono: cuentadante?.telefono || ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [selectedDeps, setSelectedDeps] = useState<string[]>(
    cuentadante?.dependencias || [cuentadante?.dependencia].filter(Boolean) || []
  );

  const handleDependenciaToggle = (depNombre: string) => {
    setSelectedDeps(prev => {
      if (prev.includes(depNombre)) {
        return prev.filter(d => d !== depNombre);
      } else {
        return [...prev, depNombre];
      }
    });
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Validar cédula (solo números, entre 7 y 10 dígitos)
    if (!/^\d{7,10}$/.test(formData.cedula)) {
      newErrors.cedula = 'La cédula debe tener entre 7 y 10 números';
    }

    // Validar correo
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Ingrese un correo electrónico válido';
    }

    // Validar teléfono (formato colombiano: 10 dígitos empezando con 3) - opcional
    if (formData.telefono && !/^3\d{9}$/.test(formData.telefono)) {
      newErrors.telefono = 'El teléfono debe ser un número colombiano válido (10 dígitos, inicia con 3)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    if (selectedDeps.length === 0) {
      alert('Por favor seleccione al menos una dependencia');
      return;
    }
    
    // Usar el callback apropiado
    const callback = onSave || onSubmit;
    
    if (!callback) {
      console.error('No se proporcionó callback onSave u onSubmit');
      return;
    }
    
    if (cuentadante) {
      callback({ ...cuentadante, ...formData, dependencias: selectedDeps, dependencia: selectedDeps[0] });
    } else {
      callback({ ...formData, dependencias: selectedDeps, dependencia: selectedDeps[0] });
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <h2 className="text-slate-900">
            {cuentadante ? 'Editar Cuentadante' : 'Nuevo Cuentadante'}
          </h2>
          <button
            onClick={onCancel}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-slate-600" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-6">
            {/* Nombre Completo */}
            <div>
              <label className="block text-slate-700 mb-2">
                Nombre Completo <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                placeholder="Ej: Carlos Andrés Rodríguez"
              />
            </div>

            {/* Cédula */}
            <div>
              <label className="block text-slate-700 mb-2">
                Cédula <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.cedula}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '');
                  setFormData({ ...formData, cedula: value });
                  if (errors.cedula) setErrors({ ...errors, cedula: '' });
                }}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent ${
                  errors.cedula ? 'border-red-500' : 'border-slate-300'
                }`}
                placeholder="Ej: 1234567890"
                maxLength={10}
              />
              {errors.cedula && (
                <p className="text-red-500 text-sm mt-1">{errors.cedula}</p>
              )}
            </div>

            {/* Cargo */}
            <div>
              <label className="block text-slate-700 mb-2">
                Cargo <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.cargo}
                onChange={(e) => setFormData({ ...formData, cargo: e.target.value })}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                placeholder="Ej: Jefe de Sistemas"
              />
            </div>

            {/* Correo */}
            <div>
              <label className="block text-slate-700 mb-2">
                Correo Electrónico <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => {
                  setFormData({ ...formData, email: e.target.value });
                  if (errors.email) setErrors({ ...errors, email: '' });
                }}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent ${
                  errors.email ? 'border-red-500' : 'border-slate-300'
                }`}
                placeholder="Ej: carlos.rodriguez@empresa.com"
              />
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">{errors.email}</p>
              )}
            </div>

            {/* Celular */}
            <div>
              <label className="block text-slate-700 mb-2">
                Número de Celular <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                required
                value={formData.telefono}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '');
                  setFormData({ ...formData, telefono: value });
                  if (errors.telefono) setErrors({ ...errors, telefono: '' });
                }}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent ${
                  errors.telefono ? 'border-red-500' : 'border-slate-300'
                }`}
                placeholder="Ej: 3001234567"
                maxLength={10}
              />
              {errors.telefono && (
                <p className="text-red-500 text-sm mt-1">{errors.telefono}</p>
              )}
            </div>

            {/* Dependencias */}
            <div>
              <label className="block text-slate-700 mb-2">
                Dependencias <span className="text-red-500">*</span>
              </label>
              <div className="flex flex-wrap gap-2 p-3 border border-slate-300 rounded-lg min-h-[60px]">
                {Array.isArray(dependencias) && dependencias.map(dep => (
                  <button
                    key={dep.id}
                    type="button"
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      selectedDeps.includes(dep.nombre) 
                        ? 'bg-slate-900 text-white' 
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                    onClick={() => handleDependenciaToggle(dep.nombre)}
                  >
                    {dep.nombre} ({dep.codigo})
                  </button>
                ))}
              </div>
              {selectedDeps.length === 0 && (
                <p className="text-red-500 text-sm mt-1">Seleccione al menos una dependencia</p>
              )}
              <p className="text-slate-500 text-sm mt-1">
                ✅ Un cuentadante puede estar asignado a múltiples dependencias. Click para seleccionar/deseleccionar.
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 mt-6 pt-6 border-t border-slate-200">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-6 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              {cuentadante ? 'Guardar Cambios' : 'Crear Cuentadante'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
