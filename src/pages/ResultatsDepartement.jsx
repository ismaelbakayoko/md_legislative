import React, { useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { fetchResultatsByDepartement, fetchTotauxCirconscription, getLieuxVoteByDepartement, clearAllData } from '../features/resultats/resultatsSlice';
import { fetchDepartements } from '../features/departements/departementsSlice';
import { selectResultatsLoading } from '../features/resultats/selectors';
import Loader from '../components/Loader';
import StatCard from '../components/StatCard';
import ResultTable from '../components/ResultTable';
import { ResultBarChart, ResultPieChart, ResultPieChartWithCustomLegend } from '../components/Charts';
import { fetchCandidatesInfo, clearCandidates } from '../features/candidats/candidatsSlice';
import CandidatesList from '../components/CandidatesList';
import useCustomWebSocket from '../hooks/useCustomWebSocket';
import { fetchElections, fetchRegions, resetSettings, clearRegions } from '../features/settings/settingsSlice';

const ResultatsDepartement = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const loading = useSelector(selectResultatsLoading);
    const currentDepartement = useSelector((state) => state.resultats.currentDepartement);
    const currentDepartementId = useSelector((state) => state.resultats.currentDepartementId);
    const selectedDepartement = useSelector((state) => state.settings.selectedDepartement);
    const totaux_globaux = useSelector((state) => state.resultats.totaux_globaux);
    const totaux_par_parti = useSelector((state) => state.resultats.totaux_par_parti);

    const effectiveId = id || selectedDepartement?.id_departement;

    // Select candidates info
    const { partis } = useSelector((state) => state.candidats);
    const { elections, selectedCirconscription } = useSelector((state) => state.settings);

    useEffect(() => {
        // Ne charger que si non présent ou différent
        if (effectiveId && currentDepartementId !== effectiveId) {
            dispatch(fetchResultatsByDepartement(effectiveId));
        }
    }, [dispatch, effectiveId, currentDepartementId]);

    // Fetch Totaux Circonscription
    useEffect(() => {
        if (elections.length > 0 && selectedCirconscription) {
            // Ne charger que si les totaux n'existent pas encore
            if (!totaux_par_parti || totaux_par_parti.length === 0) {
                const currentElection = elections[0];
                dispatch(fetchTotauxCirconscription({
                    id_election: currentElection.id_election,
                    id_cir: selectedCirconscription.id_cir,
                    nb_tour: 1,
                    annee: new Date().getFullYear().toString()
                }));
            }
        }
    }, [dispatch, elections, selectedCirconscription, totaux_par_parti]);

    // Fetch Candidates Info
    useEffect(() => {
        if (elections.length > 0 && selectedCirconscription) {
            // Ne charger que si la liste des partis est vide
            if (!partis || partis.length === 0) {
                const currentElection = elections[0];
                dispatch(fetchCandidatesInfo({
                    id_election: currentElection.id_election,
                    id_cir: selectedCirconscription.id_cir,
                    nb_tour: 1
                }));
            }
        }
    }, [dispatch, elections, selectedCirconscription, partis]);

    // ============================================
    // WebSocket Integration - Real-time Updates
    // ============================================

    // Handler unifié pour tous les messages WebSocket
    const handleWebSocketMessage = useCallback((data) => {
        // Déterminer le type d'événement (certains serveurs utilisent 'event', d'autres 'type')
        const eventType = data.event || data.type;
        if (!eventType) return;

        console.log(`[WebSocket] 📩 Événement: ${eventType}`, data);

        switch (eventType) {
            case 'resultats_bv':
            case 'INSERT_RESULTATS_GROUPES':
                console.log("🔄 Mise à jour silencieuse des résultats...");

                if (effectiveId) {
                    dispatch(fetchResultatsByDepartement({ id: effectiveId, isSilent: true }));
                }

                if (elections.length > 0 && selectedCirconscription) {
                    const currentElection = elections[0];
                    const params = {
                        id_election: currentElection.id_election,
                        id_cir: selectedCirconscription.id_cir,
                        nb_tour: 1,
                        annee: new Date().getFullYear().toString(),
                        isSilent: true
                    };

                    dispatch(fetchTotauxCirconscription(params));
                    dispatch(fetchCandidatesInfo(params));
                }
                break;

            case 'resultats_groupes':
            case 'INSERT_RESULTATS_BV':
                console.log("🔄 Mise à jour silencieuse des résultats groupés...");

                if (selectedDepartement?.nom_departement) {
                    dispatch(getLieuxVoteByDepartement({ nom_departement: selectedDepartement.nom_departement, isSilent: true }));
                }

                if (elections.length > 0 && selectedCirconscription) {
                    const currentElection = elections[0];
                    dispatch(fetchTotauxCirconscription({
                        id_election: currentElection.id_election,
                        id_cir: selectedCirconscription.id_cir,
                        nb_tour: 1,
                        annee: new Date().getFullYear().toString(),
                        isSilent: true
                    }));
                }
                break;

            case 'UPDATE_ELECTIONS':
                if (data.payload?.status === false) {
                    console.log("🚫 Élection désactivée : Réinitialisation de l'application");
                    dispatch(clearAllData());
                    dispatch(clearCandidates());
                    dispatch(resetSettings());
                    // Optionnel: rediriger vers l'accueil ou ouvrir le modal de settings
                    alert("L'élection en cours a été désactivée. Les données ont été effacées.");
                } else {
                    dispatch(fetchElections());
                }
                break;
            case 'UPDATE_REGIONS':
                console.log("🔄 Mise à jour des régions détectée...");
                dispatch(clearRegions());
                dispatch(fetchRegions());
                break;

            default:
                // Optionnel: loguer les messages de test ou de heartbeat
                if (eventType !== 'ping' && eventType !== 'heartbeat') {
                    console.log("📬 Événement WebSocket ignoré:", eventType);
                }
        }
    }, [dispatch, effectiveId, elections, selectedCirconscription, selectedDepartement]);

    // Utiliser le hook WebSocket personnalisé
    const { isConnected, connectionStatus } = useCustomWebSocket(handleWebSocketMessage);

    // Transform totaux_par_parti data for charts
    const chartData = React.useMemo(() => {
        if (totaux_par_parti && totaux_par_parti.length > 0) {
            return totaux_par_parti.map(item => {
                const titulaire = item.parti_politique.candidats?.find(c => c.statut_cand === 'Titulaire') || item.parti_politique.candidats?.[0];
                const nomComplet = titulaire ? titulaire.nom_prenoms : item.parti_politique.nom_parti;

                return {
                    id: item.parti_politique.id_parti,
                    nom: nomComplet,
                    prenom: '',
                    nom_prenoms: nomComplet, // For Pie Chart
                    parti: item.parti_politique.sigle || item.parti_politique.nom_parti, // For badges and colors
                    logo: item.parti_politique.logo_url,
                    candidats: item.parti_politique.candidats,
                    voix: item.total_voix,
                    pourcentage: totaux_globaux.bulletins_exprimes > 0
                        ? ((item.total_voix / totaux_globaux.bulletins_exprimes) * 100).toFixed(2)
                        : 0
                };
            }).sort((a, b) => b.voix - a.voix);
        } else if (partis && partis.length > 0) {
            // Fallback: Show candidates with 0 results if no totals available
            return partis.map(parti => {
                const titulaire = parti.candidats?.find(c => c.statut_cand === 'Titulaire') || parti.candidats?.[0];
                const nomComplet = titulaire ? titulaire.nom_prenoms : parti.nom_parti;

                return {
                    id: parti.id_parti,
                    nom: nomComplet,
                    prenom: '',
                    nom_prenoms: nomComplet,
                    parti: parti.sigle || parti.nom_parti,
                    logo: parti.logo_url,
                    candidats: parti.candidats,
                    voix: 0,
                    pourcentage: 0
                };
            });
        }

        return [];
    }, [totaux_par_parti, totaux_globaux, partis]);

    const handleManualRefresh = () => {
        if (effectiveId) {
            dispatch(fetchResultatsByDepartement(effectiveId));
        }
        if (elections.length > 0 && selectedCirconscription) {
            const currentElection = elections[0];
            const params = {
                id_election: currentElection.id_election,
                id_cir: selectedCirconscription.id_cir,
                nb_tour: 1,
                annee: new Date().getFullYear().toString()
            };
            dispatch(fetchTotauxCirconscription(params));
            dispatch(fetchCandidatesInfo(params));
        }
    };

    if (loading) return <Loader />;
    if (!selectedDepartement) return <div className="text-center p-8 text-gray-500">Aucun résultat disponible.</div>;

    return (
        <div className="container mx-auto px-4 py-4">
            <div className="mb-6 flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                <div>
                    <div className="flex items-center gap-3">
                        <h3 className="text-2xl font-extrabold text-gray-900 tracking-tight">
                            {selectedCirconscription.code_cir + '-' + selectedCirconscription?.circonscription}
                        </h3>
                        {/* Indicateur de connexion WebSocket */}
                        <div className={`flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all duration-500 ${isConnected
                            ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                            : 'bg-amber-100 text-amber-700 border border-amber-200 animate-pulse'
                            }`}>
                            <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${isConnected ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]' : 'bg-amber-500'}`}></span>
                            {connectionStatus}
                        </div>
                    </div>
                    <div className="flex items-center text-xs text-gray-500 mt-1">
                        <svg className="w-3 h-3 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Dernière mise à jour : {new Date().toLocaleTimeString()}
                    </div>
                </div>
                <div className="flex items-center space-x-3">
                    <button
                        onClick={handleManualRefresh}
                        className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 transition-all duration-300"
                        title="Rafraîchir les données"
                    >
                        <svg className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        Rafraîchir
                    </button>
                    <Link
                        to={`/departement/${effectiveId}/lieux-vote`}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-md text-white bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-700 hover:to-brand-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 transition-all duration-300"
                    >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        Voir les Lieux de Vote
                    </Link>
                </div>
            </div>

            {/* Global Stats */}
            {(totaux_globaux || selectedCirconscription) && (
                <div className="mb-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                        <svg className="w-5 h-5 mr-2 text-brand-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                        Statistiques Globales
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                        <div className="bg-white border-l-4 border-blue-500 rounded-lg p-3 shadow-sm hover:shadow-md transition-all duration-300">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">Population Électorale</p>
                                    <p className="text-xl font-extrabold text-blue-900 mt-1">{(selectedCirconscription?.pop_elect || 0).toLocaleString()}</p>
                                </div>
                                <div className="bg-blue-50 rounded-lg p-1.5">
                                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white border-l-4 border-purple-500 rounded-lg p-3 shadow-sm hover:shadow-md transition-all duration-300">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-[10px] font-bold text-purple-600 uppercase tracking-widest">Astreintes</p>
                                    <p className="text-xl font-extrabold text-purple-900 mt-1">{(totaux_globaux?.pers_astreint || 0).toLocaleString()}</p>
                                </div>
                                <div className="bg-purple-50 rounded-lg p-1.5">
                                    <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white border-l-4 border-emerald-500 rounded-lg p-3 shadow-sm hover:shadow-md transition-all duration-300">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">Votants</p>
                                    <p className="text-xl font-extrabold text-emerald-900 mt-1">{(totaux_globaux?.nbre_votants || 0).toLocaleString()}</p>
                                </div>
                                <div className="bg-emerald-50 rounded-lg p-1.5">
                                    <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white border-l-4 border-rose-500 rounded-lg p-3 shadow-sm hover:shadow-md transition-all duration-300">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-[10px] font-bold text-rose-600 uppercase tracking-widest">Nuls</p>
                                    <p className="text-xl font-extrabold text-rose-900 mt-1">{(totaux_globaux?.bulletins_nuls || 0).toLocaleString()}</p>
                                </div>
                                <div className="bg-rose-50 rounded-lg p-1.5">
                                    <svg className="w-5 h-5 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white border-l-4 border-indigo-500 rounded-lg p-3 shadow-sm hover:shadow-md transition-all duration-300">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest">Exprimés</p>
                                    <p className="text-xl font-extrabold text-indigo-900 mt-1">{(totaux_globaux?.bulletins_exprimes || 0).toLocaleString()}</p>
                                </div>
                                <div className="bg-indigo-50 rounded-lg p-1.5">
                                    <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white border-l-4 border-slate-500 rounded-lg p-3 shadow-sm hover:shadow-md transition-all duration-300">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">Blancs</p>
                                    <p className="text-xl font-extrabold text-slate-900 mt-1">{(totaux_globaux?.bulletins_blancs || 0).toLocaleString()}</p>
                                </div>
                                <div className="bg-slate-50 rounded-lg p-1.5">
                                    <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                </div>
                            </div>
                        </div>


                    </div>
                </div>
            )}

            {/* Candidates List */}

            <CandidatesList partis={partis} />

            {/* Charts */}
            {chartData.length > 0 && (
                <div className="mb-6">
                    {/* Pie Chart Card with Custom Legend */}
                    <div className="group relative overflow-hidden bg-gradient-to-br from-white via-white to-purple-50/30 p-5 rounded-2xl shadow-lg border border-gray-200/50 hover:shadow-2xl transition-all duration-500 ease-out">
                        {/* Decorative gradient overlay */}
                        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-brand-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                        {/* Subtle animated background pattern */}
                        <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-purple-400/10 to-transparent rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>

                        <div className="relative z-10">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-xl font-extrabold bg-gradient-to-r from-gray-900 via-gray-800 to-purple-600 bg-clip-text text-transparent flex items-center">
                                    <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-2.5 rounded-xl shadow-md mr-3 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
                                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
                                        </svg>
                                    </div>
                                    Répartition des Voix
                                </h3>
                                <div className="px-3 py-1.5 bg-gradient-to-r from-purple-50 to-brand-50 border border-purple-200/50 rounded-lg">
                                    <span className="text-xs font-bold text-purple-700">Top {chartData.slice(0, 8).length}</span>
                                </div>
                            </div>

                            {/* Divider with gradient */}
                            <div className="h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent mb-4"></div>

                            {/* Chart with custom legend - Diagram left, Legend right */}
                            <ResultPieChartWithCustomLegend candidates={chartData.slice(0, 8)} />
                        </div>
                    </div>
                </div>
            )}
            {/* Table */}
            {/* Table */}
            {chartData.length > 0 && (
                <div className="bg-white rounded-lg shadow-md border border-gray-100 p-4">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-bold text-gray-900 flex items-center">
                            <svg className="w-5 h-5 mr-2 text-brand-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                            </svg>
                            Détail des résultats
                        </h3>
                        {selectedCirconscription && (
                            <button
                                onClick={() => navigate('/resultats-par-lieu', {
                                    state: { nom_departement: selectedDepartement?.nom_departement || currentDepartement?.nom_departement }
                                })}
                                className="inline-flex items-center px-3 py-2 border border-brand-300 shadow-sm text-sm leading-4 font-medium rounded-md text-brand-700 bg-white hover:bg-brand-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 transition-colors"
                            >
                                <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                Voir par Lieu de Vote
                            </button>
                        )}
                    </div>
                    <ResultTable candidates={chartData} totalExprimes={totaux_globaux?.bulletins_exprimes || 1} />
                </div>
            )}
        </div>
    );
};

