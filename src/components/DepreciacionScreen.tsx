import { useState } from 'react';
import { Calculator, Download } from 'lucide-react';
import { toast } from 'sonner';
import type { Activo } from '../types';
import * as XLSX from 'xlsx';

interface DepreciacionScreenProps {
  activos: Activo[];
}

interface ActivoDepreciado extends Activo {
  vidaUtil: number;
  tasaDepreciacion: number;
  depreciacionAnual: number;
  depreciacionAcumulada: number;
  valorLibros: number;
}

const VIDAS_UTILES: Record<string, number> = {
  'Muebles y Enseres': 10,
  'Equipos de Computación': 5,
  'Maquinaria y Equipo': 10,
  'Vehículos': 5,
  'Edificios': 20,
  'default': 10
};

export function DepreciacionScreen({ activos }: DepreciacionScreenProps) {
  const [activosDepreciados, setActivosDepreciados] = useState<ActivoDepreciado[]>([]);
  const [calculado, setCalculado] = useState(false);

  const calcularDepreciacion = () => {
    const fechaActual = new Date();
    
    const activosConDepreciacion = activos.map(activo => {
      const vidaUtil = VIDAS_UTILES[activo.grupo] || VIDAS_UTILES.default;
      const tasaDepreciacion = 100 / vidaUtil;
      
      const fechaIngreso = new Date(activo.fechaIngreso);
      const yearsTranscurridos = (fechaActual.getTime() - fechaIngreso.getTime()) / (1000 * 60 * 60 * 24 * 365.25);
      
      const depreciacionAnual = activo.valor / vidaUtil;
      const depreciacionAcumulada = Math.min(depreciacionAnual * yearsTranscurridos, activo.valor);
      const valorLibros = Math.max(activo.valor - depreciacionAcumulada, 0);

      return {
        ...activo,
        vidaUtil,
        tasaDepreciacion,
        depreciacionAnual,
        depreciacionAcumulada,
        valorLibros
      };
    });

    setActivosDepreciados(activosConDepreciacion);
    setCalculado(true);
    toast.success('Depreciación calculada exitosamente');
  };

  const exportarExcel = () => {
    if (!calculado || activosDepreciados.length === 0) {
      toast.error('Primero debes calcular la depreciación');
      return;
    }

    try {
      const datos = activosDepreciados.map(activo => ({
        'Código': activo.codigo,
        'Nombre': activo.nombre,
        'Grupo': activo.grupo,
        'Valor Original': activo.valor,
        'Vida Útil (años)': activo.vidaUtil,
        'Tasa Depreciación (%)': activo.tasaDepreciacion.toFixed(2),
        'Depreciación Anual': Math.round(activo.depreciacionAnual),
        'Depreciación Acumulada': Math.round(activo.depreciacionAcumulada),
        'Valor en Libros': Math.round(activo.valorLibros),
        'Fecha Ingreso': activo.fechaIngreso
      }));

      const ws = XLSX.utils.json_to_sheet(datos);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Depreciación');

      XLSX.writeFile(wb, `Depreciacion-${new Date().toISOString().split('T')[0]}.xlsx`);
      toast.success('Reporte exportado exitosamente');
    } catch (error) {
      console.error('Error exportando Excel:', error);
      toast.error('Error al exportar el reporte');
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(value);
  };

  const totalValorOriginal = activosDepreciados.reduce((sum, a) => sum + a.valor, 0);
  const totalDepreciacionAcumulada = activosDepreciados.reduce((sum, a) => sum + a.depreciacionAcumulada, 0);
  const totalValorLibros = activosDepreciados.reduce((sum, a) => sum + a.valorLibros, 0);

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Depreciación de Activos</h1>
          <p className="text-slate-600">Cálculo según normas colombianas</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={calcularDepreciacion}
            className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Calculator size={20} />
            Calcular Depreciación
          </button>
          {calculado && (
            <button
              onClick={exportarExcel}
              className="flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
            >
              <Download size={20} />
              Exportar a Excel
            </button>
          )}
        </div>
      </div>

      {calculado && activosDepreciados.length > 0 && (
        <>
          <div className="grid grid-cols-3 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg border border-slate-200">
              <p className="text-slate-600 text-sm mb-1">Valor Original Total</p>
              <p className="text-2xl font-bold text-slate-900">{formatCurrency(totalValorOriginal)}</p>
            </div>
            <div className="bg-white p-6 rounded-lg border border-slate-200">
              <p className="text-slate-600 text-sm mb-1">Depreciación Acumulada</p>
              <p className="text-2xl font-bold text-red-600">{formatCurrency(totalDepreciacionAcumulada)}</p>
            </div>
            <div className="bg-white p-6 rounded-lg border border-slate-200">
              <p className="text-slate-600 text-sm mb-1">Valor en Libros</p>
              <p className="text-2xl font-bold text-green-600">{formatCurrency(totalValorLibros)}</p>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="text-left p-4 font-semibold text-slate-700">Código</th>
                    <th className="text-left p-4 font-semibold text-slate-700">Nombre</th>
                    <th className="text-left p-4 font-semibold text-slate-700">Grupo</th>
                    <th className="text-right p-4 font-semibold text-slate-700">Valor Original</th>
                    <th className="text-center p-4 font-semibold text-slate-700">Vida Útil</th>
                    <th className="text-right p-4 font-semibold text-slate-700">Dep. Acumulada</th>
                    <th className="text-right p-4 font-semibold text-slate-700">Valor en Libros</th>
                  </tr>
                </thead>
                <tbody>
                  {activosDepreciados.map((activo, index) => (
                    <tr key={activo.id} className={index % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                      <td className="p-4 font-mono text-sm">{activo.codigo}</td>
                      <td className="p-4">{activo.nombre}</td>
                      <td className="p-4 text-sm text-slate-600">{activo.grupo}</td>
                      <td className="p-4 text-right font-medium">{formatCurrency(activo.valor)}</td>
                      <td className="p-4 text-center">{activo.vidaUtil} años</td>
                      <td className="p-4 text-right text-red-600">{formatCurrency(activo.depreciacionAcumulada)}</td>
                      <td className="p-4 text-right text-green-600 font-semibold">{formatCurrency(activo.valorLibros)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {!calculado && (
        <div className="bg-slate-50 rounded-lg p-12 text-center">
          <Calculator size={48} className="mx-auto text-slate-400 mb-4" />
          <p className="text-slate-600 text-lg">
            Haz clic en "Calcular Depreciación" para generar el reporte
          </p>
        </div>
      )}
    </div>
  );
}
