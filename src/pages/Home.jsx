import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { fetchDepartements } from '../features/departements/departementsSlice';
import { fetchActiveElection } from '../features/elections/electionsSlice';
import Loader from '../components/Loader';
import StatCard from '../components/StatCard';

const Home = () => {
    const dispatch = useDispatch();
    const { list: departements, loading: depsLoading } = useSelector((state) => state.departements);
    const { activeElection, loading: electionLoading } = useSelector((state) => state.elections);

    useEffect(() => {
        dispatch(fetchDepartements());
        dispatch(fetchActiveElection());
    }, [dispatch]);

    const loading = depsLoading || electionLoading;

    if (loading) return <Loader />;

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-8 text-center">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    Résultats des Élections Législatives
                </h1>
                <p className="text-gray-500 text-lg">
                    Sélectionnez un département pour consulter les résultats détaillés
                </p>
            </div>

            {activeElection && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 max-w-4xl mx-auto">
                    <StatCard
                        title="Participation"
                        value={`${activeElection.participation || '-'}%`}
                        color="blue"
                    />
                    <StatCard
                        title="Votants"
                        value={activeElection.votants ? activeElection.votants.toLocaleString() : '-'}
                        color="green"
                    />
                    <StatCard
                        title="Sièges Pourvus"
                        value={activeElection.siegesPourvus ? `${activeElection.siegesPourvus}/${activeElection.totalSieges}` : '-'}
                        color="gray"
                    />
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {departements.map((dep) => (
                    <Link
                        key={dep.code}
                        to={`/departement/${dep.code}`}
                        className="block p-6 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md hover:border-brand-300 transition-all duration-200"
                    >
                        <div className="flex justify-between items-center">
                            <span className="text-xl font-semibold text-gray-900">
                                {dep.nom}
                            </span>
                            <span className="text-sm font-medium text-gray-400 bg-gray-100 px-2 py-1 rounded">
                                {dep.code}
                            </span>
                        </div>
                        <div className="mt-2 text-sm text-brand-600 font-medium">
                            Voir les résultats →
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
};

export default Home;
