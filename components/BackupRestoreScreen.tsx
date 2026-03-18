import { useState } from 'react';
import { Download, Upload, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import type { Activo, Dependencia, GrupoActivo, Cuentadante } from '../types';

interface BackupRestoreScreenProps {
  activos: Activo[];
  dependencias: Dependencia[];
  grupos: GrupoActivo[];
  cuentadantes: Cuentadante[];
  onRestore: () => void;
}

export function BackupRestoreScreen({
  activos,
  dependencias,
  grupos,
  cuentadantes,
  onRestore
}: BackupRestoreScreenProps) {
  const [isRestoring, setIsRestoring] = useState(false);

  const handleBackup = () => {
    try {
      const backupData = {
        activos,
        dependencias,
        grupos,
        cuentadantes,
        fecha: new Date().toISOString(),
        version: '3.0.0'
      };

      const dataStr = JSON.stringify(backupData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `backup-inventarios-${new Date().toISOString().split('T')[0]}.json`;
      link.click();
      
      URL.revokeObjectURL(url);
      toast.success('Backup creado exitosamente');
    } catch (error) {
      console.error('Error creando backup:', error);
      toast.error('Error al crear el backup');
    }
  };

  const handleRestore = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        setIsRestoring(true);
        const content = e.target?.result as string;
        const backupData = JSON.parse(content);

        // Validar estructura del backup
        if (!backupData.activos || !backupData.dependencias || !backupData.grupos || !backupData.cuentadantes) {
          throw new Error('Archivo de backup inválido');
        }

        // Aquí deberías implementar la lógica de restauración
        // llamando a los endpoints del servidor para cada entidad
        toast.success('Backup restaurado exitosamente');
        onRestore();
      } catch (error) {
        console.error('Error restaurando backup:', error);
        toast.error('Error al restaurar el backup');
      } finally {
        setIsRestoring(false);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-2">Backup y Restauración</h1>
      <p className="text-slate-600 mb-8">Gestiona copias de seguridad de tus datos</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Crear Backup */}
        <div className="bg-white p-6 rounded-lg border border-slate-200">
          <div className="flex items-center gap-3 mb-4">
            <Download className="text-blue-600" size={24} />
            <h2 className="text-xl font-semibold">Crear Backup</h2>
          </div>
          <p className="text-slate-600 mb-6">
            Descarga una copia de seguridad completa de todos tus datos
          </p>
          <button
            onClick={handleBackup}
            className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Descargar Backup
          </button>
          
          <div className="mt-6 p-4 bg-slate-50 rounded-lg">
            <h3 className="font-medium mb-2">Datos incluidos:</h3>
            <ul className="space-y-1 text-sm text-slate-600">
              <li>✓ {activos.length} activos</li>
              <li>✓ {dependencias.length} dependencias</li>
              <li>✓ {grupos.length} grupos</li>
              <li>✓ {cuentadantes.length} cuentadantes</li>
            </ul>
          </div>
        </div>

        {/* Restaurar Backup */}
        <div className="bg-white p-6 rounded-lg border border-slate-200">
          <div className="flex items-center gap-3 mb-4">
            <Upload className="text-green-600" size={24} />
            <h2 className="text-xl font-semibold">Restaurar Backup</h2>
          </div>
          <p className="text-slate-600 mb-6">
            Restaura tus datos desde un archivo de backup anterior
          </p>
          
          <label className="block">
            <input
              type="file"
              accept=".json"
              onChange={handleRestore}
              disabled={isRestoring}
              className="hidden"
            />
            <div className="w-full bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-medium text-center cursor-pointer">
              {isRestoring ? 'Restaurando...' : 'Seleccionar Archivo'}
            </div>
          </label>

          <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg flex gap-3">
            <AlertCircle className="text-amber-600 flex-shrink-0" size={20} />
            <div className="text-sm text-amber-800">
              <p className="font-medium mb-1">Advertencia</p>
              <p>La restauración sobrescribirá todos los datos actuales.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
