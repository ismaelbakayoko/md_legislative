import React, { useState } from 'react';

import AddResultsModal from './AddResultsModal';

const PollingStationList = ({ data }) => {
    const [selectedBV, setSelectedBV] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    if (!data || data.length === 0) return null;

    const handleAddResults = (bv) => {
        setSelectedBV(bv);
        setIsModalOpen(true);
    };

    return (
        <div className="mt-8 bg-white shadow overflow-hidden sm:rounded-lg border border-gray-200">
            <div className="px-4 py-5 sm:px-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                    Lieux et Bureaux de Vote
                </h3>
                <p className="mt-1 max-w-2xl text-sm text-gray-500">
                    Liste des lieux de vote et l'état des bureaux.
                </p>
            </div>
            <div className="border-t border-gray-200">
                <ul className="divide-y divide-gray-200">
                    {data.map((localite) => (
                        <li key={localite.id_local} className="p-4">
                            <h4 className="text-md font-bold text-gray-800 mb-2">{localite.nom_local} ({localite.type_local})</h4>
                            <div className="pl-4 space-y-4">
                                {localite.lieux_vote.map((lieu) => (
                                    <div key={lieu.id_lieu} className="bg-gray-50 p-3 rounded-md">
                                        <div className="font-semibold text-gray-700">{lieu.nom_lieu}</div>
                                        <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                                            {lieu.bureaux_vote.map((bv) => (
                                                <div key={bv.id_bv} className="flex flex-col text-sm bg-white p-2 border rounded shadow-sm">
                                                    <div className="flex justify-between items-center mb-2">
                                                        <span className="font-medium">BV {bv.num_bv}</span>
                                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${bv.statut_bv === 'OUVERT' ? 'bg-green-100 text-green-800' :
                                                            bv.statut_bv === 'FERME' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'
                                                            }`}>
                                                            {bv.statut_bv}
                                                        </span>
                                                    </div>
                                                    <button
                                                        onClick={() => handleAddResults(bv)}
                                                        className="w-full inline-flex justify-center items-center px-2 py-1 border border-transparent text-xs font-medium rounded text-brand-700 bg-brand-100 hover:bg-brand-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500"
                                                    >
                                                        Ajouter Résultats
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
            {selectedBV && (
                <AddResultsModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    bureauData={selectedBV}
                />
            )}
        </div>
    );
};

export default PollingStationList;
