import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { fetchResultatsDepartementAPI, fetchResultatsCandidatAPI } from './resultatsAPI';
import { addGlobalResultsAPI } from '../results/resultsAPI';

export const fetchResultatsByDepartement = createAsyncThunk(
    'resultats/fetchByDepartement',
    async (departementId, { rejectWithValue }) => {
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

const resultatsSlice = createSlice({
    name: 'resultats',
    initialState: {
        currentDepartement: null,
        currentCandidat: null,
        loading: false,
        error: null,
        addSuccess: false // Track success state
    },
    reducers: {
        clearCurrentResultats: (state) => {
            state.currentDepartement = null;
            state.currentCandidat = null;
            state.error = null;
        },
        resetAddSuccess: (state) => {
            state.addSuccess = false;
        }
    },
    extraReducers: (builder) => {
        builder
            // Departement
            .addCase(fetchResultatsByDepartement.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchResultatsByDepartement.fulfilled, (state, action) => {
                state.loading = false;
                state.currentDepartement = action.payload;
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
            });
    },
});

export const { clearCurrentResultats, resetAddSuccess } = resultatsSlice.actions;
export default resultatsSlice.reducer;
