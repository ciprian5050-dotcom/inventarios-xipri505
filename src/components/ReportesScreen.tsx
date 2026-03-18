import { useState, useMemo } from 'react';
import { FileText, Download, Filter, TrendingUp, Package, DollarSign } from 'lucide-react';
import type { Activo } from '../types';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

interface ReportesScreenProps {
  activos: Activo[];
  dependencias: string[];
}

interface Filters {
  dependencia: string;
  estado: string;
  fechaInicio: string;
  fechaFin: string;
}

function groupBy<T>(array: T[], key: keyof T): Record<string, T[]> {
  return array.reduce((result, item) => {
    const group = String(item[key]);
    if (!result[group]) result[group] = [];
    result[group].push(item);
    return result;
  }, {} as Record<string, T[]>);
}

export function ReportesScreen({ activos, dependencias }: ReportesScreenProps) {
  const [filters, setFilters] = useState<Filters>({
    dependencia: '',
    estado: '',
    fechaInicio: '',
    fechaFin: ''
  });

  // Estadísticas generales con validación Array.isArray()
  const totalActivos = Array.isArray(activos) ? activos.length : 0;
  const valorTotal = Array.isArray(activos) ? activos.reduce((sum, a) => sum + (a.valorCompra || 0), 0) : 0;
  const porDependencia = Array.isArray(activos) ? groupBy(activos, 'dependencia') : {};
  const porEstado = Array.isArray(activos) ? groupBy(activos, 'estado') : {};

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  // Filtrar activos con validación Array.isArray()
  const activosFiltrados = useMemo(() => {
    return Array.isArray(activos) ? activos.filter((activo) => {
      // Filtro por dependencia
      if (filters.dependencia && activo.dependencia !== filters.dependencia) {
        return false;
      }

      // Filtro por estado
      if (filters.estado && activo.estado !== filters.estado) {
        return false;
      }

      // Filtro por fecha
      if (filters.fechaInicio || filters.fechaFin) {
        const fechaActivo = new Date(activo.fechaIngreso);
        
        if (filters.fechaInicio) {
          const fechaInicio = new Date(filters.fechaInicio);
          if (fechaActivo < fechaInicio) return false;
        }
        
        if (filters.fechaFin) {
          const fechaFin = new Date(filters.fechaFin);
          if (fechaActivo > fechaFin) return false;
        }
      }

      return true;
    }) : [];
  }, [activos, filters]);

  const generarPDF = () => {
    const doc = new jsPDF();
    
    // Título
    doc.setFontSize(18);
    doc.text('Reporte de Inventario de Activos Fijos', 14, 20);
    
    doc.setFontSize(11);
    doc.text('E.S.E Hospital Julio Méndez Barreneche', 14, 28);
    doc.text(`Fecha: ${new Date().toLocaleDateString('es-CO')}`, 14, 34);
    
    // Resumen
    doc.setFontSize(12);
    doc.text('Resumen General:', 14, 44);
    doc.setFontSize(10);
    doc.text(`Total de Activos: ${totalActivos}`, 14, 50);
    doc.text(`Valor Total: ${formatCurrency(valorTotal)}`, 14, 56);
    
    // Tabla de activos
    const tableData = activosFiltrados.map(activo => [
      activo.codigo,
      activo.nombre,
      activo.dependencia,
      activo.estado,
      formatCurrency(activo.valorCompra || 0),
      new Date(activo.fechaIngreso).toLocaleDateString('es-CO')
    ]);

    (doc as any).autoTable({
      startY: 65,
      head: [['Código', 'Nombre', 'Dependencia', 'Estado', 'Valor', 'Fecha Ingreso']],
      body: tableData,
      theme: 'grid',
      styles: { fontSize: 8 },
      headStyles: { fillColor: [71, 85, 105] }
    });

    doc.save(`reporte-activos-${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const generarCSV = () => {
    const headers = ['Código', 'Nombre', 'Marca', 'Modelo', 'Serie', 'Dependencia', 'Estado', 'Valor', 'Fecha Ingreso'];
    const rows = activosFiltrados.map(activo => [
      activo.codigo,
      activo.nombre,
      activo.marca || '',
      activo.modelo || '',
      activo.serie || '',
      activo.dependencia,
      activo.estado,
      activo.valorCompra || 0,
      new Date(activo.fechaIngreso).toLocaleDateString('es-CO')
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `reporte-activos-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Reportes</h1>
          <p className="text-slate-600 mt-1">Genera y exporta reportes de inventario</p>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg border border-slate-200">
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 p-3 rounded-lg">
              <Package className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-slate-600 text-sm">Total Activos</p>
              <p className="text-2xl font-bold text-slate-900">{totalActivos}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-slate-200">
          <div className="flex items-center gap-3">
            <div className="bg-green-100 p-3 rounded-lg">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-slate-600 text-sm">Valor Total</p>
              <p className="text-2xl font-bold text-slate-900">{formatCurrency(valorTotal)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-slate-200">
          <div className="flex items-center gap-3">
            <div className="bg-purple-100 p-3 rounded-lg">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-slate-600 text-sm">Dependencias</p>
              <p className="text-2xl font-bold text-slate-900">{Object.keys(porDependencia).length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white p-6 rounded-lg border border-slate-200">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-5 h-5 text-slate-600" />
          <h2 className="text-lg font-semibold text-slate-900">Filtros</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Dependencia
            </label>
            <select
              value={filters.dependencia}
              onChange={(e) => setFilters({ ...filters, dependencia: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500"
            >
              <option value="">Todas</option>
              {dependencias.map(dep => (
                <option key={dep} value={dep}>{dep}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Estado
            </label>
            <select
              value={filters.estado}
              onChange={(e) => setFilters({ ...filters, estado: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500"
            >
              <option value="">Todos</option>
              <option value="Activo">Activo</option>
              <option value="Inactivo">Inactivo</option>
              <option value="En Mantenimiento">En Mantenimiento</option>
              <option value="Dado de Baja">Dado de Baja</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Fecha Inicio
            </label>
            <input
              type="date"
              value={filters.fechaInicio}
              onChange={(e) => setFilters({ ...filters, fechaInicio: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Fecha Fin
            </label>
            <input
              type="date"
              value={filters.fechaFin}
              onChange={(e) => setFilters({ ...filters, fechaFin: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500"
            />
          </div>
        </div>

        <div className="mt-4 flex gap-3">
          <button
            onClick={() => setFilters({ dependencia: '', estado: '', fechaInicio: '', fechaFin: '' })}
            className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
          >
            Limpiar Filtros
          </button>
        </div>
      </div>

      {/* Botones de Exportación */}
      <div className="bg-white p-6 rounded-lg border border-slate-200">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Exportar Reporte</h2>
        <div className="flex gap-3">
          <button
            onClick={generarPDF}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            <FileText className="w-5 h-5" />
            Exportar PDF
          </button>
          <button
            onClick={generarCSV}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Download className="w-5 h-5" />
            Exportar CSV
          </button>
        </div>
      </div>

      {/* Resumen por Dependencia */}
      <div className="bg-white p-6 rounded-lg border border-slate-200">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Resumen por Dependencia</h2>
        <div className="space-y-2">
          {Object.entries(porDependencia).map(([dep, items]) => (
            <div key={dep} className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
              <span className="font-medium text-slate-900">{dep}</span>
              <div className="flex gap-4">
                <span className="text-slate-600">{items.length} activos</span>
                <span className="text-slate-900 font-semibold">
                  {formatCurrency(items.reduce((sum, a) => sum + (a.valorCompra || 0), 0))}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Resumen por Estado */}
      <div className="bg-white p-6 rounded-lg border border-slate-200">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Resumen por Estado</h2>
        <div className="space-y-2">
          {Object.entries(porEstado).map(([estado, items]) => (
            <div key={estado} className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
              <span className="font-medium text-slate-900">{estado}</span>
              <div className="flex gap-4">
                <span className="text-slate-600">{items.length} activos</span>
                <span className="text-slate-900 font-semibold">
                  {formatCurrency(items.reduce((sum, a) => sum + (a.valorCompra || 0), 0))}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
