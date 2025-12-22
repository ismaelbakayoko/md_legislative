import { configureStore } from '@reduxjs/toolkit';
import departementsReducer from '../features/departements/departementsSlice';
import electionsReducer from '../features/elections/electionsSlice';
import resultatsReducer from '../features/resultats/resultatsSlice';
import authReducer from '../features/auth/authSlice';
import settingsReducer from '../features/settings/settingsSlice';

export const store = configureStore({
    reducer: {
        departements: departementsReducer,
        elections: electionsReducer,
        resultats: resultatsReducer,
        auth: authReducer,
        settings: settingsReducer,
    },
});
