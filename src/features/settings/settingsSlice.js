import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { fetchRegionsAPI, fetchDepartementsByRegionAPI, fetchCirconscriptionsByRegionAPI } from './settingsAPI';

// Thunks
export const fetchRegions = createAsyncThunk(
    'settings/fetchRegions',
    async (_, { rejectWithValue }) => {
        try {
            return await fetchRegionsAPI();
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const fetchDepartementsByRegion = createAsyncThunk(
    'settings/fetchDepartementsByRegion',
    async (codeRegion, { rejectWithValue }) => {
        try {
            return await fetchDepartementsByRegionAPI(codeRegion);
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const fetchCirconscriptionsByRegion = createAsyncThunk(
    'settings/fetchCirconscriptionsByRegion',
    async (idRegion, { rejectWithValue }) => {
        try {
            return await fetchCirconscriptionsByRegionAPI(idRegion);
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const fetchElections = createAsyncThunk(
    'settings/fetchElections',
    async (_, { rejectWithValue }) => {
        try {
            return await fetchElectionsAPI();
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

// Initial State load from localStorage
const loadFromStorage = (key) => {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : null;
};

const settingsSlice = createSlice({
    name: 'settings',
    initialState: {
        elections: [],
        regions: [],
        departements: [],
        circonscriptions: [],
        selectedRegion: loadFromStorage('selectedRegion'),
        selectedDepartement: loadFromStorage('selectedDepartement'),
        selectedCirconscription: loadFromStorage('selectedCirconscription'),
        loading: {
            regions: false,
            departements: false,
            circonscriptions: false,
            elections: false
        },
        error: null
    },
    // ... reducers ...
    extraReducers: (builder) => {
        builder
            // Elections
            .addCase(fetchElections.pending, (state) => {
                state.loading.elections = true;
            })
            .addCase(fetchElections.fulfilled, (state, action) => {
                state.loading.elections = false;
                state.elections = action.payload;
            })
            .addCase(fetchElections.rejected, (state, action) => {
                state.loading.elections = false;
                state.error = action.payload;
            })
            // Regions
            .addCase(fetchRegions.pending, (state) => {
                state.loading.regions = true;
            })
            .addCase(fetchRegions.fulfilled, (state, action) => {
                state.loading.regions = false;
                state.regions = action.payload;
            })
            .addCase(fetchRegions.rejected, (state, action) => {
                state.loading.regions = false;
                state.error = action.payload;
            })
            // Departements
            .addCase(fetchDepartementsByRegion.pending, (state) => {
                state.loading.departements = true;
            })
            .addCase(fetchDepartementsByRegion.fulfilled, (state, action) => {
                state.loading.departements = false;
                state.departements = action.payload;
            })
            .addCase(fetchDepartementsByRegion.rejected, (state, action) => {
                state.loading.departements = false;
                state.error = action.payload;
            })
            // Circonscriptions
            .addCase(fetchCirconscriptionsByRegion.pending, (state) => {
                state.loading.circonscriptions = true;
            })
            .addCase(fetchCirconscriptionsByRegion.fulfilled, (state, action) => {
                state.loading.circonscriptions = false;
                state.circonscriptions = action.payload;
            })
            .addCase(fetchCirconscriptionsByRegion.rejected, (state, action) => {
                state.loading.circonscriptions = false;
                state.error = action.payload;
            });
    }
});

export const { setSelectedRegion, setSelectedDepartement, setSelectedCirconscription } = settingsSlice.actions;
export default settingsSlice.reducer;