export default ResultatsDepartement;



//  {/* Bar Chart Card */}
//                     <div className="group relative overflow-hidden bg-gradient-to-br from-white via-white to-blue-50/30 p-6 rounded-2xl shadow-lg border border-gray-200/50 hover:shadow-2xl hover:scale-[1.02] transition-all duration-500 ease-out">
//                         {/* Decorative gradient overlay */}
//                         <div className="absolute inset-0 bg-gradient-to-br from-brand-500/5 via-transparent to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

//                         {/* Subtle animated background pattern */}
//                         <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-brand-400/10 to-transparent rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>

//                         <div className="relative z-10">
//                             <div className="flex items-center justify-between mb-5">
//                                 <h3 className="text-xl font-extrabold bg-gradient-to-r from-gray-900 via-gray-800 to-brand-600 bg-clip-text text-transparent flex items-center">
//                                     <div className="bg-gradient-to-br from-brand-500 to-brand-600 p-2.5 rounded-xl shadow-md mr-3 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
//                                         <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
//                                         </svg>
//                                     </div>
//                                     Résultats par Parti
//                                 </h3>
//                                 <div className="px-3 py-1.5 bg-gradient-to-r from-brand-50 to-purple-50 border border-brand-200/50 rounded-lg">
//                                     <span className="text-xs font-bold text-brand-700">Top 10</span>
//                                 </div>
//                             </div>

//                             {/* Divider with gradient */}
//                             <div className="h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent mb-4"></div>

//                             <ResultBarChart candidates={chartData.slice(0, 10)} />
//                         </div>
//                     </div>