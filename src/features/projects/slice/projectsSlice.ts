import { createAppSlice } from "../../../app/createAppSlice";
import type {CreateProjectDto, Project, InviteRequestDto, ProjectsSliceState, ProjectLog} from "../types";
import * as api from "../services/api";
import { isAxiosError, type AxiosError } from "axios";
import {createSelector, type PayloadAction} from "@reduxjs/toolkit";
import type {MarkerDto} from "../../tasks/types";
import {fetchProjectLogs} from "../services/api";

const initialState: ProjectsSliceState = {
  projects: [],
  adminProjects: [],
  currentProject: null,
  isLoading: false,
};

export const projectsSlice = createAppSlice({
  name: "projects",
  initialState,
  reducers: (create) => ({
    getAllProjects: create.asyncThunk(
      async () => {
        return api
          .fetchProjects()
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
          state.adminProjects = action.payload;
        },
        rejected: (state, action) => {
          state.isLoading = false;
          state.adminProjects = [];
          console.log(action.error);
        },
      }
    ),

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
          }
      ),

    createProject: create.asyncThunk(
      async (dto: CreateProjectDto) => {
        return api.fetchCreateProject(dto).catch((err) => {
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
                      throw new Error(err.response?.data?.message || "Failed to invite user");
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

      getProjectLogs: create.asyncThunk(
          async (projectId: string): Promise<ProjectLog[]> => {
              return fetchProjectLogs(projectId).catch((error) => {
                  if (isAxiosError(error)) {
                      throw new Error(error.response?.data?.message || "Failed to fetch project logs");
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
                      throw new Error(err.response?.data?.message || "Failed to delete project");
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
              rejected: (state) => {
                  state.isLoading = false;
              },
          }
      ),



  }),
  // You can define your selectors here. These selectors receive the slice
  // state as their first argument.
  selectors: {
    selectProjects: (state) => state.projects,
    selectAdminProjects: (state) => state.adminProjects,
    selectCurrentProject: state => state.currentProject,
    selectIsLoading: (state) => state.isLoading,
    selectCreateProjectErrorMessage: (state) => state.createProjectErrorMessage,
    selectInviteUserErrorMessage: (state) => state.inviteUserErrorMessage,
      selectCurrentProjectLogs: createSelector(
          (state: ProjectsSliceState) => state.currentProject?.logs,
          (logs) => logs ?? []
      ),

},
});

// // Action creators are generated for each case reducer function.
export const { createProject, getAllProjects,getMyProjects, getProjectById, inviteUser, addMarkerToCurrentProject, deleteProject, getProjectLogs } = projectsSlice.actions;

// Selectors returned by `slice.selectors` take the root state as their first argument.
export const {
  selectProjects,
  selectAdminProjects,
  selectIsLoading,
  selectCurrentProject,
  selectCreateProjectErrorMessage,
    selectInviteUserErrorMessage,
    selectCurrentProjectLogs
} = projectsSlice.selectors;
