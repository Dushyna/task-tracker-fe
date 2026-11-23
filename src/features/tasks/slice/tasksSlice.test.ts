import { configureStore } from "@reduxjs/toolkit";
import { AxiosError, AxiosHeaders } from "axios";
import { beforeEach, describe, expect, it, vi } from "vitest";
import i18n from "i18next";
import * as api from "../services/api";
import { mapTaskFromApi } from "../mapper/mapper";
import type { Task } from "../types";
import {
    addComment,
    clearTaskError,
    createTask,
    deleteComment,
    deleteTask,
    deleteTaskAttachment,
    getComments,
    getTasksByProjectId,
    removeMarkerFromAllTasks,
    selectComments,
    selectCreateTaskErrorMessage,
    selectFilteredTasks,
    selectIsLoading,
    selectSearchQuery,
    selectSelectedMarkerId,
    setSearchQuery,
    setSelectedMarkerId,
    setTaskError,
    tasksSlice,
    updateComment,
    updateTask,
    uploadTaskAttachment,
} from "./tasksSlice";

vi.mock("../services/api", () => ({
    fetchTasksByProjectId: vi.fn(),
    fetchCreateTask: vi.fn(),
    fetchUpdateTask: vi.fn(),
    fetchDeleteTask: vi.fn(),
    uploadAttachment: vi.fn(),
    deleteAttachment: vi.fn(),
    fetchComments: vi.fn(),
    fetchAddComment: vi.fn(),
    fetchDeleteComment: vi.fn(),
    fetchUpdateComment: vi.fn(),
}));

vi.mock("../mapper/mapper", () => ({
    mapTaskFromApi: vi.fn((raw: Task) => raw),
}));

vi.mock("i18next", () => ({
    default: {
        t: vi.fn((key: string) => key),
    },
}));

