import { useState, useMemo } from 'react';
import { Search, Filter, Edit2, Trash2, Package, AlertCircle } from 'lucide-react';
import type { Activo } from '../types';

interface ActivosListProps {
  activos: Activo[];
  onEdit: (activo: Activo) => void;
  onDelete: (id: string) => void;
  dependencias: string[];
}

export function ActivosList({ activos, onEdit, onDelete, dependencias }: ActivosListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDependencia, setFilterDependencia] = useState('');
  const [filterEstado, setFilterEstado] = useState('');

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const getEstadoBadgeClass = (estado: string) => {
    switch (estado) {
      case 'Activo':
        return 'bg-green-100 text-green-800';
      case 'Inactivo':
        return 'bg-gray-100 text-gray-800';
      case 'En Mantenimiento':
        return 'bg-yellow-100 text-yellow-800';
      case 'Dado de Baja':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-slate-100 text-slate-800';
    }
  };

  // Filtrar y buscar activos con validación Array.isArray()
  const activosFiltrados = useMemo(() => {
    return Array.isArray(activos) ? activos.filter(activo => {
      const matchesSearch = 
        activo.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        activo.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (activo.marca && activo.marca.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (activo.modelo && activo.modelo.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (activo.serie && activo.serie.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesDependencia = !filterDependencia || activo.dependencia === filterDependencia;
      const matchesEstado = !filterEstado || activo.estado === filterEstado;

      return matchesSearch && matchesDependencia && matchesEstado;
    }) : [];
  }, [activos, searchTerm, filterDependencia, filterEstado]);

  const handleDelete = (id: string) => {
    const activo = Array.isArray(activos) ? activos.find(a => a.id === id) : null;
    if (!activo) return;

    if (window.confirm(`¿Estás seguro de eliminar el activo "${activo.nombre}" (${activo.codigo})?`)) {
      onDelete(id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Lista de Activos</h1>
          <p className="text-slate-600 mt-1">
            {activosFiltrados.length} activos encontrados
          </p>
        </div>
      </div>

      {/* Filtros y Búsqueda */}
      <div className="bg-white p-4 rounded-lg border border-slate-200">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Búsqueda */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Buscar
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar por código, nombre, marca, modelo o serie..."
                className="w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500"
              />
            </div>
          </div>

          {/* Filtro por Dependencia */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Dependencia
            </label>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
              <select
                value={filterDependencia}
                onChange={(e) => setFilterDependencia(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 appearance-none bg-white"
              >
                <option value="">Todas</option>
                {dependencias.map(dep => (
                  <option key={dep} value={dep}>{dep}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Filtro por Estado */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Estado
            </label>
            <select
              value={filterEstado}
              onChange={(e) => setFilterEstado(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 appearance-none bg-white"
            >
              <option value="">Todos</option>
              <option value="Activo">Activo</option>
              <option value="Inactivo">Inactivo</option>
              <option value="En Mantenimiento">En Mantenimiento</option>
              <option value="Dado de Baja">Dado de Baja</option>
            </select>
          </div>
        </div>

        {/* Botón limpiar filtros */}
        {(searchTerm || filterDependencia || filterEstado) && (
          <div className="mt-4">
            <button
              onClick={() => {
                setSearchTerm('');
                setFilterDependencia('');
                setFilterEstado('');
              }}
              className="text-sm text-slate-600 hover:text-slate-900 underline"
            >
              Limpiar filtros
            </button>
          </div>
        )}
      </div>

      {/* Lista de Activos */}
      {activosFiltrados.length === 0 ? (
        <div className="bg-white p-12 rounded-lg border border-slate-200 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-100 rounded-full mb-4">
            {searchTerm || filterDependencia || filterEstado ? (
              <AlertCircle className="w-8 h-8 text-slate-400" />
            ) : (
              <Package className="w-8 h-8 text-slate-400" />
            )}
          </div>
          <h3 className="text-lg font-semibold text-slate-900 mb-2">
            {searchTerm || filterDependencia || filterEstado 
              ? 'No se encontraron activos'
              : 'No hay activos registrados'}
          </h3>
          <p className="text-slate-600">
            {searchTerm || filterDependencia || filterEstado
              ? 'Intenta cambiar los filtros de búsqueda'
              : 'Comienza agregando tu primer activo'}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">
                    Código
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">
                    Nombre
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">
                    Marca/Modelo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">
                    Serie
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">
                    Dependencia
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">
                    Valor
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-slate-700 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {activosFiltrados.map((activo) => (
                  <tr key={activo.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-mono font-medium text-slate-900">
                        {activo.codigo}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-slate-900">
                        {activo.nombre}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-slate-700">
                        {activo.marca && activo.modelo 
                          ? `${activo.marca} ${activo.modelo}`
                          : activo.marca || activo.modelo || '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-slate-700 font-mono">
                        {activo.serie || '-'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-slate-700">
                        {activo.dependencia}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getEstadoBadgeClass(activo.estado)}`}>
                        {activo.estado}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-slate-900">
                        {formatCurrency(activo.valorCompra || 0)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => onEdit(activo)}
                          className="p-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Editar"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(activo.id)}
                          className="p-2 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Eliminar"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
