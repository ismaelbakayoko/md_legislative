import React, { useState } from 'react';

const ResultatsLieuModal = ({ isOpen, onClose, lieuData, partis }) => {
    const [activeTab, setActiveTab] = useState('details'); // 'details' ou 'pdf'

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

    // Récupérer le PDF depuis resultats_groupes
    const getPvPdf = () => {
        if (lieuData.bureaux_vote && lieuData.bureaux_vote.length > 0) {
            const bureau = lieuData.bureaux_vote[0];
            if (bureau.resultats_groupes && bureau.resultats_groupes.length > 0) {
                const pdf = bureau.resultats_groupes[0].pv_pdf;
                return Array.isArray(pdf) ? pdf[0] : pdf;
            }
        }
        return null;
    };

    const pvPdf = getPvPdf();

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
                <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={onClose}></div>

                <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>

                <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-6xl sm:w-full">
                    <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                        <div className="flex justify-between items-start mb-4">
                            <h3 className="text-xl leading-6 font-bold text-gray-900">
                                Détails - {lieuData.nom_lieu}
                                <span className="block text-sm font-normal text-gray-500 mt-1">{lieuData.nom_local}</span>
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
                                        } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}
                                >
                                    <svg className="w-5 h-5 inline-block mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                    Résultats Détaillés
                                </button>
                                {pvPdf && (
                                    <button
                                        onClick={() => setActiveTab('pdf')}
                                        className={`${activeTab === 'pdf'
                                            ? 'border-brand-500 text-brand-600'
                                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}
                                    >
                                        <svg className="w-5 h-5 inline-block mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                        </svg>
                                        Procès-Verbal (PDF)
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
                                                <span className="bg-brand-100 text-brand-800 px-2 py-1 rounded text-sm mr-2">BV {bv.num_bv}</span>
                                                Bureau de Vote N°{bv.num_bv}
                                            </h4>

                                            {/* Global Stats Grid */}
                                            {stats ? (
                                                <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
                                                    <div className="bg-white p-2 rounded border border-gray-200 text-center">
                                                        <div className="text-xs text-gray-500 uppercase font-semibold">Inscrits</div>
                                                        <div className="font-bold text-gray-900">{stats.pop_elect?.toLocaleString()}</div>
                                                    </div>
                                                    <div className="bg-white p-2 rounded border border-gray-200 text-center">
                                                        <div className="text-xs text-gray-500 uppercase font-semibold">Votants</div>
                                                        <div className="font-bold text-blue-600">{stats.nbre_votants?.toLocaleString()}</div>
                                                    </div>
                                                    <div className="bg-white p-2 rounded border border-gray-200 text-center">
                                                        <div className="text-xs text-gray-500 uppercase font-semibold">Nuls</div>
                                                        <div className="font-bold text-red-600">{stats.bulletins_nuls?.toLocaleString()}</div>
                                                    </div>
                                                    <div className="bg-white p-2 rounded border border-gray-200 text-center">
                                                        <div className="text-xs text-gray-500 uppercase font-semibold">Blancs</div>
                                                        <div className="font-bold text-gray-600">{stats.bulletins_blancs?.toLocaleString()}</div>
                                                    </div>
                                                    <div className="bg-white p-2 rounded border border-gray-200 text-center">
                                                        <div className="text-xs text-gray-500 uppercase font-semibold">Exprimés</div>
                                                        <div className="font-bold text-green-600">{stats.bulletins_exprimes?.toLocaleString()}</div>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="text-center text-gray-500 italic mb-4">Statistiques globales non disponibles</div>
                                            )}

                                            {/* Results Table */}
                                            {results.length > 0 ? (
                                                <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 rounded-lg">
                                                    <table className="min-w-full divide-y divide-gray-300">
                                                        <thead className="bg-gray-100">
                                                            <tr>
                                                                <th scope="col" className="py-2 pl-4 pr-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Candidat</th>
                                                                <th scope="col" className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Voix</th>
                                                                <th scope="col" className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">%</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody className="divide-y divide-gray-200 bg-white">
                                                            {sortedResults.map((res, rIdx) => {
                                                                const info = getPartyInfo(res.id_parti);
                                                                const percent = exprimes > 0 ? ((res.voix_obtenues / exprimes) * 100).toFixed(2) : "0.00";

                                                                return (
                                                                    <tr key={rIdx} className="hover:bg-gray-50">
                                                                        <td className="whitespace-nowrap py-2 pl-4 pr-3 text-sm">
                                                                            <div className="flex items-center">
                                                                                {info.logo && <img src={info.logo} alt="" className="h-6 w-6 mr-2 object-contain" />}
                                                                                <div>
                                                                                    <div className="font-medium text-gray-900">{info.nom}</div>
                                                                                    <div className="text-gray-500 text-xs">{info.parti}</div>
                                                                                </div>
                                                                            </div>
                                                                        </td>
                                                                        <td className="whitespace-nowrap px-3 py-2 text-sm text-gray-900 text-right font-medium">
                                                                            {res.voix_obtenues?.toLocaleString()}
                                                                        </td>
                                                                        <td className="whitespace-nowrap px-3 py-2 text-sm text-gray-500 text-right">
                                                                            {percent}%
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
                            <div className="max-h-[70vh] overflow-hidden">
                                {pvPdf ? (
                                    <div className="h-[70vh] bg-gray-100 rounded-lg overflow-hidden border border-gray-300">
                                        <iframe
                                            src={pvPdf}
                                            className="w-full h-full"
                                            title="Procès-Verbal PDF"
                                        />
                                    </div>
                                ) : (
                                    <div className="text-center py-12 text-gray-500">
                                        <svg className="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                        <p className="text-lg font-medium">Aucun PDF disponible</p>
                                        <p className="text-sm mt-2">Le procès-verbal PDF n'a pas été téléchargé pour ce bureau de vote.</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                    <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                        {pvPdf && activeTab === 'pdf' && (
                            <a
                                href={pvPdf}
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

