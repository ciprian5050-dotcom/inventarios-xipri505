import { Cuentadante } from '../types';
import { Pencil, Trash2, Search, Building2, Mail, Phone, IdCard, Briefcase } from 'lucide-react';
import { useState } from 'react';

interface CuentadantesListProps {
  cuentadantes: Cuentadante[];
  onEdit: (cuentadante: Cuentadante) => void;
  onDelete: (id: string) => void;
}

export function CuentadantesList({ cuentadantes, onEdit, onDelete }: CuentadantesListProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredCuentadantes = cuentadantes.filter(cuentadante => {
    const matchesSearch = 
      (cuentadante.nombre || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (cuentadante.cedula || '').includes(searchTerm) ||
      (cuentadante.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (cuentadante.telefono || '').includes(searchTerm) ||
      (cuentadante.cargo || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (cuentadante.dependencia || '').toLowerCase().includes(searchTerm.toLowerCase());

    return matchesSearch;
  });

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200">
      {/* Filters */}
      <div className="p-6 border-b border-slate-200">
        <div className="flex gap-4 items-center">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por nombre, cédula, correo, teléfono, cargo o dependencia..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="px-6 py-3 text-left text-slate-700">Nombre</th>
              <th className="px-6 py-3 text-left text-slate-700">Cédula</th>
              <th className="px-6 py-3 text-left text-slate-700">Cargo</th>
              <th className="px-6 py-3 text-left text-slate-700">Dependencia</th>
              <th className="px-6 py-3 text-left text-slate-700">Contacto</th>
              <th className="px-6 py-3 text-left text-slate-700">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredCuentadantes.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                  {searchTerm ? 'No se encontraron cuentadantes con ese criterio de búsqueda' : 'No hay cuentadantes registrados. Crea uno nuevo para comenzar.'}
                </td>
              </tr>
            ) : (
              filteredCuentadantes.map((cuentadante) => {
                const iniciales = (cuentadante.nombre || 'NN').split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
                return (
                  <tr key={cuentadante.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-slate-900 rounded-full flex items-center justify-center">
                          <span className="text-white text-sm font-medium">
                            {iniciales}
                          </span>
                        </div>
                        <span className="text-slate-900 font-medium">{cuentadante.nombre}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-slate-600">
                        <IdCard className="w-4 h-4 text-slate-400" />
                        {cuentadante.cedula}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-slate-600">
                        <Briefcase className="w-4 h-4 text-slate-400" />
                        {cuentadante.cargo}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-slate-400" />
                        <span className="text-slate-900">{cuentadante.dependencia}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        {cuentadante.email && (
                          <div className="flex items-center gap-2 text-slate-600 text-sm">
                            <Mail className="w-3 h-3 text-slate-400" />
                            {cuentadante.email}
                          </div>
                        )}
                        {cuentadante.telefono && (
                          <div className="flex items-center gap-2 text-slate-600 text-sm">
                            <Phone className="w-3 h-3 text-slate-400" />
                            {cuentadante.telefono}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => onEdit(cuentadante)}
                          className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                          title="Editar"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onDelete(cuentadante.id)}
                          className="p-2 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Eliminar"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Summary */}
      <div className="px-6 py-4 bg-slate-50 border-t border-slate-200">
        <p className="text-slate-600">
          Mostrando {filteredCuentadantes.length} de {cuentadantes.length} cuentadantes
        </p>
      </div>
    </div>
  );
}