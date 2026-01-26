import { Activo, Cuentadante } from '../types';
import { Pencil, Trash2, Hash, Search, Image as ImageIcon } from 'lucide-react';
import { useState } from 'react';

interface ActivosListProps {
  activos: Activo[];
  cuentadantes: Cuentadante[];
  onEdit: (activo: Activo) => void;
  onDelete: (id: string) => void;
}

export function ActivosList({ activos, cuentadantes, onEdit, onDelete }: ActivosListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterEstado, setFilterEstado] = useState<string>('Todos');
  const [filterDependencia, setFilterDependencia] = useState<string>('Todas');
  const [selectedFoto, setSelectedFoto] = useState<string | null>(null);

  const dependencias = Array.from(new Set(activos.map(a => a.dependencia)));
  const estados = ['Todos', 'Activo', 'Inactivo', 'En mantenimiento', 'Dado de baja', 'Extraviado'];

  const filteredActivos = activos.filter(activo => {
    const matchesSearch = 
      activo.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      activo.marca.toLowerCase().includes(searchTerm.toLowerCase()) ||
      activo.modelo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      activo.qr.toLowerCase().includes(searchTerm.toLowerCase()) ||
      activo.serie.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesEstado = filterEstado === 'Todos' || activo.estado === filterEstado;
    const matchesDependencia = filterDependencia === 'Todas' || activo.dependencia === filterDependencia;

    return matchesSearch && matchesEstado && matchesDependencia;
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(value);
  };

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'Activo':
        return 'bg-green-100 text-green-800';
      case 'Inactivo':
        return 'bg-slate-100 text-slate-800';
      case 'En mantenimiento':
        return 'bg-yellow-100 text-yellow-800';
      case 'Dado de baja':
        return 'bg-red-100 text-red-800';
      case 'Extraviado':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-slate-100 text-slate-800';
    }
  };

  return (
    <div>
      {/* Filters */}
      <div className="p-6 border-b border-slate-200">
        <div className="flex gap-4 items-center">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por nombre, marca, modelo, código o serie..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
            />
          </div>
          <select
            value={filterDependencia}
            onChange={(e) => setFilterDependencia(e.target.value)}
            className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
          >
            <option value="Todas">Todas las dependencias</option>
            {dependencias.map(dep => (
              <option key={dep} value={dep}>{dep}</option>
            ))}
          </select>
          <select
            value={filterEstado}
            onChange={(e) => setFilterEstado(e.target.value)}
            className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
          >
            {estados.map(estado => (
              <option key={estado} value={estado}>{estado}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="px-6 py-3 text-left text-slate-700">Código</th>
              <th className="px-6 py-3 text-left text-slate-700">Nombre del Activo</th>
              <th className="px-6 py-3 text-left text-slate-700">Marca</th>
              <th className="px-6 py-3 text-left text-slate-700">Modelo</th>
              <th className="px-6 py-3 text-left text-slate-700">Serie</th>
              <th className="px-6 py-3 text-left text-slate-700">Dependencia</th>
              <th className="px-6 py-3 text-left text-slate-700">Valor</th>
              <th className="px-6 py-3 text-left text-slate-700">Fecha Ingreso</th>
              <th className="px-6 py-3 text-left text-slate-700">Estado</th>
              <th className="px-6 py-3 text-left text-slate-700">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredActivos.length === 0 ? (
              <tr>
                <td colSpan={10} className="px-6 py-12 text-center text-slate-500">
                  No se encontraron activos
                </td>
              </tr>
            ) : (
              filteredActivos.map((activo) => (
                <tr key={activo.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Hash className="w-4 h-4 text-slate-400" />
                      <span className="text-slate-900 font-medium">{activo.qr}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-900">{activo.nombre}</td>
                  <td className="px-6 py-4 text-slate-600">{activo.marca}</td>
                  <td className="px-6 py-4 text-slate-600">{activo.modelo}</td>
                  <td className="px-6 py-4 text-slate-600">{activo.serie}</td>
                  <td className="px-6 py-4 text-slate-600">{activo.dependencia}</td>
                  <td className="px-6 py-4 text-slate-900">{formatCurrency(activo.valor)}</td>
                  <td className="px-6 py-4 text-slate-600">
                    {new Date(activo.fechaIngreso).toLocaleDateString('es-CO')}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-sm ${getEstadoColor(activo.estado)}`}>
                      {activo.estado}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => onEdit(activo)}
                        className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                        title="Editar"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onDelete(activo.id)}
                        className="p-2 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Eliminar"
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

      {/* Summary */}
      <div className="px-6 py-4 bg-slate-50 border-t border-slate-200">
        <div className="flex justify-between items-center">
          <p className="text-slate-600">
            Mostrando {filteredActivos.length} de {activos.length} activos
          </p>
          <p className="text-slate-900">
            Valor total: {formatCurrency(filteredActivos.reduce((sum, a) => sum + a.valor, 0))}
          </p>
        </div>
      </div>

      {/* Modal de Foto */}
      {selectedFoto && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedFoto(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh]">
            <img
              src={selectedFoto}
              alt="Vista ampliada"
              className="max-w-full max-h-[90vh] rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />
            <button
              onClick={() => setSelectedFoto(null)}
              className="absolute top-4 right-4 p-2 bg-white rounded-full hover:bg-slate-100 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}