import {createAppSlice} from "../../../app/createAppSlice";
import type {AuthSliceState, Credentials, UserRegistrationDto,} from "../types";
import {
    fetchLogin,
    fetchRegister,
    fetchCurrentUser,
    fetchLogout,
} from "../services/api";
import {isAxiosError} from "axios";

const initialState: AuthSliceState = {
    isAuthenticated: false,
    isInitialized: false,
    user: undefined,
};

export const authSlice = createAppSlice({
    name: "auth",
    initialState,
    reducers: (create) => ({
        login: create.asyncThunk(
            async (credentials: Credentials) => {
                return fetchLogin(credentials).catch((err: unknown) => {
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

        register: create.asyncThunk(
            async (dto: UserRegistrationDto) => {
                return fetchRegister(dto);
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
                rejected: (state) => {
                    state.isAuthenticated = false;
                    state.user = undefined;
                },
            }
        ),

        checkAuth: create.asyncThunk(
            async () => {
                return fetchCurrentUser();},
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
        logout: create.asyncThunk(
            async () => {
                await fetchLogout();
            },
            {
                fulfilled: (state) => {
                    state.isAuthenticated = false;
                    state.user = undefined;
                    state.loginErrorMessage = undefined;
                },
            }
        ),
    }),

    selectors: {
        selectIsAuthenticated: (state) => state.isAuthenticated,
        selectInitialized: (state) => state.isInitialized,
        selectUser: (state) => state.user,
        selectRole: (state) => state.user?.role,
        selectLoginError: (state) => state?.loginErrorMessage,
    },
});

export const {login, register, checkAuth, logout} = authSlice.actions;

export const {
    selectIsAuthenticated,
    selectInitialized,
    selectUser,
    selectLoginError,
} = authSlice.selectors;