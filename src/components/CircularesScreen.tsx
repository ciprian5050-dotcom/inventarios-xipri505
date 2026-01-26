import { useState, useEffect } from 'react';
import { FileText, Plus, Download, Eye, Trash2, X, Archive, Send } from 'lucide-react';
import jsPDF from 'jspdf';
import { toast } from 'sonner';
import { kvGet, kvSet } from '../utils/supabase/client';

interface Circular {
  id: string;
  numero: string;
  fecha: string;
  para: string;
  asunto: string;
  contenido: string;
  estado: 'Pendiente' | 'Enviada' | 'Archivada';
}

interface Dependencia {
  id: string;
  nombre: string;
  codigo: string;
}

export function CircularesScreen() {
  const [circulares, setCirculares] = useState<Circular[]>([]);
  const [dependencias, setDependencias] = useState<Dependencia[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingCircular, setEditingCircular] = useState<Circular | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const loadedCirculares = await kvGet('circulares') || [];
      const loadedDependencias = await kvGet('dependencias') || [];

      setCirculares(Array.isArray(loadedCirculares) ? loadedCirculares : []);
      setDependencias(Array.isArray(loadedDependencias) ? loadedDependencias : []);
    } catch (error) {
      console.error('Error cargando datos:', error);
      toast.error('Error al cargar las circulares');
      setCirculares([]);
      setDependencias([]);
    } finally {
      setLoading(false);
    }
  };

  const saveCirculares = async (newCirculares: Circular[]) => {
    try {
      await kvSet('circulares', newCirculares);
      setCirculares(newCirculares);
    } catch (error) {
      console.error('Error guardando circulares:', error);
      toast.error('Error al guardar las circulares');
      throw error;
    }
  };

  const handleSave = async (circular: Partial<Circular>) => {
    try {
      if (editingCircular) {
        // Editar circular existente
        const updated = circulares.map(c => 
          c.id === editingCircular.id ? { ...editingCircular, ...circular } : c
        );
        await saveCirculares(updated);
        toast.success('Circular actualizada exitosamente');
      } else {
        // Crear nueva circular
        const newCircular: Circular = {
          id: crypto.randomUUID(),
          numero: `CIR-${String(circulares.length + 1).padStart(4, '0')}`,
          estado: 'Pendiente',
          ...circular
        } as Circular;
        await saveCirculares([...circulares, newCircular]);
        toast.success('Circular creada exitosamente');
      }
      setShowForm(false);
      setEditingCircular(null);
    } catch (error) {
      // El error ya se mostró en saveCirculares
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('¿Está seguro de eliminar esta circular?')) {
      try {
        const updated = circulares.filter(c => c.id !== id);
        await saveCirculares(updated);
        toast.success('Circular eliminada');
      } catch (error) {
        // El error ya se mostró en saveCirculares
      }
    }
  };

  const handleEdit = (circular: Circular) => {
    setEditingCircular(circular);
    setShowForm(true);
  };

  const cambiarEstado = async (id: string, nuevoEstado: 'Pendiente' | 'Enviada' | 'Archivada') => {
    try {
      const updated = circulares.map(c => 
        c.id === id ? { ...c, estado: nuevoEstado } : c
      );
      await saveCirculares(updated);
      toast.success(`Circular ${nuevoEstado.toLowerCase()}`);
    } catch (error) {
      // El error ya se mostró en saveCirculares
    }
  };

  const generarPDF = async (circular: Circular) => {
    const doc = new jsPDF();
    const configuracion = await kvGet('configuracion_empresa') || null;

    let currentY = 15;

    // Logo si existe - centrado arriba
    if (configuracion?.logoUrl) {
      try {
        const logoWidth = 150;
        const logoHeight = 25;
        const logoX = (doc.internal.pageSize.width - logoWidth) / 2;
        doc.addImage(configuracion.logoUrl, 'PNG', logoX, currentY, logoWidth, logoHeight);
        currentY += logoHeight + 8;
      } catch (e) {
        console.error('Error al cargar logo:', e);
      }
    }

    // Nombre de la empresa centrado
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    const nombreEmpresa = configuracion?.nombreEmpresa || 'Inventario de Activos Fijos';
    const nombreWidth = doc.getTextWidth(nombreEmpresa);
    const nombreX = (doc.internal.pageSize.width - nombreWidth) / 2;
    doc.text(nombreEmpresa, nombreX, currentY);
    currentY += 6;
    
    // NIT centrado
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    if (configuracion?.nit) {
      const nitText = `NIT: ${configuracion.nit}`;
      const nitWidth = doc.getTextWidth(nitText);
      const nitX = (doc.internal.pageSize.width - nitWidth) / 2;
      doc.text(nitText, nitX, currentY);
      currentY += 10;
    } else {
      currentY += 5;
    }

    currentY += 10;

    // Información en dos columnas (DE/PARA a la izquierda, ALMACÉN/CONTABILIDAD a la derecha)
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    
    const leftColumn = 20;
    const rightColumn = 110;
    let leftY = currentY;
    
    // Columna izquierda - ETIQUETAS
    doc.text('DE', leftColumn, leftY);
    leftY += 6;
    doc.text('PARA', leftColumn, leftY);
    leftY += 6;
    doc.text('ASUNTO', leftColumn, leftY);
    leftY += 6;
    doc.text('FECHA:', leftColumn, leftY);
    
    // Columna derecha - VALORES
    let rightY = currentY;
    doc.text('ALMACEN', rightColumn, rightY);
    rightY += 6;
    // Aquí va la dependencia seleccionada
    doc.text(circular.para.toUpperCase(), rightColumn, rightY);
    rightY += 6;
    doc.text('INVENTARIO ACTIVOS', rightColumn, rightY);
    rightY += 6;
    // Formato de fecha sin conversión de zona horaria
    const [year, month, day] = circular.fecha.split('-');
    const fechaFormateada = `${day}/${month}/${year}`;
    doc.text(fechaFormateada, rightColumn, rightY);
    
    currentY = Math.max(leftY, rightY) + 15;

    // Contenido del mensaje (texto justificado)
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    
    const contenidoCompleto = `Hago entrega del inventario de su dependencia para la revisión respectiva, cualquier novedad ya sea TRASLADOS, DEVOLUCIONES, hacerlo saber a esta dependencia mediante un oficio ya sea físico o por el correo institucional de la E.S.E HUJMB. Este inventario contiene los bienes y equipos a su cargo, cualquier inquietud agradezco hacer saber en forma escrita a esta dependencia, en un término no mayor a un (1) día hábil después de recibido el mismo, para hacer los correctivos necesarios. Si no hay objeciones, favor firmarlo y devolverlo a esta dependencia a la mayor brevedad posible.`;
    
    const contenidoLines = doc.splitTextToSize(contenidoCompleto, 170);
    doc.text(contenidoLines, 20, currentY, { align: 'justify', maxWidth: 170 });
    currentY += (contenidoLines.length * 5) + 15;

    // Despedida
    doc.text('Agradezco su atención y colaboración,', 20, currentY);
    currentY += 10;
    
    doc.text('Atentamente,', 20, currentY);
    currentY += 25;

    // Firmas en dos columnas
    const firmaY = currentY;
    
    // Firma izquierda - Almacenista General
    doc.line(20, firmaY, 90, firmaY);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text('Almacenista General', 20, firmaY + 5);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.text('Elaborado por: Ciprian Aragon', 20, firmaY + 12);

    // Firma derecha - Recibido
    doc.setFontSize(10);
    doc.line(120, firmaY, 190, firmaY);
    doc.setFont('helvetica', 'bold');
    doc.text('Recibido', 120, firmaY + 5);
    doc.setFont('helvetica', 'normal');

    // Guardar PDF
    doc.save(`circular-${circular.numero}.pdf`);
    toast.success('PDF generado exitosamente');
  };

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'Enviada': return 'bg-green-100 text-green-800';
      case 'Archivada': return 'bg-slate-100 text-slate-800';
      default: return 'bg-yellow-100 text-yellow-800';
    }
  };

  const getEstadoIcon = (estado: string) => {
    switch (estado) {
      case 'Enviada': return Send;
      case 'Archivada': return Archive;
      default: return FileText;
    }
  };

  return (
    <div className="p-8">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h2 className="text-slate-900 mb-1">Circulares</h2>
          <p className="text-slate-600">Comunicaciones oficiales del Almacén General hacia las dependencias</p>
        </div>
        <button
          onClick={() => {
            setEditingCircular(null);
            setShowForm(true);
          }}
          className="bg-slate-900 text-white px-6 py-3 rounded-lg hover:bg-slate-800 transition-colors flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Nueva Circular
        </button>
      </div>

      {/* Lista de circulares */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-6 py-3 text-left text-slate-700">No. Circular</th>
                <th className="px-6 py-3 text-left text-slate-700">Fecha</th>
                <th className="px-6 py-3 text-left text-slate-700">Para</th>
                <th className="px-6 py-3 text-left text-slate-700">Asunto</th>
                <th className="px-6 py-3 text-left text-slate-700">Estado</th>
                <th className="px-6 py-3 text-left text-slate-700">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                    Cargando circulares...
                  </td>
                </tr>
              ) : circulares.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                    No hay circulares registradas. Crea una nueva para comenzar.
                  </td>
                </tr>
              ) : (
                circulares.map((circular) => {
                  const EstadoIcon = getEstadoIcon(circular.estado);
                  return (
                    <tr key={circular.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <span className="text-slate-900 font-medium">{circular.numero}</span>
                      </td>
                      <td className="px-6 py-4 text-slate-600">
                        {new Date(circular.fecha).toLocaleDateString('es-CO')}
                      </td>
                      <td className="px-6 py-4 text-slate-900">{circular.para}</td>
                      <td className="px-6 py-4 text-slate-900">
                        {circular.asunto.length > 50 
                          ? circular.asunto.substring(0, 50) + '...' 
                          : circular.asunto}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-sm flex items-center gap-1 w-fit ${getEstadoColor(circular.estado)}`}>
                          <EstadoIcon className="w-3 h-3" />
                          {circular.estado}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          {circular.estado === 'Pendiente' && (
                            <button
                              onClick={() => cambiarEstado(circular.id, 'Enviada')}
                              className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                              title="Marcar como enviada"
                            >
                              <Send className="w-4 h-4" />
                            </button>
                          )}
                          {circular.estado === 'Enviada' && (
                            <button
                              onClick={() => cambiarEstado(circular.id, 'Archivada')}
                              className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                              title="Archivar"
                            >
                              <Archive className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() => generarPDF(circular)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Descargar PDF"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleEdit(circular)}
                            className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                            title="Ver/Editar"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(circular.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
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
      </div>

      {/* Modal de formulario */}
      {showForm && (
        <CircularForm
          circular={editingCircular}
          dependencias={dependencias}
          onSave={handleSave}
          onCancel={() => {
            setShowForm(false);
            setEditingCircular(null);
          }}
        />
      )}
    </div>
  );
}

// Componente de formulario
interface CircularFormProps {
  circular: Circular | null;
  dependencias: Dependencia[];
  onSave: (circular: Partial<Circular>) => void;
  onCancel: () => void;
}

function CircularForm({ circular, dependencias, onSave, onCancel }: CircularFormProps) {
  const [formData, setFormData] = useState({
    fecha: circular?.fecha || new Date().toISOString().split('T')[0],
    para: circular?.para || '',
    asunto: 'INVENTARIO ACTIVOS',
    contenido: 'Hago entrega del inventario de su dependencia para la revisión respectiva, cualquier novedad ya sea TRASLADOS, DEVOLUCIONES, hacerlo saber a esta dependencia mediante un oficio ya sea físico o por el correo institucional de la E.S.E HUJMB. Este inventario contiene los bienes y equipos a su cargo, cualquier inquietud agradezco hacer saber en forma escrita a esta dependencia, en un término no mayor a un (1) día hábil después de recibido el mismo, para hacer los correctivos necesarios. Si no hay objeciones, favor firmarlo y devolverlo a esta dependencia a la mayor brevedad posible.',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.para) {
      toast.error('Por favor seleccione una dependencia');
      return;
    }

    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center">
          <h3 className="text-slate-900">
            {circular ? 'Ver Circular' : 'Nueva Circular de Inventario'}
          </h3>
          <button onClick={onCancel} className="text-slate-400 hover:text-slate-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <p className="text-blue-900 font-medium mb-2">ℹ️ Circular de Entrega de Inventario</p>
            <p className="text-blue-700 text-sm">
              Esta circular notifica a la dependencia sobre la entrega del inventario para revisión.
              El contenido es estándar y se genera automáticamente.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-slate-700 mb-2">Fecha *</label>
              <input
                type="date"
                value={formData.fecha}
                onChange={(e) => setFormData({ ...formData, fecha: e.target.value })}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-slate-700 mb-2">Para (Dependencia)*</label>
              <input
                type="text"
                value={formData.para}
                onChange={(e) => setFormData({ ...formData, para: e.target.value })}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                placeholder="Ej: Tesorería, Sistemas, Recursos Humanos..."
                required
              />
            </div>
          </div>

          <div className="bg-slate-50 rounded-lg p-4 mb-6">
            <p className="text-slate-700 font-medium mb-3">📋 Información del documento:</p>
            <div className="space-y-2 text-sm">
              <div className="grid grid-cols-2">
                <span className="text-slate-600">De:</span>
                <span className="text-slate-900 font-medium">Almacén General</span>
              </div>
              <div className="grid grid-cols-2">
                <span className="text-slate-600">Asunto:</span>
                <span className="text-slate-900 font-medium">Inventario Activos</span>
              </div>
              <div className="grid grid-cols-2">
                <span className="text-slate-600">Firma:</span>
                <span className="text-slate-900 font-medium">Almacenista General</span>
              </div>
              <div className="grid grid-cols-2">
                <span className="text-slate-600">Elaborado por:</span>
                <span className="text-slate-900 font-medium">Ciprian Aragon</span>
              </div>
            </div>
          </div>

          <div className="border border-slate-200 rounded-lg p-4 mb-6">
            <p className="text-slate-700 font-medium mb-2">Contenido del mensaje:</p>
            <p className="text-slate-600 text-sm leading-relaxed">
              {formData.contenido}
            </p>
          </div>

          <div className="flex gap-3 justify-end pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors flex items-center gap-2"
            >
              <FileText className="w-5 h-5" />
              {circular ? 'Ver PDF' : 'Crear y Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}