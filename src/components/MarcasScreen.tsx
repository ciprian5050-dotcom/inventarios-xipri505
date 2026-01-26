import { useState, useEffect } from 'react';
import { Marca } from '../types';
import { Plus, Edit2, Trash2, Tag } from 'lucide-react';
import { toast } from 'sonner';
import { kvGet, kvSet } from '../utils/supabase/client';

export function MarcasScreen() {
  const [marcas, setMarcas] = useState<Marca[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingMarca, setEditingMarca] = useState<Marca | null>(null);
  const [formData, setFormData] = useState({ nombre: '', descripcion: '' });
  const [loading, setLoading] = useState(true);

  // Validar duplicados en tiempo real
  const checkDuplicado = () => {
    if (!formData.nombre.trim()) return false;
    const nombreNormalizado = formData.nombre.trim().toLowerCase();
    return marcas.some(m => 
      m.nombre.toLowerCase() === nombreNormalizado && 
      m.id !== editingMarca?.id
    );
  };

  const isDuplicado = checkDuplicado();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const loadedMarcas = await kvGet('marcas') || [];
      setMarcas(Array.isArray(loadedMarcas) ? loadedMarcas : []);
    } catch (error) {
      console.error('Error cargando marcas:', error);
      toast.error('Error al cargar las marcas');
      setMarcas([]);
    } finally {
      setLoading(false);
    }
  };

  const saveMarcas = async (newMarcas: Marca[]) => {
    try {
      await kvSet('marcas', newMarcas);
      setMarcas(newMarcas);
    } catch (error) {
      console.error('Error guardando marcas:', error);
      toast.error('Error al guardar las marcas');
      throw error;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nombre.trim()) {
      toast.error('El nombre de la marca es requerido');
      return;
    }

    // Validar duplicados (case-insensitive)
    const nombreNormalizado = formData.nombre.trim().toLowerCase();
    const existeDuplicado = marcas.some(m => 
      m.nombre.toLowerCase() === nombreNormalizado && 
      m.id !== editingMarca?.id // Excluir la marca actual si estamos editando
    );

    if (existeDuplicado) {
      toast.error(`La marca "${formData.nombre}" ya existe. Por favor usa un nombre diferente.`);
      return;
    }

    try {
      if (editingMarca) {
        // Editar marca existente
        const updatedMarcas = marcas.map(m => 
          m.id === editingMarca.id 
            ? { ...editingMarca, nombre: formData.nombre.trim(), descripcion: formData.descripcion }
            : m
        );
        await saveMarcas(updatedMarcas);
        toast.success('Marca actualizada correctamente');
      } else {
        // Agregar nueva marca
        const newMarca: Marca = {
          id: crypto.randomUUID(),
          nombre: formData.nombre.trim(),
          descripcion: formData.descripcion
        };
        await saveMarcas([...marcas, newMarca]);
        toast.success('Marca creada correctamente');
      }

      handleCancel();
    } catch (error) {
      // El error ya se mostró en saveMarcas
    }
  };

  const handleEdit = (marca: Marca) => {
    setEditingMarca(marca);
    setFormData({ nombre: marca.nombre, descripcion: marca.descripcion || '' });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('¿Está seguro de eliminar esta marca?')) {
      try {
        const newMarcas = marcas.filter(m => m.id !== id);
        await saveMarcas(newMarcas);
        toast.success('Marca eliminada correctamente');
      } catch (error) {
        // El error ya se mostró en saveMarcas
      }
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingMarca(null);
    setFormData({ nombre: '', descripcion: '' });
  };

  return (
    <div className="p-8">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h2 className="text-slate-900 mb-1">Marcas</h2>
          <p className="text-slate-600">Gestión de marcas para activos</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="bg-slate-900 text-white px-6 py-3 rounded-lg hover:bg-slate-800 transition-colors flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Nueva Marca
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
          <h3 className="text-slate-900 mb-6">
            {editingMarca ? 'Editar Marca' : 'Nueva Marca'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Nombre de la Marca *
              </label>
              <input
                type="text"
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                placeholder="Ej: Dell, HP, Samsung..."
                required
              />
              {isDuplicado && (
                <p className="text-red-500 text-sm mt-1">⚠️ Esta marca ya existe.</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Descripción
              </label>
              <textarea
                value={formData.descripcion}
                onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                placeholder="Información adicional sobre la marca..."
                rows={3}
              />
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                className="bg-slate-900 text-white px-6 py-2 rounded-lg hover:bg-slate-800 transition-colors"
              >
                {editingMarca ? 'Actualizar' : 'Crear'} Marca
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="bg-slate-200 text-slate-700 px-6 py-2 rounded-lg hover:bg-slate-300 transition-colors"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-slate-200">
        <div className="p-6 border-b border-slate-200">
          <h3 className="text-slate-900 font-medium">
            Lista de Marcas ({marcas.length})
          </h3>
        </div>
        
        {loading ? (
          <div className="p-12 text-center">
            <Tag className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500 mb-2">Cargando marcas...</p>
          </div>
        ) : marcas.length === 0 ? (
          <div className="p-12 text-center">
            <Tag className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500 mb-2">No hay marcas registradas</p>
            <p className="text-sm text-slate-400">Crea tu primera marca para comenzar</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Nombre
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Descripción
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {marcas.map((marca) => (
                  <tr key={marca.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Tag className="w-4 h-4 text-slate-400" />
                        <span className="text-sm font-medium text-slate-900">{marca.nombre}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-slate-600">
                        {marca.descripcion || '-'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleEdit(marca)}
                        className="text-slate-600 hover:text-slate-900 mr-4"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(marca.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}