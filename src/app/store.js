import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { persistStore, persistReducer, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import departementsReducer from '../features/departements/departementsSlice';
import electionsReducer from '../features/elections/electionsSlice';
import resultatsReducer from '../features/resultats/resultatsSlice';
import authReducer from '../features/auth/authSlice';
import settingsReducer from '../features/settings/settingsSlice';
import candidatsReducer from '../features/candidats/candidatsSlice';

const persistConfig = {
    key: 'root',
    version: 1,
    storage,
    whitelist: ['auth', 'settings', 'candidats', 'departements', 'resultats'], // Persist these slices
};

const appReducer = combineReducers({
    departements: departementsReducer,
    elections: electionsReducer,
    resultats: resultatsReducer,
    auth: authReducer,
    settings: settingsReducer,
    candidats: candidatsReducer,
});

const rootReducer = (state, action) => {
    if (action.type === 'auth/logout') {
        // Clear storage on logout
        storage.removeItem('persist:root');
        state = undefined;
    }
    return appReducer(state, action);
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
    reducer: persistedReducer,
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            immutableCheck: { warnAfter: 128 },
            serializableCheck: {
                warnAfter: 128,
                ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
            },
        }),
});

export const persistor = persistStore(store);
