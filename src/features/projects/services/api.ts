import axiosInstance from "../../../lib/axiosInstance";
import type {CreateProjectDto, InviteRequestDto, Project, ProjectLog} from "../types";

// we already added  prefix /api in axios config

const PROJECTS_BASE_PATH = "/projects";

export const fetchMyProjects = async (): Promise<Project[]> => {
    const res = await axiosInstance.get(`${PROJECTS_BASE_PATH}/my`);
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

export const fetchUpdateProject = async (
    id: string,
    dto: { title: string; description: string }
) => {
    const res = await axiosInstance.patch(`${PROJECTS_BASE_PATH}/${id}`, dto);
    return res.data;
};

export const fetchProjectById = async (id: string) => {
    const res = await axiosInstance.get(`${PROJECTS_BASE_PATH}/${id}`);
    return res.data;
};

export const fetchProjectLogs = async (id: string): Promise<ProjectLog[]> => {
    const res = await axiosInstance.get(`${PROJECTS_BASE_PATH}/${id}/logs`);
    return res.data;
};

export const fetchDeleteProject = async (id: string) => {
    const res = await axiosInstance.delete(`${PROJECTS_BASE_PATH}/${id}`);
    return res.data;
};

export const fetchDeleteMarker = async (projectId: string, markerId: string): Promise<void> => {
    await axiosInstance.delete(`${PROJECTS_BASE_PATH}/${projectId}/markers/${markerId}`);
};

