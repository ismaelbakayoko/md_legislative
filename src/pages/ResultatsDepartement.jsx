import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { fetchResultatsByDepartement } from '../features/resultats/resultatsSlice';
import { selectSortedCandidats, selectDepartementStats, selectResultatsLoading } from '../features/resultats/selectors';
import Loader from '../components/Loader';
import StatCard from '../components/StatCard';
import ResultTable from '../components/ResultTable';
import { ResultBarChart, ResultPieChart } from '../components/Charts';

const ResultatsDepartement = () => {
    const { id } = useParams();
    const dispatch = useDispatch();

    const loading = useSelector(selectResultatsLoading);
    const sortedCandidats = useSelector(selectSortedCandidats);
    const stats = useSelector(selectDepartementStats);
    const currentDepartement = useSelector((state) => state.resultats.currentDepartement);

    useEffect(() => {
        if (id) {
            dispatch(fetchResultatsByDepartement(id));
        }
    }, [dispatch, id]);

    if (loading) return <Loader />;
    if (!currentDepartement) return <div className="text-center p-8 text-gray-500">Aucun résultat disponible.</div>;

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900">
                    Résultats : {currentDepartement.nom} ({id})
                </h2>
                <div className="text-sm text-gray-500 mt-1">
                    Dernière mise à jour : {new Date().toLocaleDateString()}
                </div>
            </div>

            {/* Global Stats */}
            {stats && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                    <StatCard title="Inscrits" value={stats.inscrits?.toLocaleString() || '-'} color="gray" />
                    <StatCard title="Votants" value={stats.votants?.toLocaleString() || '-'} color="blue" />
                    <StatCard title="Exprimés" value={stats.exprimes?.toLocaleString() || '-'} color="green" />
                    <StatCard title="Participation" value={`${stats.participation}%`} color="brand" />
                </div>
            )}

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <ResultBarChart candidates={sortedCandidats.slice(0, 10)} />
                </div>
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 flex justify-center items-center">
                    <div className="w-full max-w-xs">
                        <ResultPieChart candidates={sortedCandidats.slice(0, 6)} />
                    </div>
                </div>
            </div>

            {/* Table */}
            <h3 className="text-xl font-bold text-gray-900 mb-4">Détail des résultats</h3>
            <ResultTable candidates={sortedCandidats} totalExprimes={stats?.exprimes || 1} />
        </div>
    );
};

export default ResultatsDepartement;
