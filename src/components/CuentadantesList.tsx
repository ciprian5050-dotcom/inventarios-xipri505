import React, { useState } from 'react';
import { Edit2, Trash2, Plus } from 'lucide-react';
import type { Cuentadante, Dependencia } from '../types';
import { CuentadanteForm } from './CuentadanteForm';

interface CuentadantesListProps {
  cuentadantes: Cuentadante[];
  dependencias: Dependencia[];
  onAdd: (cuentadante: Omit<Cuentadante, 'id'>) => void;
  onEdit: (id: string, cuentadante: Omit<Cuentadante, 'id'>) => void;
  onDelete: (id: string) => void;
}

export function CuentadantesList({ cuentadantes, dependencias, onAdd, onEdit, onDelete }: CuentadantesListProps) {
  const [showForm, setShowForm] = useState(false);
  const [editingCuentadante, setEditingCuentadante] = useState<Cuentadante | undefined>();

  const handleSubmit = (cuentadante: Omit<Cuentadante, 'id'>) => {
    if (editingCuentadante) {
      onEdit(editingCuentadante.id, cuentadante);
    } else {
      onAdd(cuentadante);
    }
    setShowForm(false);
    setEditingCuentadante(undefined);
  };

  const handleEdit = (cuentadante: Cuentadante) => {
    setEditingCuentadante(cuentadante);
    setShowForm(true);
  };

  const handleClose = () => {
    setShowForm(false);
    setEditingCuentadante(undefined);
  };

  // ✅ Función para obtener nombres de dependencias desde IDs
  const getDependenciasNombres = (dependenciaIds: string[]): string => {
    return dependenciaIds
      .map(id => dependencias.find(d => d.id === id)?.nombre)
      .filter(Boolean)
      .join(', ');
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-slate-900">Cuentadantes</h2>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Nuevo Cuentadante
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Nombre
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Cédula
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Dependencias
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Cargo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Contacto
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {cuentadantes.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                    No hay cuentadantes registrados
                  </td>
                </tr>
              ) : (
                cuentadantes.map((cuentadante) => (
                  <tr key={cuentadante.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-slate-900">
                        {cuentadante.nombre}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-slate-500">{cuentadante.cedula}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-slate-900">
                        {getDependenciasNombres(cuentadante.dependencias)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-slate-500">{cuentadante.cargo}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-slate-500">
                        {cuentadante.telefono && <div>{cuentadante.telefono}</div>}
                        {cuentadante.email && <div>{cuentadante.email}</div>}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleEdit(cuentadante)}
                        className="text-blue-600 hover:text-blue-900 mr-4"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm('¿Estás seguro de eliminar este cuentadante?')) {
                            onDelete(cuentadante.id);
                          }
                        }}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showForm && (
        <CuentadanteForm
          cuentadante={editingCuentadante}
          dependencias={dependencias}
          onSubmit={handleSubmit}
          onClose={handleClose}
        />
      )}
    </div>
  );
}
