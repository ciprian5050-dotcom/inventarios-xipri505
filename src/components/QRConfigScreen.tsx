import { Label } from './ui/label';
import { QrCode, Save, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

interface PublicConfig {
  showQr: boolean;
  showNombre: boolean;
  showMarca: boolean;
  showModelo: boolean;
  showSerie: boolean;
  showDependencia: boolean;
  showCuentadante: boolean;
  showValor: boolean;
  showFechaIngreso: boolean;
  showEstado: boolean;
  showObservaciones: boolean;
}

export function QRConfigScreen() {
  const [config, setConfig] = useState<PublicConfig>({
    showQr: true,
    showNombre: true,
    showMarca: true,
    showModelo: true,
    showSerie: true,
    showDependencia: true,
    showCuentadante: false,
    showValor: false,
    showFechaIngreso: true,
    showEstado: true,
    showObservaciones: false,
  });

  useEffect(() => {
    // Cargar configuración guardada
    const savedConfig = localStorage.getItem('qr_public_config');
    if (savedConfig) {
      setConfig(JSON.parse(savedConfig));
    }
  }, []);

  const handleToggle = (field: keyof PublicConfig) => {
    setConfig(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const handleSave = () => {
    localStorage.setItem('qr_public_config', JSON.stringify(config));
    toast.success('Configuración guardada correctamente');
  };

  const configItems = [
    { key: 'showQr', label: 'Código QR', description: 'Mostrar el código del activo' },
    { key: 'showNombre', label: 'Nombre', description: 'Nombre del activo' },
    { key: 'showMarca', label: 'Marca', description: 'Marca del activo' },
    { key: 'showModelo', label: 'Modelo', description: 'Modelo del activo' },
    { key: 'showSerie', label: 'Serie', description: 'Número de serie' },
    { key: 'showDependencia', label: 'Dependencia', description: 'Dependencia u oficina asignada' },
    { key: 'showCuentadante', label: 'Cuentadante', description: 'Persona responsable' },
    { key: 'showValor', label: 'Valor', description: 'Valor económico del activo' },
    { key: 'showFechaIngreso', label: 'Fecha de Ingreso', description: 'Fecha de registro' },
    { key: 'showEstado', label: 'Estado', description: 'Estado actual del activo' },
    { key: 'showObservaciones', label: 'Observaciones', description: 'Notas y comentarios' },
  ];

  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <QrCode className="w-8 h-8 text-slate-700" />
            <h1 className="text-slate-900">Configuración de QR Público</h1>
          </div>
          <p className="text-slate-600">
            Selecciona qué información se mostrará cuando alguien escanee el código QR de un activo
          </p>
        </div>

        {/* Alert informativo */}
        <Card className="p-4 bg-blue-50 border-blue-200 mb-6">
          <div className="flex gap-3">
            <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-blue-900 mb-1">Vista pública sin autenticación</p>
              <p className="text-blue-700">
                Las personas podrán ver esta información escaneando el código QR sin necesidad de iniciar sesión. 
                Por seguridad, desactiva los campos sensibles como el valor o cuentadante si no quieres compartirlos.
              </p>
            </div>
          </div>
        </Card>

        {/* Configuración de campos */}
        <Card className="p-6">
          <h3 className="text-slate-900 mb-6">Campos visibles en el QR</h3>
          
          <div className="space-y-4">
            {configItems.map((item) => (
              <div 
                key={item.key}
                className="flex items-center justify-between p-4 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors"
              >
                <div className="flex-1">
                  <Label htmlFor={item.key} className="text-slate-900 cursor-pointer">
                    {item.label}
                  </Label>
                  <p className="text-slate-600 mt-1">{item.description}</p>
                </div>
                <Switch
                  id={item.key}
                  checked={config[item.key as keyof PublicConfig]}
                  onCheckedChange={() => handleToggle(item.key as keyof PublicConfig)}
                />
              </div>
            ))}
          </div>

          {/* Botón de guardar */}
          <div className="mt-6 pt-6 border-t border-slate-200 flex justify-end">
            <Button onClick={handleSave} className="gap-2">
              <Save className="w-4 h-4" />
              Guardar Configuración
            </Button>
          </div>
        </Card>

        {/* Preview info */}
        <Card className="p-4 mt-6 bg-slate-50">
          <p className="text-slate-600">
            💡 <strong>Consejo:</strong> Después de guardar, genera los códigos QR desde el módulo de Activos Fijos. 
            Cada código QR contendrá un enlace único que mostrará solo los campos que has activado aquí.
          </p>
        </Card>
      </div>
    </div>
  );
}