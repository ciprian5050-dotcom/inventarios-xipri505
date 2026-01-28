import { useState, useEffect } from 'react';
import { Cuentadante, Dependencia } from '../types';
import { CuentadantesList } from './CuentadantesList';
import { CuentadanteForm } from './CuentadanteForm';
import { Plus, RefreshCw } from 'lucide-react';
import { kvGet, kvSet, kvGetByPrefix, kvDel } from '../utils/supabase/client';

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
      
      // Agregar timeout de 10 segundos
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout: La carga tardó más de 10 segundos')), 10000)
      );
      
      const loadPromise = (async () => {
        const loadedCuentadantes = await kvGetByPrefix('cuentadante:');
        const loadedDependencias = await kvGetByPrefix('dependencia:');
        
        console.log('✅ Datos cargados:', {
          cuentadantes: loadedCuentadantes.length,
          dependencias: loadedDependencias.length
        });
        
        return { loadedCuentadantes, loadedDependencias };
      })();
      
      const { loadedCuentadantes, loadedDependencias } = await Promise.race([
        loadPromise,
        timeoutPromise
      ]) as any;
      
      setCuentadantes(loadedCuentadantes);
      setDependencias(loadedDependencias);
    } catch (err: any) {
      console.error('❌ Error cargando datos:', err);
      setError(err.message || 'Error al cargar los datos desde Supabase');
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

  const handleEditCuentadante = async (cuentadante: Cuentadante) => {
    await kvSet(`cuentadante:${cuentadante.id}`, cuentadante);
    
    const newCuentadantes = cuentadantes.map(c => c.id === cuentadante.id ? cuentadante : c);
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

  // Obtener lista de dependencias ya asignadas
  const getExistingDependencias = (): string[] => {
    return cuentadantes
      .filter(c => !editingCuentadante || c.id !== editingCuentadante.id)
      .map(c => c.dependencia);
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <RefreshCw className="w-12 h-12 text-slate-400 animate-spin mx-auto mb-4" />
          <p className="text-slate-600">Cargando cuentadantes desde Supabase...</p>
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
          <h2 className="text-slate-900 mb-1">Cuentadantes</h2>
          <p className="text-slate-600">Gestión de responsables de activos fijos</p>
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
            Nuevo Cuentadante
          </button>
        </div>
      </div>

      {showForm ? (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h3 className="text-slate-900 mb-6">
            {editingCuentadante ? 'Editar Cuentadante' : 'Nuevo Cuentadante'}
          </h3>
          <CuentadanteForm
            cuentadante={editingCuentadante}
            dependencias={dependencias}
            onSubmit={editingCuentadante ? handleEditCuentadante : handleAddCuentadante}
            onCancel={handleCancel}
          />
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
