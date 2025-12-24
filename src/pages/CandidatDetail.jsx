import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useLocation } from 'react-router-dom';
import { fetchResultatsByCandidat, getLieuxVoteByDepartement } from '../features/resultats/resultatsSlice';
import { fetchCandidatesInfo } from '../features/candidats/candidatsSlice';
import { selectCurrentCandidatResultats, selectResultatsLoading } from '../features/resultats/selectors';
import Loader from '../components/Loader';
import StatCard from '../components/StatCard';

const CandidatDetail = () => {
    const { id } = useParams();
    const location = useLocation();
    const dispatch = useDispatch();

    const { partis, loading: loadingCandidates } = useSelector((state) => state.candidats);
    const { resultsByCandidate, lieuxVoteByDepartement, loadingLieuxVote, totaux_globaux } = useSelector((state) => state.resultats);
    const { selectedDepartement, selectedCirconscription, elections } = useSelector((state) => state.settings);

    // Check if candidate data was passed via navigation state (optimization)
    const passedCandidat = location.state?.candidat;

    // 1. Find Candidate in Store or use passed data
    const candidateInfo = React.useMemo(() => {
        // First priority: Use passed data if it matches the ID and has needed fields
        if (passedCandidat && passedCandidat.id === id && passedCandidat.candidats) {
            // This is from the table, enrich with department/circonscription
            const titulaire = passedCandidat.candidats?.find(c => c.statut_cand === 'Titulaire') || passedCandidat.candidats?.[0];
            if (titulaire) {
                return {
                    ...titulaire,
                    parti: passedCandidat.parti,
                    id_parti: passedCandidat.id,
                    departement: selectedDepartement?.nom_departement || 'Département Inconnu',
                    circonscription: selectedCirconscription?.circonscription || 'Circonscription Inconnue'
                };
            }
        }

        // Second priority: Find in Redux store (partis list)
        if (!partis) return null;
        for (const parti of partis) {
            if (parti.candidats) {
                const found = parti.candidats.find(c => c.id_candidat === id);
                if (found) {
                    return {
                        ...found,
                        parti: parti.nom_parti || parti.sigle,
                        sigle: parti.sigle,
                        logo: parti.logo_url,
                        id_parti: parti.id_parti,
                        departement: selectedDepartement?.nom_departement || 'Département Inconnu',
                        circonscription: selectedCirconscription?.circonscription || 'Circonscription Inconnue'
                    };
                }
            }
        }
        return null;
    }, [partis, id, selectedDepartement, selectedCirconscription, passedCandidat]);

    // 2. Fetch Data if missing
    useEffect(() => {
        // If we don't have candidates list, try to fetch it (requires settings)
        if ((!partis || partis.length === 0) && elections.length > 0 && selectedCirconscription) {
            const currentElection = elections[0];
            dispatch(fetchCandidatesInfo({
                id_election: currentElection.id_election,
                id_cir: selectedCirconscription.id_cir,
                nb_tour: 1
            }));
        }

        // Fetch detailed results (we need department name)
        // Only fetch if not already loaded or if department changed (simple check on array length/content)
        // Using selectedDepartement is safest here
        if (selectedDepartement && Object.keys(resultsByCandidate).length === 0) {
            dispatch(getLieuxVoteByDepartement(selectedDepartement.nom_departement));
        } else if (candidateInfo && !lieuxVoteByDepartement.length) {
            // Fallback if we have candidate but no results yet (and maybe selectedDepartement is missing but candidateInfo has it?)
            // unlikely given candidateInfo depends on store which depends on persistence
        }
    }, [dispatch, partis.length, elections, selectedCirconscription, selectedDepartement, resultsByCandidate]);

    // 3. Derived Results from Real Data
    const detailedData = React.useMemo(() => {
        if (!candidateInfo) return null;
        // Lookup by id_parti
        if (resultsByCandidate[candidateInfo.id_parti]) {
            return resultsByCandidate[String(candidateInfo.id_parti)]; // Ensure string key access
        }
        return null;
    }, [resultsByCandidate, candidateInfo]);

    // Calculate Totals using detailedData
    const stats = React.useMemo(() => {
        if (!detailedData) return { voix: 0, pourcentage: 0 };

        const totalVoix = detailedData.total_voix || 0;
        const totalExprimes = totaux_globaux?.bulletins_exprimes || 1; // Avoid div/0
        const pourcentage = (totalExprimes > 0 && totalVoix > 0)
            ? ((totalVoix / totalExprimes) * 100).toFixed(2)
            : "0.00";

        return { voix: totalVoix, pourcentage };
    }, [detailedData, totaux_globaux]);


    if (loadingCandidates && !candidateInfo) return <Loader />;
    if (!candidateInfo && !loadingCandidates) return <div className="text-center p-8 text-gray-500">Candidat non trouvé ou données non chargées.</div>;

    const displayCandidat = {
        ...candidateInfo,
        voix: stats.voix,
        pourcentage: stats.pourcentage,
        bureaux: detailedData ? detailedData.bureaux : []
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-8">
                <div className="flex items-center space-x-6">
                    <div className="flex-shrink-0 h-24 w-24 rounded-full overflow-hidden border-4 border-gray-100 shadow-md">
                        {displayCandidat.photo_candidat ? (
                            <img
                                src={displayCandidat.photo_candidat}
                                alt={displayCandidat.nom_prenoms}
                                className="h-full w-full object-cover"
                            />
                        ) : (
                            <div className="h-full w-full bg-gray-200 flex items-center justify-center text-gray-400">
                                <span className="text-2xl font-bold">
                                    {displayCandidat.nom_prenoms?.charAt(0)}
                                </span>
                            </div>
                        )}
                    </div>
                    <div>
                        <h2 className="text-3xl font-bold text-gray-900 mb-2">
                            {displayCandidat.nom_prenoms}
                        </h2>
                        <div className="flex items-center space-x-4">
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-brand-50 text-brand-700">
                                {displayCandidat.parti}
                            </span>
                            <span className="text-gray-500">
                                {displayCandidat.profession}
                            </span>
                        </div>
                        <div className="text-sm text-gray-400 mt-1">
                            {displayCandidat.departement} - {displayCandidat.circonscription}
                        </div>
                    </div>
                    <div className="flex-grow text-right">
                        <div className="text-4xl font-bold text-gray-900">{displayCandidat.pourcentage}%</div>
                        <div className="text-gray-500">des exprimés</div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <StatCard title="Voix Obtenues" value={displayCandidat.voix?.toLocaleString()} color="blue" />
                <StatCard title="Total Votants Circo" value={totaux_globaux?.nbre_votants?.toLocaleString() || '-'} color="gray" />
                <StatCard title="Statut" value={displayCandidat.statut_cand || '-'} color="brand" />
            </div>

            <h3 className="text-xl font-bold text-gray-900 mb-4">Résultats par Bureau de Vote</h3>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <SortableTable results={displayCandidat.bureaux} fallback={!detailedData} />
            </div>
        </div>
    );
};