const createTestStore = () =>
    configureStore({
        reducer: {
            tasks: tasksSlice.reducer,
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

const baseTask1: Task = {
    id: "task-1",
    taskNumber: 101,
    title: "Setup Vitest",
    description: "Configure unit tests",
    statusId: "st-todo",
    executors: [{ id: "u-1", firstName: "Max" }],
    markers: [{ id: "m-1", name: "Frontend", color: "#00f" }],
    attachments: [],
    checklist: [],
} as unknown as Task;

const baseTask2: Task = {
    id: "task-2",
    taskNumber: 202,
    title: "Fix backend CORS",
    description: "Allow production domain",
    statusId: "st-done",
    executors: [],
    markers: [{ id: "m-2", name: "Backend", color: "#f00" }],
    attachments: [],
    checklist: [],
} as unknown as Task;

describe("tasksSlice", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.spyOn(console, "log").mockImplementation(() => {});
        vi.spyOn(console, "error").mockImplementation(() => {});
    });

    it("returns initial state and selectors work properly", () => {
        const store = createTestStore();
        const state = store.getState();

        expect(state.tasks.tasks).toEqual([]);
        expect(selectComments(state)).toEqual([]);
        expect(selectIsLoading(state)).toBe(false);
        expect(selectSearchQuery(state)).toBe("");
        expect(selectSelectedMarkerId(state)).toBeNull();
        expect(selectFilteredTasks(state)).toEqual([]);
    });

    describe("getTasksByProjectId & createTask thunks", () => {
        it("loads and maps tasks on getTasksByProjectId fulfilled", async () => {
            vi.mocked(api.fetchTasksByProjectId).mockResolvedValueOnce([
                baseTask1 as never,
                baseTask2 as never,
            ]);
            const store = createTestStore();

            await store.dispatch(getTasksByProjectId("proj-1"));

            expect(mapTaskFromApi).toHaveBeenCalledTimes(2);
            expect(store.getState().tasks.tasks).toHaveLength(2);
        });

        it("appends created task on createTask fulfilled and sets localized error on rejected", async () => {
            vi.mocked(api.fetchCreateTask).mockResolvedValueOnce(baseTask1 as never);
            const store = createTestStore();

            await store.dispatch(createTask({ title: "Setup Vitest" } as never));
            expect(store.getState().tasks.tasks).toHaveLength(1);

            const err = createAxiosError(400, "Title must not be blank");
            vi.mocked(api.fetchCreateTask).mockRejectedValueOnce(err);

            await store.dispatch(createTask({ title: "" } as never));
            expect(i18n.t).toHaveBeenCalledWith("errors.titleBlank");
            expect(selectCreateTaskErrorMessage(store.getState())).toBe("errors.titleBlank");
        });
    });

    describe("updateTask optimistic updates & rollback", () => {
        it("applies optimistic update immediately on pending and replaces with server response on fulfilled", async () => {
            vi.mocked(api.fetchTasksByProjectId).mockResolvedValueOnce([baseTask1 as never]);
            let resolveRequest!: (value: unknown) => void;
            vi.mocked(api.fetchUpdateTask).mockImplementationOnce(
                () =>
                    new Promise((resolve) => {
                        resolveRequest = resolve;
                    })
            );

            const store = createTestStore();
            await store.dispatch(getTasksByProjectId("proj-1"));

            const promise = store.dispatch(
                updateTask({ id: "task-1", dto: { statusId: "st-done", title: "Optimistic Title" } })
            );

            const pendingTask = store.getState().tasks.tasks.find((t) => t.id === "task-1");
            expect(pendingTask?.statusId).toBe("st-done");
            expect(pendingTask?.title).toBe("Optimistic Title");

            resolveRequest({ ...baseTask1, statusId: "st-done", title: "Server Title" });
            await promise;

            const fulfilledTask = store.getState().tasks.tasks.find((t) => t.id === "task-1");
            expect(fulfilledTask?.title).toBe("Server Title");
            expect(store.getState().tasks.inFlightTaskUpdates).toEqual({});
            expect(store.getState().tasks.taskSnapshots).toEqual({});
        });

        it("rolls back to snapshot when single updateTask request rejects", async () => {
            vi.mocked(api.fetchTasksByProjectId).mockResolvedValueOnce([baseTask1 as never]);
            const err = createAxiosError(400, "Deadline cannot be in the past!");
            vi.mocked(api.fetchUpdateTask).mockRejectedValueOnce(err);

            const store = createTestStore();
            await store.dispatch(getTasksByProjectId("proj-1"));

            await store.dispatch(
                updateTask({ id: "task-1", dto: { title: "Will Be Rolled Back" } })
            );

            const rolledBackTask = store.getState().tasks.tasks.find((t) => t.id === "task-1");
            expect(rolledBackTask?.title).toBe("Setup Vitest");
            expect(selectCreateTaskErrorMessage(store.getState())).toBe("errors.deadlineInPast");
            expect(store.getState().tasks.inFlightTaskUpdates).toEqual({});
        });
    });
    describe("deleteTask & attachments thunks", () => {
        it("removes task on deleteTask fulfilled", async () => {
            vi.mocked(api.fetchTasksByProjectId).mockResolvedValueOnce([
                baseTask1 as never,
                baseTask2 as never,
            ]);
            vi.mocked(api.fetchDeleteTask).mockResolvedValueOnce(undefined as never);

            const store = createTestStore();
            await store.dispatch(getTasksByProjectId("proj-1"));
            await store.dispatch(deleteTask("task-1"));

            expect(store.getState().tasks.tasks.map((t) => t.id)).toEqual(["task-2"]);
        });

        it("adds and removes task attachment", async () => {
            vi.mocked(api.fetchTasksByProjectId).mockResolvedValueOnce([baseTask1 as never]);
            const attachment = { id: "att-1", fileName: "spec.pdf" };
            vi.mocked(api.uploadAttachment).mockResolvedValueOnce(attachment as never);
            vi.mocked(api.deleteAttachment).mockResolvedValueOnce(undefined as never);

            const store = createTestStore();
            await store.dispatch(getTasksByProjectId("proj-1"));

            const file = new File(["hello"], "spec.pdf", { type: "application/pdf" });
            await store.dispatch(uploadTaskAttachment({ taskId: "task-1", file }));

            const taskWithAtt = store.getState().tasks.tasks.find((t) => t.id === "task-1");
            expect(taskWithAtt?.attachments).toEqual([attachment]);

            await store.dispatch(deleteTaskAttachment({ taskId: "task-1", attachmentId: "att-1" }));
            const taskWithoutAtt = store.getState().tasks.tasks.find((t) => t.id === "task-1");
            expect(taskWithoutAtt?.attachments).toEqual([]);
        });
    });

    describe("comments thunks", () => {
        it("fetches, adds (to top), updates, and deletes comments", async () => {
            const c1 = { id: "c-1", text: "First comment" };
            const c2 = { id: "c-2", text: "New top comment" };
            const c2Updated = { id: "c-2", text: "Edited comment" };

            vi.mocked(api.fetchComments).mockResolvedValueOnce([c1 as never]);
            vi.mocked(api.fetchAddComment).mockResolvedValueOnce(c2 as never);
            vi.mocked(api.fetchUpdateComment).mockResolvedValueOnce(c2Updated as never);
            vi.mocked(api.fetchDeleteComment).mockResolvedValueOnce(undefined as never);

            const store = createTestStore();
            await store.dispatch(getComments("task-1"));
            expect(selectComments(store.getState())).toEqual([c1]);

            await store.dispatch(addComment({ taskId: "task-1", text: "New top comment" }));
            expect(selectComments(store.getState()).map((c) => c.id)).toEqual(["c-2", "c-1"]);

            await store.dispatch(
                updateComment({ taskId: "task-1", commentId: "c-2", text: "Edited comment" })
            );
            expect(selectComments(store.getState()).find((c) => c.id === "c-2")?.text).toBe(
                "Edited comment"
            );

            await store.dispatch(deleteComment({ taskId: "task-1", commentId: "c-1" }));
            expect(selectComments(store.getState()).map((c) => c.id)).toEqual(["c-2"]);
        });

        it("sets localized error when updateComment fails with forbidden message", async () => {
            const err = createAxiosError(403, "You can only edit your own comments");
            vi.mocked(api.fetchUpdateComment).mockRejectedValueOnce(err);
            const store = createTestStore();

            await store.dispatch(
                updateComment({ taskId: "task-1", commentId: "c-1", text: "Hack" })
            );

            expect(i18n.t).toHaveBeenCalledWith("errors.ownCommentsOnly");
            expect(selectCreateTaskErrorMessage(store.getState())).toBe("errors.ownCommentsOnly");
        });
    });

    describe("synchronous reducers & selectFilteredTasks", () => {
        it("sets and clears task error", () => {
            const store = createTestStore();
            store.dispatch(setTaskError("Custom error"));
            expect(selectCreateTaskErrorMessage(store.getState())).toBe("Custom error");

            store.dispatch(clearTaskError());
            expect(selectCreateTaskErrorMessage(store.getState())).toBe("");
        });

        it("filters tasks by title, #taskNumber, and selectedMarkerId", async () => {
            vi.mocked(api.fetchTasksByProjectId).mockResolvedValueOnce([
                baseTask1 as never,
                baseTask2 as never,
            ]);
            const store = createTestStore();
            await store.dispatch(getTasksByProjectId("proj-1"));

            store.dispatch(setSearchQuery("vitest"));
            expect(selectFilteredTasks(store.getState()).map((t) => t.id)).toEqual(["task-1"]);

            store.dispatch(setSearchQuery("#202"));
            expect(selectFilteredTasks(store.getState()).map((t) => t.id)).toEqual(["task-2"]);

            store.dispatch(setSearchQuery(""));
            store.dispatch(setSelectedMarkerId("m-1"));
            expect(selectFilteredTasks(store.getState()).map((t) => t.id)).toEqual(["task-1"]);
        });

        it("removes deleted marker from all tasks via removeMarkerFromAllTasks", async () => {
            vi.mocked(api.fetchTasksByProjectId).mockResolvedValueOnce([
                baseTask1 as never,
                baseTask2 as never,
            ]);
            const store = createTestStore();
            await store.dispatch(getTasksByProjectId("proj-1"));

            store.dispatch(removeMarkerFromAllTasks("m-1"));
            const task1 = store.getState().tasks.tasks.find((t) => t.id === "task-1");
            expect(task1?.markers).toEqual([]);
        });
    });
});
