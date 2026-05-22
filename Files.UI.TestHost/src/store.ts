import { configureStore } from '@reduxjs/toolkit';
import createSagaMiddleware from 'redux-saga';
import { filesReducer, fileActionWatcherSaga } from '@erikhermansson79/files.ui';

const sagaMiddleware = createSagaMiddleware();

export const store = configureStore({
    reducer: {
        fileActions: filesReducer,
        // Add other reducers here if needed
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware().concat(sagaMiddleware),
});

sagaMiddleware.run(fileActionWatcherSaga);