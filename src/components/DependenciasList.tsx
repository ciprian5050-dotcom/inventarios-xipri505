import { Dependencia } from '../App';
import { Pencil, Trash2, Search, Building2, MapPin, FileText } from 'lucide-react';
import { useState } from 'react';

interface DependenciasListProps {
  dependencias: Dependencia[];
  onEdit: (dependencia: Dependencia) => void;
  onDelete: (id: string) => void;
}

export function DependenciasList({ dependencias, onEdit, onDelete }: DependenciasListProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredDependencias = dependencias.filter(dependencia => {
    const matchesSearch = 
      dependencia.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dependencia.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dependencia.ubicacion.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dependencia.descripcion.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesSearch;
  });

  return (
    <div>
      {/* Filters */}
      <div className="p-6 border-b border-slate-200">
        <div className="flex gap-4 items-center">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por nombre, código, ubicación o descripción..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="px-6 py-3 text-left text-slate-700">Código</th>
              <th className="px-6 py-3 text-left text-slate-700">Nombre</th>
              <th className="px-6 py-3 text-left text-slate-700">Ubicación</th>
              <th className="px-6 py-3 text-left text-slate-700">Descripción</th>
              <th className="px-6 py-3 text-left text-slate-700">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredDependencias.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                  No se encontraron dependencias
                </td>
              </tr>
            ) : (
              filteredDependencias.map((dependencia) => (
                <tr key={dependencia.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 bg-slate-900 rounded-lg flex items-center justify-center">
                        <span className="text-white text-xs">{dependencia.codigo}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-slate-400" />
                      <span className="text-slate-900">{dependencia.nombre}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-slate-600">
                      <MapPin className="w-4 h-4 text-slate-400" />
                      {dependencia.ubicacion}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-slate-600">
                      <FileText className="w-4 h-4 text-slate-400" />
                      {dependencia.descripcion}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => onEdit(dependencia)}
                        className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                        title="Editar"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onDelete(dependencia.id)}
                        className="p-2 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Eliminar"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Summary */}
      <div className="px-6 py-4 bg-slate-50 border-t border-slate-200">
        <p className="text-slate-600">
          Mostrando {filteredDependencias.length} de {dependencias.length} dependencias
        </p>
      </div>
    </div>
  );
}
