import {createAppSlice} from "../../../app/createAppSlice";
import type {AuthSliceState, Credentials, UserRegistrationDto, UserResponseDto} from "../types";
import * as api from "../services/api";
import {isAxiosError} from "axios";
import type {PayloadAction} from "@reduxjs/toolkit";
import i18n from "i18next";

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
                return api.fetchLogin(credentials).catch((err) => {
                    if (isAxiosError(err)) {
                        throw new Error(
                            err.response?.data?.message || i18n.t("errors.internalServer")
                        );
                    }
                    throw err;
                });
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
                    if (isAxiosError(err)) {
                        if (err.response?.status === 409) {
                            throw new Error(i18n.t("errors.emailAlreadyRegistered"));
                        }
                        throw new Error(err.response?.data?.message || i18n.t("errors.registrationFailed"));
                    }
                    throw err;
                }
                // The value we return becomes the `fulfilled` action payload
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
    // You can define your selectors here. These selectors receive the slice
    // state as their first argument.
    selectors: {
        selectIsAuthenticated: (state) => state.isAuthenticated,
        selectIsInitialized: (state) => state.isInitialized,
        selectUser: (state) => state.user,
        selectRole: (state) => state.user?.role,
        selectLoginError: (state) => state?.loginErrorMessage,
        selectRegisterError: (state) => state?.registerErrorMessage,
    },
});

// // Action creators are generated for each case reducer function.
export const {login, register, checkAuth, setUser, logout} = authSlice.actions;

// Selectors returned by `slice.selectors` take the root state as their first argument.
export const {
    selectIsAuthenticated,
    selectIsInitialized,
    selectUser,
    selectRole,
    selectLoginError,
    selectRegisterError,
} = authSlice.selectors;
