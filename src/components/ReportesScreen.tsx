import { useState, useEffect } from 'react';
import { Activo, Dependencia, ConfiguracionEmpresa, Cuentadante, GrupoActivo } from '../types';
import { FileText, Download, FileSpreadsheet } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { kvGet, kvGetByPrefix } from '../utils/supabase/client';
import { calcularDepreciacion, formatearMoneda } from '../utils/depreciacion';

declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

export function ReportesScreen() {
  const [activos, setActivos] = useState<Activo[]>([]);
  const [dependencias, setDependencias] = useState<Dependencia[]>([]);
  const [cuentadantes, setCuentadantes] = useState<Cuentadante[]>([]);
  const [configuracion, setConfiguracion] = useState<ConfiguracionEmpresa | null>(null);
  const [gruposActivos, setGruposActivos] = useState<GrupoActivo[]>([]);
  const [selectedDependencia, setSelectedDependencia] = useState<string>('');
  const [selectedCuentadante, setSelectedCuentadante] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      console.log('📊 [REPORTES] Iniciando carga de datos...');
      
      // Cargar datos desde Supabase
      const loadedActivos = await kvGetByPrefix('activo:');
      const loadedDependencias = await kvGetByPrefix('dependencia:');
      const loadedCuentadantes = await kvGetByPrefix('cuentadante:');
      const loadedConfig = await kvGet('configuracion_empresa');
      const loadedGrupos = await kvGet('grupos_activos'); // Cargado como objeto único

      // Asegurar que todos sean arrays o valores por defecto
      const activosArray = Array.isArray(loadedActivos) ? loadedActivos : [];
      const dependenciasArray = Array.isArray(loadedDependencias) ? loadedDependencias : [];
      const cuentadantesArray = Array.isArray(loadedCuentadantes) ? loadedCuentadantes : [];
      const gruposArray = Array.isArray(loadedGrupos) ? loadedGrupos : [];

      console.log('📊 [REPORTES] Datos raw recibidos:', {
        activos: activosArray.length,
        dependencias: dependenciasArray.length,
        cuentadantes: cuentadantesArray.length,
        config: loadedConfig,
        grupos: gruposArray.length
      });

      console.log('🔍 [REPORTES] Primer activo:', activosArray?.[0]);
      console.log('🔍 [REPORTES] Primera dependencia:', dependenciasArray?.[0]);
      console.log('🔍 [REPORTES] Primer cuentadante:', cuentadantesArray?.[0]);

      setActivos(activosArray);
      setDependencias(dependenciasArray);
      setCuentadantes(cuentadantesArray);
      setConfiguracion(loadedConfig || null);
      setGruposActivos(gruposArray);
      
      console.log('📊 [REPORTES] Datos establecidos en el estado:', {
        activos: activosArray.length,
        dependencias: dependenciasArray.length,
        cuentadantes: cuentadantesArray.length
      });
    } catch (error: any) {
      console.error('❌ [REPORTES] Error cargando datos:', error);
      
      // Intentar cargar desde localStorage como fallback
      console.log('🔄 [REPORTES] Intentando cargar desde localStorage como fallback...');
      try {
        const localActivos = JSON.parse(localStorage.getItem('activos') || '[]');
        const localDependencias = JSON.parse(localStorage.getItem('dependencias') || '[]');
        const localCuentadantes = JSON.parse(localStorage.getItem('cuentadantes') || '[]');
        
        setActivos(localActivos);
        setDependencias(localDependencias);
        setCuentadantes(localCuentadantes);
        
        console.log('✅ [REPORTES] Datos cargados desde localStorage:', {
          activos: localActivos.length,
          dependencias: localDependencias.length,
          cuentadantes: localCuentadantes.length
        });
        
        alert('⚠️ Advertencia: Se cargaron datos desde localStorage porque Supabase no está disponible. Verifica la configuración de Supabase.');
      } catch (localError) {
        console.error('❌ [REPORTES] Error cargando desde localStorage:', localError);
        alert('Error al cargar datos. Por favor, verifica la configuración de Supabase.');
      }
    } finally {
      setLoading(false);
    }
  };

  const getActivosByDependencia = (dependencia: string) => {
    if (!dependencia) return activos;
    return activos.filter(a => a.dependencia === dependencia);
  };

  const generatePDF = () => {
    const activosFiltered = getActivosByDependencia(selectedDependencia);
    
    if (activosFiltered.length === 0) {
      alert('No hay activos para generar el reporte');
      return;
    }

    // Cambiar a tamaño CARTA (Letter: 8.5" x 11")
    const doc = new jsPDF('p', 'mm', 'letter');
    
    let currentY = 10;

    // Logo centrado arriba - horizontal (a lo largo)
    if (configuracion?.logoUrl) {
      try {
        const logoWidth = 150;  // Aún más ancho para estirar al máximo
        const logoHeight = 25;  // Altura más baja para formato panorámico
        const logoX = (doc.internal.pageSize.width - logoWidth) / 2;
        doc.addImage(configuracion.logoUrl, 'PNG', logoX, currentY, logoWidth, logoHeight);
        currentY += logoHeight + 8; // Más espacio entre logo y nombre
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
    const nitText = `NIT: ${configuracion?.nit || 'N/A'}`;
    const nitWidth = doc.getTextWidth(nitText);
    const nitX = (doc.internal.pageSize.width - nitWidth) / 2;
    doc.text(nitText, nitX, currentY);
    currentY += 5;
    
    // Fecha centrada
    const fechaText = `Fecha: ${new Date().toLocaleDateString('es-CO')}`;
    const fechaWidth = doc.getTextWidth(fechaText);
    const fechaX = (doc.internal.pageSize.width - fechaWidth) / 2;
    doc.text(fechaText, fechaX, currentY);
    currentY += 10;

    // Información de dependencia y cuentadante
    if (selectedDependencia) {
      doc.setFontSize(11);
      doc.text(`Dependencia: ${selectedDependencia}`, 15, currentY);
      currentY += 6;
    }
    
    // Mostrar el cuentadante seleccionado en el formulario
    if (selectedCuentadante) {
      doc.setFontSize(11);
      doc.text(`Cuentadante: ${selectedCuentadante}`, 15, currentY);
      currentY += 6;
    }
    
    currentY += 3;

    // Agrupar activos por grupo
    const activosPorGrupo: { [key: string]: Activo[] } = {};
    activosFiltered.forEach(activo => {
      const grupo = activo.grupo || 'Sin Grupo';
      if (!activosPorGrupo[grupo]) {
        activosPorGrupo[grupo] = [];
      }
      activosPorGrupo[grupo].push(activo);
    });

    let valorTotalGeneral = 0;
    const grupos = Object.keys(activosPorGrupo).sort();

    // Generar tabla para cada grupo
    grupos.forEach((grupo, index) => {
      const activosGrupo = activosPorGrupo[grupo];
      const valorSubtotal = activosGrupo.reduce((sum, a) => sum + a.valor, 0);
      valorTotalGeneral += valorSubtotal;

      // Título del grupo
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text(`Grupo: ${grupo}`, 15, currentY);
      currentY += 6;
      doc.setFont('helvetica', 'normal');

      // Tabla del grupo
      autoTable(doc, {
        startY: currentY,
        head: [['Código', 'Nombre', 'Marca', 'Modelo', 'Serie', 'Estado', 'Valor']],
        body: activosGrupo.map(a => {
          return [
            a.qr, // Mostrar código completo con prefijo (ej: SIS-2-07)
            a.nombre,
            a.marca,
            a.modelo,
            a.serie,
            a.estado,
            formatearMoneda(a.valor)
          ];
        }),
        styles: { fontSize: 10 },
        headStyles: { fillColor: [15, 23, 42], fontSize: 10 },
        margin: { left: 15, right: 15 }
      });

      currentY = (doc as any).lastAutoTable.finalY || currentY;
      
      // Subtotal del grupo (alineado a la derecha)
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      const subtotalText = `Subtotal: ${formatearMoneda(valorSubtotal)}`;
      const pageWidth = doc.internal.pageSize.width;
      const textWidth = doc.getTextWidth(subtotalText);
      doc.text(subtotalText, pageWidth - textWidth - 15, currentY + 5);
      doc.setFont('helvetica', 'normal');
      currentY += 10;
    });

    // Total general (alineado a la derecha)
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    
    const totalPageWidth = doc.internal.pageSize.width;
    
    const totalActivosText = `Total Activos: ${activosFiltered.length}`;
    const totalActivosWidth = doc.getTextWidth(totalActivosText);
    doc.text(totalActivosText, totalPageWidth - totalActivosWidth - 15, currentY);
    
    currentY += 6;
    
    const valorTotalText = `Valor Total: ${formatearMoneda(valorTotalGeneral)}`;
    const valorTotalWidth = doc.getTextWidth(valorTotalText);
    doc.text(valorTotalText, totalPageWidth - valorTotalWidth - 15, currentY);
    
    doc.setFont('helvetica', 'normal');

    // ===== FIRMAS AL FINAL =====
    // Verificar si hay espacio suficiente para las firmas (necesitamos ~40mm)
    const pageHeight = doc.internal.pageSize.height;
    const espacioNecesario = 40;
    
    if (currentY + espacioNecesario > pageHeight - 20) {
      // No hay espacio, agregar nueva página
      doc.addPage();
      currentY = 20;
    } else {
      // Hay espacio, agregar separación
      currentY += 25;
    }

    const firmasY = currentY;
    const pageWidth = doc.internal.pageSize.width;
    const firmaWidth = 60;
    const espacioEntre = (pageWidth - (firmaWidth * 2)) / 3;

    doc.setFontSize(9);
    
    // Primera fila: Almacenista General y Cuentadante
    // Almacenista General
    let firmaX = espacioEntre;
    doc.line(firmaX, firmasY, firmaX + firmaWidth, firmasY);
    const almacenistaText = 'Almacenista General';
    const almacenistaWidth = doc.getTextWidth(almacenistaText);
    doc.text(almacenistaText, firmaX + (firmaWidth - almacenistaWidth) / 2, firmasY + 5);
    
    // Cuentadante
    firmaX = espacioEntre + firmaWidth + espacioEntre;
    doc.line(firmaX, firmasY, firmaX + firmaWidth, firmasY);
    const cuentadanteText = 'Cuentadante';
    const cuentadanteWidth = doc.getTextWidth(cuentadanteText);
    doc.text(cuentadanteText, firmaX + (firmaWidth - cuentadanteWidth) / 2, firmasY + 5);

    // Elaborado por (a la izquierda, sin línea)
    const elaboradoY = firmasY + 15;
    const elaboradoX = 15; // Alineado a la izquierda
    doc.text('Elaborado por', elaboradoX, elaboradoY);
    doc.setFont('helvetica', 'bold');
    doc.text('Ciprian Aragon', elaboradoX, elaboradoY + 5);
    doc.setFont('helvetica', 'normal');

    doc.save(`reporte-activos-${selectedDependencia || 'todos'}-${Date.now()}.pdf`);
  };

  const generateExcel = async () => {
    const activosFiltered = getActivosByDependencia(selectedDependencia);
    
    if (activosFiltered.length === 0) {
      alert('No hay activos para exportar');
      return;
    }

    // Crear datos con depreciación calculada
    const datosConDepreciacion = activosFiltered.map(activo => {
      // Buscar el grupo del activo - CON VALIDACIÓN SEGURA
      const grupoActivo = Array.isArray(gruposActivos) 
        ? gruposActivos.find(g => g.codigo === activo.grupo)
        : undefined;
      
      // Calcular depreciación
      const depreciacion = calcularDepreciacion(activo, grupoActivo);
      
      return {
        'Código QR': activo.qr,
        'Nombre': activo.nombre,
        'Marca': activo.marca,
        'Modelo': activo.modelo,
        'Serie': activo.serie,
        'Dependencia': activo.dependencia,
        'Cuentadante': activo.cuentadante || 'N/A',
        'Estado': activo.estado,
        'Fecha Ingreso': activo.fechaIngreso,
        'Grupo': activo.grupo || 'Sin Grupo',
        'Valor Original': activo.valor,
        'Vida Útil (años)': depreciacion.vidaUtilAnios,
        'Tasa Depreciación (%)': depreciacion.tasaDepreciacion,
        'Años Transcurridos': parseFloat(depreciacion.aniosTranscurridos.toFixed(2)),
        'Depreciación Anual': parseFloat(depreciacion.depreciacionAnual.toFixed(2)),
        'Depreciación Acumulada': parseFloat(depreciacion.depreciacionAcumulada.toFixed(2)),
        'Valor Actual': parseFloat(depreciacion.valorActual.toFixed(2)),
        '% Depreciado': parseFloat(depreciacion.porcentajeDepreciado.toFixed(2))
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(datosConDepreciacion);
    
    // Ajustar anchos de columna
    worksheet['!cols'] = [
      { wch: 15 }, // Código QR
      { wch: 30 }, // Nombre
      { wch: 15 }, // Marca
      { wch: 15 }, // Modelo
      { wch: 18 }, // Serie
      { wch: 25 }, // Dependencia
      { wch: 25 }, // Cuentadante
      { wch: 15 }, // Estado
      { wch: 12 }, // Fecha Ingreso
      { wch: 20 }, // Grupo
      { wch: 15 }, // Valor Original
      { wch: 15 }, // Vida Útil
      { wch: 18 }, // Tasa Depreciación
      { wch: 18 }, // Años Transcurridos
      { wch: 18 }, // Depreciación Anual
      { wch: 20 }, // Depreciación Acumulada
      { wch: 15 }, // Valor Actual
      { wch: 15 }  // % Depreciado
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Activos con Depreciación');
    XLSX.writeFile(workbook, `activos-depreciacion-${selectedDependencia || 'todos'}-${Date.now()}.xlsx`);
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h2 className="text-slate-900 mb-1">Reportes</h2>
        <p className="text-slate-600">Generar informes de activos fijos</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
        <h3 className="text-slate-900 mb-4">Filtros</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-slate-700 mb-2">Dependencia</label>
            <select
              value={selectedDependencia}
              onChange={(e) => setSelectedDependencia(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent"
            >
              <option value="">Todas las dependencias</option>
              {Array.isArray(dependencias) && dependencias.map(d => (
                <option key={d.id} value={d.nombre}>{d.nombre}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-slate-700 mb-2">Cuentadante</label>
            <select
              value={selectedCuentadante}
              onChange={(e) => setSelectedCuentadante(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent"
            >
              <option value="">Seleccione un cuentadante</option>
              {cuentadantes.length === 0 && (
                <option disabled>No hay cuentadantes registrados</option>
              )}
              {Array.isArray(cuentadantes) && cuentadantes.map((c, index) => {
                const nombre = c.nombre || 'Sin nombre';
                const info = c.dependencia || c.cargo || '';
                return (
                  <option key={c.id || index} value={nombre}>
                    {nombre}{info ? ` - ${info}` : ''}
                  </option>
                );
              })}
            </select>
            {cuentadantes.length === 0 && (
              <p className="text-red-600 text-sm mt-1">
                ⚠️ No hay cuentadantes. Ve a la sección de Cuentadantes para crear uno.
              </p>
            )}
            <p className="text-slate-600 text-sm mt-1">
              Total cuentadantes cargados: {cuentadantes.length}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h3 className="text-slate-900 mb-4">Generar Reporte</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={generatePDF}
            className="bg-red-600 text-white px-6 py-4 rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-3"
          >
            <FileText className="w-5 h-5" />
            <div className="text-left">
              <div>Exportar a PDF</div>
              <div className="text-xs opacity-90">Documento imprimible</div>
            </div>
          </button>

          <button
            onClick={generateExcel}
            className="bg-green-600 text-white px-6 py-4 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-3"
          >
            <FileSpreadsheet className="w-5 h-5" />
            <div className="text-left">
              <div>Exportar a Excel</div>
              <div className="text-xs opacity-90">Hoja de cálculo</div>
            </div>
          </button>
        </div>

        <div className="mt-6 p-4 bg-slate-50 rounded-lg">
          <p className="text-slate-700">
            <strong>Activos a exportar:</strong> {getActivosByDependencia(selectedDependencia).length}
          </p>
          <p className="text-slate-600 text-sm mt-1">
            {selectedDependencia 
              ? `Filtrado por: ${selectedDependencia}` 
              : 'Mostrando todos los activos'}
          </p>
        </div>
      </div>
    </div>
  );
}
