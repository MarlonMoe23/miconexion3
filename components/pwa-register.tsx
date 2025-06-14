'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { X, Download } from 'lucide-react';

export default function PWARegister() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);

  useEffect(() => {
    // Registrar Service Worker
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
          .then((registration) => {
            console.log('SW registrado con éxito: ', registration);
          })
          .catch((registrationError) => {
            console.log('SW falló al registrarse: ', registrationError);
          });
      });
    }

    // Capturar evento de instalación
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallBanner(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Detectar cuando la app ya está instalada
    window.addEventListener('appinstalled', () => {
      setShowInstallBanner(false);
      setDeferredPrompt(null);
      console.log('PWA instalada exitosamente');
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      console.log('Usuario aceptó la instalación');
    } else {
      console.log('Usuario rechazó la instalación');
    }
    
    setDeferredPrompt(null);
    setShowInstallBanner(false);
  };

  const handleCloseBanner = () => {
    setShowInstallBanner(false);
  };

  if (!showInstallBanner) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 bg-white border border-gray-200 rounded-lg shadow-lg p-4 mx-auto max-w-sm">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-gray-900 mb-1">
            Instalar App
          </h3>
          <p className="text-xs text-gray-600 mb-3">
            Instala Mi Conexión Interna para un acceso más rápido y funcionalidad offline.
          </p>
          <div className="flex gap-2">
            <Button
              onClick={handleInstallClick}
              size="sm"
              className="flex items-center gap-1 h-8 px-3 text-xs"
            >
              <Download className="h-3 w-3" />
              Instalar
            </Button>
            <Button
              onClick={handleCloseBanner}
              variant="outline"
              size="sm"
              className="h-8 px-3 text-xs"
            >
              Ahora no
            </Button>
          </div>
        </div>
        <Button
          onClick={handleCloseBanner}
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0 -mt-1 -mr-1"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}