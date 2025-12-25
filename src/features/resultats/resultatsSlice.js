import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { fetchResultatsDepartementAPI, fetchResultatsCandidatAPI } from './resultatsAPI';
import { addGlobalResultsAPI, addDetailedResultsAPI } from '../results/resultsAPI';
import { fetchTotauxCirconscriptionAPI, listResultatsGroupesAPI, fetchLieuxVoteByDepartementAPI, fetchResultatsLocalesCentresAPI } from './totauxAPI';

export const fetchResultatsByDepartement = createAsyncThunk(
    'resultats/fetchByDepartement',
    async (arg, { rejectWithValue }) => {
        const departementId = typeof arg === 'object' ? arg.id : arg;
        try {
            const response = await fetchResultatsDepartementAPI(departementId);
            return response;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const fetchResultatsByCandidat = createAsyncThunk(
    'resultats/fetchByCandidat',
    async (candidatId, { rejectWithValue }) => {
        try {
            const response = await fetchResultatsCandidatAPI(candidatId);
            return response;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const fetchTotauxCirconscription = createAsyncThunk(
    'resultats/fetchTotaux',
    async (data, { rejectWithValue }) => {

        try {
            const response = await fetchTotauxCirconscriptionAPI(data);
            return response;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const listResultatsGroupes = createAsyncThunk(
    'resultats/listGroupes',
    async (data, { rejectWithValue }) => {
        console.log("data d'envoie :", data)
        try {
            const response = await listResultatsGroupesAPI(data);
            return response;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const addGlobalResults = createAsyncThunk(
    'resultats/addGlobal',
    async (data, { rejectWithValue }) => {
        try {
            const response = await addGlobalResultsAPI(data);
            return response;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const addDetailedResults = createAsyncThunk(
    'resultats/addDetailed',
    async (data, { rejectWithValue }) => {
        console.log("data d'envoie addDetailedResults :", data)
        try {
            const response = await addDetailedResultsAPI(data);
            return response;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const fetchResultatsLocalesCentres = createAsyncThunk(
    'resultats/fetchLocalesCentres',
    async (data, { rejectWithValue }) => {
        try {
            const response = await fetchResultatsLocalesCentresAPI(data);
            return response;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const getLieuxVoteByDepartement = createAsyncThunk(
    'resultats/getLieuxVoteByDepartement',
    async (arg, { rejectWithValue }) => {
        const nom_departement = typeof arg === 'object' ? arg.nom_departement : arg;
        console.log("Fetching lieux vote by departement: " + nom_departement);
        try {
            const response = await fetchLieuxVoteByDepartementAPI(nom_departement);
            return response;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

const resultatsSlice = createSlice({
    name: 'resultats',
    initialState: {
        currentDepartement: null,
        currentDepartementId: null,
        currentCandidat: null,
        currentBvResultats: null,
        lieuxVoteByDepartement: [],
        resultsByCandidate: {},
        loadingLieuxVote: false,
        totaux_globaux: {
            pop_elect: 0,
            pers_astreint: 0,
            nbre_votants: 0,
            bulletins_nuls: 0,
            bulletins_blancs: 0,
            bulletins_exprimes: 0
        },
        totaux_par_parti: [],
        resultats_centre: [],
        resultats_locales: [],
        loadingLocalesCentres: false,
        loading: false,
        error: null,
        addSuccess: false // Track success state
    },
    reducers: {
        clearCurrentResultats: (state) => {
            state.currentDepartement = null;
            state.currentDepartementId = null;
            state.currentCandidat = null;
            state.error = null;
        },
        resetAddSuccess: (state) => {
            state.addSuccess = false;
        },
        clearResultatsError: (state) => {
            state.error = null;
        },
        clearCurrentBvResultats: (state) => {
            state.currentBvResultats = null;
        },
        clearAllData: (state) => {
            state.currentDepartement = null;
            state.currentDepartementId = null;
            state.currentCandidat = null;
            state.currentBvResultats = null;
            state.lieuxVoteByDepartement = [];
            state.resultsByCandidate = {};
            state.totaux_par_parti = [];
            state.resultats_centre = [];
            state.resultats_locales = [];
            state.totaux_globaux = {
                pop_elect: 0,
                pers_astreint: 0,
                nbre_votants: 0,
                bulletins_nuls: 0,
                bulletins_blancs: 0,
                bulletins_exprimes: 0
            };
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
            // Departement
            .addCase(fetchResultatsByDepartement.pending, (state, action) => {
                if (!action.meta.arg?.isSilent) {
                    state.loading = true;
                }
                state.error = null;
            })
            .addCase(fetchResultatsByDepartement.fulfilled, (state, action) => {
                state.loading = false;
                state.currentDepartement = action.payload;
                // Store the ID used for fetching
                state.currentDepartementId = action.meta.arg?.id || action.meta.arg;
            })
            .addCase(fetchResultatsByDepartement.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Candidat
            .addCase(fetchResultatsByCandidat.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchResultatsByCandidat.fulfilled, (state, action) => {
                state.loading = false;
                state.currentCandidat = action.payload;
            })
            .addCase(fetchResultatsByCandidat.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Add Global Results
            .addCase(addGlobalResults.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.addSuccess = false;
            })
            .addCase(addGlobalResults.fulfilled, (state) => {
                state.loading = false;
                state.addSuccess = true;
            })
            .addCase(addGlobalResults.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
                state.addSuccess = false;
            })
            // Add Detailed Results
            .addCase(addDetailedResults.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.addSuccess = false;
            })
            .addCase(addDetailedResults.fulfilled, (state) => {
                state.loading = false;
                state.addSuccess = true;
            })
            .addCase(addDetailedResults.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
                state.addSuccess = false;
            })
            // Fetch Totaux Circonscription
            .addCase(fetchTotauxCirconscription.pending, (state, action) => {
                if (!action.meta.arg?.isSilent) {
                    state.loading = true;
                }
                state.error = null;
            })
            .addCase(fetchTotauxCirconscription.fulfilled, (state, action) => {
                state.loading = false;
                // Update totaux_globaux with data from API
                if (action.payload.totaux_globaux && action.payload.totaux_globaux.length > 0) {
                    state.totaux_globaux = action.payload.totaux_globaux[0];
                }
                // Update totaux_par_parti
                if (action.payload.totaux_par_parti) {
                    state.totaux_par_parti = action.payload.totaux_par_parti;
                }
            })
            .addCase(fetchTotauxCirconscription.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // List Resultats Groupes
            .addCase(listResultatsGroupes.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(listResultatsGroupes.fulfilled, (state, action) => {
                state.loading = false;
                // Assuming it returns an array, we take the first item if exists or the whole data
                // User example shows "resultats": [ { ... } ]
                state.currentBvResultats = action.payload && action.payload.length > 0 ? action.payload[0] : null;
            })
            .addCase(listResultatsGroupes.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Get Lieux Vote by Departement
            .addCase(getLieuxVoteByDepartement.pending, (state, action) => {
                if (typeof action.meta.arg === 'object' && action.meta.arg?.isSilent) {
                    // Don't set loadingLieuxVote
                } else {
                    state.loadingLieuxVote = true;
                }
                state.error = null;
            })
            .addCase(getLieuxVoteByDepartement.fulfilled, (state, action) => {
                state.loadingLieuxVote = false;
                state.lieuxVoteByDepartement = action.payload;

                // Process results by candidate for detail view
                const candidateResultsMap = {};
                action.payload.forEach(local => {
                    if (local.lieux_vote) {
                        local.lieux_vote.forEach(lieu => {
                            if (lieu.bureaux_vote) {
                                lieu.bureaux_vote.forEach(bv => {
                                    // Get BV totals from resultats_groupes
                                    let totalExprimes = 0;
                                    if (bv.resultats_groupes && bv.resultats_groupes.length > 0) {
                                        totalExprimes = bv.resultats_groupes[0].bulletins_exprimes || 0;
                                    }

                                    // Process resultats_bv
                                    if (bv.resultats_bv) {
                                        bv.resultats_bv.forEach(result => {
                                            if (result.id_parti) {
                                                if (!candidateResultsMap[String(result.id_parti)]) {
                                                    candidateResultsMap[String(result.id_parti)] = {
                                                        id_parti: result.id_parti,
                                                        total_voix: 0,
                                                        bureaux: []
                                                    };
                                                }

                                                candidateResultsMap[String(result.id_parti)].total_voix += result.voix_obtenues || 0;
                                                candidateResultsMap[String(result.id_parti)].bureaux.push({
                                                    nom_lieu: lieu.nom_lieu,
                                                    num_bv: bv.num_bv,
                                                    nom_local: local.nom_local,
                                                    nom_departement: local.nom_departement || action.meta.arg, // Fallback to arg
                                                    voix: result.voix_obtenues,
                                                    total_votes_bv: totalExprimes,
                                                    pourcentage: totalExprimes > 0
                                                        ? ((result.voix_obtenues / totalExprimes) * 100).toFixed(2)
                                                        : "0.00"
                                                });
                                            }
                                        });
                                    }
                                });
                            }
                        });
                    }
                });
                state.resultsByCandidate = candidateResultsMap;
            })
            .addCase(getLieuxVoteByDepartement.rejected, (state, action) => {
                state.loadingLieuxVote = false;
                state.error = action.payload;
            })
            // Fetch Resultats Locales Centres
            .addCase(fetchResultatsLocalesCentres.pending, (state) => {
                state.loadingLocalesCentres = true;
                state.error = null;
            })
            .addCase(fetchResultatsLocalesCentres.fulfilled, (state, action) => {
                state.loadingLocalesCentres = false;
                state.resultats_centre = action.payload.resultats_centre || [];
                state.resultats_locales = action.payload.resultats_locales || [];
            })
            .addCase(fetchResultatsLocalesCentres.rejected, (state, action) => {
                state.loadingLocalesCentres = false;
                state.error = action.payload;
            });
    },
});

export const { clearCurrentResultats, resetAddSuccess, clearResultatsError, clearCurrentBvResultats, clearAllData } = resultatsSlice.actions;
export default resultatsSlice.reducer;
