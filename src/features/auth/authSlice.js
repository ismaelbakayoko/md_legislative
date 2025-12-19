import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Simulation d'une API de login
const loginAPI = async (credentials) => {
    await new Promise(resolve => setTimeout(resolve, 800)); // Latence réseau fictive
    if (credentials.email === 'admin@gmail.com' && credentials.password === 'admin123') {
        return {
            token: 'fake-jwt-token-123456',
            user: {
                id: 1,
                name: 'Administrateur',
                email: 'admin@gmail.com',
                role: 'ADMIN'
            }
        };
    }
    throw new Error('Identifiants invalides');
};

export const loginUser = createAsyncThunk(
    'auth/login',
    async (credentials, { rejectWithValue }) => {
        try {
            const response = await loginAPI(credentials);
            return response;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

const authSlice = createSlice({
    name: 'auth',
    initialState: {
        user: null,
        token: localStorage.getItem('token') || null,
        loading: false,
        error: null,
        isAuthenticated: !!localStorage.getItem('token'),
    },
    reducers: {
        logout: (state) => {
            state.user = null;
            state.token = null;
            state.isAuthenticated = false;
            localStorage.removeItem('token');
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(loginUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(loginUser.fulfilled, (state, action) => {
                state.loading = false;
                state.isAuthenticated = true;
                state.user = action.payload.user;
                state.token = action.payload.token;
                localStorage.setItem('token', action.payload.token);
            })
            .addCase(loginUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

export const { logout } = authSlice.actions;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectAuthUser = (state) => state.auth.user;
export const selectAuthLoading = (state) => state.auth.loading;

export default authSlice.reducer;
