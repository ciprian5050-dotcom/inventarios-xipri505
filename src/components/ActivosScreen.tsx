import { useState, useEffect } from 'react';
import { Activo, Cuentadante, Dependencia, Marca } from '../types';
import { ActivosList } from './ActivosList';
import { ActivoForm } from './ActivoForm';
import { Plus, RefreshCw } from 'lucide-react';
import { kvGet, kvSet, kvGetByPrefix, kvDel } from '../utils/supabase/client';

export function ActivosScreen() {
  const [activos, setActivos] = useState<Activo[]>([]);
  const [cuentadantes, setCuentadantes] = useState<Cuentadante[]>([]);
  const [dependencias, setDependencias] = useState<Dependencia[]>([]);
  const [marcas, setMarcas] = useState<Marca[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingActivo, setEditingActivo] = useState<Activo | null>(null);
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
      
      console.log('🔍 Cargando datos desde Supabase...');

      // Cargar activos (con prefijo activo:)
      const loadedActivos = await kvGetByPrefix('activo:');
      
      // Cargar cuentadantes (con prefijo cuentadante:)
      const loadedCuentadantes = await kvGetByPrefix('cuentadante:');
      
      // Cargar dependencias (con prefijo dependencia:)
      const loadedDependencias = await kvGetByPrefix('dependencia:');
      
      // Cargar marcas (key simple: marcas)
      const loadedMarcas = await kvGet('marcas') || [];

      console.log('✅ Datos cargados:', {
        activos: loadedActivos.length,
        cuentadantes: loadedCuentadantes.length,
        dependencias: loadedDependencias.length,
        marcas: Array.isArray(loadedMarcas) ? loadedMarcas.length : 0
      });

      setActivos(loadedActivos);
      setCuentadantes(loadedCuentadantes);
      setDependencias(loadedDependencias);
      setMarcas(Array.isArray(loadedMarcas) ? loadedMarcas : []);
    } catch (err: any) {
      console.error('❌ Error cargando datos:', err);
      setError('Error al cargar los datos desde Supabase');
    } finally {
      setLoading(false);
    }
  };

  const saveActivos = async (newActivos: Activo[]) => {
    // Guardar cada activo individualmente en Supabase con prefijo activo:
    for (const activo of newActivos) {
      await kvSet(`activo:${activo.id}`, activo);
    }
    setActivos(newActivos);
  };

  const handleAddActivo = async (activo: Omit<Activo, 'id'>) => {
    // Verificar si el código QR ya existe
    const codigoExiste = activos.some(a => a.qr.toLowerCase() === activo.qr.toLowerCase());
    
    if (codigoExiste) {
      alert(`⚠️ El código "${activo.qr}" ya existe. Por favor, usa un código diferente.`);
      return;
    }
    
    const newActivo: Activo = {
      ...activo,
      id: Date.now().toString()
    };
    
    // Guardar en Supabase
    await kvSet(`activo:${newActivo.id}`, newActivo);
    
    const newActivos = [...activos, newActivo];
    setActivos(newActivos);
    
    // Guardar la marca si es nueva
    await saveMarcaIfNew(activo.marca);
    
    setShowForm(false);
  };

  const handleEditActivo = async (activo: Activo) => {
    // Actualizar en Supabase
    await kvSet(`activo:${activo.id}`, activo);
    
    const newActivos = activos.map(a => a.id === activo.id ? activo : a);
    setActivos(newActivos);
    
    // Guardar la marca si es nueva
    await saveMarcaIfNew(activo.marca);
    
    setShowForm(false);
    setEditingActivo(null);
  };

  const saveMarcaIfNew = async (nombreMarca: string) => {
    // Verificar si la marca ya existe
    const marcaExiste = marcas.some(m => m.nombre.toLowerCase() === nombreMarca.toLowerCase());
    
    if (!marcaExiste && nombreMarca.trim() !== '') {
      const newMarca: Marca = {
        id: Date.now().toString(),
        nombre: nombreMarca,
        descripcion: ''
      };
      const newMarcas = [...marcas, newMarca];
      
      // Guardar en Supabase
      await kvSet('marcas', newMarcas);
      
      setMarcas(newMarcas);
    }
  };

  const handleDeleteActivo = async (id: string) => {
    if (window.confirm('¿Está seguro de eliminar este activo?')) {
      const newActivos = activos.filter(a => a.id !== id);
      
      // Eliminar en Supabase
      await kvDel(`activo:${id}`);
      
      setActivos(newActivos);
    }
  };

  const handleEditClick = (activo: Activo) => {
    setEditingActivo(activo);
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingActivo(null);
  };

  const marcasNames = marcas.map(m => m.nombre);

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <RefreshCw className="w-12 h-12 text-slate-400 animate-spin mx-auto mb-4" />
          <p className="text-slate-600">Cargando datos desde Supabase...</p>
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
          <h2 className="text-slate-900 mb-1">Activos Fijos</h2>
          <p className="text-slate-600">Gestión completa del inventario de activos</p>
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
            Nuevo Activo
          </button>
        </div>
      </div>

      {showForm ? (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h3 className="text-slate-900 mb-6">
            {editingActivo ? 'Editar Activo' : 'Nuevo Activo'}
          </h3>
          <ActivoForm
            activo={editingActivo}
            cuentadantes={cuentadantes}
            dependencias={dependencias}
            marcas={marcasNames}
            existingActivos={activos}
            onSave={editingActivo ? handleEditActivo : handleAddActivo}
            onCancel={handleCancel}
          />
        </div>
      ) : (
        <ActivosList
          activos={activos}
          onEdit={handleEditClick}
          onDelete={handleDeleteActivo}
        />
      )}
    </div>
  );
}