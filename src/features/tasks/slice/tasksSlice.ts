import {createAppSlice} from "../../../app/createAppSlice";
import type {
    CreateTaskDto,
    InFlightTaskUpdate,
    Task,
    TaskDto,
    TasksSliceState,
    UpdateTaskDto,
    UpdateTaskPayload
} from "../types";
import * as api from "../services/api";
import {isAxiosError, type AxiosError} from "axios";
import {mapTaskFromApi} from "../mapper/mapper.ts";
import {current, isDraft, type PayloadAction} from "@reduxjs/toolkit";

const initialState: TasksSliceState = {
    tasks: [],
    taskSnapshots: {},
    inFlightTaskUpdates: {},
    comments: [],
    isLoading: false,
    searchQuery: "",
    selectedMarkerId: null as string | null,
};

function cloneTask(task: Task): Task {
    const plain = isDraft(task) ? current(task) : task;
    return structuredClone(plain);
}

function applyOptimisticUpdate(task: Task, dto: UpdateTaskDto): void {
    if (dto.statusId) task.statusId = dto.statusId;
    if (dto.title !== undefined) task.title = dto.title;
    if (dto.description !== undefined) task.description = dto.description;
    if (dto.dueDate !== undefined) task.dueDate = dto.dueDate;
    if (dto.executorIds) {
        task.executors = task.executors.filter(ex => dto.executorIds?.includes(ex.id));
    }
    if (dto.markerIds) {
        task.markers = task.markers.filter(m => dto.markerIds?.includes(m.id));
    }
    if (dto.checklist) task.checklist = structuredClone(dto.checklist);
}

function rebaseInFlightUpdates(
    base: Task,
    updates: InFlightTaskUpdate[],
    snapshots: Record<string, Task>,
): Task {
    let cursor = cloneTask(base);
    for (const update of updates) {
        snapshots[update.requestId] = cloneTask(cursor);
        const next = cloneTask(cursor);
        applyOptimisticUpdate(next, update.dto);
        cursor = next;
    }
    return cursor;
}

