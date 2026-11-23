import { configureStore } from "@reduxjs/toolkit";
import { AxiosError, AxiosHeaders } from "axios";
import { beforeEach, describe, expect, it, vi } from "vitest";
import i18n from "i18next";
import * as api from "../services/api";
import { mapTaskStatusFromApi } from "../mapper/mapper";
import type { TaskStatus } from "../types";
import {
    clearStatusError,
    createTaskStatus,
    deleteTaskStatus,
    getAllTaskStatuses,
    selectErrorMessage,
    selectIsLoading,
    selectSortedTaskStatuses,
    taskStatusSlice,
    updateTaskStatus,
    updateTaskStatusesOrder,
} from "./taskStatusSlice";

vi.mock("../services/api", () => ({
    fetchTaskStatuses: vi.fn(),
    fetchCreateTaskStatus: vi.fn(),
    fetchUpdateTaskStatus: vi.fn(),
    fetchDeleteTaskStatus: vi.fn(),
    fetchUpdateTaskStatusesOrder: vi.fn(),
}));

vi.mock("../mapper/mapper", () => ({
    mapTaskStatusFromApi: vi.fn((raw: TaskStatus) => raw),
}));

vi.mock("i18next", () => ({
    default: {
        t: vi.fn((key: string) => key),
    },
}));

const createTestStore = () =>
    configureStore({
        reducer: {
            taskStatuses: taskStatusSlice.reducer,
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

const statusTodo: TaskStatus = { id: "st-1", name: "To Do", position: 1 } as TaskStatus;
const statusDone: TaskStatus = { id: "st-2", name: "Done", position: 0 } as TaskStatus;

describe("taskStatusSlice", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.spyOn(console, "log").mockImplementation(() => {});
        vi.spyOn(console, "error").mockImplementation(() => {});
    });

    it("returns initial state and selectors work properly", () => {
        const store = createTestStore();
        const state = store.getState();

        expect(state.taskStatuses.taskStatuses).toEqual([]);
        expect(selectIsLoading(state)).toBe(false);
        expect(selectErrorMessage(state)).toBe("");
        expect(selectSortedTaskStatuses(state as never)).toEqual([]);
    });

    describe("getAllTaskStatuses thunk & selectSortedTaskStatuses", () => {
        it("maps fetched statuses and sorts them by position via selectSortedTaskStatuses", async () => {
            vi.mocked(api.fetchTaskStatuses).mockResolvedValueOnce([statusTodo, statusDone]);
            const store = createTestStore();

            await store.dispatch(getAllTaskStatuses("proj-1"));

            const state = store.getState();
            expect(mapTaskStatusFromApi).toHaveBeenCalledTimes(2);
            expect(selectIsLoading(state)).toBe(false);

            const sorted = selectSortedTaskStatuses(state as never);
            expect(sorted.map((s) => s.id)).toEqual(["st-2", "st-1"]);
        });

        it("resets taskStatuses to empty array on rejected", async () => {
            vi.mocked(api.fetchTaskStatuses).mockRejectedValueOnce(new Error("Network error"));
            const store = createTestStore();

            await store.dispatch(getAllTaskStatuses("proj-1"));

            const state = store.getState();
            expect(state.taskStatuses.taskStatuses).toEqual([]);
            expect(selectIsLoading(state)).toBe(false);
        });
    });

    describe("createTaskStatus thunk", () => {
        it("appends mapped status on fulfilled", async () => {
            vi.mocked(api.fetchCreateTaskStatus).mockResolvedValueOnce(statusTodo);
            const store = createTestStore();

            await store.dispatch(createTaskStatus({ name: "To Do", projectId: "proj-1" } as never));

            const state = store.getState();
            expect(state.taskStatuses.taskStatuses).toEqual([statusTodo]);
            expect(selectErrorMessage(state)).toBe("");
        });

        it("sets localized errorMessage on rejected AxiosError", async () => {
            const err = createAxiosError(400, "Status name cannot be empty");
            vi.mocked(api.fetchCreateTaskStatus).mockRejectedValueOnce(err);
            const store = createTestStore();

            await store.dispatch(createTaskStatus({ name: "", projectId: "proj-1" } as never));

            const state = store.getState();
            expect(i18n.t).toHaveBeenCalledWith("errors.statusNameEmpty");
            expect(selectErrorMessage(state)).toBe("errors.statusNameEmpty");
        });
    });

    describe("updateTaskStatus thunk", () => {
        it("updates existing status in list on fulfilled", async () => {
            vi.mocked(api.fetchTaskStatuses).mockResolvedValueOnce([statusTodo, statusDone]);
            const updated: TaskStatus = { ...statusTodo, name: "In Progress" };
            vi.mocked(api.fetchUpdateTaskStatus).mockResolvedValueOnce(updated);

            const store = createTestStore();
            await store.dispatch(getAllTaskStatuses("proj-1"));
            await store.dispatch(updateTaskStatus({ id: "st-1", name: "In Progress" } as never));

            const found = store.getState().taskStatuses.taskStatuses.find((s) => s.id === "st-1");
            expect(found?.name).toBe("In Progress");
        });

        it("sets localized errorMessage on rejected AxiosError", async () => {
            const err = createAxiosError(404, "TaskStatus not found");
            vi.mocked(api.fetchUpdateTaskStatus).mockRejectedValueOnce(err);
            const store = createTestStore();

            await store.dispatch(updateTaskStatus({ id: "missing", name: "Test" } as never));

            expect(selectErrorMessage(store.getState())).toBe("errors.taskStatusNotFound");
        });
    });

    describe("deleteTaskStatus thunk & clearStatusError", () => {
        it("removes status by id on fulfilled", async () => {
            vi.mocked(api.fetchTaskStatuses).mockResolvedValueOnce([statusTodo, statusDone]);
            vi.mocked(api.fetchDeleteTaskStatus).mockResolvedValueOnce(undefined as never);

            const store = createTestStore();
            await store.dispatch(getAllTaskStatuses("proj-1"));
            await store.dispatch(deleteTaskStatus("st-1"));

            const remaining = store.getState().taskStatuses.taskStatuses;
            expect(remaining).toHaveLength(1);
            expect(remaining.map((s) => s.id)).toEqual(["st-2"]);
        });

        it("sets localized errorMessage on rejected and clears via clearStatusError", async () => {
            const err = createAxiosError(403, "Access Denied");
            vi.mocked(api.fetchDeleteTaskStatus).mockRejectedValueOnce(err);
            const store = createTestStore();

            await store.dispatch(deleteTaskStatus("st-1"));
            expect(selectErrorMessage(store.getState())).toBe("errors.forbidden");

            store.dispatch(clearStatusError());
            expect(selectErrorMessage(store.getState())).toBe("");
        });
    });

    describe("updateTaskStatusesOrder thunk", () => {
        it("replaces taskStatuses with newly ordered mapped items on fulfilled", async () => {
            const reordered: TaskStatus[] = [
                { ...statusDone, position: 0 },
                { ...statusTodo, position: 1 },
            ];
            vi.mocked(api.fetchUpdateTaskStatusesOrder).mockResolvedValueOnce(reordered);
            const store = createTestStore();

            await store.dispatch(updateTaskStatusesOrder(reordered));

            expect(store.getState().taskStatuses.taskStatuses).toEqual(reordered);
        });
    });
});
