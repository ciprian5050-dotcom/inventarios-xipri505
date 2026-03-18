import { useState, useEffect } from 'react';
import { Toaster } from 'sonner';
import { ErrorBoundary } from './components/ErrorBoundary';
import { LoginScreen } from './components/LoginScreen';
import { MainLayout } from './components/MainLayout';
import { DashboardScreen } from './components/DashboardScreen';
import { ActivosScreen } from './components/ActivosScreen';
import { ActivosList } from './components/ActivosList';
import { DependenciasScreen } from './components/DependenciasScreen';
import { CuentadantesScreen } from './components/CuentadantesScreen';
import { ConfiguracionScreen } from './components/ConfiguracionScreen';
import { ReportesScreen } from './components/ReportesScreen';
import { IngresosScreen } from './components/IngresosScreen';
import { BackupRestoreScreen } from './components/BackupRestoreScreen';
import { DepreciacionScreen } from './components/DepreciacionScreen';
import { UsuariosScreen } from './components/UsuariosScreen';
import type { Activo, Dependencia, GrupoActivo, Cuentadante, Usuario } from './types';
import { toast } from 'sonner';
import { projectId, publicAnonKey } from './utils/supabase/info';

const SUPABASE_URL = `https://${projectId}.supabase.co`;
const SUPABASE_ANON_KEY = publicAnonKey;

