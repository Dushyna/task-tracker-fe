import { createAppSlice } from "../../../app/createAppSlice";
import type {CreateProjectDto, Project, InviteRequestDto, ProjectsSliceState, ProjectLog} from "../types";
import * as api from "../services/api";
import { isAxiosError, type AxiosError } from "axios";
import {createSelector, type PayloadAction} from "@reduxjs/toolkit";
import type {MarkerDto} from "../../tasks/types";
import {fetchProjectLogs} from "../services/api";
import i18n from "i18next";

const initialState: ProjectsSliceState = {
    projects: [],
    currentProject: null,
    isLoading: false,
    isUpdatingProject: false,
    updateProjectErrorMessage: undefined,
};

export const projectsSlice = createAppSlice({
    name: "projects",
    initialState,
    reducers: (create) => ({
        getMyProjects: create.asyncThunk(
            async () => {
                return api
                    .fetchMyProjects()
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
                    state.projects = action.payload;
                },
                rejected: (state, action) => {
                    state.isLoading = false;
                    state.projects = [];
                    console.log(action.error);
                },
            }),

        createProject: create.asyncThunk(
            async (dto: CreateProjectDto) => {
                return api.fetchCreateProject(dto).catch((err) => {
                    if (isAxiosError(err)) {
                        throw new Error(
                            err.response?.data?.message || i18n.t("errors.internalServer")
                        );
                    }
                });
            },
            {
                pending: (state) => {

                    state.createProjectErrorMessage = "";
                },
                fulfilled: (state, action) => {
                    state.projects.push(action.payload);
                    state.createProjectErrorMessage = "";
                },
                rejected: (state, action) => {
                    state.createProjectErrorMessage = action.error.message;
                },
            }
        ),
        updateProject: create.asyncThunk(
            async (
                { id, dto }: { id: string; dto: CreateProjectDto }
            ): Promise<Project> => {
                try {
                    return await api.fetchUpdateProject(id, dto);
                } catch (err) {
                    if (isAxiosError(err)) {
                        throw new Error(err.response?.data?.message || i18n.t("errors.updateProject"));
                    }
                    throw err;
                }
            },
            {
                pending: (state) => {
                    state.isUpdatingProject = true;
                    state.updateProjectErrorMessage = undefined;
                },
                fulfilled: (state, action) => {
                    state.isUpdatingProject = false;

                    const updatedProject = action.payload;

                    const index = state.projects.findIndex(p => p.id === updatedProject.id);
                    if (index !== -1) {
                        state.projects[index] = {
                            ...state.projects[index],
                            ...updatedProject,
                        };
                    }

                    if (state.currentProject?.id === updatedProject.id) {
                        state.currentProject = {
                            ...state.currentProject,
                            ...updatedProject,
                        };
                    }              },
                rejected: (state, action) => {
                    state.isUpdatingProject = false;
                    state.updateProjectErrorMessage = action.error.message;
                },
            }
        ),


        getProjectById: create.asyncThunk(
            async (id: string):Promise<Project> => {
                return api.fetchProjectById(id).catch(
                    (err: AxiosError<{ message: string }>) => {
                        throw new Error(err.response?.data?.message);
                    }
                );
            },
            {
                pending: (state) => {
                    state.isLoading = true;
                    state.currentProject = null;
                },
                fulfilled: (state, action) => {
                    state.isLoading = false;
                    state.currentProject = action.payload;
                },
                rejected: (state, action) => {
                    state.isLoading = false;
                    state.currentProject = null;
                    console.log(action.error);
                },
            }
        ),
        inviteUser: create.asyncThunk(
            async ({ id, dto }: { id: string; dto: InviteRequestDto }) => {
                try {
                    return await api.fetchInviteUser(id, dto);
                } catch (err) {
                    if (isAxiosError(err)) {
                        throw new Error(err.response?.data?.message || i18n.t("errors.inviteUser"));
                    }
                    throw err;
                }
            },
            {
                pending: (state) => {
                    state.inviteUserErrorMessage = "";
                },
                fulfilled: (state, action) => {
                    state.inviteUserErrorMessage = "";
                    const newCollaborator = action.payload;
                    if (state.currentProject && newCollaborator) {
                        if (!state.currentProject.projectTeam) state.currentProject.projectTeam = [];
                        state.currentProject.projectTeam.push(newCollaborator);
                    }
                    const projectInList = state.projects.find(p => p.id === state.currentProject?.id);
                    if (projectInList && newCollaborator) {
                        if (!projectInList.projectTeam) projectInList.projectTeam = [];
                        projectInList.projectTeam.push(newCollaborator);
                    }
                },
                rejected: (state, action) => {
                    state.inviteUserErrorMessage = action.error.message;
                },
            }
        ),

        addMarkerToCurrentProject: create.reducer(
            (state, action: PayloadAction<MarkerDto>) => {
                const newMarker = action.payload;

                if (state.currentProject) {
                    if (!state.currentProject.markers) state.currentProject.markers = [];
                    state.currentProject.markers.push(newMarker);
                }

                const projectInList = state.projects.find(
                    (p) => p.id === state.currentProject?.id
                );
                if (projectInList) {
                    if (!projectInList.markers) projectInList.markers = [];
                    projectInList.markers.push(newMarker);
                }
            }
        ),

        removeMarkerFromProject: create.reducer(
            (state, action: PayloadAction<string>) => {
                const markerId = action.payload;

                if (state.currentProject && state.currentProject.markers) {
                    state.currentProject.markers = state.currentProject.markers.filter(
                        (m) => m.id !== markerId
                    );
                }

                const projectInList = state.projects.find(
                    (p) => p.id === state.currentProject?.id
                );

                if (projectInList && projectInList.markers) {
                    projectInList.markers = projectInList.markers.filter(
                        (m) => m.id !== markerId
                    );
                }
            }
        ),

        getProjectLogs: create.asyncThunk(
            async (projectId: string): Promise<ProjectLog[]> => {
                return fetchProjectLogs(projectId).catch((error) => {
                    if (isAxiosError(error)) {
                        throw new Error(error.response?.data?.message || i18n.t("errors.fetchProjectLogs"));
                    }
                    throw error;
                });
            },
            {
                pending: (state) => {
                    state.isLoading = true;
                },
                fulfilled: (state, action: PayloadAction<ProjectLog[]>) => {
                    state.isLoading = false;
                    if (state.currentProject) {
                        state.currentProject.logs = action.payload;
                    }
                },
                rejected: (state, action) => {
                    state.isLoading = false;
                    console.log(action.error.message);
                },
            }
        ),

        deleteProject: create.asyncThunk(
            async (id: string) => {
                try {
                    await api.fetchDeleteProject(id);
                    return id;
                } catch (err) {
                    if (isAxiosError(err)) {
                        throw new Error(err.response?.data?.message || i18n.t("errors.deleteProject"));
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
                    state.projects = state.projects.filter((p) => p.id !== action.payload);
                    if (state.currentProject?.id === action.payload) {
                        state.currentProject = null;
                    }
                },
                rejected: (state, action) => {
                    state.isLoading = false;
                    state.deleteProjectErrorMessage = action.error.message;
                },
            }
        ),
        clearDeleteError: create.reducer((state) => {
            state.deleteProjectErrorMessage = undefined;
        }),


    }),
    // You can define your selectors here. These selectors receive the slice
    // state as their first argument.
    selectors: {
        selectProjects: (state) => state.projects,
        selectCurrentProject: state => state.currentProject,
        selectCreateProjectErrorMessage: (state) => state.createProjectErrorMessage,
        selectUpdateProjectErrorMessage: (state) => state.updateProjectErrorMessage,
        selectDeleteProjectErrorMessage: (state) => state.deleteProjectErrorMessage,
        selectInviteUserErrorMessage: (state) => state.inviteUserErrorMessage,
        selectCurrentProjectLogs: createSelector(
            (state: ProjectsSliceState) => state.currentProject?.logs,
            (logs) => logs ?? []
        ),

    },
});

// // Action creators are generated for each case reducer function.
export const { createProject, updateProject, getMyProjects, getProjectById, inviteUser,
    addMarkerToCurrentProject, removeMarkerFromProject,
    deleteProject, getProjectLogs,clearDeleteError } = projectsSlice.actions;

// Selectors returned by `slice.selectors` take the root state as their first argument.
export const {
    selectProjects,
    selectCurrentProject,
    selectCreateProjectErrorMessage,
    selectUpdateProjectErrorMessage,
    selectInviteUserErrorMessage,
    selectDeleteProjectErrorMessage,
    selectCurrentProjectLogs
} = projectsSlice.selectors;
