import { useState, FormEvent } from 'react';
import { Dependencia } from '../App';
import { X } from 'lucide-react';

interface DependenciaFormProps {
  dependencia: Dependencia | null;
  onSave: (dependencia: Dependencia | Omit<Dependencia, 'id'>) => void;
  onCancel: () => void;
}

export function DependenciaForm({ dependencia, onSave, onCancel }: DependenciaFormProps) {
  const [formData, setFormData] = useState({
    nombre: dependencia?.nombre || '',
    codigo: dependencia?.codigo || '',
    ubicacion: dependencia?.ubicacion || '',
    descripcion: dependencia?.descripcion || ''
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    
    if (dependencia) {
      onSave({ ...dependencia, ...formData });
    } else {
      onSave(formData);
    }
  };

  const generateCodigo = () => {
    if (formData.nombre) {
      const codigo = formData.nombre
        .split(' ')
        .map(word => word[0])
        .join('')
        .toUpperCase()
        .slice(0, 4);
      setFormData({ ...formData, codigo });
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <h2 className="text-slate-900">
            {dependencia ? 'Editar Dependencia' : 'Nueva Dependencia'}
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
            {/* Nombre */}
            <div>
              <label className="block text-slate-700 mb-2">
                Nombre de la Dependencia <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                placeholder="Ej: Sistemas, Recursos Humanos, Administración"
              />
            </div>

            {/* Código */}
            <div>
              <label className="block text-slate-700 mb-2">
                Código <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  required
                  value={formData.codigo}
                  onChange={(e) => setFormData({ ...formData, codigo: e.target.value.toUpperCase() })}
                  className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                  placeholder="Ej: SIS, RRHH, ADM"
                  maxLength={10}
                />
                <button
                  type="button"
                  onClick={generateCodigo}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
                  title="Generar código automático"
                >
                  Auto
                </button>
              </div>
              <p className="text-slate-500 text-sm mt-1">
                Código único para identificar la dependencia
              </p>
            </div>

            {/* Ubicación */}
            <div>
              <label className="block text-slate-700 mb-2">
                Ubicación <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.ubicacion}
                onChange={(e) => setFormData({ ...formData, ubicacion: e.target.value })}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                placeholder="Ej: Piso 3 - Edificio A"
              />
            </div>

            {/* Descripción */}
            <div>
              <label className="block text-slate-700 mb-2">
                Descripción <span className="text-red-500">*</span>
              </label>
              <textarea
                required
                value={formData.descripcion}
                onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                placeholder="Ej: Departamento de Tecnología e Informática"
                rows={3}
              />
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
              {dependencia ? 'Guardar Cambios' : 'Crear Dependencia'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