type Screen = 'dashboard' | 'activos' | 'lista' | 'dependencias' | 'cuentadantes' | 'configuracion' | 'reportes' | 'ingresos' | 'backup' | 'depreciacion' | 'usuarios';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('dashboard');
  const [activos, setActivos] = useState<Activo[]>([]);
  const [dependencias, setDependencias] = useState<Dependencia[]>([]);
  const [grupos, setGrupos] = useState<GrupoActivo[]>([]);
  const [cuentadantes, setCuentadantes] = useState<Cuentadante[]>([]);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [editingActivo, setEditingActivo] = useState<Activo | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<Usuario | null>(null);

  // Cargar datos desde Supabase
  useEffect(() => {
    if (isAuthenticated) {
      loadAllData();
    }
  }, [isAuthenticated]);

  const loadAllData = async () => {
    await Promise.all([
      loadActivos(),
      loadDependencias(),
      loadGrupos(),
      loadCuentadantes(),
      loadUsuarios()
    ]);
  };

  const loadActivos = async () => {
    if (!isAuthenticated) return;
    
    try {
      setLoading(true);
      const response = await fetch(`${SUPABASE_URL}/functions/v1/make-server-b351c7a3/activos`, {
        headers: { 'Authorization': `Bearer ${SUPABASE_ANON_KEY}` }
      });
      
      if (!response.ok) throw new Error('Error al cargar activos');
      
      const data = await response.json();
      setActivos(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error cargando activos:', error);
      toast.error('Error al cargar activos');
      setActivos([]);
    } finally {
      setLoading(false);
    }
  };

  const loadDependencias = async () => {
    if (!isAuthenticated) return;
    
    try {
      const response = await fetch(`${SUPABASE_URL}/functions/v1/make-server-b351c7a3/dependencias`, {
        headers: { 'Authorization': `Bearer ${SUPABASE_ANON_KEY}` }
      });
      
      if (!response.ok) throw new Error('Error al cargar dependencias');
      
      const data = await response.json();
      setDependencias(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error cargando dependencias:', error);
      toast.error('Error al cargar dependencias');
      setDependencias([]);
    }
  };

  const loadGrupos = async () => {
    if (!isAuthenticated) return;
    
    try {
      const response = await fetch(`${SUPABASE_URL}/functions/v1/make-server-b351c7a3/grupos`, {
        headers: { 'Authorization': `Bearer ${SUPABASE_ANON_KEY}` }
      });
      
      if (!response.ok) throw new Error('Error al cargar grupos');
      
      const data = await response.json();
      setGrupos(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error cargando grupos:', error);
      toast.error('Error al cargar grupos');
      setGrupos([]);
    }
  };

  const loadCuentadantes = async () => {
    if (!isAuthenticated) return;
    
    try {
      setLoading(true);
      console.log('🔍 Cargando cuentadantes desde Supabase...');
      
      const response = await fetch(`${SUPABASE_URL}/functions/v1/make-server-b351c7a3/cuentadantes`, {
        headers: { 'Authorization': `Bearer ${SUPABASE_ANON_KEY}` }
      });
      
      console.log('📡 Response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Error response:', errorText);
        throw new Error('Error al cargar cuentadantes');
      }
      
      const data = await response.json();
      console.log('✅ Cuentadantes cargados:', data);
      console.log('📊 Cantidad:', Array.isArray(data) ? data.length : 'NO ES ARRAY');
      
      setCuentadantes(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('💥 Error cargando cuentadantes:', error);
      toast.error('Error al cargar cuentadantes');
      setCuentadantes([]);
    } finally {
      setLoading(false);
    }
  };

  const loadUsuarios = async () => {
    if (!isAuthenticated) return;
    
    try {
      const response = await fetch(`${SUPABASE_URL}/functions/v1/make-server-b351c7a3/usuarios`, {
        headers: { 'Authorization': `Bearer ${SUPABASE_ANON_KEY}` }
      });
      
      if (!response.ok) throw new Error('Error al cargar usuarios');
      
      const data = await response.json();
      setUsuarios(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error cargando usuarios:', error);
      toast.error('Error al cargar usuarios');
      setUsuarios([]);
    }
  };

  const handleAddActivo = async (activo: Omit<Activo, 'id'>) => {
    try {
      const response = await fetch(`${SUPABASE_URL}/functions/v1/make-server-b351c7a3/activos`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(activo)
      });

      if (!response.ok) throw new Error('Error al agregar activo');

      await loadActivos();
      toast.success('Activo agregado exitosamente');
    } catch (error) {
      console.error('Error agregando activo:', error);
      toast.error('Error al agregar activo');
    }
  };

  const handleUpdateActivo = async (id: string, activo: Omit<Activo, 'id'>) => {
    try {
      const response = await fetch(`${SUPABASE_URL}/functions/v1/make-server-b351c7a3/activos/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(activo)
      });

      if (!response.ok) throw new Error('Error al actualizar activo');

      await loadActivos();
      setEditingActivo(null);
      toast.success('Activo actualizado exitosamente');
    } catch (error) {
      console.error('Error actualizando activo:', error);
      toast.error('Error al actualizar activo');
    }
  };

  const handleDeleteActivo = async (id: string) => {
    try {
      const response = await fetch(`${SUPABASE_URL}/functions/v1/make-server-b351c7a3/activos/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${SUPABASE_ANON_KEY}` }
      });

      if (!response.ok) throw new Error('Error al eliminar activo');

      await loadActivos();
      toast.success('Activo eliminado exitosamente');
    } catch (error) {
      console.error('Error eliminando activo:', error);
      toast.error('Error al eliminar activo');
    }
  };

  const handleAddDependencia = async (dependencia: Omit<Dependencia, 'id'>) => {
    try {
      const response = await fetch(`${SUPABASE_URL}/functions/v1/make-server-b351c7a3/dependencias`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(dependencia)
      });

      if (!response.ok) throw new Error('Error al agregar dependencia');

      await loadDependencias();
      toast.success('Dependencia agregada exitosamente');
    } catch (error) {
      console.error('Error agregando dependencia:', error);
      toast.error('Error al agregar dependencia');
    }
  };

  const handleUpdateDependencia = async (id: string, dependencia: Omit<Dependencia, 'id'>) => {
    try {
      const response = await fetch(`${SUPABASE_URL}/functions/v1/make-server-b351c7a3/dependencias/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(dependencia)
      });

      if (!response.ok) throw new Error('Error al actualizar dependencia');

      await loadDependencias();
      toast.success('Dependencia actualizada exitosamente');
    } catch (error) {
      console.error('Error actualizando dependencia:', error);
      toast.error('Error al actualizar dependencia');
    }
  };

  const handleDeleteDependencia = async (id: string) => {
    try {
      const response = await fetch(`${SUPABASE_URL}/functions/v1/make-server-b351c7a3/dependencias/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${SUPABASE_ANON_KEY}` }
      });

      if (!response.ok) throw new Error('Error al eliminar dependencia');

      await loadDependencias();
      toast.success('Dependencia eliminada exitosamente');
    } catch (error) {
      console.error('Error eliminando dependencia:', error);
      toast.error('Error al eliminar dependencia');
    }
  };

  const handleAddGrupo = async (grupo: Omit<GrupoActivo, 'id'>) => {
    try {
      const response = await fetch(`${SUPABASE_URL}/functions/v1/make-server-b351c7a3/grupos`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(grupo)
      });

      if (!response.ok) throw new Error('Error al agregar grupo');

      await loadGrupos();
      toast.success('Grupo agregado exitosamente');
    } catch (error) {
      console.error('Error agregando grupo:', error);
      toast.error('Error al agregar grupo');
    }
  };

  const handleUpdateGrupo = async (id: string, grupo: Omit<GrupoActivo, 'id'>) => {
    try {
      const response = await fetch(`${SUPABASE_URL}/functions/v1/make-server-b351c7a3/grupos/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(grupo)
      });

      if (!response.ok) throw new Error('Error al actualizar grupo');

      await loadGrupos();
      toast.success('Grupo actualizado exitosamente');
    } catch (error) {
      console.error('Error actualizando grupo:', error);
      toast.error('Error al actualizar grupo');
    }
  };

  const handleDeleteGrupo = async (id: string) => {
    try {
      const response = await fetch(`${SUPABASE_URL}/functions/v1/make-server-b351c7a3/grupos/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${SUPABASE_ANON_KEY}` }
      });

      if (!response.ok) throw new Error('Error al eliminar grupo');

      await loadGrupos();
      toast.success('Grupo eliminado exitosamente');
    } catch (error) {
      console.error('Error eliminando grupo:', error);
      toast.error('Error al eliminar grupo');
    }
  };

  const handleAddCuentadante = async (cuentadante: Omit<Cuentadante, 'id'>) => {
    try {
      const response = await fetch(`${SUPABASE_URL}/functions/v1/make-server-b351c7a3/cuentadantes`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(cuentadante)
      });

      if (!response.ok) throw new Error('Error al agregar cuentadante');

      await loadCuentadantes();
      toast.success('Cuentadante agregado exitosamente');
    } catch (error) {
      console.error('Error agregando cuentadante:', error);
      toast.error('Error al agregar cuentadante');
    }
  };

  const handleUpdateCuentadante = async (id: string, cuentadante: Omit<Cuentadante, 'id'>) => {
    try {
      const response = await fetch(`${SUPABASE_URL}/functions/v1/make-server-b351c7a3/cuentadantes/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(cuentadante)
      });

      if (!response.ok) throw new Error('Error al actualizar cuentadante');

      await loadCuentadantes();
      toast.success('Cuentadante actualizado exitosamente');
    } catch (error) {
      console.error('Error actualizando cuentadante:', error);
      toast.error('Error al actualizar cuentadante');
    }
  };

  const handleDeleteCuentadante = async (id: string) => {
    try {
      const response = await fetch(`${SUPABASE_URL}/functions/v1/make-server-b351c7a3/cuentadantes/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${SUPABASE_ANON_KEY}` }
      });

      if (!response.ok) throw new Error('Error al eliminar cuentadante');

      await loadCuentadantes();
      toast.success('Cuentadante eliminado exitosamente');
    } catch (error) {
      console.error('Error eliminando cuentadante:', error);
      toast.error('Error al eliminar cuentadante');
    }
  };

  const handleAddUsuario = async (usuario: Omit<Usuario, 'id'>) => {
    try {
      const response = await fetch(`${SUPABASE_URL}/functions/v1/make-server-b351c7a3/usuarios`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(usuario)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Error al agregar usuario');
      }

      await loadUsuarios();
      toast.success('Usuario agregado exitosamente');
    } catch (error: any) {
      console.error('Error agregando usuario:', error);
      toast.error(error.message || 'Error al agregar usuario');
    }
  };

  const handleUpdateUsuario = async (id: string, usuario: Omit<Usuario, 'id'>) => {
    try {
      const response = await fetch(`${SUPABASE_URL}/functions/v1/make-server-b351c7a3/usuarios/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(usuario)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Error al actualizar usuario');
      }

      await loadUsuarios();
      toast.success('Usuario actualizado exitosamente');
    } catch (error: any) {
      console.error('Error actualizando usuario:', error);
      toast.error(error.message || 'Error al actualizar usuario');
    }
  };

  const handleDeleteUsuario = async (id: string) => {
    try {
      const response = await fetch(`${SUPABASE_URL}/functions/v1/make-server-b351c7a3/usuarios/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${SUPABASE_ANON_KEY}` }
      });

      if (!response.ok) throw new Error('Error al eliminar usuario');

      await loadUsuarios();
      toast.success('Usuario eliminado exitosamente');
    } catch (error) {
      console.error('Error eliminando usuario:', error);
      toast.error('Error al eliminar usuario');
    }
  };

  const handleLogin = (user: Usuario) => {
    setCurrentUser(user);
    setIsAuthenticated(true);
    toast.success(`Bienvenido, ${user.nombre}`);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setIsAuthenticated(false);
    setCurrentScreen('dashboard');
    toast.success('Sesión cerrada exitosamente');
  };

  // Pantalla de login si no está autenticado
  if (!isAuthenticated) {
    return (
      <>
        <LoginScreen onLogin={handleLogin} />
        <Toaster position="top-right" />
      </>
    );
  }

  // Aplicación principal (autenticada)
  return (
    <ErrorBoundary>
      <MainLayout 
        currentScreen={currentScreen} 
        onNavigate={setCurrentScreen}
        currentUser={currentUser}
        onLogout={handleLogout}
      >
        {currentScreen === 'dashboard' && (
          <DashboardScreen 
            activos={activos}
            dependencias={dependencias.map(d => d.nombre)}
            cuentadantes={cuentadantes}
          />
        )}
        {currentScreen === 'activos' && (
          <ActivosScreen
            activos={activos}
            dependencias={dependencias.map(d => d.nombre)}
            grupos={grupos}
            onAddActivo={handleAddActivo}
            onUpdateActivo={handleUpdateActivo}
            editingActivo={editingActivo}
            setEditingActivo={setEditingActivo}
          />
        )}
        {currentScreen === 'lista' && (
          <ActivosList
            activos={activos}
            dependencias={dependencias.map(d => d.nombre)}
            onEdit={setEditingActivo}
            onDelete={handleDeleteActivo}
          />
        )}
        {currentScreen === 'dependencias' && (
          <DependenciasScreen
            dependencias={dependencias}
            activos={activos}
            onAddDependencia={handleAddDependencia}
            onUpdateDependencia={handleUpdateDependencia}
            onDeleteDependencia={handleDeleteDependencia}
          />
        )}
        {currentScreen === 'cuentadantes' && (
          <CuentadantesScreen
            cuentadantes={cuentadantes}
            activos={activos}
            dependencias={dependencias.map(d => d.nombre)}
            onAddCuentadante={handleAddCuentadante}
            onUpdateCuentadante={handleUpdateCuentadante}
            onDeleteCuentadante={handleDeleteCuentadante}
          />
        )}
        {currentScreen === 'configuracion' && (
          <ConfiguracionScreen
            grupos={grupos}
            onAddGrupo={handleAddGrupo}
            onUpdateGrupo={handleUpdateGrupo}
            onDeleteGrupo={handleDeleteGrupo}
          />
        )}
        {currentScreen === 'reportes' && (
          <ReportesScreen
            activos={activos}
            dependencias={dependencias.map(d => d.nombre)}
          />
        )}
        {currentScreen === 'ingresos' && (
          <IngresosScreen
            activos={activos}
            dependencias={dependencias.map(d => d.nombre)}
            grupos={grupos}
            onAddActivo={handleAddActivo}
          />
        )}
        {currentScreen === 'backup' && (
          <BackupRestoreScreen
            activos={activos}
            dependencias={dependencias}
            grupos={grupos}
            cuentadantes={cuentadantes}
            onRestore={loadAllData}
          />
        )}
        {currentScreen === 'depreciacion' && (
          <DepreciacionScreen activos={activos} />
        )}
        {currentScreen === 'usuarios' && currentUser?.rol === 'administrador' && (
          <UsuariosScreen
            usuarios={usuarios}
            onAddUsuario={handleAddUsuario}
            onUpdateUsuario={handleUpdateUsuario}
            onDeleteUsuario={handleDeleteUsuario}
            currentUser={currentUser}
          />
        )}
      </MainLayout>
      <Toaster position="top-right" />
    </ErrorBoundary>
  );
}
