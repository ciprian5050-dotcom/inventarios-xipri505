import { useState } from 'react';
import { Cuentadante } from '../types';
import { CuentadantesList } from './CuentadantesList';
import { CuentadanteForm } from './CuentadanteForm';
import { Plus, RefreshCw } from 'lucide-react';
import type { Activo } from '../types';

interface CuentadantesScreenProps {
  cuentadantes: Cuentadante[];
  activos: Activo[];
  dependencias: string[];
  onAddCuentadante: (cuentadante: Omit<Cuentadante, 'id'>) => void;
  onUpdateCuentadante: (id: string, cuentadante: Omit<Cuentadante, 'id'>) => void;
  onDeleteCuentadante: (id: string) => void;
}

export function CuentadantesScreen({
  cuentadantes,
  activos,
  dependencias,
  onAddCuentadante,
  onUpdateCuentadante,
  onDeleteCuentadante
}: CuentadantesScreenProps) {
  const [showForm, setShowForm] = useState(false);
  const [editingCuentadante, setEditingCuentadante] = useState<Cuentadante | null>(null);

  const handleAddCuentadante = (cuentadante: Omit<Cuentadante, 'id'>) => {
    onAddCuentadante(cuentadante);
    setShowForm(false);
  };

  const handleEditCuentadante = (id: string, cuentadante: Omit<Cuentadante, 'id'>) => {
    onUpdateCuentadante(id, cuentadante);
    setShowForm(false);
    setEditingCuentadante(null);
  };

  const handleDeleteCuentadante = (id: string) => {
    if (window.confirm('¿Está seguro de eliminar este cuentadante?')) {
      onDeleteCuentadante(id);
    }
  };

  const handleEditClick = (cuentadante: Cuentadante) => {
    setEditingCuentadante(cuentadante);
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingCuentadante(null);
  };

  return (
    <div className="p-8">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold mb-2">Cuentadantes</h2>
          <p className="text-slate-600">Gestiona los responsables de activos por dependencia</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus size={20} />
          Nuevo Cuentadante
        </button>
      </div>

      {showForm ? (
        <div className="bg-white rounded-lg border border-slate-200 p-6 mb-6">
          <h3 className="text-xl font-semibold mb-6">
            {editingCuentadante ? 'Editar Cuentadante' : 'Nuevo Cuentadante'}
          </h3>
          {dependencias.length === 0 ? (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <p className="text-amber-900 font-semibold mb-2">⚠️ No hay dependencias configuradas</p>
              <p className="text-amber-800 text-sm mb-3">
                Para crear cuentadantes necesitas configurar al menos una dependencia primero.
              </p>
              <button
                onClick={() => setShowForm(false)}
                className="text-amber-700 text-sm font-medium hover:text-amber-900 underline"
              >
                Volver atrás
              </button>
            </div>
          ) : (
            <CuentadanteForm
              cuentadante={editingCuentadante}
              dependencias={dependencias}
              onSubmit={(data) => {
                if (editingCuentadante) {
                  handleEditCuentadante(editingCuentadante.id, data);
                } else {
                  handleAddCuentadante(data);
                }
              }}
              onCancel={handleCancel}
            />
          )}
        </div>
      ) : (
        <CuentadantesList
          cuentadantes={cuentadantes}
          onEdit={handleEditClick}
          onDelete={handleDeleteCuentadante}
        />
      )}
    </div>
  );
}
