import { configureStore, combineReducers } from '@reduxjs/toolkit';
import departementsReducer from '../features/departements/departementsSlice';
import electionsReducer from '../features/elections/electionsSlice';
import resultatsReducer from '../features/resultats/resultatsSlice';
import authReducer from '../features/auth/authSlice';
import settingsReducer from '../features/settings/settingsSlice';
import candidatsReducer from '../features/candidats/candidatsSlice';

const appReducer = combineReducers({
    departements: departementsReducer,
    elections: electionsReducer,
    resultats: resultatsReducer,
    auth: authReducer,
    settings: settingsReducer,
    candidats: candidatsReducer,
});

const rootReducer = (state, action) => {
    // Si l'action est logout, on passe undefined à l'appReducer
    // ce qui force tous les reducers à retourner leur état initial.
    if (action.type === 'auth/logout') {
        state = undefined;
    }
    return appReducer(state, action);
};

export const store = configureStore({
    reducer: rootReducer,
});
