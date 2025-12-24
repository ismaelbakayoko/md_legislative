import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, Link } from 'react-router-dom';
import { fetchLieuxVote, fetchDepartements } from '../features/departements/departementsSlice';
import { listResultatsGroupes } from '../features/resultats/resultatsSlice';
import AddResultsModal from '../components/AddResultsModal';
import AddDetailedResultsModal from '../components/AddDetailedResultsModal';
import BvResultsModal from '../components/BvResultsModal';

const LieuxVote = () => {
    const { id } = useParams();
    const dispatch = useDispatch();
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedBV, setSelectedBV] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalType, setModalType] = useState('grouped');

    const lieuxVote = useSelector((state) => state.departements.lieuxVote);
    const loadingLieux = useSelector((state) => state.departements.loadingLieux);
    const departementsList = useSelector((state) => state.departements.list);
    const selectedDepartement = useSelector((state) => state.settings.selectedDepartement);
    const { partis } = useSelector((state) => state.candidats);
    const { elections, selectedCirconscription } = useSelector((state) => state.settings);



    useEffect(() => {
        if (selectedDepartement) {
            dispatch(fetchLieuxVote(selectedDepartement.nom_departement));
        }
    }, [dispatch, selectedDepartement]);

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

    const handleOpenModal = (bv, type) => {
        setSelectedBV(bv);
        setModalType(type);
        setIsModalOpen(true);
        if (type === 'info') {
            const currentElection = elections[0];
            dispatch(listResultatsGroupes(
                {
                    id_bv: bv.id_bv,
                    id_election: currentElection.id_election,
                    id_cir: selectedCirconscription.id_cir,
                    nb_tour: 1,
                }));
                console.log("resultats du bureau")
                console.log(bv.id_bv);
                console.log(currentElection.id_election);
                console.log(selectedCirconscription.id_cir);
        }
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedBV(null);
    };

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
                            className="w-full pl-10 pr-4 py-2.5 text-sm rounded-lg border border-gray-300 bg-white shadow-sm transition duration-200 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 hover:border-gray-400"
                        />
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
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
                <div className="space-y-6">
                    {filteredLieuxVote && filteredLieuxVote.length > 0 ? (
                        filteredLieuxVote.map((localite) => (
                            <div key={localite.id_local} className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
                                <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                                    <h3 className="text-lg font-semibold text-gray-900">
                                        {localite.nom_local} ({localite.type_local})
                                    </h3>
                                </div>
                                <div className="divide-y divide-gray-200">
                                    {localite.lieux_vote && localite.lieux_vote.length > 0 ? (
                                        localite.lieux_vote.map((lieu) => (
                                            <div key={lieu.id_lieu} className="p-4">
                                                <h4 className="font-semibold text-gray-800 mb-3">{lieu.nom_lieu}</h4>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                                    {lieu.bureaux_vote && lieu.bureaux_vote.length > 0 ? (
                                                        lieu.bureaux_vote.map((bv) => (
                                                            <div key={bv.id_bv} className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                                                                <div className="flex justify-between items-center mb-3">
                                                                    <span className="font-medium text-gray-900">BV N° {bv.num_bv}</span>
                                                                    <div className="flex items-center space-x-2">
                                                                        <button
                                                                            onClick={() => handleOpenModal(bv, 'info')}
                                                                            className="p-1 rounded-full text-blue-600 hover:bg-blue-100 transition-colors focus:outline-none"
                                                                            title="Voir les infos"
                                                                        >
                                                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                                            </svg>
                                                                        </button>
                                                                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${bv.statut_bv === 'OUVERT' ? 'bg-green-100 text-green-800' :
                                                                            bv.statut_bv === 'FERME' ? 'bg-red-100 text-red-800' :
                                                                                'bg-gray-100 text-gray-800'
                                                                            }`}>
                                                                            {bv.statut_bv}
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                                <div className="space-y-2">
                                                                    <button
                                                                        onClick={() => handleOpenModal(bv, 'grouped')}
                                                                        className="w-full inline-flex items-center justify-center px-3 py-2 border border-transparent text-xs font-medium rounded-md text-white bg-brand-600 hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 transition-colors"
                                                                    >
                                                                        <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                                        </svg>
                                                                        Résultats Groupés
                                                                    </button>
                                                                    <button
                                                                        onClick={() => handleOpenModal(bv, 'detailed')}
                                                                        className="w-full inline-flex items-center justify-center px-3 py-2 border border-brand-600 text-xs font-medium rounded-md text-brand-600 bg-white hover:bg-brand-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 transition-colors"
                                                                    >
                                                                        <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                                                                        </svg>
                                                                        Résultats Détaillés
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        ))
                                                    ) : (
                                                        <p className="text-sm text-gray-500">Aucun bureau de vote</p>
                                                    )}
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="px-4 py-3 text-sm text-gray-500">Aucun lieu de vote</p>
                                    )}
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-12">
                            <p className="text-gray-500">Aucun lieu de vote trouvé</p>
                        </div>
                    )}
                </div>
            )}

            {/* Modals */}
            {modalType === 'grouped' ? (
                <AddResultsModal
                    isOpen={isModalOpen}
                    onClose={handleCloseModal}
                    bureauData={selectedBV}
                />
            ) : modalType === 'detailed' ? (
                <AddDetailedResultsModal
                    isOpen={isModalOpen}
                    onClose={handleCloseModal}
                    bureauData={selectedBV}
                />
            ) : (
                <BvResultsModal
                    isOpen={isModalOpen}
                    onClose={handleCloseModal}
                    bureauData={selectedBV}
                />
            )}
        </div>
    );
};

export default LieuxVote;
