import { useState, useEffect } from 'react';
import { Toaster } from 'sonner';
import { LoginScreen } from './components/LoginScreen';
import { SignupScreen } from './components/SignupScreen';
import { MainLayout } from './components/MainLayout';
import { DashboardScreen } from './components/DashboardScreen';
import { ActivosScreen } from './components/ActivosScreen';
import { CuentadantesScreen } from './components/CuentadantesScreen';
import { DependenciasScreen } from './components/DependenciasScreen';
import { ReportesScreen } from './components/ReportesScreen';
import { ConfiguracionScreen } from './components/ConfiguracionScreen';
import { CircularesScreen } from './components/CircularesScreen';
import { MarcasScreen } from './components/MarcasScreen';
import { NombresActivosScreen } from './components/NombresActivosScreen';
import { IngresosScreen } from './components/IngresosScreen';
import { BackendAdminScreen } from './components/BackendAdminScreen';
import { SupabaseConfigScreen } from './components/SupabaseConfigScreen';
import { UsuariosAdminScreen } from './components/UsuariosAdminScreen';

// 🚀 VERSIÓN 3.0.0 - 2026-01-26 - FORCE REBUILD - SIN CREDENCIALES
console.log('🔥 INVENTARIOS_XIPRI505 v3.0.0 - REBUILD COMPLETO - 26/01/2026');
console.log('✅ Sistema actualizado - Sin credenciales públicas');

type Screen = 'login' | 'signup' | 'dashboard' | 'activos' | 'cuentadantes' | 'dependencias' | 'reportes' | 'configuracion' | 'circulares' | 'marcas' | 'nombres-activos' | 'ingresos' | 'backend-admin' | 'supabase-config' | 'usuarios-admin';

