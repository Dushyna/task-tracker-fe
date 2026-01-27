import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import type { Task } from "../../tasks/types";
import {Column} from "./Column.tsx";
import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import { getTasksByProjectId, updateTask, createTask, selectTasks } from "../../tasks/slice/tasksSlice";
import {getProjectById, inviteUser, selectCurrentProject, selectInviteUserErrorMessage} from "../slice/projectsSlice";
import {
    getAllTaskStatuses,
    selectSortedTaskStatuses,
    createTaskStatus,
    updateTaskStatus
} from "../../statuses/slice/taskStatusSlice";
import { CreateStatusModal } from "./CreateStatusModal";
import {TaskModal} from "./TaskModal.tsx";
import type { DragEndEvent } from "@dnd-kit/core";
import { DndContext, PointerSensor, useSensor, useSensors, rectIntersection } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import {SortableTask} from "./SortableTask.tsx";
import {InviteModal} from "./InviteModal.tsx";
import type {ProjectRole} from "../types";
import {CollaboratorsList} from "./CollaboratorsList.tsx";

export default function KanbanBoard() {
    const { projectId } = useParams<{ projectId: string }>();
    const dispatch = useAppDispatch();


    const tasks = useAppSelector(selectTasks);
    const project = useAppSelector(selectCurrentProject);
    const statuses = useAppSelector(selectSortedTaskStatuses);
    const inviteError = useAppSelector(selectInviteUserErrorMessage);

    const [modalOpen, setModalOpen] = useState(false);
    const [currentStatusId, setCurrentStatusId] = useState<string | null>(null);
    const [statusModalOpen, setStatusModalOpen] = useState(false);
    const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);


    useEffect(() => {
        if (!projectId) return;
        dispatch(getProjectById(projectId));
        dispatch(getAllTaskStatuses(projectId));
        dispatch(getTasksByProjectId(projectId));

    }, [projectId, dispatch]);

    console.log("Tasks:", tasks);
    console.log("Statuses:", statuses);


    const tasksByStatus = useMemo(() => {
        return statuses.reduce<Record<string, Task[]>>((acc, status) => {
            acc[status.id] = tasks.filter(task => task.statusId === status.id);
            return acc;
        }, {});
    }, [tasks, statuses]);

    const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (!over) return;
        const activeId = String(active.id);
        const overId = String(over.id);

        const task = tasks.find(t => t.id === activeId);
        if (!task) return;

        let newStatusId: string;

        if (statuses.some(s => s.id === overId)) {
            newStatusId = overId;
        } else {
            const overTask = tasks.find(t => t.id === overId);
            newStatusId = overTask ? overTask.statusId : task.statusId;
        }

        if (task.statusId === newStatusId) return;

        dispatch(updateTask({ id: activeId, dto: { statusId: newStatusId } }));
    };

    const openModal = (statusId: string) => {
        setCurrentStatusId(statusId);
        setModalOpen(true);
    };

    const handleCreateTask = (title: string, description: string) => {
        if (!projectId || !currentStatusId) return;

        dispatch(createTask({
            title,
            description,
            statusId: currentStatusId,
            projectId
        }));
        setModalOpen(false);
    };

    const handleCreateStatus = (name: string, position: number) => {
        if (!projectId) return;

        const normalizedPosition = Math.max(
            0,
            Math.min(position, statuses.length)
        );

        statuses
            .filter(s => s.position >= normalizedPosition)
            .sort((a, b) => b.position - a.position) // 👈 важно!
            .forEach(s => {
                dispatch(
                    updateTaskStatus({
                        id: s.id,
                        position: s.position + 1,
                    })
                );
            });

        dispatch(
            createTaskStatus({
                name,
                projectId,
                position: normalizedPosition,
            })
        );

        setStatusModalOpen(false);
    };


    const handleInviteSubmit = async (email: string, role: ProjectRole) => {
        if (project?.id) {
            const result = await dispatch(inviteUser({
                id: project.id,
                dto: { email, role}
            }));

            if (inviteUser.fulfilled.match(result)) {
                setIsInviteModalOpen(false);
            }
        }
    };



    return (
        <div className="h-screen bg-slate-100 p-4 flex flex-col">
            <div className="flex items-center gap-4 mb-4 text-black">
                <h1 className="text-2xl font-bold">
                    {project?.title ?? "Loading..."}
                </h1>

                <button
                    onClick={() => setStatusModalOpen(true)}
                    className="bg-blue-600 text-white px-3 py-1.5 rounded text-sm hover:bg-blue-700"
                >
                    + Add Status
                </button>
                <button
                    onClick={() => setIsInviteModalOpen(true)}
                    className="bg-blue-600 text-white px-3 py-1.5 rounded text-sm hover:bg-blue-700 transition"
                >
                    + Add collaborators
                </button>

                {project && (
                    <CollaboratorsList
                        collaborators={project.projectTeam}
                        onInviteClick={() => setIsInviteModalOpen(true)}
                    />
                )}

            </div>




            <DndContext sensors={sensors} collisionDetection={rectIntersection} onDragEnd={handleDragEnd}>
                <div className="flex gap-4 overflow-x-auto">
                    {statuses.map(status => (
                        <Column
                            key={status.id}
                            status={status}
                            onAddTask={() => openModal(status.id)}
                        >
                            <SortableContext
                                items={tasksByStatus[status.id]?.map(t => t.id) ?? []}
                                strategy={verticalListSortingStrategy}
                            >
                                <div className="flex flex-col gap-2">
                                    {tasksByStatus[status.id]?.map(task => (
                                        <SortableTask key={task.id} task={task} />
                                    ))}
                                </div>
                            </SortableContext>
                        </Column>
                    ))}
                </div>
            </DndContext>

            <TaskModal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                onCreate={handleCreateTask}
                statusName={statuses.find(s => s.id === currentStatusId)?.name ?? ""}
            />
            <CreateStatusModal
                isOpen={statusModalOpen}
                onClose={() => setStatusModalOpen(false)}
                onCreate={handleCreateStatus}
                maxPosition={statuses.length}
            />

            <InviteModal
                isOpen={isInviteModalOpen}
                onClose={() => setIsInviteModalOpen(false)}
                onInvite={handleInviteSubmit}
                error={inviteError}
            />


        </div>
    );
}
