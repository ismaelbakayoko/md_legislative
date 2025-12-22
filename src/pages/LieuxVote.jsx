import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, Link } from 'react-router-dom';
import { fetchLieuxVote, fetchDepartements } from '../features/departements/departementsSlice';
import PollingStationList from '../components/PollingStationList';
import Header from '../components/Header'; // Assuming Header is used inside ProtectedRoute, so maybe not needed here if wrapped in App.jsx

const LieuxVote = () => {
    const { id } = useParams();
    const dispatch = useDispatch();
    const [searchTerm, setSearchTerm] = React.useState("");

    const lieuxVote = useSelector((state) => state.departements.lieuxVote);
    const loadingLieux = useSelector((state) => state.departements.loadingLieux);
    const departementsList = useSelector((state) => state.departements.list);
    const selectedDepartement = useSelector((state) => state.settings.selectedDepartement);

    // Fetch Departments List if empty (for refresh case)
    useEffect(() => {
        if (departementsList.length === 0) {
            dispatch(fetchDepartements());
        }
    }, [dispatch, departementsList.length]);

    // Fetch Lieux Vote using Name from List
    useEffect(() => {
        if (selectedDepartement) {
            dispatch(fetchLieuxVote(selectedDepartement.nom_departement));
        }
    }, [dispatch, selectedDepartement]);

    const departmentName = departementsList.find(d => d.code === id)?.nom || id;

    // Filter Logic
    const filteredLieuxVote = React.useMemo(() => {
        if (!searchTerm) return lieuxVote;

        return lieuxVote.map(localite => {
            const matchingLieux = localite.lieux_vote.filter(lieu =>
                lieu.nom_lieu.toLowerCase().includes(searchTerm.toLowerCase())
            );
            return {
                ...localite,
                lieux_vote: matchingLieux
            };
        }).filter(localite => localite.lieux_vote.length > 0);
    }, [lieuxVote, searchTerm]);

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">
                        Lieux de Vote : {selectedDepartement?.nom_departement}
                    </h2>
                    <div className="text-sm text-gray-500 mt-1">
                        Dernière mise à jour : {new Date().toLocaleDateString()}
                    </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative w-full max-w-md">
                        <input
                            type="text"
                            placeholder="Rechercher un lieu de vote..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="
      w-full
      pl-10 pr-4 py-2.5
      text-sm
      rounded-lg
      border border-gray-300
      bg-white
      shadow-sm
      transition
      duration-200
      focus:outline-none
      focus:ring-2
      focus:ring-brand-500
      focus:border-brand-500
      hover:border-gray-400
    "
                        />

                        {/* Icône */}
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <svg
                                className="h-5 w-5 text-gray-400"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                                />
                            </svg>
                        </div>
                    </div>

                    <Link
                        to={`/departement/${id}`}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-brand-700 bg-brand-100 hover:bg-brand-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500"
                    >
                        &larr; Retour aux résultats
                    </Link>
                </div>
            </div>

            {loadingLieux ? (
                <div className="flex justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600"></div>
                </div>
            ) : (
                <PollingStationList data={filteredLieuxVote} />
            )}
        </div>
    );
};

export default LieuxVote;
