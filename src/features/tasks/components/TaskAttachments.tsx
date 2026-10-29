import type { Attachment } from '../types';
import { useAppDispatch } from '../../../app/hooks';
import {deleteTaskAttachment} from '../slice/tasksSlice';
import ConfirmModal from "../../../components/ui/ConfirmModal";
import {useState} from "react";

interface TaskAttachmentsProps {
    taskId: string;
    attachments: Attachment[];
}

const getFileIcon = (type: string) => {
    switch (type) {
        case 'IMAGE': return '🖼️';
        case 'PDF': return '📄';
        case 'DOC': return '🟦';
        case 'LINK': return '🔗';
        case 'VIDEO': return '🎬';
        default: return '📎';
    }
};

export const TaskAttachments = ({ taskId, attachments }: TaskAttachmentsProps) => {
   const dispatch = useAppDispatch();
    const [fileToDelete, setFileToDelete] = useState<Attachment | null>(null);

    const handleDeleteConfirm = () => {
        if (fileToDelete) {
            dispatch(deleteTaskAttachment({ taskId, attachmentId: fileToDelete.id }));
            setFileToDelete(null);
        }
    };
    const API_BASE = "/api/v1/attachments/download";
    const isExternal = (url: string) => url.startsWith('http');
    if (!attachments || attachments.length === 0) return null;

    return (
        <div className="space-y-4 pt-6 border-t border-slate-200/60">
            <div className="flex items-center justify-between px-1">
                <h4 className="text-sm font-black text-cyan-400 uppercase tracking-[0.2em] flex items-center gap-3">
                    <span className="text-lg">📎</span> Attachments
                </h4>
                <span className="text-[10px] font-bold text-cyan-400 bg-slate-200/50 px-2 py-0.5 rounded-full uppercase">
                    {attachments.length} files
                </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {attachments.map((file) => (
                    <div
                        key={file.id}
                        className="group relative flex items-center gap-3 p-3 bg-white/40 hover:bg-white rounded-2xl border border-transparent hover:border-cyan-200 hover:shadow-md transition-all duration-300 cursor-pointer overflow-hidden text-cyan-400"
                    >
                        <div className="w-12 h-12 shrink-0 rounded-xl bg-slate-200 flex items-center justify-center text-[10px] font-black text-cyan-400 uppercase shadow-inner group-hover:bg-cyan-100 group-hover:text-cyan-600 transition-colors">
                            {getFileIcon(file.type)}
                        </div>

                        <div className="flex flex-col min-w-0 flex-1">
                            <a
                                href={isExternal(file.url) ? file.url : `${API_BASE}${file.url}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[11px] font-black text-cyan-400 truncate hover:text-cyan-600 transition-colors underline-offset-2 hover:underline"
                            >
                                {file.name}
                            </a>
                            <div className="flex items-center gap-2 mt-1">
                                <span className="text-[9px] text-cyan-400 font-bold uppercase">
                                    {new Date(file.createdAt).toLocaleDateString()}
                                </span>
                                <span className="w-1 h-1 bg-slate-300 rounded-full" />
                                <span className="text-[9px] text-cyan-500 font-black uppercase tracking-tighter">
                                    {file.type}
                                </span>
                            </div>
                        </div>

                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                e.preventDefault();
                                setFileToDelete(file);
                            }}
                            className="..."
                        >
                            ✕
                        </button>

                        {fileToDelete && (
                            <ConfirmModal
                                title="Delete attachment?"
                                message={`Are you sure you want to delete "${fileToDelete.name}"? This action cannot be undone.`}
                                confirmText="Delete"
                                cancelText="Cancel"
                                onConfirm={handleDeleteConfirm}
                                onCancel={() => setFileToDelete(null)}
                            />
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};
