import { useState, useEffect } from 'react';
import { Cuentadante, Dependencia } from '../types';
import { CuentadantesList } from './CuentadantesList';
import { CuentadanteForm } from './CuentadanteForm';
import { Plus, RefreshCw } from 'lucide-react';
import { kvSet, kvGetByPrefix, kvDel } from '../utils/supabase/client';
import type { Activo } from '../types';

export function CuentadantesScreen() {
  const [cuentadantes, setCuentadantes] = useState<Cuentadante[]>([]);
  const [dependencias, setDependencias] = useState<Dependencia[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingCuentadante, setEditingCuentadante] = useState<Cuentadante | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Cargar datos desde Supabase
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');
      
      console.log('🔍 Cargando cuentadantes desde Supabase...');
      
      const loadedCuentadantes = await kvGetByPrefix('cuentadante:');
      const loadedDependencias = await kvGetByPrefix('dependencia:');
      
      // Asegurar que siempre sean arrays
      const cuentadantesArray = Array.isArray(loadedCuentadantes) ? loadedCuentadantes : [];
      const dependenciasArray = Array.isArray(loadedDependencias) ? loadedDependencias : [];
      
      console.log('✅ Datos cargados:', {
        cuentadantes: cuentadantesArray.length,
        dependencias: dependenciasArray.length
      });
      
      setCuentadantes(cuentadantesArray);
      setDependencias(dependenciasArray);
    } catch (err: any) {
      console.error('❌ Error cargando cuentadantes:', err);
      setError(`Error al cargar los cuentadantes: ${err.message || 'Error desconocido'}`);
      // Asegurar que los estados sean arrays incluso en caso de error
      setCuentadantes([]);
      setDependencias([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCuentadante = async (cuentadante: Omit<Cuentadante, 'id'>) => {
    const newCuentadante: Cuentadante = {
      ...cuentadante,
      id: Date.now().toString()
    };
    
    await kvSet(`cuentadante:${newCuentadante.id}`, newCuentadante);
    
    const newCuentadantes = [...cuentadantes, newCuentadante];
    setCuentadantes(newCuentadantes);
    setShowForm(false);
  };

  const handleEditCuentadante = async (id: string, cuentadante: Omit<Cuentadante, 'id'>) => {
    const updatedCuentadante: Cuentadante = { ...cuentadante, id };
    
    await kvSet(`cuentadante:${id}`, updatedCuentadante);
    
    const newCuentadantes = cuentadantes.map(c => c.id === id ? updatedCuentadante : c);
    setCuentadantes(newCuentadantes);
    setShowForm(false);
    setEditingCuentadante(null);
  };

  const handleDeleteCuentadante = async (id: string) => {
    if (window.confirm('¿Está seguro de eliminar este cuentadante?')) {
      await kvDel(`cuentadante:${id}`);
      
      const newCuentadantes = cuentadantes.filter(c => c.id !== id);
      setCuentadantes(newCuentadantes);
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
        <div className="flex gap-3">
          <button
            onClick={() => loadData()}
            className="flex items-center gap-2 bg-slate-600 text-white px-4 py-3 rounded-lg hover:bg-slate-700 transition-colors"
            title="Recargar datos"
          >
            <RefreshCw size={20} />
            Recargar
          </button>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus size={20} />
            Nuevo Cuentadante
          </button>
        </div>
      </div>

      {loading ? (
        <div className="bg-white rounded-lg border border-slate-200 p-12 text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-r-transparent"></div>
          <p className="mt-4 text-slate-600">Cargando cuentadantes...</p>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <p className="text-red-900 font-semibold mb-2">⚠️ Error</p>
          <p className="text-red-800">{error}</p>
          <button
            onClick={() => loadData()}
            className="mt-4 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
          >
            Reintentar
          </button>
        </div>
      ) : showForm ? (
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
