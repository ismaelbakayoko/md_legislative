import React, { useEffect, useState, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchResultatsLocalesCentres, getLieuxVoteByDepartement } from '../features/resultats/resultatsSlice';
import Loader from '../components/Loader';
import ResultatsLieuModal from '../components/ResultatsLieuModal';
import ResultatsAggregatModal from '../components/ResultatsAggregatModal';
import { ChevronLeftIcon, ChevronDownIcon, ChevronUpIcon, ChartBarIcon, MapPinIcon, BuildingOfficeIcon, EyeIcon } from '@heroicons/react/24/solid';
import useCustomWebSocket from '../hooks/useCustomWebSocket';

const ResultatsParLieu = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { nom_departement } = location.state || {};
    const selectedDepartement = useSelector((state) => state.settings.selectedDepartement);
    const selectedCirconscription = useSelector((state) => state.settings.selectedCirconscription);
    const { elections } = useSelector((state) => state.settings);

    const {
        lieuxVoteByDepartement,
        loadingLieuxVote,
        resultats_centre,
        resultats_locales,
        loadingLocalesCentres,
        error
    } = useSelector((state) => state.resultats);

    const [activeTab, setActiveTab] = useState('bv'); // 'bv', 'localite', 'centre'
    const [sortedData, setSortedData] = useState([]);
    const [sortConfig, setSortConfig] = useState({ key: 'nom_local', direction: 'ascending' });

    // Charger les lieux de vote (BV)
    useEffect(() => {
        if (selectedDepartement?.nom_departement && (!lieuxVoteByDepartement || lieuxVoteByDepartement.length === 0)) {
            dispatch(getLieuxVoteByDepartement(selectedDepartement.nom_departement));
        }
    }, [dispatch, selectedDepartement, lieuxVoteByDepartement]);

    // Charger les resultats locales/centres
    useEffect(() => {
        if ((activeTab === 'localite' || activeTab === 'centre') && elections.length > 0 && selectedDepartement) {
            // Uniquement si on n'a pas déjà les données ou si on veut forcer
            if (resultats_locales.length === 0 || resultats_centre.length === 0) {
                const currentElection = elections[0];
                dispatch(fetchResultatsLocalesCentres({
                    id_election: currentElection.id_election,
                    nom_departement: selectedDepartement.nom_departement,
                    nb_tour: 1
                }));
            }
        }
    }, [dispatch, activeTab, elections, selectedDepartement, resultats_locales.length]);

    // ... (WebSocket remains the same)
    const handleWebSocketMessage = useCallback((data) => {
        const eventType = data.event || data.type;
        if (eventType === 'INSERT_RESULTATS_BV' || eventType === 'INSERT_RESULTATS_GROUPES') {
            if (selectedDepartement?.nom_departement) {
                dispatch(getLieuxVoteByDepartement({ nom_departement: selectedDepartement.nom_departement, isSilent: true }));
            }
            if (elections.length > 0 && selectedDepartement) {
                const currentElection = elections[0];
                dispatch(fetchResultatsLocalesCentres({
                    id_election: currentElection.id_election,
                    nom_departement: selectedDepartement.nom_departement,
                    nb_tour: 1,
                    isSilent: true
                }));
            }
        }
    }, [dispatch, selectedDepartement, elections]);

    const { isConnected } = useCustomWebSocket(handleWebSocketMessage);

    // Transformation des données pour le tableau BV
    useEffect(() => {
        if (activeTab === 'bv' && lieuxVoteByDepartement && lieuxVoteByDepartement.length > 0) {
            let flatList = [];
            lieuxVoteByDepartement.forEach(local => {
                if (local.lieux_vote) {
                    local.lieux_vote.forEach(lieu => {
                        if (lieu.bureaux_vote && lieu.bureaux_vote.length > 0) {
                            // Compter les bureaux qui ont des données
                            const nb_bureaux_complets = lieu.bureaux_vote.filter(bv =>
                                (bv.resultats_groupes && bv.resultats_groupes.length > 0) ||
                                (bv.resultats_bv && bv.resultats_bv.length > 0)
                            ).length;

                            flatList.push({
                                id_local: local.id_local,
                                nom_local: local.nom_local,
                                nom_departement: local.nom_departement,
                                id_lieu: lieu.id_lieu,
                                id_bv: lieu.bureaux_vote[0].id_bv,
                                nom_lieu: lieu.nom_lieu,
                                nb_bureaux: lieu.bureaux_vote.length,
                                nb_bureaux_complets,
                                data: lieu
                            });
                        }
                    });
                }
            });
            setSortedData(flatList);
        }
    }, [lieuxVoteByDepartement, activeTab]);

    const totalBureaux = sortedData.reduce((acc, item) => acc + item.nb_bureaux, 0);
    const totalBureauxComplets = sortedData.reduce((acc, item) => acc + item.nb_bureaux_complets, 0);

    const requestSort = (key) => {
        let direction = 'ascending';
        if (sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    const goBack = () => navigate(-1);

    const { partis } = useSelector((state) => state.candidats);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedLieu, setSelectedLieu] = useState(null);

    const [isAggregatModalOpen, setIsAggregatModalOpen] = useState(false);
    const [selectedAggregat, setSelectedAggregat] = useState(null);
    const [aggregatTitle, setAggregatTitle] = useState('');

    const handleOpenModal = (lieuData) => {
        setSelectedLieu(lieuData);
        setIsModalOpen(true);
    };

    const handleOpenAggregatModal = (data, type) => {
        setSelectedAggregat(data);
        setAggregatTitle(type === 'localite' ? 'Détails par Localité' : 'Détails du Centre de Vote');
        setIsAggregatModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedLieu(null);
    };

    const handleCloseAggregatModal = () => {
        setIsAggregatModalOpen(false);
        setSelectedAggregat(null);
    };

    const isLoading = loadingLieuxVote || (loadingLocalesCentres && (activeTab === 'localite' || activeTab === 'centre'));

    return (
        <div className="container mx-auto px-4 py-8">
            <button
                onClick={goBack}
                className="mb-6 flex items-center text-gray-500 hover:text-brand-600 font-bold transition-all duration-300 group"
            >
                <div className="bg-white p-1.5 rounded-lg border border-gray-200 mr-3 group-hover:border-brand-200 shadow-sm transition-all group-hover:scale-110">
                    <ChevronLeftIcon className="h-4 w-4" />
                </div>
                Retour aux statistiques
            </button>

            <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-black text-gray-900 tracking-tightest">
                        Détails des Résultats
                    </h1>
                    <div className="flex items-center gap-2 mt-2">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-black bg-brand-50 text-brand-700 border border-brand-100 uppercase tracking-wider">
                            Circonscription
                        </span>
                        <p className="text-gray-600 font-bold text-sm">
                            {selectedCirconscription?.code_cir} — <span className="text-gray-900">{selectedCirconscription?.circonscription}</span>
                        </p>
                    </div>
                </div>

                {/* Tab Switcher */}
                <div className="flex bg-gray-100/80 p-1 rounded-xl border border-gray-200 backdrop-blur-sm self-start">
                    <button
                        onClick={() => { setActiveTab('bv'); setSortConfig({ key: 'nom_local', direction: 'ascending' }); }}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all duration-300 ${activeTab === 'bv' ? 'bg-white text-brand-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        <BuildingOfficeIcon className="w-4 h-4" />
                        Par Bureau
                    </button>
                    <button
                        onClick={() => { setActiveTab('localite'); setSortConfig({ key: 'nom_local', direction: 'ascending' }); }}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all duration-300 ${activeTab === 'localite' ? 'bg-white text-brand-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        <MapPinIcon className="w-4 h-4" />
                        Par Localité
                    </button>
                    <button
                        onClick={() => { setActiveTab('centre'); setSortConfig({ key: 'nom_lieu', direction: 'ascending' }); }}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all duration-300 ${activeTab === 'centre' ? 'bg-white text-brand-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        <ChartBarIcon className="w-4 h-4" />
                        Par Centre
                    </button>
                </div>
            </div>

            {isLoading ? (
                <div className="bg-white rounded-2xl shadow-xl p-12 flex flex-col items-center justify-center border border-gray-100">
                    <div className="relative">
                        <div className="w-16 h-16 border-4 border-brand-100 border-t-brand-600 rounded-full animate-spin"></div>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-8 h-8 bg-brand-50 rounded-full"></div>
                        </div>
                    </div>
                    <p className="mt-6 text-gray-500 font-bold animate-pulse uppercase tracking-widest text-xs">Chargement des données...</p>
                </div>
            ) : (
                <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        {activeTab === 'bv' && (
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50/80 border-b border-gray-200">
                                    <tr>
                                        <th scope="col" className="px-6 py-5 text-left text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] cursor-pointer hover:text-brand-600 transition-colors" onClick={() => requestSort('nom_local')}>
                                            <div className="flex items-center gap-1.5">Localité <ChevronUpIcon className={`w-3.5 h-3.5 ${sortConfig.key === 'nom_local' ? (sortConfig.direction === 'ascending' ? '' : 'rotate-180') : 'opacity-0'}`} /></div>
                                        </th>
                                        <th scope="col" className="px-6 py-5 text-left text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] cursor-pointer hover:text-brand-600 transition-colors" onClick={() => requestSort('nom_lieu')}>
                                            <div className="flex items-center gap-1.5">Lieu de Vote <ChevronUpIcon className={`w-3.5 h-3.5 ${sortConfig.key === 'nom_lieu' ? (sortConfig.direction === 'ascending' ? '' : 'rotate-180') : 'opacity-0'}`} /></div>
                                        </th>
                                        <th scope="col" className="px-6 py-5 text-center text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]">Bureaux ({totalBureaux})</th>
                                        <th scope="col" className="px-6 py-5 text-right text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-100">
                                    {sortedData.map((item, index) => (
                                        <tr key={`${item.id_lieu}-${index}`} className="hover:bg-brand-50/40 transition-all duration-200 group border-b border-gray-100 last:border-0">
                                            <td className="px-6 py-5 whitespace-nowrap text-sm font-black text-gray-900 tracking-tight">{item.nom_local}</td>
                                            <td className="px-6 py-5 whitespace-nowrap text-sm text-gray-700 font-bold">{item.nom_lieu}</td>
                                            <td className="px-6 py-5 whitespace-nowrap text-center">
                                                <div className="flex flex-col items-center gap-1">
                                                    <span className={`px-3 py-1.5 rounded-xl text-[10px] font-extrabold shadow-sm leading-none tabular-nums border uppercase tracking-wider ${item.nb_bureaux_complets === item.nb_bureaux ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : (item.nb_bureaux_complets > 0 ? 'bg-amber-50 text-amber-700 border-amber-100' : 'bg-red-50 text-red-700 border-red-100')}`}>
                                                        {item.nb_bureaux_complets}/{item.nb_bureaux} BV
                                                    </span>
                                                    {item.nb_bureaux_complets < item.nb_bureaux && (
                                                        <span className={`text-[9px] font-bold uppercase tracking-tight ${item.nb_bureaux_complets > 0 ? 'text-amber-500' : 'text-red-500 animate-pulse'}`}>
                                                            {item.nb_bureaux_complets > 0 ? 'Incomplet' : 'Aucune donnée'}
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right">
                                                <div className="flex items-center justify-end gap-3">
                                                    <button onClick={() => handleOpenModal(item.data)} className="text-brand-600 hover:text-brand-800 text-sm font-black transition-colors uppercase tracking-tight">Voir Détails</button>
                                                    {(() => {
                                                        const bureau = item.data.bureaux_vote && item.data.bureaux_vote[0];
                                                        const pvPdf = bureau?.resultats_groupes && bureau.resultats_groupes[0]?.pv_pdf;
                                                        const pdfUrl = Array.isArray(pvPdf)
                                                            ? (typeof pvPdf[0] === 'string' ? pvPdf[0] : pvPdf[0]?.url)
                                                            : (typeof pvPdf === 'string' ? pvPdf : pvPdf?.url);

                                                        return pvPdf && pdfUrl ? (
                                                            <a href={pdfUrl} target="_blank" rel="noopener noreferrer" className="p-2 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-100 transition-all shadow-sm border border-emerald-100 group-hover:scale-105" title="Voir PV">
                                                                <BuildingOfficeIcon className="w-4 h-4" />
                                                            </a>
                                                        ) : null;
                                                    })()}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}

                        {activeTab === 'localite' && (
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50/80 border-b border-gray-200">
                                    <tr>
                                        <th scope="col" className="px-6 py-5 text-left text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]">Localité</th>
                                        <th scope="col" className="px-6 py-5 text-center text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]">Pop. Élect.</th>
                                        <th scope="col" className="px-6 py-5 text-center text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]">Votants</th>
                                        <th scope="col" className="px-6 py-5 text-center text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]">Participation</th>
                                        <th scope="col" className="px-6 py-5 text-left text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]">Tête de Liste</th>
                                        <th scope="col" className="px-6 py-5 text-right text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-100">
                                    {resultats_locales.map((item, index) => (
                                        <tr key={item.resultats_generaux.id_local || index} className="hover:bg-brand-50/40 transition-all duration-200 border-b border-gray-100 last:border-0 opacity-0 animate-fade-in" style={{ animationDelay: `${index * 50}ms`, animationFillMode: 'forwards' }}>
                                            <td className="px-6 py-5 whitespace-nowrap text-sm font-black text-gray-900 tracking-tight">{item.resultats_generaux.nom_local}</td>
                                            <td className="px-6 py-5 whitespace-nowrap text-sm text-center font-black text-gray-800 tabular-nums">{item.resultats_generaux.pop_elect.toLocaleString()}</td>
                                            <td className="px-6 py-5 whitespace-nowrap text-sm text-center font-black text-brand-600 tabular-nums">{item.resultats_generaux.nbre_votants.toLocaleString()}</td>
                                            <td className="px-6 py-5 whitespace-nowrap text-center">
                                                <div className="flex flex-col items-center">
                                                    <span className="text-sm font-black text-brand-600">{item.resultats_generaux.taux_participation}%</span>
                                                    <div className="w-16 bg-gray-100 h-1.5 rounded-full mt-1 overflow-hidden border border-gray-200">
                                                        <div className="bg-brand-500 h-full rounded-full" style={{ width: `${item.resultats_generaux.taux_participation}%` }}></div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5 whitespace-nowrap">
                                                {item.resultats_partis && item.resultats_partis[0] ? (
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex flex-col">
                                                            <span className="text-sm font-bold text-gray-900 leading-tight">{item.resultats_partis[0].parti_politique}</span>
                                                            <div className="flex items-center gap-2 mt-0.5">
                                                                <span className="text-[10px] font-black uppercase text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100">{item.resultats_partis[0].nbre_voix} Voix</span>
                                                                <span className="text-[10px] font-black text-gray-400">{item.resultats_partis[0].pourcentage}%</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ) : <span className="text-xs text-gray-400 italic font-medium">Aucun résultat</span>}
                                            </td>
                                            <td className="px-6 py-5 whitespace-nowrap text-right">
                                                <button
                                                    onClick={() => handleOpenAggregatModal(item, 'localite')}
                                                    className="inline-flex items-center gap-2 px-3 py-1.5 bg-brand-50 text-brand-700 text-xs font-black rounded-lg hover:bg-brand-100 transition-all border border-brand-100 shadow-sm uppercase tracking-tighter"
                                                >
                                                    <EyeIcon className="w-3 h-3" />
                                                    Détails
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}

                        {activeTab === 'centre' && (
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50/80 border-b border-gray-200">
                                    <tr>
                                        <th scope="col" className="px-6 py-5 text-left text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]">Centre de Vote</th>
                                        <th scope="col" className="px-6 py-5 text-center text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]">Votants</th>
                                        <th scope="col" className="px-6 py-5 text-center text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]">Participation</th>
                                        <th scope="col" className="px-6 py-5 text-left text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]"> Gagnant</th>
                                        <th scope="col" className="px-6 py-5 text-center text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]">PDF PV</th>
                                        <th scope="col" className="px-6 py-5 text-right text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-100">
                                    {resultats_centre.map((item, index) => (
                                        <tr key={item.resultats_generaux.id_lieu || index} className="hover:bg-brand-50/40 transition-all duration-200 border-b border-gray-100 last:border-0 opacity-0 animate-fade-in" style={{ animationDelay: `${index * 50}ms`, animationFillMode: 'forwards' }}>
                                            <td className="px-6 py-5 whitespace-nowrap text-sm font-black text-gray-900 tracking-tight">{item.resultats_generaux.nom_lieu}</td>
                                            <td className="px-6 py-5 whitespace-nowrap text-sm text-center font-black text-gray-800 tabular-nums">{item.resultats_generaux.nbre_votants.toLocaleString()}</td>
                                            <td className="px-6 py-5 whitespace-nowrap text-center">
                                                <span className="text-sm font-black text-brand-600 tabular-nums">{item.resultats_generaux.taux_participation}%</span>
                                            </td>
                                            <td className="px-6 py-5 whitespace-nowrap">
                                                {item.resultats_partis && item.resultats_partis[0] ? (
                                                    <div className="flex flex-col">
                                                        <span className="text-sm font-bold text-gray-900">{item.resultats_partis[0].parti_politique}</span>
                                                        <span className="text-[10px] font-black text-brand-600 uppercase tracking-wide">{item.resultats_partis[0].pourcentage}% des exprimés</span>
                                                    </div>
                                                ) : <span className="text-xs text-gray-400 italic">N/A</span>}
                                            </td>
                                            <td className="px-6 py-5 whitespace-nowrap text-center">
                                                <div className="flex justify-center">
                                                    <button className="p-2 text-gray-400 hover:text-brand-600 transition-colors">
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                        </svg>
                                                    </button>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5 whitespace-nowrap text-right">
                                                <button
                                                    onClick={() => handleOpenAggregatModal(item, 'centre')}
                                                    className="inline-flex items-center gap-2 px-3 py-1.5 bg-brand-50 text-brand-700 text-xs font-black rounded-lg hover:bg-brand-100 transition-all border border-brand-100 shadow-sm uppercase tracking-tighter"
                                                >
                                                    <EyeIcon className="w-3 h-3" />
                                                    Détails
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                    {sortedData.length === 0 && activeTab === 'bv' && !loadingLieuxVote && (
                        <div className="p-12 text-center">
                            <div className="mx-auto w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center border border-gray-100 mb-4">
                                <BuildingOfficeIcon className="w-8 h-8 text-gray-300" />
                            </div>
                            <p className="text-gray-500 font-bold">Aucun bureau de vote trouvé pour ce département.</p>
                        </div>
                    )}
                </div>
            )}

            <ResultatsLieuModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                lieuData={selectedLieu}
                partis={partis}
            />
            <ResultatsAggregatModal
                isOpen={isAggregatModalOpen}
                onClose={handleCloseAggregatModal}
                data={selectedAggregat}
                title={aggregatTitle}
            />
        </div>
    );
};

export default ResultatsParLieu;
