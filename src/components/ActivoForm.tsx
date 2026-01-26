import { useState, useEffect, FormEvent } from 'react';
import { Activo, Cuentadante, Dependencia, Marca, NombreActivo, GrupoActivo } from '../types';
import { X } from 'lucide-react';
import { kvGet, kvGetByPrefix } from '../utils/supabase/client';

interface ActivoFormProps {
  activo: Activo | null;
  cuentadantes: Cuentadante[];
  dependencias: Dependencia[];
  marcas: string[];
  existingActivos?: Activo[]; // Lista de activos existentes para validar códigos duplicados
  onSave?: (activo: Activo | Omit<Activo, 'id'>) => void;
  onSubmit?: (activo: Activo | Omit<Activo, 'id'>) => void;
  onCancel: () => void;
}

export function ActivoForm({ activo, cuentadantes, dependencias, marcas, existingActivos = [], onSave, onSubmit, onCancel }: ActivoFormProps) {
  const [formData, setFormData] = useState({
    qr: activo?.qr || '',
    nombre: activo?.nombre || '',
    marca: activo?.marca || '',
    modelo: activo?.modelo || '',
    dependencia: activo?.dependencia || '',
    serie: activo?.serie || '',
    valor: activo?.valor || 0,
    fechaIngreso: activo?.fechaIngreso || new Date().toISOString().split('T')[0],
    estado: activo?.estado || 'Activo' as const,
    grupo: activo?.grupo || ''
  });
  
  const [showCustomNombre, setShowCustomNombre] = useState(false);
  const [customNombre, setCustomNombre] = useState('');
  const [customMarca, setCustomMarca] = useState('');
  const [numeroActivo, setNumeroActivo] = useState('');
  const [gruposDisponibles, setGruposDisponibles] = useState<Array<GrupoActivo>>([]);
  const [marcasCatalogo, setMarcasCatalogo] = useState<Marca[]>([]);
  const [nombresCatalogo, setNombresCatalogo] = useState<NombreActivo[]>([]);
  const [loading, setLoading] = useState(true);

  const availableDependencias = dependencias;

  // Cargar catálogos desde Supabase
  useEffect(() => {
    loadCatalogos();
  }, []);

  const loadCatalogos = async () => {
    try {
      setLoading(true);
      console.log('🔍 Cargando catálogos desde Supabase...');

      // Cargar grupos
      const loadedGrupos = await kvGet('grupos_activos');
      if (loadedGrupos && Array.isArray(loadedGrupos)) {
        console.log('✅ Grupos cargados:', loadedGrupos.length);
        setGruposDisponibles(loadedGrupos);
      } else {
        console.log('⚠️ No hay grupos, usando valores por defecto');
        const defaultGrupos = [
          { codigo: '2-06', nombre: 'Equipos de Oficina', prefijo: 'OFI-' },
          { codigo: '2-07', nombre: 'Sistemas y Comunicación', prefijo: 'SIS-' },
          { codigo: '2-08', nombre: 'Muebles y Enseres', prefijo: 'MUE-' }
        ];
        setGruposDisponibles(defaultGrupos);
      }

      // Cargar marcas
      const loadedMarcas = await kvGet('marcas');
      if (loadedMarcas && Array.isArray(loadedMarcas)) {
        console.log('✅ Marcas cargadas:', loadedMarcas.length);
        setMarcasCatalogo(loadedMarcas);
      } else {
        console.log('⚠️ No hay marcas en Supabase');
        setMarcasCatalogo([]);
      }

      // Cargar nombres de activos
      const loadedNombres = await kvGet('nombres_activos');
      if (loadedNombres && Array.isArray(loadedNombres)) {
        console.log('✅ Nombres de activos cargados:', loadedNombres.length);
        setNombresCatalogo(loadedNombres);
      } else {
        console.log('⚠️ No hay nombres de activos en Supabase');
        setNombresCatalogo([]);
      }
    } catch (error) {
      console.error('❌ Error cargando catálogos:', error);
    } finally {
      setLoading(false);
    }
  };

  // Generar código automáticamente cuando cambia el grupo o el número
  const handleGrupoChange = (grupoCodigo: string) => {
    setFormData({ ...formData, grupo: grupoCodigo });
    if (grupoCodigo && numeroActivo) {
      const grupoSeleccionado = gruposDisponibles.find(g => g.codigo === grupoCodigo);
      const codigoCompleto = `${grupoSeleccionado?.prefijo}${numeroActivo}`;
      setFormData({ ...formData, grupo: grupoCodigo, qr: codigoCompleto });
    }
  };

  const handleNumeroChange = (numero: string) => {
    setNumeroActivo(numero);
    if (formData.grupo && numero) {
      const grupoSeleccionado = gruposDisponibles.find(g => g.codigo === formData.grupo);
      const codigoCompleto = `${grupoSeleccionado?.prefijo}${numero}`;
      setFormData({ ...formData, qr: codigoCompleto });
    }
  };

  // Verificar si el código ya existe (excluyendo el activo actual si estamos editando)
  const isCodigoDuplicado = () => {
    if (!formData.qr) return false;
    return existingActivos.some(a => 
      a.qr.toLowerCase() === formData.qr.toLowerCase() && 
      a.id !== activo?.id
    );
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    
    // Si seleccionó "custom", usar los valores personalizados
    const finalData = {
      ...formData,
      nombre: formData.nombre === 'custom' ? customNombre : formData.nombre,
      marca: formData.marca === 'custom' ? customMarca : formData.marca
    };
    
    // Usar el callback apropiado
    const callback = onSave || onSubmit;
    
    if (!callback) {
      console.error('No se proporcionó callback onSave u onSubmit');
      return;
    }
    
    if (activo) {
      callback({ ...activo, ...finalData });
    } else {
      callback(finalData);
    }
  };

  const generateQR = () => {
    const timestamp = Date.now();
    const qrCode = `QR-${timestamp.toString().slice(-6)}`;
    setFormData({ ...formData, qr: qrCode });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <h2 className="text-slate-900">
            {activo ? 'Editar Activo' : 'Nuevo Activo'}
          </h2>
          <button
            onClick={onCancel}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-slate-600" />
          </button>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="p-6 text-center">
            <div className="animate-spin w-8 h-8 border-4 border-slate-300 border-t-slate-900 rounded-full mx-auto mb-3"></div>
            <p className="text-slate-600">Cargando catálogos...</p>
          </div>
        )}

        {/* Alerta si faltan catálogos */}
        {!loading && (gruposDisponibles.length === 0 || marcasCatalogo.length === 0 || dependencias.length === 0) && (
          <div className="mx-6 mt-6 bg-amber-50 border border-amber-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <div className="bg-amber-100 p-2 rounded-lg">
                <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-amber-900 font-semibold mb-1">Faltan catálogos por configurar</h3>
                <p className="text-amber-800 text-sm mb-2">
                  Para crear activos necesitas configurar primero:
                </p>
                <ul className="text-amber-800 text-sm space-y-1 mb-3">
                  {gruposDisponibles.length === 0 && <li>• <strong>Grupos de códigos</strong> (ve a Configuración)</li>}
                  {marcasCatalogo.length === 0 && <li>• <strong>Marcas</strong> (ve a Configuración → Marcas)</li>}
                  {dependencias.length === 0 && <li>• <strong>Dependencias</strong> (ve a Configuración)</li>}
                </ul>
                <button
                  type="button"
                  onClick={onCancel}
                  className="text-amber-700 text-sm font-medium hover:text-amber-900 underline"
                >
                  Ir a Configuración →
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Form */}
        {!loading && (
          <form onSubmit={handleSubmit} className="p-6">
            <div className="grid grid-cols-2 gap-6">
              {/* Grupo */}
              <div className="col-span-2 sm:col-span-1">
                <label className="block text-slate-700 mb-2">
                  Grupo
                </label>
                <select
                  required
                  value={formData.grupo}
                  onChange={(e) => handleGrupoChange(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                >
                  <option value="">Seleccione un grupo</option>
                  {gruposDisponibles.map(grupo => (
                    <option key={grupo.codigo} value={grupo.codigo}>
                      {grupo.nombre} ({grupo.prefijo})
                    </option>
                  ))}
                </select>
              </div>

              {/* Número de Activo */}
              <div className="col-span-2 sm:col-span-1">
                <label className="block text-slate-700 mb-2">
                  Número de Activo
                </label>
                <input
                  type="text"
                  required
                  value={numeroActivo}
                  onChange={(e) => handleNumeroChange(e.target.value)}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent ${
                    isCodigoDuplicado() 
                      ? 'border-red-500 focus:ring-red-500' 
                      : 'border-slate-300 focus:ring-slate-900'
                  }`}
                  placeholder="Ej: 2-07 o 001"
                />
                <p className={`text-xs mt-1 ${isCodigoDuplicado() ? 'text-red-600 font-medium' : 'text-slate-500'}`}>
                  Código generado: <span className={isCodigoDuplicado() ? 'text-red-600 font-bold' : 'text-slate-900 font-medium'}>{formData.qr || 'Seleccione grupo y número'}</span>
                  {isCodigoDuplicado() && <span className="block mt-1">⚠️ Este código ya existe. Por favor, usa un número diferente.</span>}
                </p>
              </div>

              {/* Nombre */}
              <div className="col-span-2">
                <label className="block text-slate-700 mb-2">
                  Nombre del Activo
                </label>
                <select
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                >
                  <option value="">Seleccione un nombre</option>
                  {nombresCatalogo
                    .sort((a, b) => a.nombre.localeCompare(b.nombre, 'es', { sensitivity: 'base' }))
                    .map(nombre => (
                      <option key={nombre.id} value={nombre.nombre}>{nombre.nombre}</option>
                    ))}
                  <option value="custom">✏️ Escribir otro nombre</option>
                </select>
                {formData.nombre === 'custom' && (
                  <input
                    type="text"
                    required
                    value={customNombre}
                    onChange={(e) => setCustomNombre(e.target.value)}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent mt-2"
                    placeholder="Escriba el nombre del activo"
                  />
                )}
              </div>

              {/* Marca */}
              <div>
                <label className="block text-slate-700 mb-2">
                  Marca
                </label>
                <select
                  required
                  value={formData.marca}
                  onChange={(e) => setFormData({ ...formData, marca: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                >
                  <option value="">Seleccione una marca</option>
                  {marcasCatalogo
                    .sort((a, b) => a.nombre.localeCompare(b.nombre, 'es', { sensitivity: 'base' }))
                    .map(marca => (
                      <option key={marca.id} value={marca.nombre}>{marca.nombre}</option>
                    ))}
                  <option value="custom">✏️ Escribir otra marca</option>
                </select>
                {formData.marca === 'custom' && (
                  <input
                    type="text"
                    required
                    value={customMarca}
                    onChange={(e) => setCustomMarca(e.target.value)}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent mt-2"
                    placeholder="Escriba el nombre de la marca"
                  />
                )}
              </div>

              {/* Modelo */}
              <div>
                <label className="block text-slate-700 mb-2">
                  Modelo
                </label>
                <input
                  type="text"
                  required
                  value={formData.modelo}
                  onChange={(e) => setFormData({ ...formData, modelo: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                  placeholder="Ej: Latitude 5420"
                />
              </div>

              {/* Serie */}
              <div>
                <label className="block text-slate-700 mb-2">
                  Número de Serie
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    value={formData.serie}
                    onChange={(e) => setFormData({ ...formData, serie: e.target.value })}
                    className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                    placeholder="Ej: SN123456789"
                  />
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, serie: 'No Registra' })}
                    className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors text-sm whitespace-nowrap"
                    title="Llenar con 'No Registra'"
                  >
                    No Registra
                  </button>
                </div>
              </div>

              {/* Dependencia */}
              <div className="col-span-2">
                <label className="block text-slate-700 mb-2">
                  Dependencia
                </label>
                <select
                  required
                  value={formData.dependencia}
                  onChange={(e) => setFormData({ ...formData, dependencia: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                >
                  <option value="">Seleccione una dependencia</option>
                  {availableDependencias.map(dep => (
                    <option key={dep.id} value={dep.nombre}>{dep.nombre} ({dep.codigo})</option>
                  ))}
                </select>
              </div>

              {/* Valor */}
              <div>
                <label className="block text-slate-700 mb-2">
                  Valor en COP
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  step="100"
                  value={formData.valor}
                  onChange={(e) => setFormData({ ...formData, valor: Number(e.target.value) })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                  placeholder="Ej: 749900"
                />
              </div>

              {/* Fecha de Ingreso */}
              <div>
                <label className="block text-slate-700 mb-2">
                  Fecha de Ingreso
                </label>
                <input
                  type="date"
                  required
                  value={formData.fechaIngreso}
                  onChange={(e) => setFormData({ ...formData, fechaIngreso: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                />
              </div>

              {/* Estado */}
              <div className="col-span-2">
                <label className="block text-slate-700 mb-2">
                  Estado
                </label>
                <select
                  required
                  value={formData.estado}
                  onChange={(e) => setFormData({ ...formData, estado: e.target.value as Activo['estado'] })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                >
                  <option value="Activo">Activo</option>
                  <option value="Inactivo">Inactivo</option>
                  <option value="En mantenimiento">En mantenimiento</option>
                  <option value="Dado de baja">Dado de baja</option>
                  <option value="Extraviado">Extraviado</option>
                </select>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 mt-6 pt-6 border-t border-slate-200">
              <button
                type="button"
                onClick={onCancel}
                className="flex-1 px-6 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="flex-1 px-6 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors"
              >
                {activo ? 'Guardar Cambios' : 'Crear Activo'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}