import { configureStore } from "@reduxjs/toolkit";
import { AxiosError, AxiosHeaders } from "axios";
import { beforeEach, describe, expect, it, vi } from "vitest";
import i18n from "i18next";
import * as api from "../services/api";
import type { Project, ProjectLog } from "../types";
import type { MarkerDto } from "../../tasks/types";
import {
    addMarkerToCurrentProject,
    clearDeleteError,
    createProject,
    deleteProject,
    getMyProjects,
    getProjectById,
    getProjectLogs,
    inviteUser,
    projectsSlice,
    removeMarkerFromProject,
    selectCreateProjectErrorMessage,
    selectCurrentProject,
    selectCurrentProjectLogs,
    selectDeleteProjectErrorMessage,
    selectInviteUserErrorMessage,
    selectProjects,
    selectUpdateProjectErrorMessage,
    updateProject,
} from "./projectsSlice";

vi.mock("../services/api", () => ({
    fetchMyProjects: vi.fn(),
    fetchCreateProject: vi.fn(),
    fetchUpdateProject: vi.fn(),
    fetchProjectById: vi.fn(),
    fetchInviteUser: vi.fn(),
    fetchProjectLogs: vi.fn(),
    fetchDeleteProject: vi.fn(),
}));

vi.mock("i18next", () => ({
    default: {
        t: vi.fn((key: string) => key),
    },
}));

