import { NombreActivo } from '../types';
import { Plus, Edit2, Trash2, FileText } from 'lucide-react';
import { toast } from 'sonner';
import { kvGet, kvSet } from '../utils/supabase/client';

export function NombresActivosScreen() {
  const [nombres, setNombres] = useState<NombreActivo[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingNombre, setEditingNombre] = useState<NombreActivo | null>(null);
  const [formData, setFormData] = useState({ nombre: '', descripcion: '' });
  const [loading, setLoading] = useState(true);

  // Validar duplicados en tiempo real
  const checkDuplicado = () => {
    if (!formData.nombre.trim()) return false;
    const nombreNormalizado = formData.nombre.trim().toLowerCase();
    return nombres.some(n => 
      n.nombre.toLowerCase() === nombreNormalizado && 
      n.id !== editingNombre?.id
    );
  };

  const isDuplicado = checkDuplicado();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const loadedNombres = await kvGet('nombres_activos') || [];
      setNombres(Array.isArray(loadedNombres) ? loadedNombres : []);
    } catch (error) {
      console.error('Error cargando nombres de activos:', error);
      toast.error('Error al cargar los nombres de activos');
      setNombres([]);
    } finally {
      setLoading(false);
    }
  };

  const saveNombres = async (newNombres: NombreActivo[]) => {
    try {
      await kvSet('nombres_activos', newNombres);
      setNombres(newNombres);
    } catch (error) {
      console.error('Error guardando nombres de activos:', error);
      toast.error('Error al guardar los nombres de activos');
      throw error;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nombre.trim()) {
      toast.error('El nombre del activo es requerido');
      return;
    }

    // Validar duplicados (case-insensitive)
    if (isDuplicado) {
      toast.error(`El nombre "${formData.nombre}" ya existe. Por favor usa un nombre diferente.`);
      return;
    }

    try {
      if (editingNombre) {
        // Editar nombre existente
        const updatedNombres = nombres.map(n => 
          n.id === editingNombre.id 
            ? { ...editingNombre, nombre: formData.nombre.trim(), descripcion: formData.descripcion }
            : n
        );
        await saveNombres(updatedNombres);
        toast.success('Nombre de activo actualizado correctamente');
      } else {
        // Agregar nuevo nombre
        const newNombre: NombreActivo = {
          id: crypto.randomUUID(),
          nombre: formData.nombre.trim(),
          descripcion: formData.descripcion
        };
        await saveNombres([...nombres, newNombre]);
        toast.success('Nombre de activo creado correctamente');
      }

      handleCancel();
    } catch (error) {
      // El error ya se mostró en saveNombres
    }
  };

  const handleEdit = (nombre: NombreActivo) => {
    setEditingNombre(nombre);
    setFormData({ nombre: nombre.nombre, descripcion: nombre.descripcion || '' });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('¿Está seguro de eliminar este nombre de activo?')) {
      try {
        const newNombres = nombres.filter(n => n.id !== id);
        await saveNombres(newNombres);
        toast.success('Nombre de activo eliminado correctamente');
      } catch (error) {
        // El error ya se mostró en saveNombres
      }
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingNombre(null);
    setFormData({ nombre: '', descripcion: '' });
  };

  return (
    <div className="p-8">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h2 className="text-slate-900 mb-1">Nombres de Activos</h2>
          <p className="text-slate-600">Catálogo de nombres predefinidos para activos</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="bg-slate-900 text-white px-6 py-3 rounded-lg hover:bg-slate-800 transition-colors flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Nuevo Nombre
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
          <h3 className="text-slate-900 mb-6">
            {editingNombre ? 'Editar Nombre de Activo' : 'Nuevo Nombre de Activo'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Nombre del Activo *
              </label>
              <input
                type="text"
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                placeholder="Ej: Laptop Ejecutiva, Escritorio Gerencial, Monitor LED..."
                required
              />
              {isDuplicado && (
                <p className="text-red-500 text-sm mt-1">⚠️ Este nombre de activo ya existe.</p>
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
                placeholder="Características o especificaciones del activo..."
                rows={3}
              />
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                className="bg-slate-900 text-white px-6 py-2 rounded-lg hover:bg-slate-800 transition-colors"
              >
                {editingNombre ? 'Actualizar' : 'Crear'} Nombre
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
            Lista de Nombres de Activos ({nombres.length})
          </h3>
        </div>
        
        {loading ? (
          <div className="p-12 text-center">
            <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500 mb-2">Cargando nombres de activos...</p>
          </div>
        ) : nombres.length === 0 ? (
          <div className="p-12 text-center">
            <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500 mb-2">No hay nombres de activos registrados</p>
            <p className="text-sm text-slate-400">Crea el primer nombre de activo para comenzar</p>
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
                {nombres.map((nombre) => (
                  <tr key={nombre.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-slate-400" />
                        <span className="text-sm font-medium text-slate-900">{nombre.nombre}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-slate-600">
                        {nombre.descripcion || '-'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleEdit(nombre)}
                        className="text-slate-600 hover:text-slate-900 mr-4"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(nombre.id)}
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