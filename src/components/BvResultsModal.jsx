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
                <div className="fixed inset-0 transition-opacity bg-gray-500/75 backdrop-blur-sm" onClick={onClose}></div>

                <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>

                <div className="inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-md sm:w-full border border-gray-100">
                    <div className="bg-white px-5 pt-4 pb-3 sm:p-6 sm:pb-4">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="text-xl font-black text-gray-900 tracking-tightest">
                                    Bureau {bureauData?.num_bv}
                                </h3>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-black bg-brand-50 text-brand-700 border border-brand-100 uppercase tracking-widest">
                                        Infos
                                    </span>
                                    <span className="text-xs font-bold text-gray-400">ID: {bureauData?.id_bv}</span>
                                </div>
                            </div>
                            <button onClick={onClose} className="p-1.5 bg-gray-50 text-gray-400 hover:text-gray-600 rounded-lg transition-colors">
                                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className="mt-2">
                            {loading ? (
                                <div className="flex flex-col items-center justify-center py-8">
                                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-brand-600 mb-3"></div>
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Chargement...</p>
                                </div>
                            ) : currentBvResultats ? (
                                <div className="space-y-4">
                                    {/* Global Stats Grid - Optimized to 3 columns */}
                                    <div className="grid grid-cols-3 gap-2">
                                        <div className="bg-white p-2 rounded-xl border border-gray-200 text-center shadow-sm">
                                            <div className="text-[9px] text-gray-400 uppercase font-black tracking-widest mb-0.5">Inscrits</div>
                                            <div className="text-sm font-black text-gray-900 tabular-nums">{currentBvResultats.pop_elect?.toLocaleString()}</div>
                                        </div>
                                        <div className="bg-brand-50/50 p-2 rounded-xl border border-brand-100 text-center shadow-sm">
                                            <div className="text-[9px] text-brand-400 uppercase font-black tracking-widest mb-0.5">Votants</div>
                                            <div className="text-sm font-black text-brand-700 tabular-nums">{currentBvResultats.nbre_votants?.toLocaleString()}</div>
                                        </div>
                                        <div className="bg-emerald-50/50 p-2 rounded-xl border border-emerald-100 text-center shadow-sm">
                                            <div className="text-[9px] text-emerald-500 uppercase font-black tracking-widest mb-0.5">Exprimés</div>
                                            <div className="text-sm font-black text-emerald-600 tabular-nums">{currentBvResultats.bulletins_exprimes?.toLocaleString()}</div>
                                        </div>
                                        <div className="bg-gray-50 p-2 rounded-xl border border-gray-100 text-center shadow-sm">
                                            <div className="text-[9px] text-gray-400 uppercase font-black tracking-widest mb-0.5">Astreints</div>
                                            <div className="text-sm font-black text-gray-700 tabular-nums">{currentBvResultats.pers_astreint?.toLocaleString()}</div>
                                        </div>
                                        <div className="bg-red-50/50 p-2 rounded-xl border border-red-100 text-center shadow-sm">
                                            <div className="text-[9px] text-red-400 uppercase font-black tracking-widest mb-0.5">Nuls</div>
                                            <div className="text-sm font-black text-red-600 tabular-nums">{currentBvResultats.bulletins_nuls?.toLocaleString()}</div>
                                        </div>
                                        <div className="bg-gray-50 p-2 rounded-xl border border-gray-100 text-center shadow-sm">
                                            <div className="text-[9px] text-gray-400 uppercase font-black tracking-widest mb-0.5">Blancs</div>
                                            <div className="text-sm font-black text-gray-700 tabular-nums">{currentBvResultats.bulletins_blancs?.toLocaleString()}</div>
                                        </div>
                                    </div>

                                    {/* PV Section - Compact list */}
                                    {currentBvResultats.pv_pdf && currentBvResultats.pv_pdf.length > 0 && (
                                        <div className="bg-gray-50/50 rounded-xl p-3 border border-gray-100">
                                            <h4 className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2">PV (PDF)</h4>
                                            <div className="grid grid-cols-1 gap-1.5 max-h-32 overflow-y-auto pr-1">
                                                {currentBvResultats.pv_pdf.map((file, idx) => (
                                                    <a
                                                        key={idx}
                                                        href={file.url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="flex items-center justify-between p-2 bg-white border border-gray-200 rounded-lg hover:border-brand-500 transition-all group"
                                                    >
                                                        <div className="flex items-center min-w-0">
                                                            <div className="w-6 h-6 rounded bg-red-50 flex items-center justify-center mr-2 group-hover:bg-red-100">
                                                                <svg className="w-3.5 h-3.5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                                                                    <path d="M9 2a2 2 0 00-2 2v8a2 2 0 002 2h6a2 2 0 002-2V6.414A2 2 0 0016.414 5L14 2.586A2 2 0 0012.586 2H9z" />
                                                                </svg>
                                                            </div>
                                                            <span className="text-xs font-bold text-gray-700 truncate">{file.name || `PV_${idx + 1}.pdf`}</span>
                                                        </div>
                                                        <svg className="w-4 h-4 text-gray-300 group-hover:text-brand-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                                        </svg>
                                                    </a>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Footer Info - Side by side */}
                                    <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                                        <div className="flex items-center gap-2">
                                            <span className="text-[9px] font-black text-gray-300 uppercase tracking-widest">Par</span>
                                            <span className="text-xs font-bold text-gray-500">{currentBvResultats.saisie_par}</span>
                                        </div>
                                        <span className="text-[11px] font-bold text-gray-400 tabular-nums">
                                            {new Date(currentBvResultats.date_saisie).toLocaleDateString('fr-FR', {
                                                day: '2-digit',
                                                month: '2-digit',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </span>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-8 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                                    <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Aucun résultat</p>
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="bg-gray-50 px-5 py-3 flex justify-end">
                        <button
                            type="button"
                            className="px-5 py-2 bg-white border border-gray-200 rounded-xl text-xs font-black text-gray-700 hover:bg-gray-50 transition-all active:scale-95 shadow-sm"
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
