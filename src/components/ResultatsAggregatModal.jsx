import React from 'react';

const ResultatsAggregatModal = ({ isOpen, onClose, data, title }) => {
    if (!isOpen || !data) return null;

    const { resultats_generaux, resultats_partis } = data;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
                <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={onClose}></div>

                <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>

                <div className="inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full border border-gray-100">
                    <div className="bg-white px-6 pt-5 pb-4 sm:p-8 sm:pb-6">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h3 className="text-2xl font-black text-gray-900 tracking-tight">
                                    {title}
                                </h3>
                                <p className="text-brand-600 font-bold mt-1">
                                    {resultats_generaux.nom_local || resultats_generaux.nom_lieu}
                                </p>
                            </div>
                            <button onClick={onClose} className="p-2 bg-gray-50 text-gray-400 hover:text-gray-600 rounded-xl transition-colors">
                                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {/* Global Stats Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 text-center">
                                <div className="text-[10px] text-gray-400 uppercase font-black tracking-widest mb-1">Inscrits</div>
                                <div className="text-lg font-black text-gray-900">{resultats_generaux.pop_elect?.toLocaleString()}</div>
                            </div>
                            <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100 text-center">
                                <div className="text-[10px] text-blue-400 uppercase font-black tracking-widest mb-1">Votants</div>
                                <div className="text-lg font-black text-blue-700">{resultats_generaux.nbre_votants?.toLocaleString()}</div>
                            </div>
                            <div className="bg-red-50/50 p-4 rounded-xl border border-red-100 text-center">
                                <div className="text-[10px] text-red-400 uppercase font-black tracking-widest mb-1">Nuls/Blancs</div>
                                <div className="text-lg font-black text-red-700">{(resultats_generaux.bulletins_nuls + resultats_generaux.bulletins_blancs)?.toLocaleString()}</div>
                            </div>
                            <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-100 text-center">
                                <div className="text-[10px] text-emerald-400 uppercase font-black tracking-widest mb-1">Exprimés</div>
                                <div className="text-lg font-black text-emerald-700">{resultats_generaux.total_exprimes?.toLocaleString()}</div>
                            </div>
                        </div>

                        {/* Results Table */}
                        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th scope="col" className="px-6 py-4 text-left text-xs font-black text-gray-400 uppercase tracking-widest">Parti / Candidat</th>
                                        <th scope="col" className="px-6 py-4 text-right text-xs font-black text-gray-400 uppercase tracking-widest">Voix</th>
                                        <th scope="col" className="px-6 py-4 text-right text-xs font-black text-gray-400 uppercase tracking-widest">%</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {resultats_partis && resultats_partis.length > 0 ? (
                                        resultats_partis.map((res, idx) => (
                                            <tr key={idx} className="hover:bg-brand-50/20 transition-colors">
                                                <td className="px-6 py-4">
                                                    <span className="text-sm font-bold text-gray-900">{res.parti_politique}</span>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <span className="text-sm font-black text-gray-700">{res.nbre_voix?.toLocaleString()}</span>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex flex-col items-end">
                                                        <span className="text-sm font-black text-brand-600">{res.pourcentage}%</span>
                                                        <div className="w-16 bg-gray-100 h-1 rounded-full mt-1 overflow-hidden">
                                                            <div className="bg-brand-500 h-full" style={{ width: `${res.pourcentage}%` }}></div>
                                                        </div>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="3" className="px-6 py-12 text-center text-gray-400 italic">
                                                Aucun résultat détaillé disponible pour cet agrégat.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="bg-gray-50 px-6 py-4 flex justify-end">
                        <button
                            type="button"
                            className="px-6 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-700 hover:bg-gray-50 focus:outline-none transition-all active:scale-95 shadow-sm"
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

export default ResultatsAggregatModal;
