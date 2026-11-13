import type {CollaboratorDto} from "../../projects/types";

export interface Task {
    id: string;
    title: string;
    taskNumber: number;
    description: string;
    statusId: string;
    projectId: string;
    executors: CollaboratorDto[];
    markers: MarkerDto[];
    checklist: ChecklistItem[];
    dueDate?: string | null;
    createdAt?: string;
    updatedAt?: string;
    attachments: Attachment[];
    comments: Comment[];

}

export interface CreateTaskDto {
    title: string;
    description: string;
    statusId: string;
    projectId: string;
}

export interface TaskDto{
    id: string;
    title: string;
    taskNumber: number;
    description: string;
    statusId: string;
    projectId: string;
    executors: CollaboratorDto[];
    markers: MarkerDto[];
    checklist: ChecklistItem[];
    dueDate?: string | null;
    createdAt?: string;
    updatedAt?: string;
    attachments: Attachment[];
    comments: Comment[];
}



export interface UpdateTaskDto {
    title?: string;
    description?: string;
    statusId?: string;
    projectId?: string;
    executorIds?: string[];
    markerIds?: string[];
    checklist?: ChecklistItem[];
    dueDate?: string | null;
    attachments?: Attachment[];
}

export interface UpdateTaskPayload {
    id: string;
    dto: UpdateTaskDto;
}

export interface InFlightTaskUpdate {
    requestId: string;
    dto: UpdateTaskDto;
}

export interface TasksSliceState {
    tasks: Task[];
    taskSnapshots: Record<string, Task>;
    inFlightTaskUpdates: Record<string, InFlightTaskUpdate[]>;
    createTaskErrorMessage?: string;
    comments: Comment[];
    isLoading: boolean;
    searchQuery: string,
    selectedMarkerId: string | null
}

export interface MarkerDto {
    id: string;
    name: string;
    color: string;
}
export interface ChecklistItem {
    id?: string;
    text: string;
    completed: boolean;
}

export interface Attachment {
    id: string;
    name: string;
    url: string;
    type: 'IMAGE' | 'PDF' | 'DOC' | 'VIDEO' | 'FILE' | 'LINK';
    createdAt: string;
}
export interface Comment {
    id: string;
    text: string;
    authorName: string;
    authorAvatarUrl: string;
    createdAt: string;
}