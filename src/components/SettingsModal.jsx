import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    fetchRegions,
    fetchDepartementsByRegion,
    fetchCirconscriptionsByRegion,
    fetchElections,
    setSelectedRegion,
    setSelectedDepartement,
    setSelectedCirconscription
} from '../features/settings/settingsSlice';
import { clearAllData } from '../features/resultats/resultatsSlice';
import { clearCandidates } from '../features/candidats/candidatsSlice';

const SettingsModal = ({ isOpen, onClose, forced = false }) => {
    const dispatch = useDispatch();
    const {
        regions, departements, circonscriptions, elections,
        selectedRegion, selectedDepartement, selectedCirconscription,
        loading
    } = useSelector((state) => state.settings);

    // Local state for deferred saving
    const [localRegion, setLocalRegion] = useState(null);
    const [localDepartement, setLocalDepartement] = useState(null);
    const [localCirconscription, setLocalCirconscription] = useState(null);

    // Sync local state with global state when modal opens
    useEffect(() => {
        if (isOpen) {
            setLocalRegion(selectedRegion);
            setLocalDepartement(selectedDepartement);
            setLocalCirconscription(selectedCirconscription);
        }
    }, [isOpen, selectedRegion, selectedDepartement, selectedCirconscription]);

    const isComplete = localRegion && localDepartement && localCirconscription;

    useEffect(() => {
        if (isOpen && regions.length === 0) {
            dispatch(fetchRegions());
        }
        dispatch(fetchElections());
    }, [isOpen, regions.length, dispatch]);

    // Fetch dependent data based on LOCAL selection
    useEffect(() => {
        if (localRegion) {
            if (localRegion.code_region) {
                dispatch(fetchDepartementsByRegion(localRegion.code_region));
            }
            if (localRegion.id_region) {
                dispatch(fetchCirconscriptionsByRegion(localRegion.id_region));
            }
        }
    }, [localRegion, dispatch]);

    const handleRegionChange = (e) => {
        const regionId = e.target.value;
        const region = regions.find(r => r.id_region === regionId || r.code_region === regionId);
        setLocalRegion(region);
        setLocalDepartement(null);
        setLocalCirconscription(null);
    };

    const handleDepartementChange = (e) => {
        const deptId = e.target.value;
        const dept = departements.find(d => d.code_departement === deptId || d.id_departement === deptId);
        setLocalDepartement(dept);
    };

    const handleCirconscriptionChange = (e) => {
        const circId = e.target.value;
        const circ = circonscriptions.find(c => c.id_cir === circId);
        setLocalCirconscription(circ);
    };

    const handleSave = () => {
        const regionChanged = localRegion?.id_region !== selectedRegion?.id_region;
        const deptChanged = localDepartement?.id_departement !== selectedDepartement?.id_departement;
        const circChanged = localCirconscription?.id_cir !== selectedCirconscription?.id_cir;

        if (regionChanged || deptChanged || circChanged) {
            dispatch(clearAllData());
            dispatch(clearCandidates());
        }

        if (localRegion) dispatch(setSelectedRegion(localRegion));
        if (localDepartement) dispatch(setSelectedDepartement(localDepartement));
        if (localCirconscription) dispatch(setSelectedCirconscription(localCirconscription));
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-hidden">
            <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
                {/* Backdrop with blur */}
                <div
                    className="fixed inset-0 transition-opacity backdrop-blur-sm bg-gray-900/40"
                    aria-hidden="true"
                    onClick={forced ? undefined : onClose}
                ></div>

                <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

                {/* Modal Container */}
                <div className="relative inline-block align-bottom bg-white rounded-3xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-sm sm:w-full border border-gray-100" role="dialog" aria-modal="true" aria-labelledby="modal-headline">

                    {/* Header with gradient pattern */}
                    <div className="bg-gradient-to-br from-brand-600 to-brand-800 px-5 py-6 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
                        <div className="absolute bottom-0 left-0 w-24 h-24 bg-brand-400/20 rounded-full -ml-12 -mb-12 blur-xl"></div>

                        <div className="relative z-10 text-center">
                            <div className="mx-auto w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mb-3 shadow-inner border border-white/30">
                                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-black text-white tracking-tight" id="modal-headline">
                                {forced ? 'Configuration Requise' : 'Configuration'}
                            </h3>
                            <p className="text-brand-100 text-sm mt-1 font-medium px-4">
                                {forced
                                    ? "Définissez votre périmètre d'action pour accéder à la plateforme."
                                    : "Personnalisez votre zone de consultation."}
                            </p>
                        </div>
                    </div>

                    <div className="px-5 py-6 space-y-4">
                        {/* Region */}
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <label htmlFor="region" className="block text-[11px] font-black text-gray-400 uppercase tracking-widest">
                                    Région administrative
                                </label>
                                <button
                                    onClick={() => dispatch(fetchRegions())}
                                    className={`p-1.5 text-brand-600 hover:bg-brand-50 rounded-xl transition-all ${loading.regions ? 'animate-spin' : 'active:rotate-180'}`}
                                    title="Actualiser les régions"
                                    disabled={loading.regions}
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                    </svg>
                                </button>
                            </div>
                            <div className="relative group">
                                <select
                                    id="region"
                                    name="region"
                                    className="block w-full pl-4 pr-10 py-2.5 text-sm font-bold bg-gray-50 border-2 border-gray-100 rounded-2xl appearance-none focus:outline-none focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 focus:bg-white transition-all duration-300 group-hover:border-gray-200"
                                    value={localRegion?.id_region || ''}
                                    onChange={handleRegionChange}
                                >
                                    <option value="" className="font-sans">Sélectionner une région</option>
                                    {regions.map((region) => (
                                        <option key={region.id_region} value={region.id_region}>
                                            {region.nom_region}
                                        </option>
                                    ))}
                                </select>
                                <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none text-gray-400 group-focus-within:text-brand-500 transition-colors">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </div>
                            </div>
                            {loading.regions && <p className="text-[10px] text-brand-600 font-bold italic animate-pulse">Synchronisation des régions...</p>}
                        </div>

                        {/* Departement */}
                        <div className="space-y-2">
                            <label htmlFor="departement" className="block text-[11px] font-black text-gray-400 uppercase tracking-widest">
                                Département
                            </label>
                            <div className="relative group">
                                <select
                                    id="departement"
                                    name="departement"
                                    className="block w-full pl-4 pr-10 py-2.5 text-sm font-bold bg-gray-50 border-2 border-gray-100 rounded-2xl appearance-none focus:outline-none focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 focus:bg-white transition-all duration-300 group-hover:border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                    value={localDepartement?.id_departement || ''}
                                    onChange={handleDepartementChange}
                                    disabled={!localRegion || loading.departements}
                                >
                                    <option value="">Sélectionner un département</option>
                                    {departements.map((dept) => (
                                        <option key={dept.id_departement} value={dept.id_departement}>
                                            {dept.nom_departement}
                                        </option>
                                    ))}
                                </select>
                                <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none text-gray-400 group-focus-within:text-brand-500 transition-colors">
                                    {loading.departements ? (
                                        <svg className="animate-spin h-4 w-4 text-brand-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                    ) : (
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Circonscription */}
                        <div className="space-y-2">
                            <label htmlFor="circonscription" className="block text-[11px] font-black text-gray-400 uppercase tracking-widest">
                                Circonscription électorale
                            </label>
                            <div className="relative group">
                                <select
                                    id="circonscription"
                                    name="circonscription"
                                    className="block w-full pl-4 pr-10 py-2.5 text-sm font-bold bg-gray-50 border-2 border-gray-100 rounded-2xl appearance-none focus:outline-none focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 focus:bg-white transition-all duration-300 group-hover:border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                    value={localCirconscription?.id_cir || ''}
                                    onChange={handleCirconscriptionChange}
                                    disabled={!localRegion || loading.circonscriptions}
                                >
                                    <option value="">Sélectionner une circonscription</option>
                                    {circonscriptions.map((circ) => (
                                        <option key={circ.id_cir} value={circ.id_cir}>
                                            {circ.circonscription}
                                        </option>
                                    ))}
                                </select>
                                <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none text-gray-400 group-focus-within:text-brand-500 transition-colors">
                                    {loading.circonscriptions ? (
                                        <svg className="animate-spin h-4 w-4 text-brand-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                    ) : (
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Footer with actions */}
                    <div className="bg-gray-50/80 backdrop-blur-md px-5 py-5 flex flex-col items-center">
                        <button
                            type="button"
                            disabled={forced && !isComplete}
                            className={`w-full py-3 px-6 rounded-2xl text-base font-black tracking-tight shadow-xl transition-all duration-300 transform active:scale-95 flex items-center justify-center gap-2 ${forced && !isComplete
                                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                : 'bg-brand-600 text-white hover:bg-brand-700 hover:shadow-brand-500/20 active:bg-brand-800'
                                }`}
                            onClick={handleSave}
                        >
                            <span>{forced ? 'Activer la configuration' : 'Appliquer les changements'}</span>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                            </svg>
                        </button>

                        {!forced && (
                            <button
                                onClick={onClose}
                                className="mt-4 text-xs font-bold text-gray-400 hover:text-gray-600 transition-colors uppercase tracking-widest"
                            >
                                Annuler et fermer
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SettingsModal;
