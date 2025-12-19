import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { fetchResultatsByCandidat } from '../features/resultats/resultatsSlice';
import { selectCurrentCandidatResultats, selectResultatsLoading } from '../features/resultats/selectors';
import Loader from '../components/Loader';
import StatCard from '../components/StatCard';

const CandidatDetail = () => {
    const { id } = useParams();
    const dispatch = useDispatch();

    const loading = useSelector(selectResultatsLoading);
    const candidat = useSelector(selectCurrentCandidatResultats);

    useEffect(() => {
        if (id) {
            dispatch(fetchResultatsByCandidat(id));
        }
    }, [dispatch, id]);

    if (loading) return <Loader />;
    if (!candidat) return <div className="text-center p-8 text-gray-500">Candidat non trouvé.</div>;

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-3xl font-bold text-gray-900 mb-2">
                            {candidat.prenom} {candidat.nom}
                        </h2>
                        <div className="flex items-center space-x-4">
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-brand-50 text-brand-700">
                                {candidat.parti}
                            </span>
                            <span className="text-gray-500">
                                {candidat.departement} - Circonscription {candidat.circonscription}
                            </span>
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="text-4xl font-bold text-gray-900">{candidat.pourcentage}%</div>
                        <div className="text-gray-500">des exprimés</div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <StatCard title="Voix" value={candidat.voix?.toLocaleString()} color="blue" />
                <StatCard title="Total Votants Circo" value={candidat.totalVotants?.toLocaleString()} color="gray" />
                <StatCard title="Position" value={candidat.position ? `${candidat.position}e` : '-'} color="brand" />
            </div>

            <h3 className="text-xl font-bold text-gray-900 mb-4">Résultats par Bureau de Vote</h3>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bureau</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Voix</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">%</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {/* Simulation de résultats par bureau si non disponibles dans l'objet candidat global */}
                        {(candidat.bureaux || []).length > 0 ? (
                            candidat.bureaux.map((bureau, idx) => (
                                <tr key={idx}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{bureau.nom}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900">{bureau.voix}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900">{bureau.pourcentage}%</td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="3" className="px-6 py-4 text-center text-sm text-gray-500 italic">
                                    Détail par bureau non disponible pour ce candidat.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default CandidatDetail;
