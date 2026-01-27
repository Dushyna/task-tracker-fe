import type {Task, TaskDto} from "../types";

export function mapTaskFromApi(data: TaskDto): Task {
    return {
        id: data.id,
        title: data.title,
        description: data.description,
        statusId: data.status?.id ?? '',
        projectId: data.project?.id ?? '',
    };
}
