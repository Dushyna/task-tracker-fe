import {createAppSlice} from "../../../app/createAppSlice";
import type {CreateTaskDto, TaskDto, TasksSliceState, UpdateTaskPayload} from "../types";
import * as api from "../services/api";
import {isAxiosError, type AxiosError} from "axios";
import {mapTaskFromApi} from "../mapper/mapper.ts";

const initialState: TasksSliceState = {
    tasks: [],
    currentTask: null,
    isLoading: false,
};

export const tasksSlice = createAppSlice({
        name: "tasks",
        initialState,
        reducers: (create) => ({
            getTasksByProjectId: create.asyncThunk(
                async (id: string) => {
                    return api
                        .fetchTasksByProjectId(id)
                        .catch((err: AxiosError<{ message: string }>) => {
                            // раскрываем ошибку от аксиоса и получаем сообщение
                            // бросаем новую ошибку, которая поподет в rejected case
                            throw new Error(err.response?.data?.message);
                        });
                },
                {
                    pending: (state) => {
                        state.isLoading = true;
                    },
                    fulfilled: (state, action) => {
                        state.isLoading = false;
                        state.tasks = (action.payload as TaskDto[]).map(mapTaskFromApi);                    },
                    rejected: (state, action) => {
                        state.isLoading = false;
                        state.tasks = [];
                        console.log(action.error);
                    },
                }
            ),


            createTask: create.asyncThunk(
                async (dto: CreateTaskDto) => {
                    return api.fetchCreateTask(dto).catch((err) => {
                        if (isAxiosError(err)) {
                            throw new Error(
                                err.response?.data?.message || "Internal Server Error"
                            );
                        }
                    });
                    // The value we return becomes the `fulfilled` action payload
                },
                {
                    pending: (state) => {
                        // TODO add spinner here
                        state.createTaskErrorMessage = "";
                    },
                    fulfilled: (state, action) => {
                        state.tasks.push(mapTaskFromApi(action.payload));
                        state.createTaskErrorMessage = "";
                    },
                    rejected: (state, action) => {
                        state.createTaskErrorMessage = action.error.message;
                    },
                }
            ),


        updateTask: create.asyncThunk(
            async ({id, dto}:UpdateTaskPayload) => {
                return api.fetchUpdateTask(id, dto).catch((err) => {
                    if (isAxiosError(err)) {
                        throw new Error(
                            err.response?.data?.message || "Internal Server Error"
                        );
                    }
                });
                // The value we return becomes the `fulfilled` action payload
            },
            {
                pending: (state, action) => {
                    const { id, dto } = action.meta.arg;

                    const task = state.tasks.find((t) => t.id === id);
                    if (task && dto.statusId) {
                        task.statusId = dto.statusId;
                    }
                },
                fulfilled: (state, action) => {
                    const updatedTaskDto = action.payload; // TaskDto
                    const updatedTask = mapTaskFromApi(updatedTaskDto); // ✅ Task

                    const index = state.tasks.findIndex(
                        (t) => t.id === updatedTask.id
                    );

                    if (index !== -1) {
                        state.tasks[index] = updatedTask;
                    }

                    state.currentTask = updatedTask;
                    state.createTaskErrorMessage = "";
                },
                rejected: (state, action) => {
                    state.createTaskErrorMessage = action.error.message;
                    state.currentTask = null;
                },
            }
        ),

            deleteTask: create.asyncThunk(
                async (id: string) => {
                    await api.fetchDeleteTask(id);
                    return id;
                },
                {
                    fulfilled: (state, action) => {
                        state.tasks = state.tasks.filter(t => t.id !== action.payload);
                    }
                }
            )


    }),


    // You can define your selectors here. These selectors receive the slice
    // state as their first argument.
    selectors: {
        selectTasks: (state) => state.tasks,
        selectCurrentTask: state => state.currentTask,
        selectIsLoading: (state) => state.isLoading,
        selectCreateTaskErrorMessage: (state) => state.createTaskErrorMessage,
    },
    }
);

// // Action creators are generated for each case reducer function.
export const {createTask, getTasksByProjectId, updateTask, deleteTask} = tasksSlice.actions;

// Selectors returned by `slice.selectors` take the root state as their first argument.
export const {
    selectTasks,
    selectCurrentTask,
    selectIsLoading,
    selectCreateTaskErrorMessage,
} = tasksSlice.selectors;
