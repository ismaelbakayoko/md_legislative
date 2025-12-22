import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { loginUserAPI, registerUser, verifyTokenAPI } from './authAPI';

export const loginUser = createAsyncThunk(
    'auth/login',
    async (credentials, { rejectWithValue }) => {
        try {
            const response = await loginUserAPI(credentials);
            if (response.success) {
                return response;
            } else {
                return rejectWithValue('Échec de la connexion');
            }
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || error.message);
        }
    }
);

export const register = createAsyncThunk(
    'auth/register',
    async (userData, { rejectWithValue }) => {
        try {
            const response = await registerUser(userData);
            if (response.success) {
                return response;
            } else {
                return rejectWithValue('Échec de l\'inscription');
            }
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || error.message);
        }
    }
);

export const checkAuthStatus = createAsyncThunk(
    'auth/checkStatus',
    async (_, { rejectWithValue }) => {
        const token = localStorage.getItem('token');
        if (!token) return rejectWithValue('No token');

        try {
            const response = await verifyTokenAPI(token);
            if (response.success) {
                return token;
            } else {
                return rejectWithValue('Token invalid');
            }
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

const authSlice = createSlice({
    name: 'auth',
    initialState: {
        user: null, // Note: The login API returns 'contact_user', not full user object sometimes. Adjust based on API response.
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
            // Login
            .addCase(loginUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(loginUser.fulfilled, (state, action) => {
                state.loading = false;
                state.isAuthenticated = true;
                // API response: { success: true, contact_user, token }
                state.user = { contact: action.payload.contact_user };
                state.token = action.payload.token;
                localStorage.setItem('token', action.payload.token);
            })
            .addCase(loginUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Register
            .addCase(register.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(register.fulfilled, (state, action) => {
                state.loading = false;
                // API response: { success: true, message, compteUser }
                // Optionally auto-login or just success
            })
            .addCase(register.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Check Auth Status
            .addCase(checkAuthStatus.fulfilled, (state) => {
                state.isAuthenticated = true;
            })
            .addCase(checkAuthStatus.rejected, (state) => {
                state.isAuthenticated = false;
                state.token = null;
                state.user = null;
                localStorage.removeItem('token');
            });
    },
});

export const { logout } = authSlice.actions;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectAuthUser = (state) => state.auth.user;
export const selectAuthLoading = (state) => state.auth.loading;
export const selectAuthError = (state) => state.auth.error;

export default authSlice.reducer;
