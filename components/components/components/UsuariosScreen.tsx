import { useState } from 'react';
import { Plus, Edit2, Trash2, User, Shield } from 'lucide-react';
import { toast } from 'sonner';
import type { Usuario } from '../types';

interface UsuariosScreenProps {
  usuarios: Usuario[];
  onAddUsuario: (usuario: Omit<Usuario, 'id'>) => void;
  onUpdateUsuario: (id: string, usuario: Omit<Usuario, 'id'>) => void;
  onDeleteUsuario: (id: string) => void;
  currentUser: Usuario | null;
}

export function UsuariosScreen({
  usuarios,
  onAddUsuario,
  onUpdateUsuario,
  onDeleteUsuario,
  currentUser
}: UsuariosScreenProps) {
  const [showForm, setShowForm] = useState(false);
  const [editingUsuario, setEditingUsuario] = useState<Usuario | null>(null);
  const [formData, setFormData] = useState({
    nombre: '',
    usuario: '',
    password: '',
    rol: 'usuario' as 'administrador' | 'usuario'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.nombre || !formData.usuario || (!editingUsuario && !formData.password)) {
      toast.error('Todos los campos son obligatorios');
      return;
    }

    if (editingUsuario) {
      const updateData = formData.password 
        ? formData 
        : { nombre: formData.nombre, usuario: formData.usuario, rol: formData.rol, password: editingUsuario.password };
      
      onUpdateUsuario(editingUsuario.id, updateData);
      setEditingUsuario(null);
    } else {
      onAddUsuario(formData);
    }

    setFormData({ nombre: '', usuario: '', password: '', rol: 'usuario' });
    setShowForm(false);
  };

  const handleEdit = (usuario: Usuario) => {
    setEditingUsuario(usuario);
    setFormData({
      nombre: usuario.nombre,
      usuario: usuario.usuario,
      password: '',
      rol: usuario.rol
    });
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (currentUser?.id === id) {
      toast.error('No puedes eliminar tu propio usuario');
      return;
    }

    if (confirm('¿Estás seguro de eliminar este usuario?')) {
      onDeleteUsuario(id);
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingUsuario(null);
    setFormData({ nombre: '', usuario: '', password: '', rol: 'usuario' });
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Gestión de Usuarios</h1>
          <p className="text-slate-600">Administra los usuarios del sistema</p>
        </div>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus size={20} />
            Nuevo Usuario
          </button>
        )}
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-lg border border-slate-200 mb-8">
          <h2 className="text-xl font-semibold mb-6">
            {editingUsuario ? 'Editar Usuario' : 'Nuevo Usuario'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Nombre Completo *
                </label>
                <input
                  type="text"
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Ej: Juan Pérez"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Usuario *
                </label>
                <input
                  type="text"
                  value={formData.usuario}
                  onChange={(e) => setFormData({ ...formData, usuario: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Ej: jperez"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Contraseña {editingUsuario && '(dejar vacío para no cambiar)'}
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="••••••••"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Rol *
                </label>
                <select
                  value={formData.rol}
                  onChange={(e) => setFormData({ ...formData, rol: e.target.value as 'administrador' | 'usuario' })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="usuario">Usuario</option>
                  <option value="administrador">Administrador</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                {editingUsuario ? 'Actualizar' : 'Crear'} Usuario
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

      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left p-4 font-semibold text-slate-700">Nombre</th>
                <th className="text-left p-4 font-semibold text-slate-700">Usuario</th>
                <th className="text-left p-4 font-semibold text-slate-700">Rol</th>
                <th className="text-right p-4 font-semibold text-slate-700">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {usuarios.map((usuario, index) => (
                <tr
                  key={usuario.id}
                  className={index % 2 === 0 ? 'bg-white' : 'bg-slate-50'}
                >
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <User size={20} className="text-blue-600" />
                      </div>
                      <span className="font-medium">{usuario.nombre}</span>
                      {currentUser?.id === usuario.id && (
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                          Tú
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="p-4 text-slate-600">{usuario.usuario}</td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      {usuario.rol === 'administrador' ? (
                        <>
                          <Shield size={16} className="text-purple-600" />
                          <span className="text-purple-600 font-medium">Administrador</span>
                        </>
                      ) : (
                        <>
                          <User size={16} className="text-slate-600" />
                          <span className="text-slate-600">Usuario</span>
                        </>
                      )}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => handleEdit(usuario)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Editar"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(usuario.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Eliminar"
                        disabled={currentUser?.id === usuario.id}
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {usuarios.length === 0 && (
          <div className="p-12 text-center text-slate-500">
            No hay usuarios registrados
          </div>
        )}
      </div>
    </div>
  );
}
