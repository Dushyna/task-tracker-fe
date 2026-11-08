import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { DndContext, DragOverlay } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";

import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import { selectFilteredTasks, getTasksByProjectId, setSearchQuery, selectSearchQuery, selectSelectedMarkerId, setSelectedMarkerId } from "../../tasks/slice/tasksSlice";
import { getProjectById, selectCurrentProject, selectInviteUserErrorMessage } from "../slice/projectsSlice";
import {
    clearStatusError, createTaskStatus,
    getAllTaskStatuses,
    selectErrorMessage,
    selectIsLoading,
    selectSortedTaskStatuses
} from "../../statuses/slice/taskStatusSlice";
import { SortableTask } from "./SortableTask.tsx";

import { BoardHeader } from "./BoardHeader.tsx";
import { BoardModals } from "./BoardModals.tsx";

import { useKanbanDnd } from "../hooks/useKanbanDnd";
import { useKanbanActions } from "../hooks/useKanbanActions";
import { usePageTitle } from "../../../app/customHooks/usePageTitle.ts";
import {SortableColumn} from "./SortableColumn.tsx";
import NotificationModal from "../../../components/ui/NotificationModal.tsx";

export default function KanbanBoard() {
    const { projectId } = useParams<{ projectId: string }>();
    const dispatch = useAppDispatch();


    const tasks = useAppSelector(selectFilteredTasks);
    const searchQuery = useAppSelector(selectSearchQuery);
    const project = useAppSelector(selectCurrentProject);
    const selectedMarkerId = useAppSelector(selectSelectedMarkerId);
    const projectMarkers = project?.markers || [];
    const statuses = useAppSelector(selectSortedTaskStatuses);
    const allNames = statuses.map(s => s.name);
    const inviteError = useAppSelector(selectInviteUserErrorMessage);
    const isLoading = useAppSelector(selectIsLoading);
    const statusesError = useAppSelector(selectErrorMessage);

    const [modalOpen, setModalOpen] = useState(false);
    const [currentStatusId, setCurrentStatusId] = useState<string | null>(null);
    const [statusModalOpen, setStatusModalOpen] = useState(false);
    const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
    const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
    const [statusToDelete, setStatusToDelete] = useState<{id: string, name: string} | null>(null);
    const [isLogsModalOpen, setIsLogsModalOpen] = useState(false);

    const {
        sensors, activeTask, handleDragStart, handleDragEnd,
        collisionDetection, dropAnimation
    } = useKanbanDnd(tasks, statuses);

    const {
        handleCreateTask,
        handleDeleteStatus, handleInvite
    } = useKanbanActions(projectId);

    usePageTitle(project ? `TrackerApp | ${project.title}` : "Loading...");

    useEffect(() => {
        if (projectId) {
            dispatch(getProjectById(projectId));
            dispatch(getAllTaskStatuses(projectId));
            dispatch(getTasksByProjectId(projectId));
        }
    }, [projectId, dispatch]);

    const tasksByStatus = useMemo(() => {
        return statuses.reduce((acc, status) => ({
            ...acc,
            [status.id]: tasks.filter(t => t.statusId === status.id)
        }), {} as Record<string, typeof tasks>);
    }, [tasks, statuses]);

    if (isLoading && statuses.length === 0) {
        return (
            <div className="h-screen flex items-center justify-center bg-black/50 backdrop-blur-sm">
                <div className="text-cyan-400 animate-pulse font-black uppercase tracking-widest">
                    Loading project column...
                </div>
            </div>
        );
    }

    return (
        <div className="h-screen flex flex-col bg-transparent border border-cyan-900/50 rounded-2xl p-4 overflow-hidden">
            <BoardHeader
                title={project?.title}
                searchQuery={searchQuery}
                onSearchChange={(val) => dispatch(setSearchQuery(val))}
                selectedMarkerId={selectedMarkerId}
                projectMarkers={projectMarkers}
                onMarkerClick={(id) => dispatch(setSelectedMarkerId(id === selectedMarkerId ? null : id))}
                onAddStatus={() => setStatusModalOpen(true)}
                onAddCollab={() => setIsInviteModalOpen(true)}
                onOpenLogs={() => setIsLogsModalOpen(true)}
                collaborators={project?.projectTeam}
            />

            <DndContext
                sensors={sensors}
                collisionDetection={collisionDetection}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
            >
                <div className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar">
                    {statuses.map(status => {
                        const tasksInStatus = tasksByStatus[status.id] || [];
                        return (
                            <SortableColumn
                                key={status.id}
                                status={status}
                                allStatusNames={allNames}
                                onAddTask={() => {
                                    setCurrentStatusId(status.id);
                                    setModalOpen(true);
                                }}
                                canDelete={tasksInStatus.length === 0}
                                onDelete={() => setStatusToDelete({ id: status.id, name: status.name })}

                            >


                                <SortableContext
                                    items={tasksInStatus.map(t => t.id)}
                                    strategy={verticalListSortingStrategy}
                                >
                                    <div className="flex flex-col gap-2">
                                        {tasksInStatus.map(task => (
                                            <SortableTask
                                                key={task.id}
                                                task={task}
                                                onOpenEdit={() => setEditingTaskId(task.id)}
                                            />
                                        ))}
                                    </div>
                                </SortableContext>
                            </SortableColumn>
                        );
                    })}
                </div>

                <DragOverlay dropAnimation={dropAnimation}>
                    {activeTask && (
                        <div className="bg-white rounded-xl p-3 border-2 border-cyan-500 shadow-2xl rotate-3 w-[260px] md:w-[300px] cursor-grabbing">
                            <div className="font-semibold text-black">{activeTask.title}</div>
                        </div>                    )}
                </DragOverlay>
            </DndContext>

            <BoardModals
                modals={{
                    task: {
                        isOpen: modalOpen,
                        statusId: currentStatusId,
                        statusName: statuses.find(s => s.id === currentStatusId)?.name || "",
                        onClose: () => setModalOpen(false)
                    },
                    status: {
                        isOpen: statusModalOpen,
                        onClose: () => setStatusModalOpen(false),
                        maxPosition: statuses.length
                    },
                    invite: {
                        isOpen: isInviteModalOpen,
                        onClose: () => setIsInviteModalOpen(false),
                        error: inviteError
                    },
                    edit: {
                        taskId: editingTaskId,
                        task: tasks.find(t => t.id === editingTaskId),
                        onClose: () => setEditingTaskId(null)
                    },
                    deleteStatus: {
                        status: statusToDelete,
                        onClose: () => setStatusToDelete(null)
                    },
                    logs: {
                        isOpen: isLogsModalOpen,
                        onClose: () => setIsLogsModalOpen(false),
                        projectId: projectId!
                    }
                }}
                actions={{
                    onCreateTask: async (title, desc) => {
                        await  handleCreateTask(title, desc, currentStatusId!);
                        setModalOpen(false); },
                    onCreateStatus: async (name, pos) => {
                        try {
                            await dispatch(createTaskStatus({ name, position: pos, projectId: projectId! })).unwrap();
                            setStatusModalOpen(false);
                        } catch (error) {
                            console.error("Status creation failed:", error);
                        }                    },
                    onInvite: (email, role) => {
                        handleInvite(projectId!, email, role).then(res => {
                            if(res.meta.requestStatus === 'fulfilled') setIsInviteModalOpen(false);
                        });
                    },
                    onDeleteStatus: handleDeleteStatus
                }}
            />
            {statusesError && (
                <NotificationModal
                    title="Access Denied"
                    message={statusesError}
                    onClose={() => dispatch(clearStatusError())}
                />
            )}
        </div>
    );
}
