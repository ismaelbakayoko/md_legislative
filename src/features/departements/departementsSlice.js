import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { fetchDepartementsAPI } from './departementsAPI';

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

const departementsSlice = createSlice({
    name: 'departements',
    initialState: {
        list: [],
        loading: false,
        error: null,
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
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
            });
    },
});

export default departementsSlice.reducer;
