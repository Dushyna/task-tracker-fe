import type {UpdateUserPayloadDto, UserSliceState, UserDetailedDto} from "../types";
import * as api from "../services/api";
import {createAppSlice} from "../../../app/createAppSlice.ts";
import {isPending, isRejected, type PayloadAction} from "@reduxjs/toolkit";
import i18n from "i18next";
import {getLocalizedApiError, throwLocalizedAxiosError} from "../../../utils/apiErrorHandler";

const initialState: UserSliceState = {
    data: null,
    loading: false,
    error: undefined,
};

export const getAvatarUpdateError = () => i18n.t("errors.updateAvatar");

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
            async (formData: FormData, {rejectWithValue}) => {
                try {
                    return await api.fetchUpdateUserAvatar(formData);
                } catch (err) {
                    return rejectWithValue(getLocalizedApiError(err, "errors.updateAvatar"));
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
            state.data = action.payload ? {...action.payload} : null;
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

export const {selectUserData} = userSlice.selectors;
