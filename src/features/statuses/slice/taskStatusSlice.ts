import {createAppSlice} from "../../../app/createAppSlice";
import type {CreateTaskStatusDto, TaskStatus, TaskStatusSliceState, UpdateTaskStatusDto} from "../types";
import * as api from "../services/api";
import {createSelector} from '@reduxjs/toolkit';
import type {RootState} from '../../../app/store';
import {mapTaskStatusFromApi} from "../mapper/mapper.ts";
import {throwLocalizedAxiosError} from "../../../utils/apiErrorHandler";

const initialState: TaskStatusSliceState = {
    taskStatuses: [],
    isLoading: false,
    errorMessage: "",
};

export const taskStatusSlice = createAppSlice({
    name: "taskStatuses",
    initialState,
    reducers: (create) => ({
        getAllTaskStatuses: create.asyncThunk(
            async (id: string) => {
                try {
                    return await api.fetchTaskStatuses(id);
                } catch (err) {
                    return throwLocalizedAxiosError(err, "errors.fetchTaskStatuses");
                }
            },
            {
                pending: (state) => {
                    state.isLoading = true;
                },
                fulfilled: (state, action) => {
                    state.isLoading = false;
                    state.taskStatuses = action.payload.map(mapTaskStatusFromApi);
                },
                rejected: (state, action) => {
                    state.isLoading = false;
                    state.taskStatuses = [];
                    console.log(action.error.message);
                },
            }
        ),

        createTaskStatus: create.asyncThunk(
            async (dto: CreateTaskStatusDto) => {
                try {
                    return await api.fetchCreateTaskStatus(dto);
                } catch (err) {
                    return throwLocalizedAxiosError(err, "errors.internalServer");
                }
            },
            {
                pending: (state) => {
                    state.isLoading = true;
                    state.errorMessage = "";
                },
                fulfilled: (state, action) => {
                    state.isLoading = false;
                    state.taskStatuses.push(mapTaskStatusFromApi(action.payload));
                    state.errorMessage = "";
                },
                rejected: (state, action) => {
                    state.isLoading = false;
                    state.errorMessage = action.error.message ?? "";
                },
            }
        ),


        updateTaskStatus: create.asyncThunk(
            async (dto: UpdateTaskStatusDto) => {
                try {
                    return await api.fetchUpdateTaskStatus(dto);
                } catch (err) {
                    return throwLocalizedAxiosError(err, "errors.internalServer");
                }
            }, {
                fulfilled: (state, action) => {
                    const updated = mapTaskStatusFromApi(action.payload);

                    const index = state.taskStatuses.findIndex(
                        (s) => s.id === updated.id
                    );

                    if (index !== -1) {
                        state.taskStatuses[index] = updated;
                    }
                    state.errorMessage = "";
                },
                rejected: (state, action) => {
                    state.isLoading = false;
                    state.errorMessage = action.error.message ?? "";
                    console.error(action.error);
                },
            }
        ),

        deleteTaskStatus: create.asyncThunk(
            async (id: string) => {
                try {
                    await api.fetchDeleteTaskStatus(id);
                    return id;
                } catch (err) {
                    return throwLocalizedAxiosError(err, "errors.deleteTaskStatus");
                }
            },
            {
                pending: (state) => {
                    state.isLoading = true;
                },
                fulfilled: (state, action) => {
                    state.isLoading = false;
                    state.taskStatuses = state.taskStatuses.filter(s => s.id !== action.payload);
                    state.errorMessage = "";
                },
                rejected: (state, action) => {
                    state.isLoading = false;
                    state.errorMessage = action.error.message ?? "";
                }
            }
        ),

        updateTaskStatusesOrder: create.asyncThunk(
            async (newOrder: TaskStatus[]) => {
                try {
                    return await api.fetchUpdateTaskStatusesOrder(newOrder);
                } catch (err) {
                    return throwLocalizedAxiosError(err, "errors.updateTaskStatusesOrder");
                }
            },
            {
                fulfilled: (state, action) => {
                    state.taskStatuses = action.payload.map(mapTaskStatusFromApi);
                },
                rejected: (_state, action) => {
                    console.error(action.error.message);
                }
            }
        ),

        clearStatusError: create.reducer((state) => {
            state.errorMessage = "";
        }),

    }),

    // You can define your selectors here. These selectors receive the slice
    // state as their first argument.
    selectors: {
        selectTaskStatuses: (state) => state.taskStatuses,
        selectIsLoading: (state) => state.isLoading,
        selectErrorMessage: (state) =>
            state.errorMessage,
    },
});

export const selectSortedTaskStatuses = createSelector(
    (state: RootState) => state.taskStatuses.taskStatuses, // <- доступ к массиву внутри slice
    (taskStatuses) => [...taskStatuses].sort((a, b) => a.position - b.position)
);

export const {
    getAllTaskStatuses,
    createTaskStatus,
    updateTaskStatus,
    deleteTaskStatus,
    clearStatusError,
    updateTaskStatusesOrder
} = taskStatusSlice.actions;

export const {
    selectIsLoading,
    selectErrorMessage,
} = taskStatusSlice.selectors;