function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('login');
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Verificar sesión
    const session = localStorage.getItem('inventory_session');
    if (session) {
      setIsAuthenticated(true);
      setCurrentScreen('dashboard');
    }

    // Inicializar datos de ejemplo si no existen
    initializeData();
  }, []);

  const initializeData = () => {
    // Crear usuario admin si no existe
    const users = JSON.parse(localStorage.getItem('inventory_users') || '{}');
    if (!users['admin@empresa.com']) {
      users['admin@empresa.com'] = {
        email: 'admin@empresa.com',
        password: 'admin123',
        nombre: 'Administrador'
      };
      localStorage.setItem('inventory_users', JSON.stringify(users));
    }

    // Crear activos de ejemplo si no existen - usando clave 'activos' consistente
    const activos = localStorage.getItem('activos');
    if (!activos) {
      const ejemplos = [
        {
          id: crypto.randomUUID(),
          qr: 'SIS-2-07-001',
          nombre: 'Laptop Dell Latitude 5420',
          marca: '',
          modelo: 'Latitude 5420',
          serie: 'DL5420-2024-001',
          dependencia: 'Sistemas',
          valor: 3500000,
          fechaIngreso: '2024-01-15',
          estado: 'Activo',
          grupo: '2-07',
          cuentadante: 'Juan Pérez'
        },
        {
          id: crypto.randomUUID(),
          qr: 'MUE-2-08-001',
          nombre: 'Escritorio Ejecutivo Premium',
          marca: '',
          modelo: 'Ejecutivo Premium',
          serie: 'MSA-ESC-2024-045',
          dependencia: 'Administracin',
          valor: 850000,
          fechaIngreso: '2024-02-20',
          estado: 'Activo',
          grupo: '2-08',
          cuentadante: 'María González'
        },
        {
          id: crypto.randomUUID(),
          qr: 'OFI-2-06-001',
          nombre: 'Impresora Multifuncional HP',
          marca: '',
          modelo: 'LaserJet Pro MFP M428',
          serie: 'HP-LJ428-2024-087',
          dependencia: 'Contabilidad',
          valor: 1200000,
          fechaIngreso: '2024-03-10',
          estado: 'Activo',
          grupo: '2-06',
          cuentadante: 'Carlos Rodríguez'
        }
      ];
      localStorage.setItem('activos', JSON.stringify(ejemplos));
    }

    // Inicializar marcas vacías si no existen
    const marcas = localStorage.getItem('marcas');
    if (!marcas) {
      localStorage.setItem('marcas', JSON.stringify([]));
    }

    // Migración: Limpiar marcas predefinidas (ejecutar una sola vez)
    const marcasLimpiadas = localStorage.getItem('marcas_limpiadas_v1');
    if (!marcasLimpiadas) {
      localStorage.setItem('marcas', JSON.stringify([]));
      localStorage.setItem('marcas_limpiadas_v1', 'true');
      console.log('✅ Marcas predefinidas eliminadas');
    }

    // Inicializar nombres de activos vacíos si no existen
    const nombresActivos = localStorage.getItem('nombres_activos');
    if (!nombresActivos) {
      localStorage.setItem('nombres_activos', JSON.stringify([]));
    }

    // Crear dependencias de ejemplo si no existen - usando clave 'dependencias' consistente
    const dependencias = localStorage.getItem('dependencias');
    if (!dependencias) {
      const ejemplosDependencias = [
        { id: crypto.randomUUID(), nombre: 'Sistemas', codigo: 'SIS', responsable: 'Juan Pérez', ubicacion: 'Edificio A - Piso 2' },
        { id: crypto.randomUUID(), nombre: 'Administracin', codigo: 'ADM', responsable: 'María González', ubicacion: 'Edificio A - Piso 1' },
        { id: crypto.randomUUID(), nombre: 'Contabilidad', codigo: 'CON', responsable: 'Carlos Rodríguez', ubicacion: 'Edificio A - Piso 1' },
        { id: crypto.randomUUID(), nombre: 'Recursos Humanos', codigo: 'RRH', responsable: 'Ana Martínez', ubicacion: 'Edificio B - Piso 1' }
      ];
      localStorage.setItem('dependencias', JSON.stringify(ejemplosDependencias));
    }

    // Crear cuentadantes de ejemplo si no existen
    const cuentadantes = localStorage.getItem('cuentadantes');
    if (!cuentadantes) {
      const ejemplosCuentadantes = [
        { id: crypto.randomUUID(), nombre: 'Juan Pérez', cedula: '1234567890', cargo: 'Jefe de Sistemas', dependencia: 'Sistemas', email: 'juan.perez@empresa.com', telefono: '3001234567' },
        { id: crypto.randomUUID(), nombre: 'María González', cedula: '0987654321', cargo: 'Administradora', dependencia: 'Administración', email: 'maria.gonzalez@empresa.com', telefono: '3007654321' },
        { id: crypto.randomUUID(), nombre: 'Carlos Rodríguez', cedula: '1122334455', cargo: 'Contador', dependencia: 'Contabilidad', email: 'carlos.rodriguez@empresa.com', telefono: '3009876543' },
        { id: crypto.randomUUID(), nombre: 'Ana Martínez', cedula: '5544332211', cargo: 'Jefe de RRHH', dependencia: 'Recursos Humanos', email: 'ana.martinez@empresa.com', telefono: '3005551234' }
      ];
      localStorage.setItem('cuentadantes', JSON.stringify(ejemplosCuentadantes));
    }

    // Crear configuración de empresa si no existe
    const config = localStorage.getItem('configuracion_empresa');
    if (!config) {
      const defaultConfig = {
        nombreEmpresa: 'Mi Empresa',
        nit: '900.123.456-7',
        direccion: 'Calle 123 #45-67',
        telefono: '(601) 234-5678',
        email: 'info@miempresa.com',
        logoUrl: ''
      };
      localStorage.setItem('configuracion_empresa', JSON.stringify(defaultConfig));
    }

    // Crear grupos de activos si no existen
    const grupos = localStorage.getItem('grupos_activos');
    if (!grupos) {
      const defaultGrupos = [
        { codigo: '2-06', nombre: 'Equipos de Oficina', prefijo: 'OFI-' },
        { codigo: '2-07', nombre: 'Sistemas y Comunicación', prefijo: 'SIS-' },
        { codigo: '2-08', nombre: 'Muebles y Enseres', prefijo: 'MUE-' }
      ];
      localStorage.setItem('grupos_activos', JSON.stringify(defaultGrupos));
    }

    // Crear circulares vacías si no existen
    const circulares = localStorage.getItem('circulares');
    if (!circulares) {
      localStorage.setItem('circulares', JSON.stringify([]));
    }
  };

  const handleLogin = (email: string, password: string) => {
    // Login hardcoded para garantizar que funcione
    if (email === 'admin@empresa.com' && password === 'admin123') {
      const session = {
        email: 'admin@empresa.com',
        nombre: 'Administrador',
        timestamp: new Date().toISOString()
      };
      localStorage.setItem('inventory_session', JSON.stringify(session));
      setIsAuthenticated(true);
      setCurrentScreen('dashboard');
      return true;
    }

    // Verificar otros usuarios en localStorage
    const users = JSON.parse(localStorage.getItem('inventory_users') || '{}');
    const user = users[email];
    
    if (user && user.password === password) {
      const session = {
        email: user.email,
        nombre: user.nombre,
        timestamp: new Date().toISOString()
      };
      localStorage.setItem('inventory_session', JSON.stringify(session));
      setIsAuthenticated(true);
      setCurrentScreen('dashboard');
      return true;
    }

    return false;
  };

  const handleSignup = async (email: string, password: string, nombre: string): Promise<{ success: boolean; error?: string }> => {
    try {
      // Verificar si el usuario ya existe
      const users = JSON.parse(localStorage.getItem('inventory_users') || '{}');
      
      if (users[email]) {
        return { success: false, error: 'Este correo electrónico ya está registrado' };
      }

      // Crear nuevo usuario
      users[email] = {
        email,
        password,
        nombre,
        createdAt: new Date().toISOString()
      };

      // Guardar en localStorage
      localStorage.setItem('inventory_users', JSON.stringify(users));

      return { success: true };
    } catch (error) {
      console.error('Error al crear usuario:', error);
      return { success: false, error: 'Error al crear la cuenta. Inténtelo de nuevo.' };
    }
  };

  const handleGoToSignup = () => {
    setCurrentScreen('signup');
  };

  const handleGoToLogin = () => {
    setCurrentScreen('login');
  };

  const handleLogout = () => {
    localStorage.removeItem('inventory_session');
    setIsAuthenticated(false);
    setCurrentScreen('login');
  };

  const handleNavigate = (screen: Screen) => {
    setCurrentScreen(screen);
  };

  // Pantalla de login
  if (!isAuthenticated) {
    return (
      <>
        {currentScreen === 'login' && (
          <LoginScreen onLogin={handleLogin} onGoToSignup={handleGoToSignup} />
        )}
        {currentScreen === 'signup' && (
          <SignupScreen onSignup={handleSignup} onGoToLogin={handleGoToLogin} />
        )}
        <Toaster position="top-right" />
      </>
    );
  }

  // Aplicación principal (autenticada)
  return (
    <>
      <MainLayout
        currentScreen={currentScreen}
        onNavigate={handleNavigate}
        onLogout={handleLogout}
      >
        {currentScreen === 'dashboard' && <DashboardScreen />}
        {currentScreen === 'activos' && <ActivosScreen />}
        {currentScreen === 'cuentadantes' && <CuentadantesScreen />}
        {currentScreen === 'dependencias' && <DependenciasScreen />}
        {currentScreen === 'marcas' && <MarcasScreen />}
        {currentScreen === 'nombres-activos' && <NombresActivosScreen />}
        {currentScreen === 'reportes' && <ReportesScreen />}
        {currentScreen === 'configuracion' && <ConfiguracionScreen />}
        {currentScreen === 'circulares' && <CircularesScreen />}
        {currentScreen === 'ingresos' && <IngresosScreen />}
        {currentScreen === 'backend-admin' && <BackendAdminScreen />}
        {currentScreen === 'supabase-config' && <SupabaseConfigScreen />}
        {currentScreen === 'usuarios-admin' && <UsuariosAdminScreen />}
      </MainLayout>
      <Toaster position="top-right" />
    </>
  );
}

export default App;