const SortableTable = ({ results, fallback }) => {
    const [sortConfig, setSortConfig] = React.useState({ key: 'nom_local', direction: 'ascending' });

    const sortedResults = React.useMemo(() => {
        if (!results) return [];
        let sortableItems = [...results];
        if (sortConfig !== null) {
            sortableItems.sort((a, b) => {
                let valA = a[sortConfig.key];
                let valB = b[sortConfig.key];

                // Handling nested properties or specific types if needed
                if (typeof valA === 'string') valA = valA.toLowerCase();
                if (typeof valB === 'string') valB = valB.toLowerCase();

                // For voices, ensure number comparison
                if (sortConfig.key === 'voix') {
                    valA = Number(a.voix) || 0;
                    valB = Number(b.voix) || 0;
                }

                if (valA < valB) {
                    return sortConfig.direction === 'ascending' ? -1 : 1;
                }
                if (valA > valB) {
                    return sortConfig.direction === 'ascending' ? 1 : -1;
                }
                return 0;
            });
        }
        return sortableItems;
    }, [results, sortConfig]);

    const requestSort = (key) => {
        let direction = 'ascending';
        if (sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    const getSortIcon = (name) => {
        if (sortConfig.key !== name) return null;
        return sortConfig.direction === 'ascending' ? '▲' : '▼';
    };

    if (!results || results.length === 0) {
        return (
            <div className="text-center p-6 text-gray-500 italic">
                Détail par bureau non disponible pour ce candidat.
            </div>
        );
    }

    return (
        <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
                <tr>
                    <th
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                        onClick={() => requestSort('nom_local')}
                    >
                        Localité {getSortIcon('nom_local')}
                    </th>
                    <th
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                        onClick={() => requestSort('nom_lieu')}
                    >
                        Lieu de Vote {getSortIcon('nom_lieu')}
                    </th>
                    <th
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                        onClick={() => requestSort('num_bv')}
                    >
                        BV {getSortIcon('num_bv')}
                    </th>
                    <th
                        className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                        onClick={() => requestSort('voix')}
                    >
                        Voix {getSortIcon('voix')}
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        %
                    </th>
                </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
                {sortedResults.map((bureau, idx) => (
                    <tr key={idx} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                            {/* Using nom_local or nom if fallback */}
                            {bureau.nom_local || bureau.nom}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                            {bureau.nom_lieu || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {bureau.num_bv || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900 font-bold">
                            {bureau.voix?.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-500">
                            {bureau.pourcentage}%
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
};

export default CandidatDetail;
