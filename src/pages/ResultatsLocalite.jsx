import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { getLieuxVoteByDepartement } from '../features/resultats/resultatsSlice';
import { ChevronLeftIcon } from '@heroicons/react/24/solid';
import Loader from '../components/Loader';

const ResultatsLocalite = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { localData, nom_departement } = location.state || {};

    const { lieuxVoteByDepartement, loadingLieuxVote } = useSelector((state) => state.resultats);
    const { partis } = useSelector((state) => state.candidats);
    const { selectedDepartement } = useSelector((state) => state.settings);

    const [resultsData, setResultsData] = useState([]);
    const [totalVoix, setTotalVoix] = useState(0);

    useEffect(() => {
        if (localData && lieuxVoteByDepartement) {
            // Trouver la localité dans les données
            const localite = lieuxVoteByDepartement.find(l => l.id_local === localData.id_local);

            if (localite && localite.lieux_vote) {
                // Lieu spécifique
                const lieu = localite.lieux_vote.find(lv => lv.id_lieu === localData.id_lieu);

                if (lieu && lieu.bureaux_vote) {
                    // Agréger les résultats de tous les bureaux de vote
                    const resultatsParParti = {};
                    let total = 0;

                    lieu.bureaux_vote.forEach(bureau => {
                        if (bureau.resultats_bv && Array.isArray(bureau.resultats_bv)) {
                            bureau.resultats_bv.forEach(resultat => {
                                const parti = resultat.sigle_parti || 'Inconnu';
                                if (!resultatsParParti[parti]) {
                                    resultatsParParti[parti] = {
                                        parti: parti,
                                        candidat: resultat.nom_candidat || resultat.nom_prenoms || '',
                                        voix: 0
                                    };
                                }
                                resultatsParParti[parti].voix += resultat.voix || 0;
                                total += resultat.voix || 0;
                            });
                        }
                    });

                    // Convertir en array et trier
                    const results = Object.values(resultatsParParti).sort((a, b) => b.voix - a.voix);
                    setResultsData(results);
                    setTotalVoix(total);
                }
            }
        }
    }, [localData, lieuxVoteByDepartement]);

    // Polling Mechanism - Fallback (30 seconds)
    useEffect(() => {
        const pollingInterval = setInterval(() => {
            console.log("🔄 [Polling] Mise à jour automatique de la localité (30s)...");
            if (nom_departement || selectedDepartement?.nom_departement) {
                dispatch(getLieuxVoteByDepartement({
                    nom_departement: nom_departement || selectedDepartement.nom_departement,
                    isSilent: true
                }));
            }
        }, 30000);

        return () => clearInterval(pollingInterval);
    }, [dispatch, nom_departement, selectedDepartement]);

    const goBack = () => {
        navigate(-1);
    };

    if (loadingLieuxVote) return <Loader />;

    if (!localData) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="text-center text-red-600">
                    Aucune donnée de localité fournie
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <button
                onClick={goBack}
                className="mb-6 flex items-center text-gray-600 hover:text-gray-900 transition-colors"
            >
                <ChevronLeftIcon className="h-5 w-5 mr-1" />
                Retour
            </button>

            {/* Header */}
            <div className="bg-gradient-to-r from-brand-600 to-brand-700 rounded-lg shadow-lg p-6 mb-6 text-white">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold mb-2">
                            Résultats - {localData.nom_lieu}
                        </h1>
                        <p className="text-brand-100 text-sm">
                            {localData.nom_local}, {nom_departement}
                        </p>
                        <p className="text-brand-200 text-xs mt-1">
                            {localData.nb_bureaux} bureau{localData.nb_bureaux > 1 ? 'x' : ''} de vote
                        </p>
                    </div>
                    <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
                        <p className="text-xs text-brand-100 uppercase tracking-wider">Total Voix</p>
                        <p className="text-3xl font-bold">{totalVoix.toLocaleString()}</p>
                    </div>
                </div>
            </div>

            {/* Résultats par parti */}
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                    <h2 className="text-xl font-bold text-gray-800">
                        Résultats par Parti
                    </h2>
                </div>

                {resultsData.length > 0 ? (
                    <div className="p-6">
                        <div className="space-y-4">
                            {resultsData.map((result, index) => {
                                const percentage = totalVoix > 0
                                    ? ((result.voix / totalVoix) * 100).toFixed(2)
                                    : '0.00';

                                const partiInfo = partis.find(p => p.sigle === result.parti);
                                const couleur = partiInfo?.couleur || '#9ca3af';

                                return (
                                    <div
                                        key={index}
                                        className="group bg-gray-50 hover:bg-gray-100 rounded-lg p-4 border border-gray-200 hover:border-gray-300 transition-all duration-200"
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-4 flex-1">
                                                {/* Rang */}
                                                <div className="flex-shrink-0">
                                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${index === 0 ? 'bg-yellow-500' :
                                                        index === 1 ? 'bg-gray-400' :
                                                            index === 2 ? 'bg-orange-600' :
                                                                'bg-gray-300'
                                                        }`}>
                                                        {index + 1}
                                                    </div>
                                                </div>

                                                {/* Info Parti */}
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center space-x-2 mb-1">
                                                        <div
                                                            className="w-4 h-4 rounded-full border-2 border-white shadow-sm"
                                                            style={{ backgroundColor: couleur }}
                                                        ></div>
                                                        <h3 className="font-bold text-gray-900 text-lg">
                                                            {result.parti}
                                                        </h3>
                                                    </div>
                                                    {result.candidat && (
                                                        <p className="text-sm text-gray-600 truncate">
                                                            {result.candidat}
                                                        </p>
                                                    )}
                                                </div>

                                                {/* Statistiques */}
                                                <div className="flex items-center space-x-6">
                                                    <div className="text-right">
                                                        <p className="text-xs text-gray-500 uppercase tracking-wider">Voix</p>
                                                        <p className="text-xl font-bold text-gray-900">
                                                            {result.voix.toLocaleString()}
                                                        </p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-xs text-gray-500 uppercase tracking-wider">Pourcentage</p>
                                                        <p className="text-xl font-bold" style={{ color: couleur }}>
                                                            {percentage}%
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Barre de progression */}
                                        <div className="mt-3">
                                            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                                                <div
                                                    className="h-full rounded-full transition-all duration-500 group-hover:opacity-80"
                                                    style={{
                                                        width: `${percentage}%`,
                                                        backgroundColor: couleur
                                                    }}
                                                ></div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ) : (
                    <div className="p-8 text-center text-gray-500">
                        Aucun résultat disponible pour cette localité
                    </div>
                )}
            </div>
        </div>
    );
};

export default ResultatsLocalite;
