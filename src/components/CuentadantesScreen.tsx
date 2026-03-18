import { useState } from 'react';
import { Users, Plus, Edit2, Trash2, Mail, Phone, Building2, Package, DollarSign } from 'lucide-react';
import type { Cuentadante, Activo } from '../types';

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
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    nombre: '',
    identificacion: '',
    cargo: '',
    dependencia: '',
    email: '',
    telefono: ''
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const getActivosPorCuentadante = (cuentadante: Cuentadante) => {
    const activosDependencia = Array.isArray(activos) ? activos.filter(a => 
      a.dependencia === cuentadante.dependencia
    ) : [];
    
    const valorTotal = activosDependencia.reduce((sum, a) => sum + (a.valorCompra || 0), 0);
    
    return {
      cantidad: activosDependencia.length,
      valorTotal
    };
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nombre || !formData.identificacion || !formData.cargo || !formData.dependencia) {
      alert('Por favor completa todos los campos obligatorios');
      return;
    }

    // Validar formato de email si se proporciona
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      alert('Por favor ingresa un email válido');
      return;
    }

    // Validar duplicados de identificación (excepto al editar el mismo registro)
    const existeDuplicado = Array.isArray(cuentadantes) ? cuentadantes.some(c => 
      c.identificacion.toLowerCase() === formData.identificacion.toLowerCase() && 
      c.id !== editingId
    ) : false;

    if (existeDuplicado) {
      alert('Ya existe un cuentadante con esta identificación');
      return;
    }

    if (editingId) {
      onUpdateCuentadante(editingId, formData);
    } else {
      onAddCuentadante(formData);
    }

    resetForm();
  };

  const handleEdit = (id: string) => {
    const cuentadante = Array.isArray(cuentadantes) ? cuentadantes.find(c => c.id === id) : null;
    if (cuentadante) {
      setFormData({
        nombre: cuentadante.nombre,
        identificacion: cuentadante.identificacion,
        cargo: cuentadante.cargo,
        dependencia: cuentadante.dependencia,
        email: cuentadante.email || '',
        telefono: cuentadante.telefono || ''
      });
      setEditingId(id);
      setShowForm(true);
    }
  };

  const handleDelete = (id: string) => {
    const cuentadante = Array.isArray(cuentadantes) ? cuentadantes.find(c => c.id === id) : null;
    if (!cuentadante) return;

    // Verificar si tiene activos asignados
    const activosDependencia = Array.isArray(activos) ? activos.filter(a => 
      a.dependencia === cuentadante.dependencia
    ) : [];

    if (activosDependencia.length > 0) {
      if (!window.confirm(
        `El cuentadante "${cuentadante.nombre}" tiene ${activosDependencia.length} activo(s) asignado(s) en su dependencia.\n\n` +
        `Si eliminas este cuentadante, los activos permanecerán en la dependencia "${cuentadante.dependencia}".\n\n` +
        `¿Estás seguro de continuar?`
      )) {
        return;
      }
    } else {
      if (!window.confirm(`¿Estás seguro de eliminar al cuentadante "${cuentadante.nombre}"?`)) {
        return;
      }
    }

    onDeleteCuentadante(id);
  };

  const resetForm = () => {
    setFormData({
      nombre: '',
      identificacion: '',
      cargo: '',
      dependencia: '',
      email: '',
      telefono: ''
    });
    setEditingId(null);
    setShowForm(false);
  };

  // Validar que cuentadantes sea un array antes de hacer cualquier operación
  const cuentadantesArray = Array.isArray(cuentadantes) ? cuentadantes : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Cuentadantes</h1>
          <p className="text-slate-600 mt-1">
            Gestiona los responsables de activos por dependencia
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Agregar Cuentadante
        </button>
      </div>

      {/* Formulario */}
      {showForm && (
        <div className="bg-white p-6 rounded-lg border border-slate-200">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">
            {editingId ? 'Editar Cuentadante' : 'Nuevo Cuentadante'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Nombre Completo *
                </label>
                <input
                  type="text"
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500"
                  placeholder="Ej: Juan Pérez García"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Identificación *
                </label>
                <input
                  type="text"
                  value={formData.identificacion}
                  onChange={(e) => setFormData({ ...formData, identificacion: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500"
                  placeholder="Ej: 1234567890"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Cargo *
                </label>
                <input
                  type="text"
                  value={formData.cargo}
                  onChange={(e) => setFormData({ ...formData, cargo: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500"
                  placeholder="Ej: Coordinador de Sistemas"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Dependencia *
                </label>
                <select
                  value={formData.dependencia}
                  onChange={(e) => setFormData({ ...formData, dependencia: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500"
                  required
                >
                  <option value="">Seleccionar...</option>
                  {dependencias.map(dep => (
                    <option key={dep} value={dep}>{dep}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500"
                  placeholder="ejemplo@hospital.gov.co"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Teléfono
                </label>
                <input
                  type="tel"
                  value={formData.telefono}
                  onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500"
                  placeholder="3001234567"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                className="px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors"
              >
                {editingId ? 'Actualizar' : 'Guardar'}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Lista de Cuentadantes */}
      {cuentadantesArray.length === 0 ? (
        <div className="bg-white p-12 rounded-lg border border-slate-200 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-100 rounded-full mb-4">
            <Users className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 mb-2">
            No hay cuentadantes registrados
          </h3>
          <p className="text-slate-600">
            Comienza agregando tu primer cuentadante
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cuentadantesArray.map((cuentadante) => {
            const stats = getActivosPorCuentadante(cuentadante);
            return (
              <div
                key={cuentadante.id}
                className="bg-white rounded-lg border border-slate-200 overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="bg-slate-50 border-b border-slate-200 px-6 py-4">
                  <h3 className="font-semibold text-slate-900">{cuentadante.nombre}</h3>
                  <p className="text-sm text-slate-600">{cuentadante.cargo}</p>
                </div>

                <div className="p-6 space-y-3">
                  <div className="flex items-center gap-2 text-sm text-slate-700">
                    <Building2 className="w-4 h-4 text-slate-400" />
                    <span>{cuentadante.dependencia}</span>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-slate-700">
                    <span className="font-medium">ID:</span>
                    <span className="font-mono">{cuentadante.identificacion}</span>
                  </div>

                  {cuentadante.email && (
                    <div className="flex items-center gap-2 text-sm text-slate-700">
                      <Mail className="w-4 h-4 text-slate-400" />
                      <span className="truncate">{cuentadante.email}</span>
                    </div>
                  )}

                  {cuentadante.telefono && (
                    <div className="flex items-center gap-2 text-sm text-slate-700">
                      <Phone className="w-4 h-4 text-slate-400" />
                      <span>{cuentadante.telefono}</span>
                    </div>
                  )}

                  <div className="pt-3 mt-3 border-t border-slate-200">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="flex items-center gap-2 text-slate-600 mb-1">
                          <Package className="w-4 h-4" />
                          <span className="text-xs">Activos</span>
                        </div>
                        <p className="text-lg font-bold text-slate-900">{stats.cantidad}</p>
                      </div>
                      <div>
                        <div className="flex items-center gap-2 text-slate-600 mb-1">
                          <DollarSign className="w-4 h-4" />
                          <span className="text-xs">Valor Total</span>
                        </div>
                        <p className="text-sm font-bold text-slate-900">
                          {formatCurrency(stats.valorTotal)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-50 border-t border-slate-200 px-6 py-3 flex gap-2">
                  <button
                    onClick={() => handleEdit(cuentadante.id)}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm text-slate-700 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(cuentadante.id)}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm text-slate-700 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    Eliminar
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
