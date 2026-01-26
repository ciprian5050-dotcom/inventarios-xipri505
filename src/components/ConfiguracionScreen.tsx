import { useState, useRef, useEffect } from 'react';
import { ConfiguracionEmpresa, GrupoActivo } from '../types';
import { Upload, Building2, Save, X, Plus, Edit2, Trash2, Tag, Database } from 'lucide-react';
import { MigracionModal } from './MigracionModal';
import { kvGet, kvSet } from '../utils/supabase/client';
import { TASAS_DEPRECIACION_ESTANDAR } from '../utils/depreciacion';

export function ConfiguracionScreen() {
  const [formData, setFormData] = useState<ConfiguracionEmpresa>({
    nombreEmpresa: '',
    nit: '',
    direccion: '',
    telefono: '',
    logoUrl: ''
  });
  const [previewLogo, setPreviewLogo] = useState<string>('');
  const [showSuccess, setShowSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Estados para gestión de grupos
  const [grupos, setGrupos] = useState<GrupoActivo[]>([]);
  const [showGrupoForm, setShowGrupoForm] = useState(false);
  const [editingGrupo, setEditingGrupo] = useState<GrupoActivo | null>(null);
  const [grupoForm, setGrupoForm] = useState({ 
    codigo: '', 
    nombre: '', 
    prefijo: '',
    vidaUtil: 10,
    tasaDepreciacion: 10
  });
  const [showMigracionModal, setShowMigracionModal] = useState(false);
  const [loading, setLoading] = useState(true);

  // Cargar configuración desde Supabase
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      console.log('🔍 Cargando configuración desde Supabase...');
      
      // Cargar configuración de empresa
      const savedConfig = await kvGet('configuracion_empresa');
      if (savedConfig) {
        setFormData(savedConfig);
        setPreviewLogo(savedConfig.logoUrl);
      }

      // Cargar grupos
      const savedGrupos = await kvGet('grupos_activos');
      if (savedGrupos && Array.isArray(savedGrupos)) {
        setGrupos(savedGrupos);
      } else {
        // Grupos por defecto
        const defaultGrupos = [
          { codigo: '2-06', nombre: 'Equipos de Oficina', prefijo: 'OFI-', vidaUtil: 10, tasaDepreciacion: 10 },
          { codigo: '2-07', nombre: 'Sistemas y Comunicación', prefijo: 'SIS-', vidaUtil: 5, tasaDepreciacion: 20 },
          { codigo: '2-08', nombre: 'Muebles y Enseres', prefijo: 'MUE-', vidaUtil: 15, tasaDepreciacion: 6.67 }
        ];
        setGrupos(defaultGrupos);
        await kvSet('grupos_activos', defaultGrupos);
      }
      
      console.log('✅ Configuración cargada');
    } catch (err: any) {
      console.error('❌ Error cargando configuración:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setPreviewLogo(base64String);
        setFormData({ ...formData, logoUrl: base64String });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveLogo = () => {
    setPreviewLogo('');
    setFormData({ ...formData, logoUrl: '' });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Guardar en Supabase
    kvSet('configuracion_empresa', formData);
    
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const handleAddGrupo = () => {
    setShowGrupoForm(true);
    setEditingGrupo(null);
    setGrupoForm({ codigo: '', nombre: '', prefijo: '', vidaUtil: 10, tasaDepreciacion: 10 });
  };

  const handleEditGrupo = (grupo: GrupoActivo) => {
    setEditingGrupo(grupo);
    setGrupoForm(grupo);
    setShowGrupoForm(true);
  };

  const handleDeleteGrupo = (codigo: string) => {
    if (!confirm('¿Estás seguro de que deseas eliminar este grupo?')) return;
    const newGrupos = grupos.filter(grupo => grupo.codigo !== codigo);
    setGrupos(newGrupos);
    kvSet('grupos_activos', newGrupos);
  };

  const handleSaveGrupo = () => {
    if (editingGrupo) {
      const newGrupos = grupos.map(g =>
        g.codigo === editingGrupo.codigo ? { ...grupoForm } : g
      );
      setGrupos(newGrupos);
      kvSet('grupos_activos', newGrupos);
    } else {
      const newGrupos = [...grupos, { 
        ...grupoForm, 
        codigo: grupoForm.codigo,
        vidaUtil: grupoForm.vidaUtil || 10,
        tasaDepreciacion: grupoForm.tasaDepreciacion || 10
      }];
      setGrupos(newGrupos);
      kvSet('grupos_activos', newGrupos);
    }
    setShowGrupoForm(false);
    setEditingGrupo(null);
    setGrupoForm({ 
      codigo: '', 
      nombre: '', 
      prefijo: '',
      vidaUtil: 10,
      tasaDepreciacion: 10
    });
  };

  return (
    <div className="p-8">
      {showMigracionModal && (
        <MigracionModal onClose={() => setShowMigracionModal(false)} />
      )}
      
      <div className="mb-8">
        <h2 className="text-slate-900 mb-1">Configuración</h2>
        <p className="text-slate-600">Configuración general del sistema</p>
      </div>

      {showSuccess && (
        <div className="mb-6 bg-green-50 border border-green-200 text-green-800 px-6 py-4 rounded-lg">
          ✓ Configuración guardada correctamente
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Información de la Empresa */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-slate-100 p-3 rounded-lg">
              <Building2 className="w-6 h-6 text-slate-700" />
            </div>
            <div>
              <h3 className="text-slate-900">Información de la Empresa</h3>
              <p className="text-slate-600 text-sm">Datos que aparecerán en los reportes</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-slate-700 mb-2">Nombre de la Empresa</label>
              <input
                type="text"
                value={formData.nombreEmpresa}
                onChange={(e) => setFormData({ ...formData, nombreEmpresa: e.target.value })}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                placeholder="Ej: Mi Empresa S.A.S."
              />
            </div>

            <div>
              <label className="block text-slate-700 mb-2">NIT</label>
              <input
                type="text"
                value={formData.nit}
                onChange={(e) => setFormData({ ...formData, nit: e.target.value })}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                placeholder="Ej: 900.123.456-7"
              />
            </div>

            <div>
              <label className="block text-slate-700 mb-2">Dirección</label>
              <input
                type="text"
                value={formData.direccion}
                onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                placeholder="Ej: Calle 123 #45-67"
              />
            </div>

            <div>
              <label className="block text-slate-700 mb-2">Teléfono</label>
              <input
                type="text"
                value={formData.telefono}
                onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                placeholder="Ej: (601) 123-4567"
              />
            </div>
          </div>

          {/* Logo */}
          <div className="mt-6">
            <label className="block text-slate-700 mb-2">Logo de la Empresa</label>
            <div className="flex items-start gap-4">
              {previewLogo && (
                <div className="relative">
                  <img
                    src={previewLogo}
                    alt="Logo preview"
                    className="w-32 h-32 object-contain border border-slate-300 rounded-lg p-2"
                  />
                  <button
                    type="button"
                    onClick={handleRemoveLogo}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
              
              <div className="flex-1">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="logo-upload"
                />
                <label
                  htmlFor="logo-upload"
                  className="inline-flex items-center gap-2 bg-slate-100 text-slate-700 px-4 py-2 rounded-lg hover:bg-slate-200 cursor-pointer transition-colors"
                >
                  <Upload className="w-5 h-5" />
                  {previewLogo ? 'Cambiar Logo' : 'Subir Logo'}
                </label>
                <p className="text-slate-600 text-sm mt-2">
                  Formato recomendado: PNG o JPG, tamaño máximo 2MB
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Gestión de Grupos */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-slate-100 p-3 rounded-lg">
              <Tag className="w-6 h-6 text-slate-700" />
            </div>
            <div>
              <h3 className="text-slate-900">Gestión de Grupos</h3>
              <p className="text-slate-600 text-sm">Administra los grupos de activos</p>
            </div>
          </div>

          <div className="flex justify-end mb-4">
            <button
              type="button"
              onClick={handleAddGrupo}
              className="bg-slate-900 text-white px-4 py-2 rounded-lg hover:bg-slate-800 transition-colors flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Agregar Grupo
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="bg-slate-100 text-slate-700 px-4 py-2 border border-slate-300 text-left">Código</th>
                  <th className="bg-slate-100 text-slate-700 px-4 py-2 border border-slate-300 text-left">Nombre</th>
                  <th className="bg-slate-100 text-slate-700 px-4 py-2 border border-slate-300 text-left">Prefijo</th>
                  <th className="bg-slate-100 text-slate-700 px-4 py-2 border border-slate-300 text-center">Vida Útil (años)</th>
                  <th className="bg-slate-100 text-slate-700 px-4 py-2 border border-slate-300 text-center">Depreciación Anual (%)</th>
                  <th className="bg-slate-100 text-slate-700 px-4 py-2 border border-slate-300 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {grupos.map(grupo => (
                  <tr key={grupo.codigo}>
                    <td className="px-4 py-2 border border-slate-300">{grupo.codigo}</td>
                    <td className="px-4 py-2 border border-slate-300">{grupo.nombre}</td>
                    <td className="px-4 py-2 border border-slate-300">
                      <span className="bg-slate-100 px-2 py-1 rounded text-slate-700">{grupo.prefijo}</span>
                    </td>
                    <td className="px-4 py-2 border border-slate-300 text-center">{grupo.vidaUtil || 10}</td>
                    <td className="px-4 py-2 border border-slate-300 text-center">{grupo.tasaDepreciacion || 10}%</td>
                    <td className="px-4 py-2 border border-slate-300">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleEditGrupo(grupo)}
                          className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                          title="Editar"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteGrupo(grupo.codigo)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
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

          {/* Formulario de Grupo */}
          {showGrupoForm && (
            <div className="mt-6 bg-slate-50 rounded-lg p-6 border border-slate-200">
              <h4 className="text-slate-900 mb-4 font-semibold">{editingGrupo ? 'Editar Grupo' : 'Nuevo Grupo'}</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-slate-700 mb-2 text-sm">Código</label>
                  <input
                    type="text"
                    value={grupoForm.codigo}
                    onChange={(e) => setGrupoForm({ ...grupoForm, codigo: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                    placeholder="Ej: 2-06"
                    disabled={!!editingGrupo}
                  />
                </div>

                <div>
                  <label className="block text-slate-700 mb-2 text-sm">Nombre</label>
                  <input
                    type="text"
                    value={grupoForm.nombre}
                    onChange={(e) => setGrupoForm({ ...grupoForm, nombre: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                    placeholder="Ej: Equipos de Oficina"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 mb-2 text-sm">Prefijo</label>
                  <input
                    type="text"
                    value={grupoForm.prefijo}
                    onChange={(e) => setGrupoForm({ ...grupoForm, prefijo: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                    placeholder="Ej: OFI-"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 mb-2 text-sm">Vida Útil (años)</label>
                  <input
                    type="number"
                    value={grupoForm.vidaUtil}
                    onChange={(e) => setGrupoForm({ ...grupoForm, vidaUtil: parseInt(e.target.value) })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                    placeholder="Ej: 10"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 mb-2 text-sm">Tasa de Depreciación (%)</label>
                  <input
                    type="number"
                    value={grupoForm.tasaDepreciacion}
                    onChange={(e) => setGrupoForm({ ...grupoForm, tasaDepreciacion: parseFloat(e.target.value) })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                    placeholder="Ej: 10"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <button
                  type="button"
                  onClick={() => setShowGrupoForm(false)}
                  className="px-4 py-2 text-slate-700 bg-slate-200 rounded-lg hover:bg-slate-300 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleSaveGrupo}
                  className="bg-slate-900 text-white px-4 py-2 rounded-lg hover:bg-slate-800 transition-colors flex items-center gap-2"
                >
                  <Save className="w-5 h-5" />
                  Guardar
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Botón Guardar */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="bg-slate-900 text-white px-8 py-3 rounded-lg hover:bg-slate-800 transition-colors flex items-center gap-2"
          >
            <Save className="w-5 h-5" />
            Guardar Configuración
          </button>
        </div>
      </form>
    </div>
  );
}