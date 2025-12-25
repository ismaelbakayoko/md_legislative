import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout, selectAuthUser } from '../features/auth/authSlice';
import SettingsModal from './SettingsModal';
import usePWAInstall from '../hooks/usePWAInstall';

const Header = () => {
    const location = useLocation();
    const dispatch = useDispatch();
    const user = useSelector(selectAuthUser);
    const { selectedRegion, selectedDepartement, selectedCirconscription } = useSelector((state) => state.settings);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const { isInstallable, installPWA } = usePWAInstall();

    const isSettingsComplete = !!(selectedRegion && selectedDepartement && selectedCirconscription);

    React.useEffect(() => {
        if (user && !isSettingsComplete) {
            setIsSettingsOpen(true);
        }
    }, [user, isSettingsComplete]);

    const handleLogout = () => {
        dispatch(logout());
    };

    return (
        <header className="sticky top-0 bg-white border-b border-gray-200 shadow-sm z-50">
            <div className="container mx-auto px-4 py-4 flex justify-between items-center">
                <div className="flex items-center space-x-4">
                    <Link to="/" className="text-2xl font-bold text-brand-900 tracking-tight">
                        Résultats Élections
                    </Link>
                    <span className="text-gray-300 text-2xl">|</span>
                    <span className="text-sm font-medium text-gray-500 uppercase tracking-wider">
                        Législatives
                    </span>
                </div>

                <nav className="flex items-center space-x-6">
                    {/* Lien retour supprimé pour mode département unique */}

                    <div className="flex items-center space-x-4 border-l pl-6 border-gray-200">
                        <div className="text-right">
                            <div className="text-sm font-medium text-gray-900">{user?.name || 'Utilisateur'}</div>
                            <div className="text-xs text-gray-500">{user?.contact || user?.email || ''}</div>
                        </div>

                        {isInstallable && (
                            <button
                                onClick={installPWA}
                                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-orange-100 text-orange-700 hover:bg-orange-200 border border-orange-200 transition-all duration-300 shadow-sm group"
                                title="Installer l'application"
                            >
                                <svg className="w-4 h-4 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                </svg>
                                <span className="text-xs font-bold uppercase tracking-wider">Installer</span>
                            </button>
                        )}

                        <button
                            onClick={() => setIsSettingsOpen(true)}
                            className="text-gray-400 hover:text-brand-600 focus:outline-none"
                            title="Paramètres"
                        >
                            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                        </button>

                        <button
                            onClick={handleLogout}
                            className="text-sm text-red-600 hover:text-red-800 font-medium"
                        >
                            Déconnexion
                        </button>
                    </div>
                </nav>
            </div>
            <SettingsModal
                isOpen={isSettingsOpen}
                onClose={() => setIsSettingsOpen(false)}
                forced={!isSettingsComplete}
            />
        </header>
    );
};

export default Header;