export const tasksSlice = createAppSlice({
        name: "tasks",
        initialState,
        reducers: (create) => ({
            getTasksByProjectId: create.asyncThunk(
                async (id: string) => {
                    return api
                        .fetchTasksByProjectId(id)
                        .catch((err: AxiosError<{ message: string }>) => {
                            throw new Error(err.response?.data?.message);
                        });
                },
                {
                    pending: (state) => {
                        state.isLoading = true;
                    },
                    fulfilled: (state, action) => {
                        state.isLoading = false;
                        state.tasks = (action.payload as TaskDto[]).map(mapTaskFromApi);
                    },
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
                        throw err;
                    });
                    // The value we return becomes the `fulfilled` action payload
                },
                {
                    pending: (state) => {
                        state.isLoading = true;
                        state.createTaskErrorMessage = "";
                    },
                    fulfilled: (state, action) => {
                        state.isLoading = false;
                        state.tasks.push(mapTaskFromApi(action.payload));
                        state.createTaskErrorMessage = "";
                    },
                    rejected: (state, action) => {
                        state.isLoading = false;
                        state.createTaskErrorMessage = action.error.message;
                    },
                }
            ),


            updateTask: create.asyncThunk(
                async ({id, dto}: UpdateTaskPayload) => {
                    return api.fetchUpdateTask(id, dto).catch((err) => {
                        if (isAxiosError(err)) {
                            throw new Error(
                                err.response?.data?.message || "Internal Server Error"
                            );
                        }
                        throw err;
                    });
                    // The value we return becomes the `fulfilled` action payload
                },
                {
                    pending: (state, action) => {
                        state.isLoading = true;
                        const {id, dto} = action.meta.arg;
                        const requestId = action.meta.requestId;

                        const task = state.tasks.find((t) => t.id === id);
                        if (!task) return;

                        state.taskSnapshots[requestId] = cloneTask(task);
                        const queue = state.inFlightTaskUpdates[id] ?? [];
                        queue.push({requestId, dto});
                        state.inFlightTaskUpdates[id] = queue;
                        applyOptimisticUpdate(task, dto);
                    },
                    fulfilled: (state, action) => {
                        state.isLoading = false;
                        const {id} = action.meta.arg;
                        const requestId = action.meta.requestId;
                        delete state.taskSnapshots[requestId];

                        const remaining = (state.inFlightTaskUpdates[id] ?? [])
                            .filter((update) => update.requestId !== requestId);
                        const updatedTask = mapTaskFromApi(action.payload);
                        const index = state.tasks.findIndex((t) => t.id === updatedTask.id);

                        if (remaining.length === 0 || index === -1) {
                            for (const update of remaining) {
                                delete state.taskSnapshots[update.requestId];
                            }
                            delete state.inFlightTaskUpdates[id];
                            if (index !== -1) {
                                state.tasks[index] = updatedTask;
                            }
                        } else {
                            state.inFlightTaskUpdates[id] = remaining;
                            state.tasks[index] = rebaseInFlightUpdates(
                                updatedTask,
                                remaining,
                                state.taskSnapshots,
                            );
                        }

                        state.createTaskErrorMessage = "";
                    },
                    rejected: (state, action) => {
                        state.isLoading = false;
                        const {id} = action.meta.arg;
                        const requestId = action.meta.requestId;
                        const queue = state.inFlightTaskUpdates[id] ?? [];
                        const failedIndex = queue.findIndex((update) => update.requestId === requestId);
                        const snapshot = state.taskSnapshots[requestId];

                        delete state.taskSnapshots[requestId];

                        const taskIndex = state.tasks.findIndex((t) => t.id === id);

                        if (snapshot && failedIndex !== -1) {
                            const earlier = queue.slice(0, failedIndex);
                            const later = queue.slice(failedIndex + 1);

                            if (taskIndex !== -1) {
                                state.tasks[taskIndex] = later.length === 0
                                    ? cloneTask(snapshot)
                                    : rebaseInFlightUpdates(snapshot, later, state.taskSnapshots);
                            } else {
                                for (const update of later) {
                                    delete state.taskSnapshots[update.requestId];
                                }
                            }

                            const stillInFlight = [...earlier, ...later];
                            if (stillInFlight.length === 0 || taskIndex === -1) {
                                delete state.inFlightTaskUpdates[id];
                            } else {
                                state.inFlightTaskUpdates[id] = stillInFlight;
                            }
                        } else {
                            const remaining = queue.filter((update) => update.requestId !== requestId);
                            if (remaining.length === 0 || taskIndex === -1) {
                                for (const update of remaining) {
                                    delete state.taskSnapshots[update.requestId];
                                }
                                delete state.inFlightTaskUpdates[id];
                            } else {
                                state.inFlightTaskUpdates[id] = remaining;
                            }
                        }

                        state.createTaskErrorMessage = action.error.message;
                    },
                }
            ),

            deleteTask: create.asyncThunk(
                async (id: string) => {
                    await api.fetchDeleteTask(id);
                    return id;
                },
                {
                    pending: (state) => {
                        state.isLoading = true;
                    },
                    fulfilled: (state, action) => {
                        state.isLoading = false;
                        state.tasks = state.tasks.filter(t => t.id !== action.payload);
                    },
                    rejected: (state) => {
                        state.isLoading = false;
                    }
                }
            ),

            uploadTaskAttachment: create.asyncThunk(
                async ({taskId, file}: { taskId: string; file: File }) => {
                    return await api.uploadAttachment(taskId, file);
                },
                {
                    pending: (state) => {
                        state.isLoading = true;
                    },
                    fulfilled: (state, action) => {
                        state.isLoading = false;
                        const newAttachment = action.payload;
                        const taskId = action.meta.arg.taskId;

                        const task = state.tasks.find(t => t.id === taskId);
                        if (task) {
                            if (!task.attachments) task.attachments = [];
                            task.attachments.push(newAttachment);
                        }

                    },
                    rejected: (state, action) => {
                        state.isLoading = false;
                        state.createTaskErrorMessage = action.error.message || "Failed to upload file";
                    },
                }
            ),

            deleteTaskAttachment: create.asyncThunk(
                async ({taskId, attachmentId}: { taskId: string; attachmentId: string }) => {
                    await api.deleteAttachment(taskId, attachmentId);
                    return {taskId, attachmentId};
                },
                {
                    fulfilled: (state, action) => {
                        const {taskId, attachmentId} = action.payload;
                        const task = state.tasks.find(t => t.id === taskId);
                        if (task) {
                            task.attachments = task.attachments.filter(a => a.id !== attachmentId);
                        }

                    },
                    rejected: (state) => {
                        state.createTaskErrorMessage = "Failed to delete attachment";
                    }
                }
            ),

            getComments: create.asyncThunk(
                async (taskId: string) => {
                    return api.fetchComments(taskId).catch((err) => {
                        if (isAxiosError(err)) {
                            throw new Error(err.response?.data?.message || "Failed to fetch comments");
                        }
                        throw err;
                    });
                },
                {
                    pending: (state) => {
                        state.comments = [];
                    },
                    fulfilled: (state, action) => {
                        state.comments = action.payload;
                    },
                    rejected: (_state, action) => {
                        console.error("Comments error:", action.error.message);
                    }
                }
            ),

            addComment: create.asyncThunk(
                async ({taskId, text}: { taskId: string, text: string }) => {
                    return api.fetchAddComment(taskId, text).catch((err) => {
                        if (isAxiosError(err)) {
                            throw new Error(err.response?.data?.message || "Failed to add comment");
                        }
                        throw err;
                    });
                },
                {
                    fulfilled: (state, action) => {
                        state.comments.unshift(action.payload);
                    },
                    rejected: (_state, action) => {
                        console.error("Add comment error:", action.error.message);
                    }
                }
            ),

            deleteComment: create.asyncThunk(
                async ({taskId, commentId}: { taskId: string, commentId: string }) => {
                    try {
                        await api.fetchDeleteComment(taskId, commentId);
                        return commentId;
                    } catch (err) {
                        if (isAxiosError(err)) {
                            throw new Error(err.response?.data?.message || "Failed to delete");
                        }
                        throw err;
                    }
                },
                {
                    pending: (state) => {
                        state.isLoading = true;
                    },
                    fulfilled: (state, action) => {
                        state.isLoading = false;
                        state.comments = state.comments.filter(c => c.id !== action.payload);
                    },
                    rejected: (state, action) => {
                        state.isLoading = false;
                        state.createTaskErrorMessage = action.error.message;
                    }
                }
            ),

            updateComment: create.asyncThunk(
                async ({taskId, commentId, text}: { taskId: string, commentId: string, text: string }) => {
                    try {
                        return await api.fetchUpdateComment(taskId, commentId, text);
                    } catch (err) {
                        if (isAxiosError(err)) {
                            throw new Error(err.response?.data?.message || "Forbidden");
                        }
                        throw err;
                    }
                },
                {
                    pending: (state) => {
                        state.isLoading = true;
                        state.createTaskErrorMessage = "";
                    },
                    fulfilled: (state, action) => {
                        state.isLoading = false;
                        const index = state.comments.findIndex(c => c.id === action.payload.id);
                        if (index !== -1) {
                            state.comments[index] = action.payload;
                        }
                    },
                    rejected: (state, action) => {
                        state.isLoading = false;
                        state.createTaskErrorMessage = action.error.message;
                    }
                }
            ),


            setTaskError: create.reducer((state, action: PayloadAction<string>) => {
                state.createTaskErrorMessage = action.payload;
            }),
            clearTaskError: create.reducer((state) => {
                state.createTaskErrorMessage = "";
            }),

            setSearchQuery: create.reducer((state, action: PayloadAction<string>) => {
                state.searchQuery = action.payload;
            }),

            setSelectedMarkerId: create.reducer((state, action: PayloadAction<string | null>) => {
                state.selectedMarkerId = action.payload;
            }),

            removeMarkerFromAllTasks: create.reducer(
                (state, action: PayloadAction<string>) => {
                    const markerId = action.payload;

                    state.tasks = state.tasks.map(task => ({
                        ...task,
                        markers: task.markers?.filter(m => m.id !== markerId) || []
                    }));

                }
            ),


        }),


        // You can define your selectors here. These selectors receive the slice
        // state as their first argument.
        selectors: {
            selectSearchQuery: (state) => state.searchQuery,
            selectFilteredTasks: (state) => {
                const query = state.searchQuery.toLowerCase().trim();
                const markerId = state.selectedMarkerId;

                return state.tasks.filter(task => {
                    const matchesText = !query ||
                        task.title.toLowerCase().includes(query) ||
                        `#${task.taskNumber}`.includes(query);

                    const matchesMarker = !markerId ||
                        task.markers?.some(m => m.id === markerId);

                    return matchesText && matchesMarker;
                });
            },
            selectSelectedMarkerId: (state) => state.selectedMarkerId,
            selectComments: (state) => state.comments,
            selectIsLoading: (state) => state.isLoading,
            selectCreateTaskErrorMessage: (state) => state.createTaskErrorMessage,
        },
    }
);

// // Action creators are generated for each case reducer function.
export const {
    createTask,
    setSearchQuery,
    setSelectedMarkerId,
    removeMarkerFromAllTasks,
    getTasksByProjectId,
    updateTask,
    deleteTask,
    clearTaskError,
    setTaskError,
    uploadTaskAttachment,
    deleteTaskAttachment,
    getComments,
    addComment,
    deleteComment,
    updateComment
}
    = tasksSlice.actions;

// Selectors returned by `slice.selectors` take the root state as their first argument.
export const {
    selectSearchQuery,
    selectFilteredTasks,
    selectSelectedMarkerId,
    selectComments,
    selectIsLoading,
    selectCreateTaskErrorMessage,
} = tasksSlice.selectors;
