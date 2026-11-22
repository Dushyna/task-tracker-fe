import {createAppSlice} from "../../../app/createAppSlice";
import type {AuthSliceState, Credentials, UserRegistrationDto, UserResponseDto} from "../types";
import * as api from "../services/api";
import type {PayloadAction} from "@reduxjs/toolkit";
import {throwLocalizedAxiosError} from "../../../utils/apiErrorHandler";

const initialState: AuthSliceState = {
    isAuthenticated: false,
    isInitialized: false,
    user: undefined,
    loginErrorMessage: undefined,
    registerErrorMessage: undefined,
};

export const authSlice = createAppSlice({
    name: "auth",
    initialState,
    reducers: (create) => ({
        login: create.asyncThunk(
            async (credentials: Credentials) => {
                try {
                    return await api.fetchLogin(credentials);
                } catch (err) {
                    return throwLocalizedAxiosError(err, "errors.internalServer");
                }
            },
            {
                pending: (state) => {
                    state.isAuthenticated = false;
                    state.loginErrorMessage = undefined;
                },
                fulfilled: (state) => {
                    state.isAuthenticated = true;
                    state.loginErrorMessage = undefined;
                },
                rejected: (state, action) => {
                    state.isAuthenticated = false;
                    state.user = undefined;
                    console.log(action.error);
                    state.loginErrorMessage = action.error.message;
                },
            }
        ),

        logout: create.asyncThunk(
            async () => {
                return api.fetchLogout();
            },
            {
                fulfilled: (state) => {
                    state.isAuthenticated = false;
                    state.user = undefined;
                },
                rejected: (state) => {
                    state.isAuthenticated = false;
                    state.user = undefined;
                },
            }
        ),

        register: create.asyncThunk(
            async (dto: UserRegistrationDto) => {
                try {
                    return await api.fetchRegister(dto);
                } catch (err) {
                    return throwLocalizedAxiosError(err, "errors.registrationFailed");
                }
            },
            {
                pending: (state) => {
                    state.isAuthenticated = false;
                    state.registerErrorMessage = undefined;
                },
                fulfilled: (state) => {
                    state.isAuthenticated = false;
                    state.user = undefined;
                    state.registerErrorMessage = undefined;
                },
                rejected: (state, action) => {
                    state.isAuthenticated = false;
                    state.user = undefined;
                    state.registerErrorMessage = action.error.message;
                },
            }
        ),

        checkAuth: create.asyncThunk(
            async () => {
                return api.fetchCurrentUser();
            },
            {
                fulfilled: (state, action) => {
                    state.isAuthenticated = true;
                    state.user = action.payload;
                    state.isInitialized = true;
                },
                rejected: (state, action) => {
                    state.isAuthenticated = false;
                    state.user = undefined;
                    state.isInitialized = true;
                    console.log("CheckAuth failed!", action.error.message);
                },
            }
        ),

        setUser: create.reducer((state, action: PayloadAction<UserResponseDto | undefined>) => {
            state.user = action.payload;
        })

    }),
    selectors: {
        selectIsAuthenticated: (state) => state.isAuthenticated,
        selectIsInitialized: (state) => state.isInitialized,
        selectUser: (state) => state.user,
        selectLoginError: (state) => state?.loginErrorMessage,
        selectRegisterError: (state) => state?.registerErrorMessage,
    },
});

export const {login, register, checkAuth, setUser, logout} = authSlice.actions;

export const {
    selectIsAuthenticated,
    selectIsInitialized,
    selectUser,
    selectLoginError,
    selectRegisterError,
} = authSlice.selectors;
