import type { UpdateUserPayloadDto, UserSliceState, UserDetailedDto } from "../types";
import * as api from "../services/api";
import { createAppSlice } from "../../../app/createAppSlice.ts";
import { isAxiosError } from "axios";
import { isPending, isRejected, type PayloadAction } from "@reduxjs/toolkit";
import i18n from "i18next";

const initialState: UserSliceState = {
    data: null,
    loading: false,
    error: undefined,
};

export const getAvatarUpdateError = () => i18n.t("errors.updateAvatar");

const throwLocalizedAxiosError = (err: unknown, fallbackKey: string): never => {
    if (isAxiosError(err)) {
        throw new Error(err.response?.data?.message || i18n.t(fallbackKey));
    }
    throw err;
};

export const userSlice = createAppSlice({
    name: "user",
    initialState,
    reducers: (create) => ({
        getUserDetails: create.asyncThunk(
            async () => {
                try {
                    return await api.fetchUserDetails();
                } catch (err) {
                    return throwLocalizedAxiosError(err, "errors.fetchUserDetails");
                }
            },
            {
                fulfilled: (state, action) => {
                    state.data = action.payload;
                    state.loading = false;
                },
            }
        ),

        updateUserDetails: create.asyncThunk(
            async (payload: UpdateUserPayloadDto) => {
                try {
                    return await api.fetchUpdateUserDetails(payload);
                } catch (err) {
                    return throwLocalizedAxiosError(err, "errors.updateUserDetails");
                }
            },
            {
                fulfilled: (state, action) => {
                    state.data = action.payload;
                    state.loading = false;
                },
            }
        ),

        updateUserAvatar: create.asyncThunk(
            async (formData: FormData, { rejectWithValue }) => {
                try {
                    return await api.fetchUpdateUserAvatar(formData);
                } catch (err) {
                    if (isAxiosError(err)) {
                        return rejectWithValue(err.response?.data?.message || getAvatarUpdateError());
                    }
                    return rejectWithValue(getAvatarUpdateError());
                }
            },
            {
                fulfilled: (state, action) => {
                    state.data = action.payload;
                    state.loading = false;
                },
                rejected: (state, action) => {
                    state.loading = false;
                    state.error = (action.payload as string) || getAvatarUpdateError();
                },
            }
        ),

        setUserDetails: create.reducer((state, action: PayloadAction<UserDetailedDto | undefined>) => {
            state.data = action.payload ? { ...action.payload } : null;
        }),
    }),
    extraReducers: (builder) => {
        builder
            .addMatcher(isPending(getUserDetails, updateUserDetails, updateUserAvatar), (state) => {
                state.loading = true;
                state.error = undefined;
            })
            .addMatcher(isRejected(getUserDetails, updateUserDetails), (state, action) => {
                state.loading = false;
                state.error = action.error.message;
            });
    },
    selectors: {
        selectUserData: (state) => state.data,
    },
});

export const {
    getUserDetails,
    setUserDetails,
    updateUserDetails,
    updateUserAvatar,
} = userSlice.actions;

export const { selectUserData } = userSlice.selectors;
