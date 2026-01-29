import {createAppSlice} from "../../../app/createAppSlice";
import type {AuthSliceState, Credentials, UserRegistrationDto} from "../types";
import * as api from "../services/api";
import {isAxiosError} from "axios";

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
                            err.response?.data?.message || "Internal Server Error"
                        );
                    }
                    throw err;
                });
            },
            {
                pending: (state) => {
                    state.isAuthenticated = false;
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
                            throw new Error("A user with this email is already registered.");
                        }
                        throw new Error(err.response?.data?.message || "Error during registration");
                    }
                    throw err;
                }
                // The value we return becomes the `fulfilled` action payload
            },
            {
                pending: (state) => {
                    state.isAuthenticated = false;
                },
                fulfilled: (state, action) => {
                    state.isAuthenticated = true;
                    state.user = action.payload;
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
        )
    }),
    // You can define your selectors here. These selectors receive the slice
    // state as their first argument.
    selectors: {
        selectIsAuthenticated: (state) => state.isAuthenticated,
        selectInitialized: (state) => state.isInitialized,
        selectUser: (state) => state.user,
        selectRole: (state) => state.user?.role,
        selectLoginError: (state) => state?.loginErrorMessage,
        selectRegisterError: (state) => state?.registerErrorMessage,
    },
});

// // Action creators are generated for each case reducer function.
export const {login, register, checkAuth, logout} = authSlice.actions;

// Selectors returned by `slice.selectors` take the root state as their first argument.
export const {
    selectIsAuthenticated,
    selectInitialized,
    selectUser,
    selectRole,
    selectLoginError,
    selectRegisterError,
} = authSlice.selectors;