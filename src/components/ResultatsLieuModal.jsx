import React, { useState, useEffect } from 'react';

const ResultatsLieuModal = ({ isOpen, onClose, lieuData, partis }) => {
    const [activeTab, setActiveTab] = useState('details'); // 'details' ou 'pdf'
    const [selectedPdfIndex, setSelectedPdfIndex] = useState(0);

    useEffect(() => {
        if (isOpen) {
            setSelectedPdfIndex(0);
        }
    }, [isOpen, lieuData]);

    if (!isOpen || !lieuData) return null;

    const getPartyInfo = (id_parti) => {
        if (!partis) return { nom: 'Inconnu', parti: '?' };
        const parti = partis.find(p => p.id_parti === id_parti);
        if (!parti) return { nom: 'Inconnu', parti: '?' };

        const candidat = parti.candidats && parti.candidats.length > 0 ? parti.candidats[0] : null;
        return {
            nom: candidat ? candidat.nom_prenoms : parti.nom_parti,
            parti: parti.sigle || parti.nom_parti,
            logo: parti.logo_url
        };
    };

    // Récupérer les PDFs depuis resultats_groupes
    const getPvPdfs = () => {
        if (lieuData.bureaux_vote && lieuData.bureaux_vote.length > 0) {
            // Rechercher dans tous les bureaux s'il y a des PDFs
            // Pour l'instant on prend ceux du premier bureau qui en a
            for (const bureau of lieuData.bureaux_vote) {
                if (bureau.resultats_groupes && bureau.resultats_groupes.length > 0) {
                    const pdf = bureau.resultats_groupes[0].pv_pdf;
                    if (pdf) {
                        return Array.isArray(pdf) ? pdf : [pdf];
                    }
                }
            }
        }
        return [];
    };

    const pvPdfs = getPvPdfs();
    const activePdf = pvPdfs.length > 0 ? pvPdfs[selectedPdfIndex] : null;
    const activePdfUrl = typeof activePdf === 'string' ? activePdf : activePdf?.url;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
                <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={onClose}></div>

                <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>

                <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-6xl sm:w-full">
                    <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                        <div className="flex justify-between items-start mb-6">
                            <h3 className="text-2xl font-black text-gray-900 tracking-tightest">
                                {lieuData.nom_lieu}
                                <div className="flex items-center gap-2 mt-2">
                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[16px] font-black bg-brand-50 text-brand-700 border border-brand-100 uppercase tracking-wider">
                                        Localité
                                    </span>
                                    <span className="text-[16px] font-bold text-gray-500">{lieuData.nom_local}</span>
                                </div>
                            </h3>
                            <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
                                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {/* Tabs */}
                        <div className="border-b border-gray-200 mb-4">
                            <nav className="-mb-px flex space-x-8">
                                <button
                                    onClick={() => setActiveTab('details')}
                                    className={`${activeTab === 'details'
                                        ? 'border-brand-500 text-brand-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                        } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-[16px] transition-colors`}
                                >
                                    <svg className="w-5 h-5 inline-block mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                    Résultats Détaillés
                                </button>
                                {pvPdfs.length > 0 && (
                                    <button
                                        onClick={() => setActiveTab('pdf')}
                                        className={`${activeTab === 'pdf'
                                            ? 'border-brand-500 text-brand-600'
                                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-[16px] transition-colors`}
                                    >
                                        <svg className="w-5 h-5 inline-block mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                        </svg>
                                        Procès-Verbal ({pvPdfs.length})
                                    </button>
                                )}
                            </nav>
                        </div>

                        {/* Content */}
                        {activeTab === 'details' ? (
                            <div className="space-y-8 max-h-[70vh] overflow-y-auto pr-2">
                                {lieuData.bureaux_vote && lieuData.bureaux_vote.map((bv, idx) => {
                                    const stats = bv.resultats_groupes ? bv.resultats_groupes[0] : null;
                                    const results = bv.resultats_bv || [];
                                    const exprimes = stats ? stats.bulletins_exprimes : 0;

                                    // Sort results by votes desc
                                    const sortedResults = [...results].sort((a, b) => (b.voix_obtenues || 0) - (a.voix_obtenues || 0));

                                    return (
                                        <div key={idx} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                                            <h4 className="font-bold text-gray-800 mb-3 flex items-center">
                                                <span className="bg-brand-100 text-brand-800 px-3 py-1 rounded text-sm mr-2">BV {bv.num_bv}</span>
                                                Bureau de Vote N°{bv.num_bv}
                                            </h4>

                                            {/* Global Stats Grid */}
                                            {stats ? (
                                                <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
                                                    <div className="bg-white p-3 rounded-xl border border-gray-200 text-center shadow-sm">
                                                        <div className="text-[16px] text-gray-400 uppercase font-black tracking-widest mb-1">Inscrits</div>
                                                        <div className="text-lg font-black text-gray-900 tabular-nums">{stats.pop_elect?.toLocaleString()}</div>
                                                    </div>
                                                    <div className="bg-brand-50/50 p-3 rounded-xl border border-brand-100 text-center shadow-sm">
                                                        <div className="text-[16px] text-brand-400 uppercase font-black tracking-widest mb-1">Votants</div>
                                                        <div className="text-lg font-black text-brand-700 tabular-nums">{stats.nbre_votants?.toLocaleString()}</div>
                                                    </div>
                                                    <div className="bg-red-50/50 p-3 rounded-xl border border-red-100 text-center shadow-sm">
                                                        <div className="text-[16px] text-red-400 uppercase font-black tracking-widest mb-1">Nuls</div>
                                                        <div className="text-lg font-black text-red-600 tabular-nums">{stats.bulletins_nuls?.toLocaleString()}</div>
                                                    </div>
                                                    <div className="bg-gray-50 p-3 rounded-xl border border-gray-200 text-center shadow-sm">
                                                        <div className="text-[16px] text-gray-400 uppercase font-black tracking-widest mb-1">Blancs</div>
                                                        <div className="text-lg font-black text-gray-700 tabular-nums">{stats.bulletins_blancs?.toLocaleString()}</div>
                                                    </div>
                                                    <div className="bg-emerald-50/50 p-3 rounded-xl border border-emerald-100 text-center shadow-sm">
                                                        <div className="text-[16px] text-emerald-500 uppercase font-black tracking-widest mb-1">Exprimés</div>
                                                        <div className="text-lg font-black text-emerald-600 tabular-nums">{stats.bulletins_exprimes?.toLocaleString()}</div>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="text-center text-gray-500 italic mb-4">Statistiques globales non disponibles</div>
                                            )}

                                            {/* Results Table */}
                                            {results.length > 0 ? (
                                                <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 rounded-lg">
                                                    <table className="min-w-full divide-y divide-gray-300">
                                                        <thead className="bg-gray-100/80 border-b border-gray-200">
                                                            <tr>
                                                                <th scope="col" className="py-3 pl-4 pr-3 text-left text-[16px] font-black text-gray-400 uppercase tracking-widest">Parti politique</th>
                                                                <th scope="col" className="px-3 py-3 text-right text-[16px] font-black text-gray-400 uppercase tracking-widest">Voix</th>
                                                                <th scope="col" className="px-3 py-3 text-right text-[16px] font-black text-gray-400 uppercase tracking-widest">Part</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody className="divide-y divide-gray-200 bg-white">
                                                            {sortedResults.map((res, rIdx) => {
                                                                const info = getPartyInfo(res.id_parti);
                                                                const percent = exprimes > 0 ? ((res.voix_obtenues / exprimes) * 100).toFixed(2) : "0.00";

                                                                return (
                                                                    <tr key={rIdx} className="hover:bg-brand-50/30 transition-colors border-b border-gray-100 last:border-0">
                                                                        <td className="whitespace-nowrap py-3 pl-4 pr-3 text-[16px]">
                                                                            <div className="flex items-center">
                                                                                {info.logo && (
                                                                                    <div className="w-8 h-8 rounded-lg bg-gray-50 border border-gray-100 p-1 mr-3 flex items-center justify-center">
                                                                                        <img src={info.logo} alt="" className="max-h-full max-w-full object-contain" />
                                                                                    </div>
                                                                                )}
                                                                                <div>
                                                                                    <div className="font-black text-gray-900 leading-none">{info.parti}</div>
                                                                                    <div className="text-gray-400 text-[16px] mt-1 font-bold">{info.nom}</div>
                                                                                </div>
                                                                            </div>
                                                                        </td>
                                                                        <td className="whitespace-nowrap px-3 py-3 text-[16px] text-gray-900 text-right font-black tabular-nums">
                                                                            {res.voix_obtenues?.toLocaleString()}
                                                                        </td>
                                                                        <td className="whitespace-nowrap px-3 py-3 text-[16px] text-right">
                                                                            <span className="inline-flex items-center px-2 py-0.5 rounded bg-brand-50 text-brand-700 text-[16px] font-black tabular-nums">
                                                                                {percent}%
                                                                            </span>
                                                                        </td>
                                                                    </tr>
                                                                );
                                                            })}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            ) : (
                                                <div className="text-center text-gray-500 italic">Aucun résultat par candidat saisi</div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="flex flex-col md:flex-row gap-4 h-[70vh]">
                                {/* PDF Selector Sidebar if multiple */}
                                {pvPdfs.length > 1 && (
                                    <div className="w-full md:w-64 flex-shrink-0 bg-gray-50 rounded-lg p-3 border border-gray-200 overflow-y-auto">
                                        <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Liste des fichiers</h4>
                                        <div className="space-y-2">
                                            {pvPdfs.map((pdf, idx) => {
                                                const name = typeof pdf === 'string' ? `Document ${idx + 1}` : (pdf.name || `Document ${idx + 1}`);
                                                return (
                                                    <button
                                                        key={idx}
                                                        onClick={() => setSelectedPdfIndex(idx)}
                                                        className={`w-full text-left p-3 rounded-xl border transition-all text-xs font-bold flex items-center gap-3 ${selectedPdfIndex === idx
                                                            ? 'bg-brand-50 border-brand-500 text-brand-700 shadow-sm'
                                                            : 'bg-white border-gray-100 text-gray-500 hover:border-brand-200 hover:bg-gray-50'
                                                            }`}
                                                    >
                                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${selectedPdfIndex === idx ? 'bg-brand-500 text-white' : 'bg-gray-100 text-gray-400'}`}>
                                                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                                <path d="M9 2a2 2 0 00-2 2v8a2 2 0 002 2h6a2 2 0 002-2V6.414A2 2 0 0016.414 5L14 2.586A2 2 0 0012.586 2H9z" />
                                                            </svg>
                                                        </div>
                                                        <span className="truncate">{name}</span>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}

                                <div className="flex-grow bg-gray-100 rounded-lg overflow-hidden border border-gray-300">
                                    {activePdfUrl ? (
                                        <iframe
                                            src={activePdfUrl}
                                            className="w-full h-full"
                                            title="Procès-Verbal PDF"
                                        />
                                    ) : (
                                        <div className="flex items-center justify-center h-full text-gray-500 flex-col p-8 text-center">
                                            <svg className="w-16 h-16 mb-4 text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                            </svg>
                                            <p className="text-lg font-bold">Document non disponible</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                    <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                        {activePdfUrl && activeTab === 'pdf' && (
                            <a
                                href={activePdfUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-brand-600 text-base font-medium text-white hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 sm:ml-3 sm:w-auto sm:text-sm mb-3 sm:mb-0"
                            >
                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                </svg>
                                Télécharger PDF
                            </a>
                        )}
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

export default ResultatsLieuModal;

