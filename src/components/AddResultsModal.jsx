import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { addGlobalResults, resetAddSuccess } from '../features/resultats/resultatsSlice';
import { selectAuthUser } from '../features/auth/authSlice';

const AddResultsModal = ({ isOpen, onClose, bureauData }) => {
    const dispatch = useDispatch();
    const user = useSelector(selectAuthUser);
    const { loading, error, addSuccess } = useSelector((state) => state.resultats);

    const [formData, setFormData] = useState({
        pop_elect: '',
        pers_astreint: '',
        nbre_votants: '',
        bulletins_nuls: '',
        bulletins_blancs: '',
        bulletins_exprimes: ''
    });

    useEffect(() => {
        if (addSuccess) {
            onClose();
            dispatch(resetAddSuccess());
            // Optionally refresh polling station list if needed, 
            // but the parent handles displaying updated status (though data needs refetch)
            // For now just close.
        }
    }, [addSuccess, onClose, dispatch]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        const payload = {
            ...formData,
            id_bv: bureauData?.id_bv,
            saisie_par: user?.id, // Assuming user object has id
            // Should add validation here if needed
        };

        dispatch(addGlobalResults(payload));
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                <div className="fixed inset-0 transition-opacity" aria-hidden="true" onClick={onClose}>
                    <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
                </div>

                <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

                <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
                    <div className="sm:flex sm:items-start">
                        <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                            <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-headline">
                                Ajouter Résultats - BV {bureauData?.num_bv}
                            </h3>
                            {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
                            <form onSubmit={handleSubmit} className="mt-5 space-y-4">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Population Électorale</label>
                                        <input
                                            type="number"
                                            name="pop_elect"
                                            required
                                            value={formData.pop_elect}
                                            onChange={handleChange}
                                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand-500 focus:border-brand-500 sm:text-sm"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Personnes en Astreinte</label>
                                        <input
                                            type="number"
                                            name="pers_astreint"
                                            required
                                            value={formData.pers_astreint}
                                            onChange={handleChange}
                                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand-500 focus:border-brand-500 sm:text-sm"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Nombre de Votants</label>
                                        <input
                                            type="number"
                                            name="nbre_votants"
                                            required
                                            value={formData.nbre_votants}
                                            onChange={handleChange}
                                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand-500 focus:border-brand-500 sm:text-sm"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Bulletins Nuls</label>
                                        <input
                                            type="number"
                                            name="bulletins_nuls"
                                            required
                                            value={formData.bulletins_nuls}
                                            onChange={handleChange}
                                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand-500 focus:border-brand-500 sm:text-sm"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Bulletins Blancs</label>
                                        <input
                                            type="number"
                                            name="bulletins_blancs"
                                            required
                                            value={formData.bulletins_blancs}
                                            onChange={handleChange}
                                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand-500 focus:border-brand-500 sm:text-sm"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Bulletins Exprimés</label>
                                        <input
                                            type="number"
                                            name="bulletins_exprimes"
                                            required
                                            value={formData.bulletins_exprimes}
                                            onChange={handleChange}
                                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand-500 focus:border-brand-500 sm:text-sm"
                                        />
                                    </div>
                                </div>

                                <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-brand-600 text-base font-medium text-white hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
                                    >
                                        {loading ? 'Traitement...' : 'Enregistrer'}
                                    </button>
                                    <button
                                        type="button"
                                        className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 sm:mt-0 sm:w-auto sm:text-sm"
                                        onClick={onClose}
                                    >
                                        Annuler
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AddResultsModal;
