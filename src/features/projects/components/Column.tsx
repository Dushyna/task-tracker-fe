import {type KeyboardEvent, useEffect, useState} from 'react';
import { useDroppable } from "@dnd-kit/core";
import {clearStatusError, selectErrorMessage, updateTaskStatus,selectIsLoading as selectStatusLoading} from "../../statuses/slice/taskStatusSlice.ts";
import {useAppDispatch, useAppSelector} from "../../../app/hooks.ts";
import type {SortableColumnProps} from "./SortableColumn.tsx";
import NotificationModal from "../../../components/ui/NotificationModal.tsx";
import MainButton from "../../../components/ui/buttons/MainButton.tsx";

export function Column({ status,
                           allStatusNames,
                           children,
                           onAddTask,
                           onDelete,
                           canDelete,
                           dragAttributes,
                           dragListeners,
}: SortableColumnProps) {
    const { setNodeRef } = useDroppable({ id: status.id });
    const dispatch = useAppDispatch();
    const [isEditing, setIsEditing] = useState(false);
    const [newName, setNewName] = useState(status.name);
    const [validationError, setValidationError] = useState<{title: string, message: string} | null>(null);
    const serverError = useAppSelector(selectErrorMessage);
    const isStatusLoading = useAppSelector(selectStatusLoading);

    useEffect(() => {
        setNewName(status.name);
    }, [status.name]);

    const handleSave = () => {
        const trimmedName = newName.trim();

        if (!trimmedName) {
            setValidationError({
                title: "Empty Name",
                message: "The status name cannot be empty. Please enter at least one character."
            });
            setNewName(status.name);
            setIsEditing(false);
            return;
        }

        const isDuplicate = allStatusNames.some(
            (name) => name.toLowerCase() === trimmedName.toLowerCase() && name !== status.name
        );

        if (isDuplicate) {
            setValidationError({
                title: "Duplicate Status",
                message: `A column with the name "${trimmedName}" already exists on this board. Names must be unique.`
            });
            setNewName(status.name);
            setIsEditing(false);
            return;
        }

        if (trimmedName !== status.name) {
            dispatch(updateTaskStatus({ id: status.id, name: trimmedName }));
        }
        setIsEditing(false);
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") handleSave();
        if (e.key === "Escape") {
            setNewName(status.name);
            setIsEditing(false);
        }
    };



    return (
        <div ref={setNodeRef} className="flex flex-col bg-transparent rounded-2xl border-2 border-cyan-400/20 text-cyan-400 p-4 min-w-[320px] min-h-[500px] transition-all hover:border-cyan-400/40">
            <h2
                {...dragAttributes}
                {...dragListeners}
                className="text-lg font-semibold mb-3 flex justify-between items-center text-cyan-400 touch-none select-none cursor-grab active:cursor-grabbing">
                <div className="flex-1 mr-2 min-w-0">
                    {isEditing ? (
                        <input
                            autoFocus
                            className="w-full bg-black/40 border border-cyan-400 rounded px-2 py-1 text-sm outline-none shadow-[0_0_10px_rgba(6,182,212,0.2)]"
                            value={newName}
                            onChange={(e) => setNewName(e.target.value)}
                            onBlur={handleSave}
                            onKeyDown={handleKeyDown}
                        />
                    ) : (
                        <span
                            onClick={() => setIsEditing(true)}
                            className="cursor-pointer hover:text-cyan-300 transition-colors truncate block"
                            title="Click to edit name"
                        >
                {status.name}
            </span>
                    )}

                    {validationError && (
                        <NotificationModal
                            title={validationError.title}
                            message={validationError.message}
                            buttonText="Got it"
                            variant="error"
                            onClose={() => setValidationError(null)}
                        />
                    )}
                    {serverError && (
                        <NotificationModal
                            title="Access Denied"
                            message={serverError}
                            buttonText="Close"
                            onClose={() => dispatch(clearStatusError())}
                        />
                    )}
                </div>
                <div className="flex gap-2 shrink-0" onClick={(e) => e.stopPropagation()}>
                    <MainButton onClick={onAddTask}>New Task</MainButton>
                    {canDelete && onDelete && (
                        <button
                            onClick={onDelete}
                            disabled={isStatusLoading}
                            title="Delete column"
                            className={`p-2 rounded-lg transition-all flex items-center justify-center
            ${isStatusLoading ? 'text-rose-500 bg-rose-500/10' : 'text-slate-500 hover:text-rose-500 hover:bg-rose-500/10'}`}
                        >
                            {isStatusLoading ? (
                                /* Spinner */
                                <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                            ) : (
                                <svg xmlns="http://www.w3.org" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                                </svg>
                            )}
                        </button>
                    )}
                </div>
            </h2>
            <div className={"flex-grow"}>
            {children}
            </div>
        </div>
    );
}