const createTestStore = () =>
    configureStore({
        reducer: {
            projects: projectsSlice.reducer,
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

const mockProject1: Project = {
    id: "proj-1",
    title: "Tracker App",
    description: "Main project",
    projectTeam: [],
    markers: [],
    logs: [],
} as unknown as Project;

const mockProject2: Project = {
    id: "proj-2",
    title: "Second Project",
    description: "Secondary",
    projectTeam: [],
    markers: [],
    logs: [],
} as unknown as Project;

describe("projectsSlice", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.spyOn(console, "log").mockImplementation(() => {});
    });

    it("returns initial state and selectors work properly", () => {
        const store = createTestStore();
        const state = store.getState();

        expect(selectProjects(state)).toEqual([]);
        expect(selectCurrentProject(state)).toBeNull();
        expect(selectCurrentProjectLogs(state)).toEqual([]);
        expect(selectCreateProjectErrorMessage(state)).toBeUndefined();
        expect(selectUpdateProjectErrorMessage(state)).toBeUndefined();
        expect(selectDeleteProjectErrorMessage(state)).toBeUndefined();
        expect(selectInviteUserErrorMessage(state)).toBeUndefined();
    });

    describe("getMyProjects thunk", () => {
        it("stores fetched projects on fulfilled", async () => {
            vi.mocked(api.fetchMyProjects).mockResolvedValueOnce([mockProject1, mockProject2]);
            const store = createTestStore();

            await store.dispatch(getMyProjects());

            const state = store.getState();
            expect(selectProjects(state)).toHaveLength(2);
            expect(selectProjects(state)[0].id).toBe("proj-1");
            expect(state.projects.isLoading).toBe(false);
        });

        it("clears projects and stops loading on rejected", async () => {
            vi.mocked(api.fetchMyProjects).mockRejectedValueOnce(new Error("Network error"));
            const store = createTestStore();

            await store.dispatch(getMyProjects());

            const state = store.getState();
            expect(selectProjects(state)).toEqual([]);
            expect(state.projects.isLoading).toBe(false);
        });
    });

    describe("createProject thunk", () => {
        it("appends created project to list on fulfilled", async () => {
            vi.mocked(api.fetchCreateProject).mockResolvedValueOnce(mockProject1);
            const store = createTestStore();

            await store.dispatch(
                createProject({ title: "Tracker App", description: "Main project" } as never)
            );

            const state = store.getState();
            expect(selectProjects(state)).toEqual([mockProject1]);
            expect(selectCreateProjectErrorMessage(state)).toBe("");
        });

        it("sets localized createProjectErrorMessage on rejected AxiosError", async () => {
            const err = createAxiosError(400, "Title and description are required");
            vi.mocked(api.fetchCreateProject).mockRejectedValueOnce(err);
            const store = createTestStore();

            await store.dispatch(createProject({ title: "", description: "" } as never));

            const state = store.getState();
            expect(i18n.t).toHaveBeenCalledWith("errors.projectTitleDescriptionRequired");
            expect(selectCreateProjectErrorMessage(state)).toBe(
                "errors.projectTitleDescriptionRequired"
            );
        });
    });

    describe("updateProject thunk", () => {
        it("updates project in both projects list and currentProject on fulfilled", async () => {
            vi.mocked(api.fetchMyProjects).mockResolvedValueOnce([mockProject1, mockProject2]);
            vi.mocked(api.fetchProjectById).mockResolvedValueOnce(mockProject1);
            const updated: Project = { ...mockProject1, title: "Updated Title" };
            vi.mocked(api.fetchUpdateProject).mockResolvedValueOnce(updated);

            const store = createTestStore();
            await store.dispatch(getMyProjects());
            await store.dispatch(getProjectById("proj-1"));

            await store.dispatch(
                updateProject({
                    id: "proj-1",
                    dto: { title: "Updated Title", description: "Main project" } as never,
                })
            );

            const state = store.getState();
            expect(selectProjects(state)[0].title).toBe("Updated Title");
            expect(selectCurrentProject(state)?.title).toBe("Updated Title");
            expect(state.projects.isUpdatingProject).toBe(false);
        });

        it("sets localized updateProjectErrorMessage on rejected AxiosError", async () => {
            const err = createAxiosError(404, "Project not found");
            vi.mocked(api.fetchUpdateProject).mockRejectedValueOnce(err);
            const store = createTestStore();

            await store.dispatch(
                updateProject({
                    id: "missing-id",
                    dto: { title: "Test", description: "Desc" } as never,
                })
            );

            const state = store.getState();
            expect(i18n.t).toHaveBeenCalledWith("errors.projectNotFound");
            expect(selectUpdateProjectErrorMessage(state)).toBe("errors.projectNotFound");
        });
    });
    describe("getProjectById & getProjectLogs thunks", () => {
        it("sets currentProject on getProjectById fulfilled and attaches logs on getProjectLogs fulfilled", async () => {
            const logs = [{ id: "log-1", message: "Created task" }] as unknown as ProjectLog[];
            vi.mocked(api.fetchProjectById).mockResolvedValueOnce(mockProject1);
            vi.mocked(api.fetchProjectLogs).mockResolvedValueOnce(logs);

            const store = createTestStore();
            await store.dispatch(getProjectById("proj-1"));
            expect(selectCurrentProject(store.getState())?.id).toBe("proj-1");

            await store.dispatch(getProjectLogs("proj-1"));
            expect(selectCurrentProjectLogs(store.getState())).toEqual(logs);
        });
    });

    describe("inviteUser thunk", () => {
        it("adds collaborator to both currentProject and matching project in projects list", async () => {
            const collaborator = { id: "col-1", email: "dev@example.com", role: "MEMBER" };
            vi.mocked(api.fetchMyProjects).mockResolvedValueOnce([
                { ...mockProject1, projectTeam: [] },
            ]);
            vi.mocked(api.fetchProjectById).mockResolvedValueOnce({
                ...mockProject1,
                projectTeam: [],
            });
            vi.mocked(api.fetchInviteUser).mockResolvedValueOnce(collaborator as never);

            const store = createTestStore();
            await store.dispatch(getMyProjects());
            await store.dispatch(getProjectById("proj-1"));

            await store.dispatch(
                inviteUser({
                    id: "proj-1",
                    dto: { email: "dev@example.com" } as never,
                })
            );

            const state = store.getState();
            expect(selectCurrentProject(state)?.projectTeam).toHaveLength(1);
            expect(selectProjects(state)[0].projectTeam).toHaveLength(1);
            expect(selectInviteUserErrorMessage(state)).toBe("");
        });

        it("sets localized inviteUserErrorMessage on rejected AxiosError", async () => {
            const err = createAxiosError(400, "Cannot invite another OWNER");
            vi.mocked(api.fetchInviteUser).mockRejectedValueOnce(err);
            const store = createTestStore();

            await store.dispatch(
                inviteUser({
                    id: "proj-1",
                    dto: { email: "owner@example.com" } as never,
                })
            );

            const state = store.getState();
            expect(i18n.t).toHaveBeenCalledWith("errors.cannotInviteOwner");
            expect(selectInviteUserErrorMessage(state)).toBe("errors.cannotInviteOwner");
        });
    });

    describe("markers synchronous reducers", () => {
        it("adds and removes a marker in both currentProject and projects list", async () => {
            const marker: MarkerDto = {
                id: "marker-1",
                name: "Bug",
                color: "#ff0000",
            } as unknown as MarkerDto;

            vi.mocked(api.fetchMyProjects).mockResolvedValueOnce([
                { ...mockProject1, markers: [] },
            ]);
            vi.mocked(api.fetchProjectById).mockResolvedValueOnce({
                ...mockProject1,
                markers: [],
            });

            const store = createTestStore();
            await store.dispatch(getMyProjects());
            await store.dispatch(getProjectById("proj-1"));

            store.dispatch(addMarkerToCurrentProject(marker));
            expect(selectCurrentProject(store.getState())?.markers).toEqual([marker]);
            expect(selectProjects(store.getState())[0].markers).toEqual([marker]);

            store.dispatch(removeMarkerFromProject("marker-1"));
            expect(selectCurrentProject(store.getState())?.markers).toEqual([]);
            expect(selectProjects(store.getState())[0].markers).toEqual([]);
        });
    });

    describe("deleteProject thunk & clearDeleteError", () => {
        it("removes project from projects list and resets currentProject when deleted", async () => {
            vi.mocked(api.fetchMyProjects).mockResolvedValueOnce([mockProject1, mockProject2]);
            vi.mocked(api.fetchProjectById).mockResolvedValueOnce(mockProject1);
            vi.mocked(api.fetchDeleteProject).mockResolvedValueOnce(undefined as never);

            const store = createTestStore();
            await store.dispatch(getMyProjects());
            await store.dispatch(getProjectById("proj-1"));

            await store.dispatch(deleteProject("proj-1"));

            const state = store.getState();
            expect(selectProjects(state)).toHaveLength(1);
            expect(selectProjects(state)[0].id).toBe("proj-2");
            expect(selectCurrentProject(state)).toBeNull();
        });

        it("sets localized deleteProjectErrorMessage on error and clears it via clearDeleteError", async () => {
            const err = createAxiosError(403, "Access Denied");
            vi.mocked(api.fetchDeleteProject).mockRejectedValueOnce(err);
            const store = createTestStore();

            await store.dispatch(deleteProject("proj-1"));
            expect(selectDeleteProjectErrorMessage(store.getState())).toBe("errors.forbidden");

            store.dispatch(clearDeleteError());
            expect(selectDeleteProjectErrorMessage(store.getState())).toBeUndefined();
        });
    });
});
