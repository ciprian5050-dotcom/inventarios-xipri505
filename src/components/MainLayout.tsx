import { ReactNode, useState, useEffect } from 'react';
import { 
  Package, 
  LayoutDashboard, 
  LogOut, 
  Menu, 
  X,
  ChevronLeft,
  ChevronRight,
  User as UserIcon,
  Users,
  Building2,
  FileText,
  Settings,
  FileSignature,
  Tag,
  Layers,
  Database,
  ServerCog,
  PackagePlus,
  UserCog
} from 'lucide-react';

interface MainLayoutProps {
  currentScreen: string;
  onNavigate: (screen: 'dashboard' | 'activos' | 'cuentadantes' | 'dependencias' | 'reportes' | 'configuracion' | 'circulares' | 'marcas' | 'nombres-activos' | 'ingresos' | 'backend-admin' | 'supabase-config' | 'usuarios-admin') => void;
  onLogout: () => void;
  children: ReactNode;
}

export function MainLayout({ currentScreen, onNavigate, onLogout, children }: MainLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [user, setUser] = useState({ nombre: 'Usuario', rol: 'Admin' });

  useEffect(() => {
    // Obtener información del usuario de la sesión
    const session = localStorage.getItem('inventory_session');
    if (session) {
      try {
        const sessionData = JSON.parse(session);
        setUser({
          nombre: sessionData.nombre || 'Usuario',
          rol: sessionData.rol || 'Administrador'
        });
      } catch (e) {
        console.error('Error al cargar sesión:', e);
      }
    }
  }, []);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'dependencias', label: 'Dependencias', icon: Building2 },
    { id: 'cuentadantes', label: 'Cuentadantes', icon: Users },
    { id: 'marcas', label: 'Marcas', icon: Tag },
    { id: 'nombres-activos', label: 'Nombres Activos', icon: Layers },
    { id: 'activos', label: 'Activos Fijos', icon: Package },
    { id: 'ingresos', label: 'Ingresos', icon: PackagePlus },
    { id: 'reportes', label: 'Reportes', icon: FileText },
    { id: 'configuracion', label: 'Configuración', icon: Settings },
    { id: 'circulares', label: 'Circulares', icon: FileSignature },
    { id: 'backend-admin', label: 'Backend Admin', icon: Database },
    { id: 'supabase-config', label: 'Configuración Supabase', icon: ServerCog },
    { id: 'usuarios-admin', label: 'Administrar Usuarios', icon: UserCog }
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar Desktop */}
      <aside
        className={`hidden lg:flex flex-col bg-white border-r border-slate-200 transition-all duration-300 ${
          sidebarCollapsed ? 'w-20' : 'w-64'
        }`}
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-200">
          {!sidebarCollapsed && (
            <div className="flex items-center gap-3">
              <div className="bg-slate-900 p-2 rounded-lg">
                <Package className="w-5 h-5 text-white" />
              </div>
              <span className="text-slate-900">Activos Fijos</span>
            </div>
          )}
          {sidebarCollapsed && (
            <div className="bg-slate-900 p-2 rounded-lg mx-auto">
              <Package className="w-5 h-5 text-white" />
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentScreen === item.id;
              
              return (
                <li key={item.id}>
                  <button
                    onClick={() => onNavigate(item.id as 'dashboard' | 'activos' | 'cuentadantes' | 'dependencias' | 'reportes' | 'configuracion' | 'circulares' | 'marcas' | 'nombres-activos' | 'ingresos' | 'backend-admin' | 'supabase-config' | 'usuarios-admin')}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-slate-900 text-white'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    } ${sidebarCollapsed ? 'justify-center' : ''}`}
                    title={sidebarCollapsed ? item.label : ''}
                  >
                    <Icon className="w-5 h-5 flex-shrink-0" />
                    {!sidebarCollapsed && <span>{item.label}</span>}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* User & Collapse */}
        <div className="border-t border-slate-200 p-4">
          {!sidebarCollapsed && (
            <div className="flex items-center gap-3 px-4 py-3 mb-2">
              <div className="w-8 h-8 bg-slate-900 rounded-full flex items-center justify-center">
                <UserIcon className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-slate-900 text-sm truncate">{user?.nombre || 'Usuario'}</p>
                <p className="text-slate-500 text-xs truncate">{user?.rol || 'Administrador'}</p>
              </div>
            </div>
          )}
          
          <div className="flex gap-2">
            {!sidebarCollapsed && (
              <button
                onClick={onLogout}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-slate-600 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Salir</span>
              </button>
            )}
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              title={sidebarCollapsed ? 'Expandir' : 'Contraer'}
            >
              {sidebarCollapsed ? (
                <ChevronRight className="w-5 h-5" />
              ) : (
                <ChevronLeft className="w-5 h-5" />
              )}
            </button>
          </div>

          {sidebarCollapsed && (
            <button
              onClick={onLogout}
              className="w-full mt-2 p-2 text-slate-600 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors flex items-center justify-center"
              title="Cerrar sesión"
            >
              <LogOut className="w-5 h-5" />
            </button>
          )}
        </div>
      </aside>

      {/* Mobile Sidebar */}
      {mobileSidebarOpen && (
        <>
          <div
            className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={() => setMobileSidebarOpen(false)}
          />
          <aside className="lg:hidden fixed left-0 top-0 bottom-0 w-64 bg-white border-r border-slate-200 z-50 flex flex-col">
            {/* Logo */}
            <div className="h-16 flex items-center justify-between px-4 border-b border-slate-200">
              <div className="flex items-center gap-3">
                <div className="bg-slate-900 p-2 rounded-lg">
                  <Package className="w-5 h-5 text-white" />
                </div>
                <span className="text-slate-900">Activos Fijos</span>
              </div>
              <button
                onClick={() => setMobileSidebarOpen(false)}
                className="p-2 hover:bg-slate-100 rounded-lg"
              >
                <X className="w-5 h-5 text-slate-600" />
              </button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4">
              <ul className="space-y-2">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = currentScreen === item.id;
                  
                  return (
                    <li key={item.id}>
                      <button
                        onClick={() => {
                          onNavigate(item.id as 'dashboard' | 'activos' | 'cuentadantes' | 'dependencias' | 'reportes' | 'configuracion' | 'circulares' | 'marcas' | 'nombres-activos' | 'ingresos' | 'backend-admin' | 'supabase-config' | 'usuarios-admin');
                          setMobileSidebarOpen(false);
                        }}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                          isActive
                            ? 'bg-slate-900 text-white'
                            : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                        <span>{item.label}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </nav>

            {/* User */}
            <div className="border-t border-slate-200 p-4">
              <div className="flex items-center gap-3 px-4 py-3 mb-2">
                <div className="w-8 h-8 bg-slate-900 rounded-full flex items-center justify-center">
                  <UserIcon className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-slate-900 text-sm truncate">{user?.nombre || 'Usuario'}</p>
                  <p className="text-slate-500 text-xs truncate">{user?.rol || 'Administrador'}</p>
                </div>
              </div>
              <button
                onClick={onLogout}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 text-slate-600 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Cerrar Sesión</span>
              </button>
            </div>
          </aside>
        </>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header Mobile */}
        <header className="lg:hidden h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4">
          <button
            onClick={() => setMobileSidebarOpen(true)}
            className="p-2 hover:bg-slate-100 rounded-lg"
          >
            <Menu className="w-6 h-6 text-slate-900" />
          </button>
          <div className="flex items-center gap-2">
            <div className="bg-slate-900 p-2 rounded-lg">
              <Package className="w-5 h-5 text-white" />
            </div>
            <span className="text-slate-900">Activos Fijos</span>
          </div>
          <div className="w-10" /> {/* Spacer for centering */}
        </header>

        {/* Content */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>

        {/* Footer con Copyright */}
        <footer className="bg-white border-t border-slate-200 py-4 px-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-sm text-slate-600">
            <div>
              <span className="font-semibold text-slate-900">INVENTARIOS_XIPRI505</span>
              <span className="mx-2">•</span>
              <span>© {new Date().getFullYear()} Todos los derechos reservados</span>
            </div>
            <div className="text-slate-500">
              Sistema de Gestión de Activos Fijos
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}