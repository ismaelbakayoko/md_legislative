import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useDispatch, useSelector } from 'react-redux';
import { addDetailedResults, resetAddSuccess, clearResultatsError } from '../features/resultats/resultatsSlice';
import { selectAuthUser } from '../features/auth/authSlice';

const AddDetailedResultsModal = ({ isOpen, onClose, bureauData }) => {
    const dispatch = useDispatch();
    const user = useSelector(selectAuthUser);
    const { loading, error, addSuccess } = useSelector((state) => state.resultats);
    const { partis } = useSelector((state) => state.candidats);
    const { elections, selectedCirconscription } = useSelector((state) => state.settings);

    const [partiResults, setPartiResults] = useState({});

    // Clear errors when modal opens or closes
    useEffect(() => {
        if (isOpen) {
            dispatch(clearResultatsError());
        }
        return () => {
            dispatch(clearResultatsError());
        };
    }, [isOpen, dispatch]);

    useEffect(() => {
        if (addSuccess) {
            toast.success("Les résultats détaillés ont été enregistrés avec succès !");
            onClose();
            dispatch(resetAddSuccess());
        }
        if (error) {
            toast.error(`Erreur : ${error}`);
        }
    }, [addSuccess, error, onClose, dispatch]);

    useEffect(() => {
        // Initialize results object for each party
        if (partis && partis.length > 0) {
            const initialResults = {};
            partis.forEach(parti => {
                initialResults[parti.id_parti] = '';
            });
            setPartiResults(initialResults);
        }
    }, [partis]);

    const handleChange = (id_parti, value) => {
        setPartiResults(prev => ({ ...prev, [id_parti]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        // Get current election
        const currentElection = elections && elections.length > 0 ? elections[0] : null;

        if (!currentElection || !selectedCirconscription) {
            console.error('Missing election or circonscription data');
            return;
        }
        console.log('Selected circonscription:', selectedCirconscription);
        console.log('Selected election:', currentElection);
        console.log('Selected bureau:', bureauData);
        console.log('Full user object:', user);
        console.log('User contact:', user?.contact_user);
        // Build the listeResultat_bv array
        const listeResultat_bv = Object.entries(partiResults)
            .filter(([id_parti, voix_obtenues]) => voix_obtenues && voix_obtenues !== '')
            .map(([id_parti, voix_obtenues]) => ({
                id_election: currentElection.id_election,
                id_cir: selectedCirconscription.id_cir,
                nb_tour: 1, // Default to tour 1
                id_bv: bureauData?.id_bv,
                id_parti: id_parti,
                voix_obtenues: parseInt(voix_obtenues),
                saisie_par: user?.contact_user
            }));


        // Send all results in one call
        if (listeResultat_bv.length > 0) {
            dispatch(addDetailedResults({ listeResultats: listeResultat_bv }));
            console.log('Selected listeResultat_bv:', listeResultat_bv);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                <div className="fixed inset-0 transition-opacity" aria-hidden="true" onClick={onClose}>
                    <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
                </div>

                <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

                <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full sm:p-6">
                    <div className="sm:flex sm:items-start">
                        <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                            <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-headline">
                                Résultats Détaillés - BV {bureauData?.num_bv}
                            </h3>
                            <p className="text-sm text-gray-500 mt-2">
                                Saisissez le nombre de voix obtenues par chaque parti
                            </p>
                            <form onSubmit={handleSubmit} className="mt-5">
                                <div className="max-h-96 overflow-y-auto space-y-3">
                                    {partis && partis.length > 0 ? (
                                        partis.map((parti) => (
                                            <div key={parti.id_parti} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                                                <div className="flex items-center flex-1">
                                                    {parti.logo_url ? (
                                                        <img src={parti.logo_url} alt={parti.sigle} className="h-10 w-10 mr-3 object-contain" />
                                                    ) : (
                                                        <div className="h-10 w-10 mr-3 bg-brand-200 rounded-full flex items-center justify-center text-brand-700 text-sm font-bold">
                                                            {parti.sigle?.substring(0, 2)}
                                                        </div>
                                                    )}
                                                    <div className="flex-1">
                                                        <p className="font-semibold text-gray-900">{parti.nom_parti}</p>
                                                        <p className="text-xs text-gray-500">{parti.sigle}</p>
                                                    </div>
                                                </div>
                                                <div className="w-32">
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        placeholder="Voix"
                                                        value={partiResults[parti.id_parti] || ''}
                                                        onChange={(e) => handleChange(parti.id_parti, e.target.value)}
                                                        className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand-500 focus:border-brand-500 text-sm"
                                                    />
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-gray-500 text-center py-4">Aucun parti disponible</p>
                                    )}
                                </div>

                                <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-brand-600 text-base font-medium text-white hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
                                    >
                                        {loading ? 'Traitement...' : 'Enregistrer'}
                                    </button>
                                    <button
                                        type="button"
                                        className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 sm:mt-0 sm:w-auto sm:text-sm"
                                        onClick={onClose}
                                    >
                                        Annuler
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AddDetailedResultsModal;
