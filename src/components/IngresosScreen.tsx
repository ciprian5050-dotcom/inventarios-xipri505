import { useState, useEffect } from 'react';
import { PackagePlus, FileText, Calendar, Building2, Hash, DollarSign, Save, X, Edit2, Trash2, Eye, Download, Search, Plus } from 'lucide-react';
import { kvGet, kvSet, kvGetByPrefix } from '../utils/supabase/client';
import jsPDF from 'jspdf';

interface Ingreso {
  id: string;
  numeroIngreso: string;
  fechaIngreso: string;
  proveedor: string;
  nitProveedor: string;
  numeroFactura: string;
  fechaFactura: string;
  valorTotal: number;
  activos: ActivoIngreso[];
  observaciones: string;
  creadoPor: string;
  fechaCreacion: string;
}

interface ActivoIngreso {
  codigo: string;
  nombre: string;
  marca: string;
  modelo: string;
  serie: string;
  valor: number;
  cantidad: number;
}

export function IngresosScreen() {
  const [ingresos, setIngresos] = useState<Ingreso[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingIngreso, setEditingIngreso] = useState<Ingreso | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Formulario
  const [formData, setFormData] = useState<Partial<Ingreso>>({
    fechaIngreso: new Date().toISOString().split('T')[0],
    proveedor: '',
    nitProveedor: '',
    numeroFactura: '',
    fechaFactura: new Date().toISOString().split('T')[0],
    valorTotal: 0,
    activos: [],
    observaciones: '',
    creadoPor: 'Administrador'
  });

  // Formulario de activo temporal
  const [activoTemp, setActivoTemp] = useState<ActivoIngreso>({
    codigo: '',
    nombre: '',
    marca: '',
    modelo: '',
    serie: '',
    valor: 0,
    cantidad: 1
  });

  useEffect(() => {
    loadIngresos();
  }, []);

  const loadIngresos = async () => {
    try {
      setLoading(true);
      const data = await kvGetByPrefix('ingreso:');
      setIngresos(data.sort((a, b) => 
        new Date(b.fechaCreacion).getTime() - new Date(a.fechaCreacion).getTime()
      ));
    } catch (err) {
      console.error('Error cargando ingresos:', err);
    } finally {
      setLoading(false);
    }
  };

  const generateNumeroIngreso = () => {
    const year = new Date().getFullYear();
    const count = ingresos.length + 1;
    return `ING-${year}-${String(count).padStart(4, '0')}`;
  };

  const handleAddActivo = () => {
    if (!activoTemp.codigo || !activoTemp.nombre || activoTemp.valor <= 0) {
      alert('Por favor completa los campos obligatorios del activo');
      return;
    }

    const nuevosActivos = [...(formData.activos || []), { ...activoTemp }];
    const nuevoTotal = nuevosActivos.reduce((sum, a) => sum + (a.valor * a.cantidad), 0);

    setFormData({
      ...formData,
      activos: nuevosActivos,
      valorTotal: nuevoTotal
    });

    // Limpiar formulario de activo
    setActivoTemp({
      codigo: '',
      nombre: '',
      marca: '',
      modelo: '',
      serie: '',
      valor: 0,
      cantidad: 1
    });
  };

  const handleRemoveActivo = (index: number) => {
    const nuevosActivos = formData.activos?.filter((_, i) => i !== index) || [];
    const nuevoTotal = nuevosActivos.reduce((sum, a) => sum + (a.valor * a.cantidad), 0);
    
    setFormData({
      ...formData,
      activos: nuevosActivos,
      valorTotal: nuevoTotal
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.proveedor || !formData.numeroFactura || !formData.activos || formData.activos.length === 0) {
      alert('Por favor completa todos los campos obligatorios y agrega al menos un activo');
      return;
    }

    try {
      let ingresoData: Ingreso;

      if (editingIngreso) {
        ingresoData = {
          ...editingIngreso,
          ...formData as Ingreso
        };
      } else {
        ingresoData = {
          id: Date.now().toString(),
          numeroIngreso: generateNumeroIngreso(),
          fechaCreacion: new Date().toISOString(),
          ...formData
        } as Ingreso;
      }

      await kvSet(`ingreso:${ingresoData.id}`, ingresoData);
      await loadIngresos();
      
      setShowForm(false);
      setEditingIngreso(null);
      resetForm();
      
      alert('✅ Ingreso guardado exitosamente');
    } catch (err) {
      console.error('Error guardando ingreso:', err);
      alert('❌ Error al guardar el ingreso');
    }
  };

  const handleEdit = (ingreso: Ingreso) => {
    setEditingIngreso(ingreso);
    setFormData(ingreso);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este ingreso?')) return;

    try {
      const updatedIngresos = ingresos.filter(i => i.id !== id);
      setIngresos(updatedIngresos);
      
      // Eliminar de Supabase
      await kvSet(`ingreso:${id}`, null);
      await loadIngresos();
      
      alert('✅ Ingreso eliminado');
    } catch (err) {
      console.error('Error eliminando ingreso:', err);
      alert('❌ Error al eliminar el ingreso');
    }
  };

  const resetForm = () => {
    setFormData({
      fechaIngreso: new Date().toISOString().split('T')[0],
      proveedor: '',
      nitProveedor: '',
      numeroFactura: '',
      fechaFactura: new Date().toISOString().split('T')[0],
      valorTotal: 0,
      activos: [],
      observaciones: '',
      creadoPor: 'Administrador'
    });
    setActivoTemp({
      codigo: '',
      nombre: '',
      marca: '',
      modelo: '',
      serie: '',
      valor: 0,
      cantidad: 1
    });
  };

  const generatePDF = async (ingreso: Ingreso) => {
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      
      // Cargar configuración de empresa
      const config = await kvGet('configuracion_empresa') || {};

      // Header con logo
      if (config.logoUrl) {
        try {
          doc.addImage(config.logoUrl, 'PNG', 15, 10, 30, 30);
        } catch (e) {
          console.log('No se pudo cargar el logo');
        }
      }

      // Información de la empresa
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text(config.nombreEmpresa || 'EMPRESA', 50, 20);
      
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.text(config.nit ? `NIT: ${config.nit}` : '', 50, 26);
      doc.text(config.direccion || '', 50, 31);
      doc.text(config.telefono || '', 50, 36);

      // Título
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('ENTRADA DE ACTIVOS FIJOS', pageWidth / 2, 55, { align: 'center' });

      // Número de ingreso
      doc.setFontSize(11);
      doc.text(`No. ${ingreso.numeroIngreso}`, pageWidth / 2, 62, { align: 'center' });

      // Información del ingreso
      let yPos = 75;
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text('INFORMACIÓN GENERAL', 15, yPos);
      
      yPos += 7;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      
      // Tabla de información
      const infoData = [
        ['Fecha de Ingreso:', new Date(ingreso.fechaIngreso).toLocaleDateString('es-CO')],
        ['Proveedor:', ingreso.proveedor],
        ['NIT Proveedor:', ingreso.nitProveedor || 'N/A'],
        ['No. Factura:', ingreso.numeroFactura],
        ['Fecha Factura:', new Date(ingreso.fechaFactura).toLocaleDateString('es-CO')],
        ['Valor Total:', `$${ingreso.valorTotal.toLocaleString('es-CO')}`]
      ];

      infoData.forEach(([label, value]) => {
        doc.setFont('helvetica', 'bold');
        doc.text(label, 15, yPos);
        doc.setFont('helvetica', 'normal');
        doc.text(value, 60, yPos);
        yPos += 6;
      });

      // Activos ingresados
      yPos += 5;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.text('ACTIVOS INGRESADOS', 15, yPos);
      
      yPos += 5;
      
      // Tabla de activos
      const tableStartY = yPos;
      const colWidths = [25, 45, 25, 25, 25, 25, 25];
      const headers = ['Código', 'Nombre', 'Marca', 'Modelo', 'Serie', 'Cant.', 'Valor Unit.'];
      
      // Header de tabla
      doc.setFillColor(51, 51, 51);
      doc.rect(15, yPos, pageWidth - 30, 7, 'F');
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      
      let xPos = 15;
      headers.forEach((header, i) => {
        doc.text(header, xPos + 2, yPos + 5);
        xPos += colWidths[i];
      });
      
      yPos += 7;
      doc.setTextColor(0, 0, 0);
      doc.setFont('helvetica', 'normal');

      // Filas de activos
      ingreso.activos.forEach((activo, index) => {
        if (yPos > pageHeight - 30) {
          doc.addPage();
          yPos = 20;
        }

        // Fila alternada
        if (index % 2 === 0) {
          doc.setFillColor(245, 245, 245);
          doc.rect(15, yPos, pageWidth - 30, 6, 'F');
        }

        xPos = 15;
        const rowData = [
          activo.codigo,
          activo.nombre.substring(0, 25),
          activo.marca.substring(0, 15),
          activo.modelo.substring(0, 15),
          activo.serie.substring(0, 15),
          activo.cantidad.toString(),
          `$${activo.valor.toLocaleString('es-CO')}`
        ];

        rowData.forEach((text, i) => {
          doc.text(text, xPos + 2, yPos + 4);
          xPos += colWidths[i];
        });

        yPos += 6;
      });

      // Total
      yPos += 3;
      doc.setFont('helvetica', 'bold');
      doc.text('VALOR TOTAL:', pageWidth - 70, yPos);
      doc.text(`$${ingreso.valorTotal.toLocaleString('es-CO')}`, pageWidth - 30, yPos, { align: 'right' });

      // Observaciones
      if (ingreso.observaciones) {
        yPos += 10;
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9);
        doc.text('OBSERVACIONES:', 15, yPos);
        
        yPos += 5;
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        const obsLines = doc.splitTextToSize(ingreso.observaciones, pageWidth - 30);
        doc.text(obsLines, 15, yPos);
        yPos += obsLines.length * 4;
      }

      // Firmas
      yPos = pageHeight - 40;
      
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      
      // Recibido por
      doc.line(20, yPos, 80, yPos);
      doc.text('Recibido por', 50, yPos + 5, { align: 'center' });
      
      // Autorizado por
      doc.line(pageWidth - 80, yPos, pageWidth - 20, yPos);
      doc.text('Autorizado por', pageWidth - 50, yPos + 5, { align: 'center' });

      // Footer
      doc.setFontSize(7);
      doc.setTextColor(128, 128, 128);
      doc.text(
        `Generado el ${new Date().toLocaleString('es-CO')} | ${ingreso.numeroIngreso}`,
        pageWidth / 2,
        pageHeight - 10,
        { align: 'center' }
      );

      // Descargar
      doc.save(`Ingreso-${ingreso.numeroIngreso}.pdf`);
    } catch (err) {
      console.error('Error generando PDF:', err);
      alert('❌ Error al generar el PDF');
    }
  };

  const filteredIngresos = ingresos.filter(ingreso =>
    ingreso.numeroIngreso.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ingreso.proveedor.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ingreso.numeroFactura.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Cargando ingresos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-slate-900 mb-1">Ingresos de Activos</h2>
          <p className="text-slate-600">Registra la entrada de nuevos activos con factura</p>
        </div>
        <button
          onClick={() => {
            setShowForm(true);
            setEditingIngreso(null);
            resetForm();
          }}
          className="flex items-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-lg hover:bg-slate-800 transition-colors"
        >
          <PackagePlus className="w-5 h-5" />
          Nuevo Ingreso
        </button>
      </div>

      {/* Formulario */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl max-w-5xl w-full my-8">
            <div className="bg-slate-900 text-white px-6 py-4 rounded-t-xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <PackagePlus className="w-6 h-6" />
                <h3 className="text-lg font-semibold">
                  {editingIngreso ? 'Editar Ingreso' : 'Nuevo Ingreso de Activos'}
                </h3>
              </div>
              <button
                onClick={() => {
                  setShowForm(false);
                  setEditingIngreso(null);
                  resetForm();
                }}
                className="hover:bg-slate-800 p-2 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 max-h-[80vh] overflow-y-auto">
              {/* Datos de la factura */}
              <div className="bg-blue-50 rounded-lg p-6 mb-6">
                <h4 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-blue-600" />
                  Información de la Factura
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-700 mb-2 text-sm font-medium">
                      Fecha de Ingreso <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={formData.fechaIngreso}
                      onChange={(e) => setFormData({ ...formData, fechaIngreso: e.target.value })}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 mb-2 text-sm font-medium">
                      Proveedor <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.proveedor}
                      onChange={(e) => setFormData({ ...formData, proveedor: e.target.value })}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Nombre del proveedor"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 mb-2 text-sm font-medium">
                      NIT del Proveedor
                    </label>
                    <input
                      type="text"
                      value={formData.nitProveedor}
                      onChange={(e) => setFormData({ ...formData, nitProveedor: e.target.value })}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Ej: 900.123.456-7"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 mb-2 text-sm font-medium">
                      Número de Factura <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.numeroFactura}
                      onChange={(e) => setFormData({ ...formData, numeroFactura: e.target.value })}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Ej: FAC-2024-001"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 mb-2 text-sm font-medium">
                      Fecha de Factura <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={formData.fechaFactura}
                      onChange={(e) => setFormData({ ...formData, fechaFactura: e.target.value })}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 mb-2 text-sm font-medium">
                      Valor Total (calculado automáticamente)
                    </label>
                    <div className="flex items-center gap-2 px-4 py-2 bg-slate-100 border border-slate-300 rounded-lg">
                      <DollarSign className="w-5 h-5 text-slate-600" />
                      <span className="font-semibold text-slate-900">
                        ${formData.valorTotal?.toLocaleString('es-CO') || '0'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Agregar activos */}
              <div className="bg-green-50 rounded-lg p-6 mb-6">
                <h4 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                  <Plus className="w-5 h-5 text-green-600" />
                  Agregar Activos
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <label className="block text-slate-700 mb-2 text-sm">
                      Código <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={activoTemp.codigo}
                      onChange={(e) => setActivoTemp({ ...activoTemp, codigo: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                      placeholder="Ej: SIS-2-07-0001"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 mb-2 text-sm">
                      Nombre <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={activoTemp.nombre}
                      onChange={(e) => setActivoTemp({ ...activoTemp, nombre: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                      placeholder="Ej: Laptop Dell"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 mb-2 text-sm">Marca</label>
                    <input
                      type="text"
                      value={activoTemp.marca}
                      onChange={(e) => setActivoTemp({ ...activoTemp, marca: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                      placeholder="Ej: Dell"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 mb-2 text-sm">Modelo</label>
                    <input
                      type="text"
                      value={activoTemp.modelo}
                      onChange={(e) => setActivoTemp({ ...activoTemp, modelo: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                      placeholder="Ej: Latitude 5420"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 mb-2 text-sm">Serie</label>
                    <input
                      type="text"
                      value={activoTemp.serie}
                      onChange={(e) => setActivoTemp({ ...activoTemp, serie: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                      placeholder="Ej: ABC123456"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 mb-2 text-sm">Cantidad</label>
                    <input
                      type="number"
                      min="1"
                      value={activoTemp.cantidad}
                      onChange={(e) => setActivoTemp({ ...activoTemp, cantidad: parseInt(e.target.value) || 1 })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 mb-2 text-sm">
                      Valor Unitario <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={activoTemp.valor}
                      onChange={(e) => setActivoTemp({ ...activoTemp, valor: parseFloat(e.target.value) || 0 })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                      placeholder="0"
                    />
                  </div>

                  <div className="flex items-end">
                    <button
                      type="button"
                      onClick={handleAddActivo}
                      className="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      Agregar
                    </button>
                  </div>
                </div>

                {/* Lista de activos agregados */}
                {formData.activos && formData.activos.length > 0 && (
                  <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-slate-900 text-white">
                          <tr>
                            <th className="px-3 py-2 text-left">Código</th>
                            <th className="px-3 py-2 text-left">Nombre</th>
                            <th className="px-3 py-2 text-left">Marca</th>
                            <th className="px-3 py-2 text-left">Modelo</th>
                            <th className="px-3 py-2 text-center">Cant.</th>
                            <th className="px-3 py-2 text-right">Valor Unit.</th>
                            <th className="px-3 py-2 text-right">Subtotal</th>
                            <th className="px-3 py-2 text-center">Acción</th>
                          </tr>
                        </thead>
                        <tbody>
                          {formData.activos.map((activo, index) => (
                            <tr key={index} className="border-b border-slate-200 hover:bg-slate-50">
                              <td className="px-3 py-2">{activo.codigo}</td>
                              <td className="px-3 py-2">{activo.nombre}</td>
                              <td className="px-3 py-2">{activo.marca}</td>
                              <td className="px-3 py-2">{activo.modelo}</td>
                              <td className="px-3 py-2 text-center">{activo.cantidad}</td>
                              <td className="px-3 py-2 text-right">${activo.valor.toLocaleString('es-CO')}</td>
                              <td className="px-3 py-2 text-right font-semibold">
                                ${(activo.valor * activo.cantidad).toLocaleString('es-CO')}
                              </td>
                              <td className="px-3 py-2 text-center">
                                <button
                                  type="button"
                                  onClick={() => handleRemoveActivo(index)}
                                  className="text-red-600 hover:bg-red-50 p-1 rounded transition-colors"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>

              {/* Observaciones */}
              <div className="mb-6">
                <label className="block text-slate-700 mb-2 text-sm font-medium">
                  Observaciones
                </label>
                <textarea
                  value={formData.observaciones}
                  onChange={(e) => setFormData({ ...formData, observaciones: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                  placeholder="Notas adicionales sobre el ingreso..."
                />
              </div>

              {/* Botones */}
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingIngreso(null);
                    resetForm();
                  }}
                  className="px-6 py-2 text-slate-700 bg-slate-200 rounded-lg hover:bg-slate-300 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-2 bg-slate-900 text-white px-6 py-2 rounded-lg hover:bg-slate-800 transition-colors"
                >
                  <Save className="w-5 h-5" />
                  {editingIngreso ? 'Actualizar' : 'Guardar'} Ingreso
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Búsqueda */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por número de ingreso, proveedor o factura..."
            className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Lista de ingresos */}
      {filteredIngresos.length === 0 ? (
        <div className="bg-slate-50 border-2 border-dashed border-slate-300 rounded-lg p-12 text-center">
          <PackagePlus className="w-16 h-16 text-slate-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-slate-900 mb-2">
            {searchTerm ? 'No se encontraron resultados' : 'No hay ingresos registrados'}
          </h3>
          <p className="text-slate-600 mb-6">
            {searchTerm
              ? 'Intenta con otros términos de búsqueda'
              : 'Comienza registrando tu primer ingreso de activos'}
          </p>
          {!searchTerm && (
            <button
              onClick={() => {
                setShowForm(true);
                setEditingIngreso(null);
                resetForm();
              }}
              className="inline-flex items-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-lg hover:bg-slate-800 transition-colors"
            >
              <PackagePlus className="w-5 h-5" />
              Nuevo Ingreso
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredIngresos.map((ingreso) => (
            <div
              key={ingreso.id}
              className="bg-white border border-slate-200 rounded-lg p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-4">
                  <div className="bg-blue-100 p-3 rounded-lg">
                    <FileText className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">{ingreso.numeroIngreso}</h3>
                    <p className="text-sm text-slate-600">
                      Proveedor: <span className="font-medium">{ingreso.proveedor}</span>
                    </p>
                    <p className="text-sm text-slate-600">
                      Factura: <span className="font-medium">{ingreso.numeroFactura}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => generatePDF(ingreso)}
                    className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                    title="Descargar PDF"
                  >
                    <Download className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleEdit(ingreso)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Editar"
                  >
                    <Edit2 className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleDelete(ingreso.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Eliminar"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div>
                  <p className="text-xs text-slate-500 mb-1">Fecha Ingreso</p>
                  <p className="text-sm font-medium text-slate-900">
                    {new Date(ingreso.fechaIngreso).toLocaleDateString('es-CO')}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-1">Fecha Factura</p>
                  <p className="text-sm font-medium text-slate-900">
                    {new Date(ingreso.fechaFactura).toLocaleDateString('es-CO')}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-1">Activos</p>
                  <p className="text-sm font-medium text-slate-900">{ingreso.activos.length}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-1">Valor Total</p>
                  <p className="text-sm font-semibold text-green-600">
                    ${ingreso.valorTotal.toLocaleString('es-CO')}
                  </p>
                </div>
              </div>

              {ingreso.observaciones && (
                <div className="bg-slate-50 rounded p-3">
                  <p className="text-xs text-slate-500 mb-1">Observaciones</p>
                  <p className="text-sm text-slate-700">{ingreso.observaciones}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Resumen */}
      {filteredIngresos.length > 0 && (
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <p className="text-sm text-blue-700 mb-1">Total Ingresos</p>
              <p className="text-3xl font-bold text-blue-900">{filteredIngresos.length}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-blue-700 mb-1">Total Activos Ingresados</p>
              <p className="text-3xl font-bold text-blue-900">
                {filteredIngresos.reduce((sum, ing) => sum + ing.activos.length, 0)}
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-blue-700 mb-1">Valor Total Acumulado</p>
              <p className="text-3xl font-bold text-blue-900">
                ${filteredIngresos.reduce((sum, ing) => sum + ing.valorTotal, 0).toLocaleString('es-CO')}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
