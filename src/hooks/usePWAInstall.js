import { useState, useEffect } from 'react';

/**
 * Hook pour gérer l'installation de la PWA
 */
const usePWAInstall = () => {
    const [deferredPrompt, setDeferredPrompt] = useState(null);
    const [isInstallable, setIsInstallable] = useState(false);
    const [isInstalled, setIsInstalled] = useState(false);

    useEffect(() => {
        // Vérifier si l'app est déjà installée ou en mode standalone
        const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
        if (isStandalone) {
            setIsInstalled(true);
            console.log('📱 App lancée en mode standalone (déjà installée)');
        }

        console.log('🔍 Recherche de compatibilité PWA...');
        console.log('🛠 Service Worker supporté:', 'serviceWorker' in navigator);
        console.log('🌐 Sécurisé (HTTPS/Local):', window.isSecureContext);

        const handleBeforeInstallPrompt = (e) => {
            console.log('✅ Événement beforeinstallprompt capturé !');
            // Empêcher l'affichage automatique par défaut sur mobile
            e.preventDefault();
            // Stocker l'événement pour plus tard
            setDeferredPrompt(e);
            setIsInstallable(true);
        };

        const handleAppInstalled = () => {
            // Cacher le bouton après l'installation
            setIsInstallable(false);
            setDeferredPrompt(null);
            setIsInstalled(true);
            console.log('🚀 PWA installée avec succès');
        };

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        window.addEventListener('appinstalled', handleAppInstalled);

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
            window.removeEventListener('appinstalled', handleAppInstalled);
        };
    }, []);

    const installPWA = async () => {
        if (!deferredPrompt) return;

        // Afficher l'invite d'installation native
        deferredPrompt.prompt();

        // Attendre la réponse de l'utilisateur
        const { outcome } = await deferredPrompt.userChoice;
        console.log(`👤 Choix utilisateur installation: ${outcome}`);

        // On ne peut utiliser deferredPrompt qu'une seule fois
        setDeferredPrompt(null);
        setIsInstallable(false);
    };

    return { isInstallable, isInstalled, installPWA };
};

export default usePWAInstall;
