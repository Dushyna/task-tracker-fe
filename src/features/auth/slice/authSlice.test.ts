import { configureStore } from "@reduxjs/toolkit";
import { AxiosError, AxiosHeaders } from "axios";
import { beforeEach, describe, expect, it, vi } from "vitest";
import i18n from "i18next";
import * as api from "../services/api";
import type { UserResponseDto } from "../types";
import {
    authSlice,
    checkAuth,
    login,
    logout,
    register,
    selectIsAuthenticated,
    selectIsInitialized,
    selectLoginError,
    selectRegisterError,
    selectUser,
    setUser,
} from "./authSlice";

vi.mock("../services/api", () => ({
    fetchLogin: vi.fn(),
    fetchLogout: vi.fn(),
    fetchRegister: vi.fn(),
    fetchCurrentUser: vi.fn(),
}));

vi.mock("i18next", () => ({
    default: {
        t: vi.fn((key: string) => key),
    },
}));

const createTestStore = () =>
    configureStore({
        reducer: {
            auth: authSlice.reducer,
        },
    });

const createAxiosError = (status: number, message: string): AxiosError => {
    const headers = new AxiosHeaders();
    return new AxiosError(
        "Request failed",
        "ERR_BAD_REQUEST",
        { headers },
        {},
        {
            status,
            statusText: "Error",
            headers,
            config: { headers },
            data: { message },
        }
    );
};

const mockUser: UserResponseDto = {
    id: "user-1",
    email: "user@example.com",
    firstName: "Max",
    lastName: "Mustermann",
} as UserResponseDto;

describe("authSlice", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.spyOn(console, "log").mockImplementation(() => {});
    });

    it("returns initial state and selectors work properly", () => {
        const store = createTestStore();
        const state = store.getState();

        expect(selectIsAuthenticated(state)).toBe(false);
        expect(selectIsInitialized(state)).toBe(false);
        expect(selectUser(state)).toBeUndefined();
        expect(selectLoginError(state)).toBeUndefined();
        expect(selectRegisterError(state)).toBeUndefined();
    });

    it("handles setUser synchronous reducer", () => {
        const store = createTestStore();

        store.dispatch(setUser(mockUser));
        expect(selectUser(store.getState())).toEqual(mockUser);

        store.dispatch(setUser(undefined));
        expect(selectUser(store.getState())).toBeUndefined();
    });

    describe("login thunk", () => {
        it("sets isAuthenticated to true and clears loginErrorMessage on fulfilled", async () => {
            vi.mocked(api.fetchLogin).mockResolvedValueOnce(undefined as never);
            const store = createTestStore();

            await store.dispatch(login({ email: "user@example.com", password: "secret" }));

            const state = store.getState();
            expect(selectIsAuthenticated(state)).toBe(true);
            expect(selectLoginError(state)).toBeUndefined();
        });

        it("sets localized loginErrorMessage on rejected AxiosError", async () => {
            const err = createAxiosError(401, "Invalid username or password.");
            vi.mocked(api.fetchLogin).mockRejectedValueOnce(err);
            const store = createTestStore();

            await store.dispatch(login({ email: "user@example.com", password: "wrong" }));

            const state = store.getState();
            expect(i18n.t).toHaveBeenCalledWith("errors.invalidCredentials");
            expect(selectIsAuthenticated(state)).toBe(false);
            expect(selectUser(state)).toBeUndefined();
            expect(selectLoginError(state)).toBe("errors.invalidCredentials");
        });
    });

    describe("logout thunk", () => {
        it("resets isAuthenticated and user on fulfilled", async () => {
            vi.mocked(api.fetchLogin).mockResolvedValueOnce(undefined as never);
            vi.mocked(api.fetchLogout).mockResolvedValueOnce(undefined as never);
            const store = createTestStore();

            await store.dispatch(login({ email: "user@example.com", password: "secret" }));
            store.dispatch(setUser(mockUser));
            expect(selectIsAuthenticated(store.getState())).toBe(true);

            await store.dispatch(logout());

            const state = store.getState();
            expect(selectIsAuthenticated(state)).toBe(false);
            expect(selectUser(state)).toBeUndefined();
        });

        it("still resets isAuthenticated and user even if logout API fails", async () => {
            vi.mocked(api.fetchLogout).mockRejectedValueOnce(new Error("Network error"));
            const store = createTestStore();
            store.dispatch(setUser(mockUser));

            await store.dispatch(logout());

            const state = store.getState();
            expect(selectIsAuthenticated(state)).toBe(false);
            expect(selectUser(state)).toBeUndefined();
        });
    });

    describe("register thunk", () => {
        it("keeps isAuthenticated false and clears registerErrorMessage on fulfilled", async () => {
            vi.mocked(api.fetchRegister).mockResolvedValueOnce(undefined as never);
            const store = createTestStore();

            await store.dispatch(
                register({
                    email: "new@example.com",
                    password: "Password123!",
                    firstName: "Anna",
                    lastName: "Schmidt",
                } as never)
            );

            const state = store.getState();
            expect(selectIsAuthenticated(state)).toBe(false);
            expect(selectUser(state)).toBeUndefined();
            expect(selectRegisterError(state)).toBeUndefined();
        });

        it("sets localized registerErrorMessage on rejected AxiosError", async () => {
            const err = createAxiosError(409, "User already exists");
            vi.mocked(api.fetchRegister).mockRejectedValueOnce(err);
            const store = createTestStore();

            await store.dispatch(
                register({
                    email: "existing@example.com",
                    password: "Password123!",
                } as never)
            );

            const state = store.getState();
            expect(i18n.t).toHaveBeenCalledWith("errors.emailAlreadyRegistered");
            expect(selectIsAuthenticated(state)).toBe(false);
            expect(selectRegisterError(state)).toBe("errors.emailAlreadyRegistered");
        });
    });

    describe("checkAuth thunk", () => {
        it("sets user, isAuthenticated and isInitialized to true on fulfilled", async () => {
            vi.mocked(api.fetchCurrentUser).mockResolvedValueOnce(mockUser);
            const store = createTestStore();

            await store.dispatch(checkAuth());

            const state = store.getState();
            expect(selectIsAuthenticated(state)).toBe(true);
            expect(selectIsInitialized(state)).toBe(true);
            expect(selectUser(state)).toEqual(mockUser);
        });

        it("sets isInitialized to true and clears user on rejected", async () => {
            vi.mocked(api.fetchCurrentUser).mockRejectedValueOnce(new Error("Unauthorized"));
            const store = createTestStore();

            await store.dispatch(checkAuth());

            const state = store.getState();
            expect(selectIsAuthenticated(state)).toBe(false);
            expect(selectIsInitialized(state)).toBe(true);
            expect(selectUser(state)).toBeUndefined();
        });
    });
});
