import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { register, selectAuthLoading, selectIsAuthenticated, selectAuthError } from '../features/auth/authSlice';

const Register = () => {
    const [formData, setFormData] = useState({
        nom_user: '',
        contact_user: '',
        password_user: '',
        id_bv: '',
        // confirm_password: ''
    });

    const dispatch = useDispatch();
    const navigate = useNavigate();
    const loading = useSelector(selectAuthLoading);
    const isAuthenticated = useSelector(selectIsAuthenticated);
    const error = useSelector(selectAuthError);

    useEffect(() => {
        if (isAuthenticated) {
            navigate('/');
        }
    }, [isAuthenticated, navigate]);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (formData.password_user !== formData.confirm_password) {
            alert("Les mots de passe ne correspondent pas");
            return;
        }

        const resultAction = await dispatch(register({
            nom_user: formData.nom_user,
            contact_user: formData.contact_user,
            password_user: formData.password_user,
            id_bv: formData.id_bv
        }));

        if (register.fulfilled.match(resultAction)) {
            // Registration successful, maybe redirect to login or home?
            // For now redirect to login
            navigate('/login');
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
                <div className="mx-auto h-24 w-24 mb-4 flex justify-center items-center">
                    <svg viewBox="0 0 100 100" className="h-full w-full">
                        <path d="M50 0 C20 0 0 30 0 60 C0 90 30 90 50 90 C70 90 100 90 100 60 C100 30 80 0 50 0 Z M50 20 C60 20 65 30 65 40 C65 55 55 60 50 60 C45 60 35 55 35 40 C35 30 40 20 50 20 Z" fill="#2E4D8C" />
                    </svg>
                </div>
                <h2 className="mt-2 text-3xl font-extrabold text-brand-900 tracking-tight">
                    Créer un compte
                </h2>
                <p className="mt-2 text-sm text-gray-500">
                    Portail des Résultats Électoraux
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 border-t-4 border-brand-600">
                    <form className="space-y-6" onSubmit={handleSubmit}>
                        <div>
                            <label htmlFor="nom_user" className="block text-sm font-medium text-gray-700">
                                Nom complet
                            </label>
                            <div className="mt-1">
                                <input
                                    id="nom_user"
                                    name="nom_user"
                                    type="text"
                                    required
                                    value={formData.nom_user}
                                    onChange={handleChange}
                                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-brand-500 focus:border-brand-500 sm:text-sm"
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="contact_user" className="block text-sm font-medium text-gray-700">
                                Contact (Email ou Téléphone)
                            </label>
                            <div className="mt-1">
                                <input
                                    id="contact_user"
                                    name="contact_user"
                                    type="text"
                                    required
                                    value={formData.contact_user}
                                    onChange={handleChange}
                                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-brand-500 focus:border-brand-500 sm:text-sm"
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="password_user" className="block text-sm font-medium text-gray-700">
                                Mot de passe
                            </label>
                            <div className="mt-1">
                                <input
                                    id="password_user"
                                    name="password_user"
                                    type="password"
                                    required
                                    value={formData.password_user}
                                    onChange={handleChange}
                                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-brand-500 focus:border-brand-500 sm:text-sm"
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="confirm_password" className="block text-sm font-medium text-gray-700">
                                Confirmer le mot de passe
                            </label>
                            <div className="mt-1">
                                <input
                                    id="confirm_password"
                                    name="confirm_password"
                                    type="password"
                                    required
                                    value={formData.confirm_password}
                                    onChange={handleChange}
                                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-brand-500 focus:border-brand-500 sm:text-sm"
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="rounded-md bg-red-50 p-4">
                                <div className="flex">
                                    <div className="ml-3">
                                        <h3 className="text-sm font-medium text-red-800">
                                            Erreur
                                        </h3>
                                        <div className="mt-2 text-sm text-red-700">
                                            <p>{error}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div>
                            <button
                                type="submit"
                                disabled={loading}
                                className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-brand-600 hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 transition-colors ${loading ? 'opacity-75 cursor-not-allowed' : ''}`}
                            >
                                {loading ? 'Création en cours...' : 'Créer un compte'}
                            </button>
                        </div>
                    </form>

                    <div className="mt-6">
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-300"></div>
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-2 bg-white text-gray-500">
                                    Déjà un compte ?
                                </span>
                            </div>
                        </div>
                        <div className="mt-6 text-center">
                            <Link to="/login" className="font-medium text-brand-600 hover:text-brand-500">
                                Se connecter
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;
