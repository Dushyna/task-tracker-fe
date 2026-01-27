import axiosInstance from "../../../lib/axiosInstance";
import type {CreateProjectDto, InviteRequestDto, Project} from "../types";

// we already added  prefix /api in axios config

const PROJECTS_BASE_PATH = "/projects";

export const fetchProjects = async (): Promise<Project[]> => {
  const res = await axiosInstance.get(PROJECTS_BASE_PATH);
  return res.data;
};

export const fetchInviteUser = async (id: string, inviteDto: InviteRequestDto) => {
    const res = await axiosInstance.post(`${PROJECTS_BASE_PATH}/${id}/invite`, inviteDto);
    return res.data;
};




export const fetchCreateProject = async (projectDto: CreateProjectDto) => {
  const res = await axiosInstance.post(PROJECTS_BASE_PATH, projectDto);
  return res.data;
};

export const fetchProjectById = async (id: string) => {
    const res = await axiosInstance.get(`${PROJECTS_BASE_PATH}/${id}`);
    return res.data;
};

