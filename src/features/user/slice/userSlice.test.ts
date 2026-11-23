import { configureStore } from "@reduxjs/toolkit";
import { AxiosError, AxiosHeaders } from "axios";
import { beforeEach, describe, expect, it, vi } from "vitest";
import i18n from "i18next";
import * as api from "../services/api";
import type { UserDetailedDto } from "../types";
import {
    getAvatarUpdateError,
    getUserDetails,
    selectUserData,
    setUserDetails,
    updateUserAvatar,
    updateUserDetails,
    userSlice,
} from "./userSlice";

vi.mock("../services/api", () => ({
    fetchUserDetails: vi.fn(),
    fetchUpdateUserDetails: vi.fn(),
    fetchUpdateUserAvatar: vi.fn(),
}));

vi.mock("i18next", () => ({
    default: {
        t: vi.fn((key: string) => key),
    },
}));

const createTestStore = () =>
    configureStore({
        reducer: {
            user: userSlice.reducer,
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

const mockUserDetails: UserDetailedDto = {
    id: "u-1",
    email: "max@example.de",
    firstName: "Max",
    lastName: "Mustermann",
    avatarUrl: "https://example.de",
} as unknown as UserDetailedDto;

describe("userSlice", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("returns initial state and selectUserData works properly", () => {
        const store = createTestStore();
        const state = store.getState();

        expect(selectUserData(state)).toBeNull();
        expect(state.user.loading).toBe(false);
        expect(state.user.error).toBeUndefined();
    });

    it("handles setUserDetails synchronous reducer (copying object or setting null)", () => {
        const store = createTestStore();

        store.dispatch(setUserDetails(mockUserDetails));
        expect(selectUserData(store.getState())).toEqual(mockUserDetails);
        expect(selectUserData(store.getState())).not.toBe(mockUserDetails);

        store.dispatch(setUserDetails(undefined));
        expect(selectUserData(store.getState())).toBeNull();
    });

    it("getAvatarUpdateError returns translated fallback key", () => {
        expect(getAvatarUpdateError()).toBe("errors.updateAvatar");
        expect(i18n.t).toHaveBeenCalledWith("errors.updateAvatar");
    });

    describe("getUserDetails thunk", () => {
        it("stores user details and resets loading on fulfilled", async () => {
            vi.mocked(api.fetchUserDetails).mockResolvedValueOnce(mockUserDetails);
            const store = createTestStore();

            await store.dispatch(getUserDetails());

            const state = store.getState();
            expect(selectUserData(state)).toEqual(mockUserDetails);
            expect(state.user.loading).toBe(false);
            expect(state.user.error).toBeUndefined();
        });

        it("sets localized error via matcher on rejected AxiosError", async () => {
            const err = createAxiosError(404, "User not found");
            vi.mocked(api.fetchUserDetails).mockRejectedValueOnce(err);
            const store = createTestStore();

            await store.dispatch(getUserDetails());

            const state = store.getState();
            expect(i18n.t).toHaveBeenCalledWith("errors.userNotFoundGeneric");
            expect(state.user.loading).toBe(false);
            expect(state.user.error).toBe("errors.userNotFoundGeneric");
        });
    });

    describe("updateUserDetails thunk", () => {
        it("updates user data on fulfilled", async () => {
            const updated: UserDetailedDto = { ...mockUserDetails, firstName: "Moritz" };
            vi.mocked(api.fetchUpdateUserDetails).mockResolvedValueOnce(updated);
            const store = createTestStore();

            await store.dispatch(updateUserDetails({ firstName: "Moritz" } as never));

            const state = store.getState();
            expect(selectUserData(state)?.firstName).toBe("Moritz");
            expect(state.user.loading).toBe(false);
        });

        it("sets localized error via matcher on rejected AxiosError", async () => {
            const err = createAxiosError(400, "Validation failed for one or more fields");
            vi.mocked(api.fetchUpdateUserDetails).mockRejectedValueOnce(err);
            const store = createTestStore();

            await store.dispatch(updateUserDetails({ firstName: "" } as never));

            const state = store.getState();
            expect(i18n.t).toHaveBeenCalledWith("errors.validationFailed");
            expect(state.user.loading).toBe(false);
            expect(state.user.error).toBe("errors.validationFailed");
        });
    });

    describe("updateUserAvatar thunk", () => {
        it("updates user data with new avatar on fulfilled", async () => {
            const updated: UserDetailedDto = {
                ...mockUserDetails,
                avatarUrl: "https://example.de",
            };
            vi.mocked(api.fetchUpdateUserAvatar).mockResolvedValueOnce(updated);
            const store = createTestStore();

            const formData = new FormData();
            await store.dispatch(updateUserAvatar(formData));

            const state = store.getState();
            expect(selectUserData(state)?.avatarUrl).toBe("https://example.de");
            expect(state.user.loading).toBe(false);
            expect(state.user.error).toBeUndefined();
        });

        it("sets localized error via rejectWithValue on rejected AxiosError", async () => {
            const err = createAxiosError(
                400,
                "Invalid avatar file: must be PNG or JPEG and <= 5MB"
            );
            vi.mocked(api.fetchUpdateUserAvatar).mockRejectedValueOnce(err);
            const store = createTestStore();

            const formData = new FormData();
            await store.dispatch(updateUserAvatar(formData));

            const state = store.getState();
            expect(i18n.t).toHaveBeenCalledWith("errors.invalidAvatarFile");
            expect(state.user.loading).toBe(false);
            expect(state.user.error).toBe("errors.invalidAvatarFile");
        });
    });
});
