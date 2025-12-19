import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { fetchActiveElectionAPI } from './electionsAPI';

export const fetchActiveElection = createAsyncThunk(
    'elections/fetchActiveElection',
    async (_, { rejectWithValue }) => {
        try {
            const response = await fetchActiveElectionAPI();
            return response;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

const electionsSlice = createSlice({
    name: 'elections',
    initialState: {
        activeElection: null,
        loading: false,
        error: null,
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchActiveElection.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchActiveElection.fulfilled, (state, action) => {
                state.loading = false;
                state.activeElection = action.payload;
            })
            .addCase(fetchActiveElection.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

export default electionsSlice.reducer;
