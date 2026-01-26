import { useState, useEffect } from 'react';
import { Dependencia } from '../types';
import { DependenciasList } from './DependenciasList';
import { DependenciaForm } from './DependenciaForm';
import { Plus, RefreshCw } from 'lucide-react';
import { kvSet, kvGetByPrefix, kvDel } from '../utils/supabase/client';

export function DependenciasScreen() {
  const [dependencias, setDependencias] = useState<Dependencia[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingDependencia, setEditingDependencia] = useState<Dependencia | null>(null);
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
      
      console.log('🔍 Cargando dependencias desde Supabase...');
      
      const loadedDependencias = await kvGetByPrefix('dependencia:');
      
      console.log('✅ Dependencias cargadas:', loadedDependencias.length);
      
      setDependencias(loadedDependencias);
    } catch (err: any) {
      console.error('❌ Error cargando dependencias:', err);
      setError('Error al cargar las dependencias desde Supabase');
    } finally {
      setLoading(false);
    }
  };

  const handleAddDependencia = async (dependencia: Omit<Dependencia, 'id'>) => {
    const newDependencia: Dependencia = {
      ...dependencia,
      id: Date.now().toString()
    };
    
    await kvSet(`dependencia:${newDependencia.id}`, newDependencia);
    
    const newDependencias = [...dependencias, newDependencia];
    setDependencias(newDependencias);
    setShowForm(false);
  };

  const handleEditDependencia = async (dependencia: Dependencia) => {
    await kvSet(`dependencia:${dependencia.id}`, dependencia);
    
    const newDependencias = dependencias.map(d => d.id === dependencia.id ? dependencia : d);
    setDependencias(newDependencias);
    setShowForm(false);
    setEditingDependencia(null);
  };

  const handleDeleteDependencia = async (id: string) => {
    if (window.confirm('¿Está seguro de eliminar esta dependencia?')) {
      await kvDel(`dependencia:${id}`);
      
      const newDependencias = dependencias.filter(d => d.id !== id);
      setDependencias(newDependencias);
    }
  };

  const handleEditClick = (dependencia: Dependencia) => {
    setEditingDependencia(dependencia);
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingDependencia(null);
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <RefreshCw className="w-12 h-12 text-slate-400 animate-spin mx-auto mb-4" />
          <p className="text-slate-600">Cargando dependencias desde Supabase...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <p className="text-red-800 mb-4">{error}</p>
          <button
            onClick={loadData}
            className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h2 className="text-slate-900 mb-1">Dependencias</h2>
          <p className="text-slate-600">Gestión de oficinas y áreas</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={loadData}
            className="bg-slate-100 text-slate-700 px-4 py-3 rounded-lg hover:bg-slate-200 transition-colors flex items-center gap-2"
            title="Recargar datos"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
          <button
            onClick={() => setShowForm(true)}
            className="bg-slate-900 text-white px-6 py-3 rounded-lg hover:bg-slate-800 transition-colors flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Nueva Dependencia
          </button>
        </div>
      </div>

      {showForm ? (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h3 className="text-slate-900 mb-6">
            {editingDependencia ? 'Editar Dependencia' : 'Nueva Dependencia'}
          </h3>
          <DependenciaForm
            dependencia={editingDependencia}
            onSave={editingDependencia ? handleEditDependencia : handleAddDependencia}
            onCancel={handleCancel}
          />
        </div>
      ) : (
        <DependenciasList
          dependencias={dependencias}
          onEdit={handleEditClick}
          onDelete={handleDeleteDependencia}
        />
      )}
    </div>
  );
}