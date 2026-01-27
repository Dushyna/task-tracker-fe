import { createAppSlice } from "../../../app/createAppSlice";
import type {CreateProjectDto, Project, InviteRequestDto, ProjectsSliceState} from "../types";
import * as api from "../services/api";
import { isAxiosError, type AxiosError } from "axios";

const initialState: ProjectsSliceState = {
  projects: [],
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




  }),
  // You can define your selectors here. These selectors receive the slice
  // state as their first argument.
  selectors: {
    selectProjects: (state) => state.projects,
    selectCurrentProject: state => state.currentProject,
    selectIsLoading: (state) => state.isLoading,
    selectCreateProjectErrorMessage: (state) => state.createProjectErrorMessage,
    selectInviteUserErrorMessage: (state) => state.inviteUserErrorMessage,

},
});

// // Action creators are generated for each case reducer function.
export const { createProject, getAllProjects, getProjectById, inviteUser } = projectsSlice.actions;

// Selectors returned by `slice.selectors` take the root state as their first argument.
export const {
  selectProjects,
  selectIsLoading,
  selectCurrentProject,
  selectCreateProjectErrorMessage,
    selectInviteUserErrorMessage,
} = projectsSlice.selectors;
