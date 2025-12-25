import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { fetchCandidatesInfoAPI } from './candidatsAPI';

export const fetchCandidatesInfo = createAsyncThunk(
    'candidats/fetchInfo',
    async (data, { rejectWithValue }) => {
        try {
            return await fetchCandidatesInfoAPI(data);
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

const candidatsSlice = createSlice({
    name: 'candidats',
    initialState: {
        partis: [],
        total: 0,
        loading: false,
        error: null
    },
    reducers: {
        clearCandidates: (state) => {
            state.partis = [];
            state.total = 0;
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchCandidatesInfo.pending, (state, action) => {
                if (!action.meta.arg?.isSilent) {
                    state.loading = true;
                }
                state.error = null;
            })
            .addCase(fetchCandidatesInfo.fulfilled, (state, action) => {
                state.loading = false;
                state.partis = action.payload.partis;
                state.total = action.payload.total;
            })
            .addCase(fetchCandidatesInfo.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    }
});

export const { clearCandidates } = candidatsSlice.actions;
export default candidatsSlice.reducer;
