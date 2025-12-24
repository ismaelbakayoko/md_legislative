import React, { useEffect, useState, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getLieuxVoteByDepartement } from '../features/resultats/resultatsSlice';
import Loader from '../components/Loader';
import ResultatsLieuModal from '../components/ResultatsLieuModal';
import { ChevronLeftIcon, ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/solid';
import useCustomWebSocket from '../hooks/useCustomWebSocket';

const ResultatsParLieu = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { nom_departement } = location.state || {};
    const selectedDepartement = useSelector((state) => state.settings.selectedDepartement);

    const { lieuxVoteByDepartement, loadingLieuxVote, error } = useSelector((state) => state.resultats);
    const [sortedData, setSortedData] = useState([]);
    const [sortConfig, setSortConfig] = useState({ key: 'nom_local', direction: 'ascending' });

    useEffect(() => {
        if (selectedDepartement?.nom_departement) {
            dispatch(getLieuxVoteByDepartement(selectedDepartement.nom_departement));
        }
    }, [dispatch, selectedDepartement]);

    // ============================================
    // WebSocket Integration - Real-time Updates
    // ============================================

    // Handler pour les messages WebSocket
    const handleWebSocketMessage = useCallback((data) => {
        console.log("📨 WebSocket: Message reçu (ResultatsParLieu):", data);

        const eventType = data.event || data.type;

        if (eventType === 'INSERT_RESULTATS_BV' || eventType === 'INSERT_RESULTATS_GROUPES') {
            console.log("🔄 Rafraîchissement lieux de vote");

            if (selectedDepartement?.nom_departement) {
                dispatch(getLieuxVoteByDepartement({ nom_departement: selectedDepartement.nom_departement, isSilent: true }));
            }
        }
    }, [dispatch, selectedDepartement]);

    // Utiliser le hook WebSocket
    const { isConnected, connectionStatus } = useCustomWebSocket(handleWebSocketMessage);

    useEffect(() => {
        if (lieuxVoteByDepartement && lieuxVoteByDepartement.length > 0) {
            console.log("Processing Lieux Vote Data:", lieuxVoteByDepartement);
            let flatList = [];
            lieuxVoteByDepartement.forEach(local => {
                if (local.lieux_vote && Array.isArray(local.lieux_vote)) {
                    local.lieux_vote.forEach(lieu => {
                        // Vérifier que bureaux_vote existe et n'est pas vide
                        if (lieu.bureaux_vote && lieu.bureaux_vote.length > 0) {
                            flatList.push({
                                id_local: local.id_local,
                                nom_local: local.nom_local,
                                nom_departement: local.nom_departement,
                                id_lieu: lieu.id_lieu,
                                id_bv: lieu.bureaux_vote[0].id_bv,
                                nom_lieu: lieu.nom_lieu,
                                nb_bureaux: lieu.bureaux_vote.length,
                                data: lieu // Store full object just in case
                            });
                        } else {
                            console.warn("Lieu sans bureaux de vote:", lieu);
                        }
                    });
                }
            });
            console.log("Flat List Created:", flatList);
            setSortedData(flatList);
        }
    }, [lieuxVoteByDepartement]);

    const requestSort = (key) => {
        let direction = 'ascending';
        if (sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    useEffect(() => {
        if (sortedData.length > 0) {
            let sortableItems = [...sortedData];
            if (sortConfig !== null) {
                sortableItems.sort((a, b) => {
                    const valA = a[sortConfig.key] || "";
                    const valB = b[sortConfig.key] || "";

                    if (valA < valB) {
                        return sortConfig.direction === 'ascending' ? -1 : 1;
                    }
                    if (valA > valB) {
                        return sortConfig.direction === 'ascending' ? 1 : -1;
                    }
                    return 0;
                });

                // Only update if order actually changed to avoid loop - check first/last element or simple check
                // For now, let's just use string comparison of IDs to check if different
                const currentIds = sortedData.map(i => i.id_lieu).join(',');
                const newIds = sortableItems.map(i => i.id_lieu).join(',');

                if (currentIds !== newIds) {
                    setSortedData(sortableItems);
                }
            }
        }
    }, [sortConfig]); // Removed lieuxVoteByDepartement dependency to avoid conflict

    const goBack = () => {
        navigate(-1);
    };

    const { partis } = useSelector((state) => state.candidats);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedLieu, setSelectedLieu] = useState(null);

    const handleOpenModal = (lieuData) => {
        setSelectedLieu(lieuData);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedLieu(null);
    };

    // ... (rest of code before return)

    if (loadingLieuxVote) return <Loader />;

    return (
        <div className="container mx-auto px-4 py-8">
            <button
                onClick={goBack}
                className="mb-6 flex items-center text-gray-600 hover:text-gray-900 transition-colors"
            >
                <ChevronLeftIcon className="h-5 w-5 mr-1" />
                Retour
            </button>

            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-gray-800">
                        Lieux de Vote - {nom_departement}
                    </h2>
                    <span className="text-sm text-gray-500">
                        {sortedData.length} Lieux trouvés
                    </span>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th
                                    scope="col"
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                                    onClick={() => requestSort('nom_local')}
                                >
                                    <div className="flex items-center">
                                        Localité
                                        {sortConfig.key === 'nom_local' && (
                                            sortConfig.direction === 'ascending' ? <ChevronUpIcon className="h-4 w-4 ml-1" /> : <ChevronDownIcon className="h-4 w-4 ml-1" />
                                        )}
                                    </div>
                                </th>
                                <th
                                    scope="col"
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                                    onClick={() => requestSort('nom_lieu')}
                                >
                                    <div className="flex items-center">
                                        Lieu de Vote
                                        {sortConfig.key === 'nom_lieu' && (
                                            sortConfig.direction === 'ascending' ? <ChevronUpIcon className="h-4 w-4 ml-1" /> : <ChevronDownIcon className="h-4 w-4 ml-1" />
                                        )}
                                    </div>
                                </th>
                                <th
                                    scope="col"
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider text-center"
                                >
                                    Bureaux
                                </th>
                                <th
                                    scope="col"
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider text-center"
                                >
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {sortedData.map((item, index) => (
                                <tr key={`${item.id_lieu}-${index}`} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                        {item.nom_local}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                        {item.nom_lieu}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                            {item.nb_bureaux}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium space-x-3">
                                        <button
                                            className="text-brand-600 hover:text-brand-900 font-semibold"
                                            onClick={() => handleOpenModal(item.data)}
                                        >
                                            Voir Détails
                                        </button>
                                        {(() => {
                                            const bureau = item.data.bureaux_vote && item.data.bureaux_vote[0];
                                            const pvPdf = bureau?.resultats_groupes && bureau.resultats_groupes[0]?.pv_pdf;
                                            const pv = bureau?.resultats_groupes && bureau.resultats_groupes[0]?.pv;
                                            const pdfUrl = Array.isArray(pvPdf) ? pvPdf[0] : pvPdf;

                                            if (pvPdf) {
                                                return (
                                                    <a
                                                        href={pdfUrl}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-emerald-600 hover:text-emerald-900 font-semibold inline-flex items-center"
                                                        title="Ouvrir le PV dans le navigateur"
                                                    >
                                                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                                        </svg>
                                                        Voir PV
                                                    </a>
                                                );
                                            }
                                            return null;
                                        })()}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {sortedData.length === 0 && !loadingLieuxVote && (
                    <div className="p-8 text-center text-gray-500">
                        Aucun lieu de vote trouvé pour ce département.
                    </div>
                )}
            </div>

            <ResultatsLieuModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                lieuData={selectedLieu}
                partis={partis}
            />
        </div>
    );
};

export default ResultatsParLieu;
