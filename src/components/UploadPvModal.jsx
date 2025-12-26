import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useDispatch, useSelector } from 'react-redux';
import { uploadPv, resetAddSuccess, clearResultatsError } from '../features/resultats/resultatsSlice';

const UploadPvModal = ({ isOpen, onClose, bureauData, onSuccess }) => {
    const dispatch = useDispatch();
    const { loading, error, addSuccess } = useSelector((state) => state.resultats);
    const { elections, selectedCirconscription } = useSelector((state) => state.settings);
    const [pdfFiles, setPdfFiles] = useState([]);

    useEffect(() => {
        if (isOpen) {
            dispatch(clearResultatsError());
            setPdfFiles([]);
        }
    }, [isOpen, dispatch]);

    useEffect(() => {
        if (addSuccess) {
            toast.success("Les PV ont été uploadés avec succès !");
            if (onSuccess) onSuccess();
            onClose();
            dispatch(resetAddSuccess());
        }
    }, [addSuccess, onClose, dispatch, onSuccess]);

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

        if (pdfFiles.length === 0) {
            toast.error("Veuillez sélectionner au moins un fichier PDF");
            return;
        }

        const currentElection = elections && elections.length > 0 ? elections[0] : null;

        if (!currentElection || !selectedCirconscription || !bureauData) {
            toast.error("Données manquantes pour l'upload");
            return;
        }

        const formData = new FormData();
        formData.append('id_election', currentElection.id_election);
        formData.append('id_cir', selectedCirconscription.id_cir);
        formData.append('nb_tour', 1);
        formData.append('id_bv', bureauData.id_bv);

        // Append each file to the same key 'pv_pdf'
        pdfFiles.forEach(file => {
            formData.append('pv_pdf', file);
        });

        dispatch(uploadPv(formData));
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                <div className="fixed inset-0 transition-opacity" aria-hidden="true" onClick={onClose}>
                    <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
                </div>
                <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
                <div className="inline-block align-bottom bg-white rounded-2xl px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6 border border-gray-100">
                    <div className="sm:flex sm:items-start">
                        <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                            <h3 className="text-xl font-black text-gray-900 tracking-tightest mb-4">
                                Uploader les PV - BV {bureauData?.num_bv}
                            </h3>
                            <p className="text-gray-500 text-sm mb-6 font-medium text-center sm:text-left">
                                Sélectionnez un ou plusieurs fichiers PDF du procès-verbal (max 10).
                            </p>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="relative group">
                                    <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 hover:border-brand-400 transition-all bg-gray-50 group-hover:bg-brand-50/30 flex flex-col items-center">
                                        <svg className="w-12 h-12 text-gray-300 group-hover:text-brand-400 mb-3 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                        </svg>
                                        <input
                                            type="file"
                                            accept=".pdf"
                                            multiple
                                            onChange={handleFileChange}
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                        />
                                        <p className="text-sm font-black text-gray-600 text-center max-w-full truncate px-4">
                                            {pdfFiles.length > 0
                                                ? `${pdfFiles.length} fichier(s) sélectionné(s)`
                                                : "Cliquez pour choisir les PDF"}
                                        </p>
                                        <div className="mt-2 flex flex-wrap justify-center gap-1 max-h-24 overflow-y-auto px-2">
                                            {pdfFiles.map((f, i) => (
                                                <span key={i} className="text-[10px] bg-white border border-gray-100 px-2 py-0.5 rounded text-gray-400 truncate max-w-[120px]">
                                                    {f.name}
                                                </span>
                                            ))}
                                        </div>
                                        <p className="text-[10px] text-gray-400 mt-3 uppercase font-black tracking-widest text-center">Format PDF uniquement (Max 10)</p>
                                    </div>
                                </div>

                                <div className="flex flex-col sm:flex-row-reverse gap-3">
                                    <button
                                        type="submit"
                                        disabled={loading || pdfFiles.length === 0}
                                        className="inline-flex justify-center items-center px-6 py-3 border border-transparent text-sm font-black rounded-xl text-white bg-brand-600 hover:bg-brand-700 focus:outline-none transition-all active:scale-95 disabled:opacity-50 shadow-lg shadow-brand-500/20"
                                    >
                                        {loading ? (
                                            <>
                                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                                Envoi...
                                            </>
                                        ) : "Uploader les PV"}
                                    </button>
                                    <button
                                        type="button"
                                        className="inline-flex justify-center items-center px-6 py-3 border border-gray-200 text-sm font-black rounded-xl text-gray-700 bg-white hover:bg-gray-50 focus:outline-none transition-all active:scale-95 shadow-sm"
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

export default UploadPvModal;
