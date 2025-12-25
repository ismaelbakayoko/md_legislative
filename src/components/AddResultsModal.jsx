import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useDispatch, useSelector } from 'react-redux';
import { addGlobalResults, resetAddSuccess, clearResultatsError } from '../features/resultats/resultatsSlice';
import { selectAuthUser } from '../features/auth/authSlice';

const AddResultsModal = ({ isOpen, onClose, bureauData }) => {
    const dispatch = useDispatch();
    const user = useSelector(selectAuthUser);
    const { loading, error, addSuccess } = useSelector((state) => state.resultats);
    const { elections, selectedCirconscription } = useSelector((state) => state.settings);


    const [formData, setFormData] = useState({
        pop_elect: '',
        pers_astreint: '',
        nbre_votants: '',
        bulletins_nuls: '',
        bulletins_blancs: '',
        bulletins_exprimes: ''
    });
    const [pdfFiles, setPdfFiles] = useState([]);

    // Mettre à jour le formulaire quand bureauData change
    useEffect(() => {
        if (isOpen && bureauData) {
            const initialPopElect = (bureauData.bv_configs && bureauData.bv_configs.length > 0)
                ? bureauData.bv_configs[0].pop_elect
                : '';

            setFormData({
                pop_elect: initialPopElect,
                pers_astreint: '',
                nbre_votants: '',
                bulletins_nuls: '',
                bulletins_blancs: '',
                bulletins_exprimes: ''
            });
            setPdfFiles([]);
        }
    }, [isOpen, bureauData]);

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
            toast.success("Les résultats globaux ont été enregistrés avec succès !");
            onClose();
            dispatch(resetAddSuccess());
            // Reset form
            setFormData({
                pop_elect: '',
                pers_astreint: '',
                nbre_votants: '',
                bulletins_nuls: '',
                bulletins_blancs: '',
                bulletins_exprimes: ''
            });
            setPdfFiles([]);
        }
        if (error) {
            toast.error(`Erreur : ${error}`);
        }
    }, [addSuccess, error, onClose, dispatch]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => {
            const newState = { ...prev, [name]: value };

            // Calcul automatique des bulletins exprimés
            // Formule demandée: nombre de votant - bulletin nul
            if (name === 'nbre_votants' || name === 'bulletins_nuls') {
                const votants = parseInt(name === 'nbre_votants' ? value : prev.nbre_votants) || 0;
                const nuls = parseInt(name === 'bulletins_nuls' ? value : prev.bulletins_nuls) || 0;
                newState.bulletins_exprimes = Math.max(0, votants - nuls).toString();
            }

            return newState;
        });
    };

    const handleFileChange = (e) => {
        const selectedFiles = Array.from(e.target.files);
        const validPdfs = selectedFiles.filter(file => file.type === 'application/pdf');

        if (validPdfs.length !== selectedFiles.length) {
            toast.error('Certains fichiers ont été ignorés car ils ne sont pas au format PDF');
        }

        if (validPdfs.length > 10) {
            toast.error('Vous ne pouvez pas sélectionner plus de 10 fichiers');
            setPdfFiles(validPdfs.slice(0, 10));
        } else {
            setPdfFiles(validPdfs);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        // Get current election
        const currentElection = elections && elections.length > 0 ? elections[0] : null;

        if (!currentElection || !selectedCirconscription) {
            console.error('Missing election or circonscription data');
            return;
        }

        const payload = {
            ...formData,
            id_bv: bureauData?.id_bv,
            saisie_par: user?.contact_user,
            id_cir: selectedCirconscription?.id_cir,
            id_election: currentElection?.id_election,
            nb_tour: 1,
            pv_pdf: pdfFiles // Include the PDF files array
        };
        console.log('payload', payload);

        dispatch(addGlobalResults(payload));
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                <div className="fixed inset-0 transition-opacity" aria-hidden="true" onClick={onClose}>
                    <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
                </div>

                <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

                <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
                    <div className="sm:flex sm:items-start">
                        <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                            <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-headline">
                                Ajouter Résultats - BV {bureauData?.num_bv}
                            </h3>
                            <form onSubmit={handleSubmit} className="mt-5 space-y-4">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Population Électorale</label>
                                        <div className="mt-1 block w-full border border-gray-200 bg-gray-50 rounded-md py-2 px-3 text-sm text-gray-600 font-semibold italic">
                                            {(bureauData?.bv_configs && bureauData.bv_configs.length > 0)
                                                ? bureauData.bv_configs[0].pop_elect
                                                : 'N/A'}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Personnes en Astreinte</label>
                                        <input
                                            type="number"
                                            name="pers_astreint"
                                            required
                                            value={formData.pers_astreint}
                                            onChange={handleChange}
                                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand-500 focus:border-brand-500 sm:text-sm"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Nombre de Votants</label>
                                        <input
                                            type="number"
                                            name="nbre_votants"
                                            required
                                            value={formData.nbre_votants}
                                            onChange={handleChange}
                                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand-500 focus:border-brand-500 sm:text-sm"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Bulletins Nuls</label>
                                        <input
                                            type="number"
                                            name="bulletins_nuls"
                                            required
                                            value={formData.bulletins_nuls}
                                            onChange={handleChange}
                                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand-500 focus:border-brand-500 sm:text-sm"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Bulletins Blancs</label>
                                        <input
                                            type="number"
                                            name="bulletins_blancs"
                                            required
                                            value={formData.bulletins_blancs}
                                            onChange={handleChange}
                                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand-500 focus:border-brand-500 sm:text-sm"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Bulletins Exprimés</label>
                                        <div className="mt-1 block w-full border border-gray-200 bg-gray-50 rounded-md py-2 px-3 text-sm text-gray-600 font-bold">
                                            {formData.bulletins_exprimes || '0'}
                                        </div>
                                    </div>
                                </div>

                                {/* PDF Upload */}
                                <div className="mt-4">
                                    <label className="block text-sm font-medium text-gray-700">
                                        PV (PDF) <span className="text-gray-500 text-xs">(optionnel, max 10)</span>
                                    </label>
                                    <div className="mt-1 flex items-center">
                                        <input
                                            type="file"
                                            accept=".pdf"
                                            multiple
                                            onChange={handleFileChange}
                                            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-brand-50 file:text-brand-700 hover:file:bg-brand-100"
                                        />
                                    </div>
                                    {pdfFiles.length > 0 && (
                                        <div className="mt-2 space-y-1">
                                            <p className="text-sm font-medium text-gray-600">
                                                {pdfFiles.length} fichier(s) sélectionné(s) :
                                            </p>
                                            <div className="max-h-24 overflow-y-auto flex flex-wrap gap-1">
                                                {pdfFiles.map((f, i) => (
                                                    <span key={i} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800 border border-gray-200 truncate max-w-[150px]">
                                                        {f.name}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
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

export default AddResultsModal;
