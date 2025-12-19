import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout, selectAuthUser } from '../features/auth/authSlice';

const Header = () => {
    const location = useLocation();
    const dispatch = useDispatch();
    const user = useSelector(selectAuthUser);

    const handleLogout = () => {
        dispatch(logout());
    };

    return (
        <header className="bg-white border-b border-gray-200 shadow-sm">
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
                    {location.pathname !== '/' && (
                        <Link
                            to="/"
                            className="text-sm font-medium text-brand-600 hover:text-brand-800 transition-colors"
                        >
                            ← Retour à l'accueil
                        </Link>
                    )}

                    <div className="flex items-center space-x-4 border-l pl-6 border-gray-200">
                        <div className="text-right">
                            <div className="text-sm font-medium text-gray-900">{user?.name || 'Utilisateur'}</div>
                            <div className="text-xs text-gray-500">{user?.email || ''}</div>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="text-sm text-red-600 hover:text-red-800 font-medium"
                        >
                            Déconnexion
                        </button>
                    </div>
                </nav>
            </div>
        </header>
    );
};

export default Header;
