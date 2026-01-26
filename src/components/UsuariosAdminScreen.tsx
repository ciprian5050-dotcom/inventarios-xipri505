import { useState, useEffect } from 'react';
import { Users, Plus, Trash2, Edit2, Key, Mail, User as UserIcon, Shield, Search, AlertCircle, CheckCircle, X } from 'lucide-react';
import { toast } from 'sonner';

interface Usuario {
  email: string;
  nombre: string;
  password: string;
  rol?: string;
  createdAt?: string;
}

export function UsuariosAdminScreen() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [editingUser, setEditingUser] = useState<Usuario | null>(null);
  const [changingPasswordUser, setChangingPasswordUser] = useState<Usuario | null>(null);
  
  // Form states
  const [formData, setFormData] = useState({
    email: '',
    nombre: '',
    password: '',
    confirmPassword: '',
    rol: 'Usuario'
  });

  const [passwordData, setPasswordData] = useState({
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    loadUsuarios();
  }, []);

  const loadUsuarios = () => {
    const usersData = localStorage.getItem('inventory_users');
    if (usersData) {
      const usersObj = JSON.parse(usersData);
      const usersArray = Object.values(usersObj) as Usuario[];
      setUsuarios(usersArray);
    }
  };

  const handleOpenNew = () => {
    setEditingUser(null);
    setFormData({
      email: '',
      nombre: '',
      password: '',
      confirmPassword: '',
      rol: 'Usuario'
    });
    setShowModal(true);
  };

  const handleOpenEdit = (user: Usuario) => {
    setEditingUser(user);
    setFormData({
      email: user.email,
      nombre: user.nombre,
      password: '',
      confirmPassword: '',
      rol: user.rol || 'Usuario'
    });
    setShowModal(true);
  };

  const handleOpenPasswordChange = (user: Usuario) => {
    setChangingPasswordUser(user);
    setPasswordData({
      newPassword: '',
      confirmPassword: ''
    });
    setShowPasswordModal(true);
  };

  const handleSave = () => {
    // Validaciones
    if (!formData.nombre.trim()) {
      toast.error('El nombre es obligatorio');
      return;
    }

    if (!formData.email.trim()) {
      toast.error('El correo electrónico es obligatorio');
      return;
    }

    if (!editingUser && !formData.password) {
      toast.error('La contraseña es obligatoria para usuarios nuevos');
      return;
    }

    if (formData.password && formData.password.length < 6) {
      toast.error('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error('Las contraseñas no coinciden');
      return;
    }

    // Guardar
    const usersData = localStorage.getItem('inventory_users');
    const users = usersData ? JSON.parse(usersData) : {};

    // Verificar si el email ya existe (solo para usuarios nuevos o si cambió el email)
    if (!editingUser || editingUser.email !== formData.email) {
      if (users[formData.email]) {
        toast.error('Este correo electrónico ya está registrado');
        return;
      }
    }

    // Si es edición, eliminar el usuario anterior si cambió el email
    if (editingUser && editingUser.email !== formData.email) {
      delete users[editingUser.email];
    }

    // Crear o actualizar usuario
    users[formData.email] = {
      email: formData.email,
      nombre: formData.nombre,
      password: formData.password || editingUser?.password || '',
      rol: formData.rol,
      createdAt: editingUser?.createdAt || new Date().toISOString()
    };

    localStorage.setItem('inventory_users', JSON.stringify(users));
    loadUsuarios();
    setShowModal(false);
    toast.success(editingUser ? 'Usuario actualizado exitosamente' : 'Usuario creado exitosamente');
  };

  const handleChangePassword = () => {
    if (!passwordData.newPassword || passwordData.newPassword.length < 6) {
      toast.error('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('Las contraseñas no coinciden');
      return;
    }

    if (!changingPasswordUser) return;

    const usersData = localStorage.getItem('inventory_users');
    const users = usersData ? JSON.parse(usersData) : {};

    if (users[changingPasswordUser.email]) {
      users[changingPasswordUser.email].password = passwordData.newPassword;
      localStorage.setItem('inventory_users', JSON.stringify(users));
      loadUsuarios();
      setShowPasswordModal(false);
      toast.success('Contraseña actualizada exitosamente');
    }
  };

  const handleDelete = (user: Usuario) => {
    if (user.email === 'admin@empresa.com') {
      toast.error('No se puede eliminar el usuario administrador principal');
      return;
    }

    if (confirm(`¿Estás seguro de eliminar el usuario "${user.nombre}"?`)) {
      const usersData = localStorage.getItem('inventory_users');
      const users = usersData ? JSON.parse(usersData) : {};
      delete users[user.email];
      localStorage.setItem('inventory_users', JSON.stringify(users));
      loadUsuarios();
      toast.success('Usuario eliminado exitosamente');
    }
  };

  const filteredUsuarios = usuarios.filter(user =>
    user.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 p-3 rounded-xl">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">Gestión de Usuarios</h1>
                <p className="text-slate-600 text-sm">Administra los usuarios del sistema</p>
              </div>
            </div>
            <button
              onClick={handleOpenNew}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Nuevo Usuario
            </button>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por nombre o correo..."
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Lista de Usuarios */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Usuario</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Correo</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Rol</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Fecha Creación</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredUsuarios.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center">
                      <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                      <p className="text-slate-500">No hay usuarios registrados</p>
                    </td>
                  </tr>
                ) : (
                  filteredUsuarios.map((user, index) => (
                    <tr key={index} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="bg-blue-100 p-2 rounded-lg">
                            <UserIcon className="w-5 h-5 text-blue-600" />
                          </div>
                          <span className="font-medium text-slate-900">{user.nombre}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-slate-600">
                          <Mail className="w-4 h-4" />
                          {user.email}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                          user.rol === 'Administrador' || user.email === 'admin@empresa.com' 
                            ? 'bg-purple-100 text-purple-700' 
                            : 'bg-slate-100 text-slate-700'
                        }`}>
                          <Shield className="w-3 h-3" />
                          {user.rol || (user.email === 'admin@empresa.com' ? 'Administrador' : 'Usuario')}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-600 text-sm">
                        {user.createdAt ? new Date(user.createdAt).toLocaleDateString('es-CO') : 'N/A'}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleOpenPasswordChange(user)}
                            className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors"
                            title="Cambiar contraseña"
                          >
                            <Key className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleOpenEdit(user)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Editar"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(user)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Eliminar"
                            disabled={user.email === 'admin@empresa.com'}
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
        </div>

        {/* Total */}
        <div className="mt-4 text-center text-slate-600 text-sm">
          Total: <strong>{filteredUsuarios.length}</strong> usuario{filteredUsuarios.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Modal Crear/Editar Usuario */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-slate-900">
                  {editingUser ? 'Editar Usuario' : 'Nuevo Usuario'}
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                {/* Nombre */}
                <div>
                  <label className="block text-slate-700 mb-2 text-sm font-medium">
                    Nombre Completo *
                  </label>
                  <input
                    type="text"
                    value={formData.nombre}
                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Juan Pérez"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-slate-700 mb-2 text-sm font-medium">
                    Correo Electrónico *
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="usuario@empresa.com"
                    disabled={editingUser?.email === 'admin@empresa.com'}
                  />
                </div>

                {/* Rol */}
                <div>
                  <label className="block text-slate-700 mb-2 text-sm font-medium">
                    Rol
                  </label>
                  <select
                    value={formData.rol}
                    onChange={(e) => setFormData({ ...formData, rol: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={editingUser?.email === 'admin@empresa.com'}
                  >
                    <option value="Usuario">Usuario</option>
                    <option value="Administrador">Administrador</option>
                  </select>
                </div>

                {/* Contraseña */}
                <div>
                  <label className="block text-slate-700 mb-2 text-sm font-medium">
                    {editingUser ? 'Nueva Contraseña (dejar vacío para no cambiar)' : 'Contraseña *'}
                  </label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Mínimo 6 caracteres"
                    minLength={6}
                  />
                </div>

                {/* Confirmar Contraseña */}
                <div>
                  <label className="block text-slate-700 mb-2 text-sm font-medium">
                    Confirmar Contraseña
                  </label>
                  <input
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Repita la contraseña"
                    minLength={6}
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSave}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {editingUser ? 'Actualizar' : 'Crear'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Cambiar Contraseña */}
      {showPasswordModal && changingPasswordUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-slate-900">Cambiar Contraseña</h2>
                <button
                  onClick={() => setShowPasswordModal(false)}
                  className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-900">
                  <strong>Usuario:</strong> {changingPasswordUser.nombre}
                </p>
                <p className="text-sm text-blue-700">{changingPasswordUser.email}</p>
              </div>

              <div className="space-y-4">
                {/* Nueva Contraseña */}
                <div>
                  <label className="block text-slate-700 mb-2 text-sm font-medium">
                    Nueva Contraseña *
                  </label>
                  <input
                    type="password"
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Mínimo 6 caracteres"
                    minLength={6}
                  />
                </div>

                {/* Confirmar Contraseña */}
                <div>
                  <label className="block text-slate-700 mb-2 text-sm font-medium">
                    Confirmar Nueva Contraseña *
                  </label>
                  <input
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Repita la contraseña"
                    minLength={6}
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowPasswordModal(false)}
                  className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleChangePassword}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Cambiar Contraseña
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}