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
        if (localRegion) dispatch(setSelectedRegion(localRegion));
        if (localDepartement) dispatch(setSelectedDepartement(localDepartement));
        if (localCirconscription) dispatch(setSelectedCirconscription(localCirconscription));
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                <div className="fixed inset-0 transition-opacity" aria-hidden="true" onClick={forced ? undefined : onClose}>
                    <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
                </div>

                <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

                <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6" role="dialog" aria-modal="true" aria-labelledby="modal-headline">
                    <div>
                        <div className="mt-3 text-center sm:mt-5">
                            <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-headline">
                                {forced ? 'Configuration Requise' : 'Configuration'}
                            </h3>
                            <div className="mt-2">
                                <p className="text-sm text-gray-500">
                                    {forced
                                        ? "Veuillez sélectionner votre zone géographique pour continuer."
                                        : "Sélectionnez votre zone géographique de travail."}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="mt-5 sm:mt-6 space-y-4">
                        {/* Region */}
                        <div>
                            <label htmlFor="region" className="block text-sm font-medium text-gray-700">
                                Région
                            </label>
                            <select
                                id="region"
                                name="region"
                                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-brand-500 focus:border-brand-500 sm:text-sm rounded-md"
                                value={localRegion?.id_region || ''}
                                onChange={handleRegionChange}
                            >
                                <option value="">Choisir une région</option>
                                {regions.map((region) => (
                                    <option key={region.id_region} value={region.id_region}>
                                        {region.nom_region}
                                    </option>
                                ))}
                            </select>
                            {loading.regions && <p className="text-xs text-brand-500 mt-1">Chargement...</p>}
                        </div>

                        {/* Departement */}
                        <div>
                            <label htmlFor="departement" className="block text-sm font-medium text-gray-700">
                                Département
                            </label>
                            <select
                                id="departement"
                                name="departement"
                                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-brand-500 focus:border-brand-500 sm:text-sm rounded-md"
                                value={localDepartement?.id_departement || ''}
                                onChange={handleDepartementChange}
                                disabled={!localRegion || loading.departements}
                            >
                                <option value="">Choisir un département</option>
                                {departements.map((dept) => (
                                    <option key={dept.id_departement} value={dept.id_departement}>
                                        {dept.nom_departement}
                                    </option>
                                ))}
                            </select>
                            {loading.departements && <p className="text-xs text-brand-500 mt-1">Chargement...</p>}
                        </div>

                        {/* Circonscription */}
                        <div>
                            <label htmlFor="circonscription" className="block text-sm font-medium text-gray-700">
                                Circonscription
                            </label>
                            <select
                                id="circonscription"
                                name="circonscription"
                                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-brand-500 focus:border-brand-500 sm:text-sm rounded-md"
                                value={localCirconscription?.id_cir || ''}
                                onChange={handleCirconscriptionChange}
                                disabled={!localRegion || loading.circonscriptions}
                            >
                                <option value="">Choisir une circonscription</option>
                                {circonscriptions.map((circ) => (
                                    <option key={circ.id_cir} value={circ.id_cir}>
                                        {circ.circonscription}
                                    </option>
                                ))}
                            </select>
                            {loading.circonscriptions && <p className="text-xs text-brand-500 mt-1">Chargement...</p>}
                        </div>
                    </div>

                    <div className="mt-5 sm:mt-6">
                        <button
                            type="button"
                            disabled={forced && !isComplete}
                            className={`inline-flex justify-center w-full rounded-md border border-transparent shadow-sm px-4 py-2 text-base font-medium text-white sm:text-sm ${forced && !isComplete
                                ? 'bg-gray-400 cursor-not-allowed'
                                : 'bg-brand-600 hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500'
                                }`}
                            onClick={handleSave}
                        >
                            {forced ? 'Enregistrer et Continuer' : 'Fermer et Enregistrer'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SettingsModal;
