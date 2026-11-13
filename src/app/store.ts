import {combineSlices, configureStore} from "@reduxjs/toolkit";
import {authSlice} from "../features/auth/slice/authSlice";
import {projectsSlice} from "../features/projects/slice/projectsSlice";
import {tasksSlice} from "../features/tasks/slice/tasksSlice.ts";
import {taskStatusSlice} from "../features/statuses/slice/taskStatusSlice.ts";
import {userSlice} from "../features/user/slice/userSlice.ts";
// `combineSlices` automatically combines the reducers using
// their `reducerPath`s, therefore we no longer need to call `combineReducers`.
export const rootReducer = combineSlices(authSlice, userSlice, projectsSlice, tasksSlice, taskStatusSlice);
// Infer the `RootState` type from the root reducer
export type RootState = ReturnType<typeof rootReducer>;

// The store setup is wrapped in `makeStore` to allow reuse
// when setting up tests that need the same store config
export const makeStore = (preloadedState?: Partial<RootState>) => {
    return configureStore({
        reducer: rootReducer,

        preloadedState,
        middleware: (getDefaultMiddleware) =>
            getDefaultMiddleware({
                serializableCheck: false,
                immutableCheck: false,
            }),
    });

};

export const store = makeStore();

// Infer the type of `store`
export type AppStore = typeof store;
// Infer the `AppDispatch` type from the store itself
export type AppDispatch = AppStore["dispatch"];

