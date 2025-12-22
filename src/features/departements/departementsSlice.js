import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { fetchDepartementsAPI, fetchLieuxVoteAPI } from './departementsAPI';

export const fetchDepartements = createAsyncThunk(
    'departements/fetchDepartements',
    async (_, { rejectWithValue }) => {
        try {
            const response = await fetchDepartementsAPI();
            return response;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const fetchLieuxVote = createAsyncThunk(
    'departements/fetchLieuxVote',
    async (nomDepartement, { rejectWithValue }) => {
        try {
            const response = await fetchLieuxVoteAPI(nomDepartement);
            return response.dataMap;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

const departementsSlice = createSlice({
    name: 'departements',
    initialState: {
        list: [],
        lieuxVote: [],
        loading: false,
        loadingLieux: false,
        error: null,
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            // Departements List
            .addCase(fetchDepartements.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchDepartements.fulfilled, (state, action) => {
                state.loading = false;
                state.list = action.payload;
            })
            .addCase(fetchDepartements.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Lieux de Vote
            .addCase(fetchLieuxVote.pending, (state) => {
                state.loadingLieux = true;
            })
            .addCase(fetchLieuxVote.fulfilled, (state, action) => {
                state.loadingLieux = false;
                state.lieuxVote = action.payload;
            })
            .addCase(fetchLieuxVote.rejected, (state, action) => {
                state.loadingLieux = false;
                // We might want to handle error specifically or share the global error
                console.error("Failed to fetch lieux de vote", action.payload);
            });
    },
});

export default departementsSlice.reducer;
