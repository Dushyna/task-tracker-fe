import {useEffect, useState} from "react";
import {useAppDispatch, useAppSelector} from "../../../app/hooks.ts";
import {useTaskActions} from "../hooks/useTaskActions.ts";
import {TaskChecklist} from "./TaskChecklist.tsx";
import {TaskSidebar} from "./TaskSidebar.tsx";
import type {Task} from "../types";
import {TaskAttachments} from "./TaskAttachments.tsx";
import {TaskComments} from "./TaskComments.tsx";
import {getComments, setTaskError} from "../slice/tasksSlice";
import {format, formatDistanceToNow} from 'date-fns';
import PulsedStripe from "../../../components/ui/PulsedStripe.tsx";

interface TaskEditModalProps {
    card: Task;
    onClose: () => void;
}


export function EditTaskModal({card, onClose}: TaskEditModalProps) {
    const project = useAppSelector((state) => state.projects.currentProject);
    const allTasks = useAppSelector(state => state.tasks.tasks);
    const currentTask = allTasks.find(t => t.id === card.id) || card;
    const [isCreatingChecklist, setIsCreatingChecklist] = useState(false);
    const allStatuses = useAppSelector((state) => state.taskStatuses.taskStatuses);
    const currentStatus = allStatuses.find(s => s.id === currentTask.statusId);
    const statusName = currentStatus ? currentStatus.name : "Unknown Status";
    const error = useAppSelector(state => state.tasks.createTaskErrorMessage);

    const {
        handleAddExecutor,
        handleAddMarker,
        handleCreateAndAddMarker,
        handleDeleteGlobalMarker,
        syncChecklist,
        patchTask,
        isUpdating
    } = useTaskActions(currentTask, project?.id);
    const dispatch = useAppDispatch();

    useEffect(() => {
        if (currentTask.id) {
            dispatch(getComments(currentTask.id));
        }
    }, [currentTask.id, dispatch]);

    useEffect(() => {
        if (error) {
            const timer = setTimeout(() => {
                dispatch(setTaskError(""));
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [error, dispatch]);


    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-0 animate-in fade-in duration-500 bg-black/60"
            onClick={onClose}>
            {/* Main container */}
            <div
                className="w-full max-h-[95%] max-w-6xl bg-slate-900 border border-cyan-500/20 hover:border-cyan-500/40 rounded-xl flex flex-col relative overflow-hidden custom-scrollbar"
                onClick={e => e.stopPropagation()}>

                {/* 1. Cover */}
                <div
                    className="min-h-20 w-full shrink-0 relative bg-gradient-to-r from-slate-900 via-cyan-950 to-slate-900 overflow-hidden">

                    {/* Header */}
                    <div className="min-h-20 w-full py-4 px-4 flex items-center justify-center">
                        <div
                            className="w-full flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-center sm:text-left">
                            {/* TaskNumber */}
                            <div className="flex justify-center sm:justify-start">
            <span
                className="text-xs whitespace-nowrap font-black text-cyan-400 bg-cyan-500/10 px-3 py-1.5 rounded-full border border-cyan-500/20 tracking-widest uppercase">
                Task #{currentTask.taskNumber}
            </span>
                            </div>

                            {/* Input Title */}
                            <input
                                defaultValue={currentTask.title}
                                onBlur={(e) => {
                                    const val = e.target.value.trim();
                                    if (val && val !== currentTask.title) patchTask({title: val});
                                }}
                                className="w-full max-w-md bg-transparent text-lg sm:text-xl font-black text-white text-neon-strong outline-none transition-all uppercase tracking-tighter text-center"
                            />

                            {/* Status display */}
                            <div
                                className="flex whitespace-nowrap items-center gap-2 justify-center text-xs font-black text-cyan-400 uppercase tracking-wider">
                                <span>Status:</span>
                                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_#22d3ee]"></span>
                                <span className="text-cyan-400 font-black tracking-[0.1em]">
                {statusName}
            </span>
                            </div>
                        </div>
                    </div>
                </div>
                <PulsedStripe height="2px"></PulsedStripe>
                <div className="px-4 py-6 sm:px-10 sm:pt-12 sm:pb-10 grid grid-cols-1 lg:grid-cols-[1fr_280px] overflow-y-auto gap-6 sm:gap-10">                    {/* Left part */}
                    <div className="space-y-8">
                        {/* Markers and Members */}
                        <div className="flex flex-wrap gap-10">
                            {error && (
                                <div className="w-full mb-4 animate-in fade-in slide-in-from-top-2 duration-300">
                                    <div
                                        className="bg-rose-500/10 border border-rose-500/50 rounded-xl px-4 py-2.5 flex items-center gap-3 shadow-[0_0_15px_rgba(244,63,94,0.2)]">
                                        <span className="text-rose-500 animate-pulse text-xs">⚠️</span>
                                        <span
                                            className="text-[10px] font-black text-rose-400 uppercase tracking-[0.1em]">
                                            System Alert // {error}
                                        </span>
                                    </div>
                                </div>
                            )}
                            {currentTask.markers?.length > 0 && (
                                <div className="space-y-3">
                                    <h4 className="text-sm font-black text-cyan-400 uppercase tracking-[0.2em] flex items-center gap-3"> Labels</h4>
                                    <div className="flex flex-wrap items-center gap-2">
                                        {currentTask.markers.map(m => (
                                            <span key={m.id}
                                                  className={`${m.color} px-3 py-2 rounded-xl text-[9px] font-black text-white shadow-[0_0_10px_rgba(255,255,255,0.1)] uppercase tracking-wider`}>
                                                {m.name}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {currentTask.executors?.length > 0 && (
                                <div className="space-y-3">
                                    <h4 className="text-sm font-black text-cyan-400 uppercase tracking-[0.2em] flex items-center gap-3">Members</h4>
                                    <div className="flex -space-x-2">
                                        {currentTask.executors.map(ex => (
                                            <div key={ex.id}
                                                 className="w-9 h-9 rounded-xl bg-cyan-950 border border-cyan-500/40 flex items-center justify-center text-cyan-400 text-xs font-black shadow-lg">
                                                {ex.email.charAt(0).toUpperCase()}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                            {/* Due Date Display */}
                            {currentTask.dueDate && (
                                <div className="space-y-3">
                                    <h4 className="text-sm font-black text-cyan-400 uppercase tracking-[0.2em] flex items-center gap-3">Deadline</h4>
                                    <div
                                        className="bg-white/5 border border-cyan-500/20 px-3 h-[33.5px] rounded-xl shadow-sm flex items-center gap-2 group transition-all">
                                        <span className="text-cyan-400 animate-twinkle">📅</span>
                                        <span
                                            className="text-cyan-100 text-[10px] font-black uppercase tracking-tighter">
                                            {new Date(currentTask.dueDate).toLocaleString('en-US', {
                                                day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'
                                            })}
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Description */}
                        <div className="space-y-3">
                            <h4 className="text-sm font-black text-cyan-400 uppercase tracking-[0.2em] flex items-center gap-3">
                                <span className="animate-flicker">›</span> Description
                            </h4>
                            <textarea
                                defaultValue={currentTask.description}
                                onBlur={(e) => {
                                    const val = e.target.value.trim();
                                    if (val !== currentTask.description) patchTask({description: val});
                                }}
                                className="w-full min-h-[120px] p-4 bg-black/40 focus:bg-black/40 rounded-2xl outline-none placeholder:text-white text-white text-sm leading-relaxed transition-all resize-none border border-cyan-500/20 focus:border-cyan-400 shadow-inner"
                                placeholder="Add a more detailed description..."
                            />
                        </div>

                        {/* TaskAttachments */}
                        <TaskAttachments
                            taskId={currentTask.id}
                            attachments={currentTask.attachments || []}
                        />


                        {/* CheckList */}
                        <TaskChecklist
                            items={currentTask.checklist || []}
                            onSync={syncChecklist}
                            isCreating={isCreatingChecklist}
                            onCloseCreating={() => setIsCreatingChecklist(false)}
                        />
                        <div className="pt-4">
                            <TaskComments taskId={currentTask.id}/>
                        </div>
                    </div>

                    {/* SideBar */}
                    <div className="flex flex-col">
                        <div className="bg-white/5 p-4 rounded-xl border border-cyan-500/20 space-y-6">
                            <TaskSidebar
                                task={currentTask}
                                isUpdating={isUpdating}
                                projectMembers={project?.projectTeam || []}
                                projectMarkers={project?.markers || []}
                                actions={{
                                    handleAddExecutor, handleAddMarker,
                                    handleCreateAndAddMarker, handleDeleteGlobalMarker, setIsCreatingChecklist,
                                    patchTask
                                }}
                            />
                        </div>

                        {/* Activity Footer — Unified Style */}
                        <div
                            className="mt-4 p-5 bg-white/5 rounded-2xl border group transition-all border-cyan-500/20 shadow-inner">
                            <p className="text-[9px] text-cyan-400 font-black uppercase tracking-[0.2em] mb-4 px-1 border-b border-white/5 pb-2">
                                HISTORY
                            </p>

                            <div className="flex flex-col gap-3 px-1">
                                {/* 1. Initialized (Верхній рядок) */}
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center gap-2">
                                        <div className="w-1 h-1 rounded-full bg-cyan-500/20"></div>
                                        <span
                                            className="text-[10px] font-black uppercase tracking-widest text-cyan-400">
                                            Initialized
                                        </span>
                                    </div>
                                    <span
                                        className="text-[10px] font-black uppercase tracking-tighter text-cyan-300">
                                        {currentTask.createdAt
                                            ? format(new Date(currentTask.createdAt), 'MMM d, yyyy')
                                            : '---'}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center gap-2">
                                        <div
                                            className="w-1 h-1 rounded-full bg-cyan-500/40 shadow-[0_0_8px_rgba(6,182,212,0.4)]"></div>
                                        <span
                                            className="text-[10px] font-black uppercase tracking-widest text-cyan-400">
                                            Last Update
                                        </span>
                                    </div>
                                    <span className="text-[10px] font-black uppercase tracking-tighter text-cyan-400">
                                        {currentTask.updatedAt
                                            ? formatDistanceToNow(new Date(currentTask.updatedAt), {addSuffix: true})
                                            : 'Just now'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
