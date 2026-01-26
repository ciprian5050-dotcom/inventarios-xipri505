import { useState, FormEvent } from 'react';
import { Cuentadante, Dependencia } from '../types';
import { X } from 'lucide-react';

interface CuentadanteFormProps {
  cuentadante: Cuentadante | null;
  dependencias: Dependencia[];
  existingDependencias?: string[];
  onSave?: (cuentadante: Cuentadante | Omit<Cuentadante, 'id'>) => void;
  onSubmit?: (cuentadante: Cuentadante | Omit<Cuentadante, 'id'>) => void;
  onCancel: () => void;
}

export function CuentadanteForm({ cuentadante, dependencias, existingDependencias = [], onSave, onSubmit, onCancel }: CuentadanteFormProps) {
  const [formData, setFormData] = useState({
    nombre: cuentadante?.nombre || '',
    cedula: cuentadante?.cedula || '',
    cargo: cuentadante?.cargo || '',
    dependencia: cuentadante?.dependencia || '',
    email: cuentadante?.email || '',
    telefono: cuentadante?.telefono || ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

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

    // Validar dependencia única (solo al crear o si cambió la dependencia)
    if (!cuentadante || cuentadante.dependencia !== formData.dependencia) {
      if (existingDependencias.includes(formData.dependencia)) {
        newErrors.dependencia = 'Ya existe un cuentadante asignado a esta dependencia';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    // Usar el callback apropiado
    const callback = onSave || onSubmit;
    
    if (!callback) {
      console.error('No se proporcionó callback onSave u onSubmit');
      return;
    }
    
    if (cuentadante) {
      callback({ ...cuentadante, ...formData });
    } else {
      callback(formData);
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

            {/* Dependencia */}
            <div>
              <label className="block text-slate-700 mb-2">
                Dependencia <span className="text-red-500">*</span>
              </label>
              <select
                required
                value={formData.dependencia}
                onChange={(e) => {
                  setFormData({ ...formData, dependencia: e.target.value });
                  if (errors.dependencia) setErrors({ ...errors, dependencia: '' });
                }}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent ${
                  errors.dependencia ? 'border-red-500' : 'border-slate-300'
                }`}
              >
                <option value="">Seleccione una dependencia</option>
                {dependencias.map(dep => (
                  <option key={dep.id} value={dep.nombre}>{dep.nombre} ({dep.codigo})</option>
                ))}
              </select>
              {errors.dependencia && (
                <p className="text-red-500 text-sm mt-1">{errors.dependencia}</p>
              )}
              <p className="text-slate-500 text-sm mt-1">
                Cada dependencia debe tener un único cuentadante responsable
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