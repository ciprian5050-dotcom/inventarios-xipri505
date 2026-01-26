import { useEffect, useState } from 'react';
import { projectId } from '../utils/supabase/info';

interface MigrationHelperProps {
  accessToken: string | null;
}

export function MigrationHelper({ accessToken }: MigrationHelperProps) {
  const [migrated, setMigrated] = useState(false);
  const [migrating, setMigrating] = useState(false);

  useEffect(() => {
    const checkAndMigrate = async () => {
      // Solo migrar una vez por sesión
      if (migrated || migrating || !accessToken) {
        return;
      }

      // Verificar si ya se migró antes
      const alreadyMigrated = localStorage.getItem('data_migrated');
      if (alreadyMigrated) {
        console.log('✅ Datos ya fueron migrados anteriormente');
        setMigrated(true);
        return;
      }

      // Verificar si hay datos en localStorage para migrar
      const activos = localStorage.getItem('activos');
      const cuentadantes = localStorage.getItem('cuentadantes');
      const dependencias = localStorage.getItem('dependencias');
      const marcas = localStorage.getItem('marcas');
      const empresaConfig = localStorage.getItem('empresa_config');

      if (!activos && !cuentadantes && !dependencias && !marcas && !empresaConfig) {
        console.log('ℹ️ No hay datos en localStorage para migrar');
        localStorage.setItem('data_migrated', 'true');
        setMigrated(true);
        return;
      }

      console.log('📦 Iniciando migración automática de datos a la nube...');
      setMigrating(true);

      try {
        const migrateData: any = {};

        if (activos) {
          migrateData.activos = JSON.parse(activos);
          console.log(`📦 ${migrateData.activos.length} activos para migrar`);
        }
        if (cuentadantes) {
          migrateData.cuentadantes = JSON.parse(cuentadantes);
          console.log(`📦 ${migrateData.cuentadantes.length} cuentadantes para migrar`);
        }
        if (dependencias) {
          migrateData.dependencias = JSON.parse(dependencias);
          console.log(`📦 ${migrateData.dependencias.length} dependencias para migrar`);
        }
        if (marcas) {
          migrateData.marcas = JSON.parse(marcas);
          console.log(`📦 ${migrateData.marcas.length} marcas para migrar`);
        }
        if (empresaConfig) {
          migrateData.configuracionEmpresa = JSON.parse(empresaConfig);
          console.log('📦 Configuración de empresa para migrar');
        }

        const response = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-b351c7a3/migrate`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${accessToken}`,
            },
            body: JSON.stringify(migrateData),
          }
        );

        if (!response.ok) {
          throw new Error('Error en la migración');
        }

        const result = await response.json();
        console.log('✅ Migración completada exitosamente:', result);
        
        // Marcar como migrado
        localStorage.setItem('data_migrated', 'true');
        setMigrated(true);
      } catch (error: any) {
        console.error('❌ Error al migrar datos:', error);
        // No marcar como migrado si hubo error, para reintentar
      } finally {
        setMigrating(false);
      }
    };

    checkAndMigrate();
  }, [accessToken, migrated, migrating]);

  // Este componente no renderiza nada
  return null;
}
