import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { clearCurrentBvResultats } from '../features/resultats/resultatsSlice';

const BvResultsModal = ({ isOpen, onClose, bureauData }) => {
    const dispatch = useDispatch();
    const { currentBvResultats, loading } = useSelector((state) => state.resultats);

    useEffect(() => {
        if (!isOpen) {
            dispatch(clearCurrentBvResultats());
        }
    }, [isOpen, dispatch]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
                <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={onClose}></div>

                <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>

                <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                    <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                        <div className="sm:flex sm:items-start">
                            <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 sm:mx-0 sm:h-10 sm:w-10">
                                <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                                <h3 className="text-lg leading-6 font-medium text-gray-900">
                                    Résultats du Bureau N° {bureauData?.num_bv}
                                </h3>
                                <div className="mt-4">
                                    {loading ? (
                                        <div className="flex justify-center py-4">
                                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600"></div>
                                        </div>
                                    ) : currentBvResultats ? (
                                        <div className="space-y-4 text-sm text-gray-600">
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="py-2 border-b border-gray-100">
                                                    <span className="block text-xs font-semibold text-gray-500 uppercase">Population Électorale</span>
                                                    <span className="block text-lg font-bold text-gray-900">{currentBvResultats.pop_elect?.toLocaleString()}</span>
                                                </div>
                                                <div className="py-2 border-b border-gray-100">
                                                    <span className="block text-xs font-semibold text-gray-500 uppercase">Votants</span>
                                                    <span className="block text-lg font-bold text-gray-900">{currentBvResultats.nbre_votants?.toLocaleString()}</span>
                                                </div>
                                                <div className="py-2 border-b border-gray-100">
                                                    <span className="block text-xs font-semibold text-gray-500 uppercase">Exprimés</span>
                                                    <span className="block text-lg font-bold text-indigo-600">{currentBvResultats.bulletins_exprimes?.toLocaleString()}</span>
                                                </div>
                                                <div className="py-2 border-b border-gray-100">
                                                    <span className="block text-xs font-semibold text-gray-500 uppercase">Astreints</span>
                                                    <span className="block text-lg font-bold text-gray-900">{currentBvResultats.pers_astreint?.toLocaleString()}</span>
                                                </div>
                                                <div className="py-2">
                                                    <span className="block text-xs font-semibold text-gray-500 uppercase">Nuls</span>
                                                    <span className="block text-lg font-bold text-red-600">{currentBvResultats.bulletins_nuls?.toLocaleString()}</span>
                                                </div>
                                                <div className="py-2">
                                                    <span className="block text-xs font-semibold text-gray-500 uppercase">Blancs</span>
                                                    <span className="block text-lg font-bold text-gray-600">{currentBvResultats.bulletins_blancs?.toLocaleString()}</span>
                                                </div>
                                            </div>

                                            {currentBvResultats.pv_pdf && currentBvResultats.pv_pdf.length > 0 && (
                                                <div className="mt-4 pt-4 border-t border-gray-200">
                                                    <h4 className="font-semibold text-gray-900 mb-2">Pièces Jointes (PV)</h4>
                                                    <ul className="space-y-2">
                                                        {currentBvResultats.pv_pdf.map((file, idx) => (
                                                            <li key={idx}>
                                                                <a
                                                                    href={file.url}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="flex items-center text-blue-600 hover:text-blue-800 hover:underline"
                                                                >
                                                                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                                                                    </svg>
                                                                    {file.name}
                                                                </a>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}

                                            <div className="mt-4 pt-4 border-t border-gray-200 text-xs text-gray-400 flex flex-col space-y-1">
                                                <span>Saisi par : {currentBvResultats.saisie_par}</span>
                                                <span>Date : {new Date(currentBvResultats.date_saisie).toLocaleString()}</span>
                                            </div>
                                        </div>
                                    ) : (
                                        <p className="text-center text-gray-500 py-4">Aucun résultat trouvé pour ce bureau.</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                        <button
                            type="button"
                            className="w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 sm:ml-3 sm:w-auto sm:text-sm"
                            onClick={onClose}
                        >
                            Fermer
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BvResultsModal;
