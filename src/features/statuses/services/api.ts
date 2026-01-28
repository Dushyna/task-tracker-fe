import axiosInstance from "../../../lib/axiosInstance";
import type {CreateTaskStatusDto, UpdateTaskStatusDto} from "../types";

// we already added  prefix /api in axios config

const STATUS_BASE_PATH = "/status";
const PROJECTS_BASE_PATH = "/projects";


export const fetchCreateTaskStatus = async (taskStatusDto: CreateTaskStatusDto) => {
  const res = await axiosInstance.post(STATUS_BASE_PATH, taskStatusDto);
  return res.data;
};

export const fetchUpdateTaskStatus = async (taskStatusDto: UpdateTaskStatusDto) => {
    const res = await axiosInstance.patch(STATUS_BASE_PATH, taskStatusDto);
    return res.data;
};

export const fetchTaskStatuses = async (id:string) => {
    const res = await axiosInstance.get(`${PROJECTS_BASE_PATH}/${id}/status`);
    return res.data;
};

export const fetchDeleteTaskStatus = async (id: string) => {
    const res = await axiosInstance.delete(`${STATUS_BASE_PATH}/${id}`);
    return res.data;
};