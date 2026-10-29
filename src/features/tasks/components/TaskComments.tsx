import React, {useState} from 'react';
import {useAppDispatch, useAppSelector} from '../../../app/hooks';
import {addComment, selectComments, deleteComment, updateComment, clearTaskError} from '../slice/tasksSlice';
import NeonButton from '../../../components/ui/buttons/NeonButton.tsx';
import {format} from 'date-fns';
import { enUS } from 'date-fns/locale';
import ConfirmModal from "../../../components/ui/ConfirmModal.tsx";
import NotificationModal from "../../../components/ui/NotificationModal.tsx";

interface TaskCommentsProps {
    taskId: string;
}

export const TaskComments: React.FC<TaskCommentsProps> = ({taskId}) => {
    const [text, setText] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const dispatch = useAppDispatch();
    const comments = useAppSelector(selectComments);
    const [commentToDelete, setCommentToDelete] = useState<string | null>(null);
    const isLoading = useAppSelector(state => state.tasks.isLoading);
    const serverError = useAppSelector(state => state.tasks.createTaskErrorMessage);
    const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
    const [editText, setEditText] = useState('');

    const handleSaveEdit = async (commentId: string) => {
        if (!editText.trim()) return;

        dispatch(clearTaskError());

        try {
            await dispatch(updateComment({ taskId, commentId, text: editText.trim() })).unwrap();

            setEditingCommentId(null);
            setEditText('');
        } catch (err) {
            console.error("Update failed:", err);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!text.trim() || isSubmitting) return;

        setIsSubmitting(true);
        try {
            await dispatch(addComment({taskId, text: text.trim()})).unwrap();
            setText('');
        } catch (error) {
            console.error("Failed to add comment:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="mt-8 border-t border-cyan-500/20 pt-6">
            <h4 className="mb-3 text-sm font-black text-cyan-400 uppercase tracking-[0.2em] flex items-center gap-3">
                <svg xmlns="http://www.w3.org" className="h-4 w-4" fill="none" viewBox="0 0 24 24"
                     stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
                </svg>
                Discussion
            </h4>

            {/* Input Form */}
            <form onSubmit={handleSubmit} className="mb-6">
                <textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Write a comment..."
                    className="w-full bg-black/40 border border-cyan-500/30 rounded-xl p-3 text-sm placeholder:text-white text-white outline-none focus:border-cyan-400 focus:shadow-[0_0_10px_rgba(6,182,212,0.2)] transition-all min-h-[80px] resize-none"
                />
                <div className="flex justify-end mt-2">
                    <NeonButton
                        size="sm"
                        variant="primary"
                        type="submit"
                        disabled={!text.trim() || isSubmitting}
                    >
<span className={isSubmitting ? "text-slate-400" : "text-cyan-400 font-black"}>
        {isSubmitting ? 'Sending...' : 'Post Comment'}
    </span>
                    </NeonButton>
                </div>
            </form>

            {/* Comments List */}
            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                {comments.length === 0 ? (
                    <p className="text-xs text-cyan-400 italic uppercase tracking-tighter">
                        No comments yet. Be the first to start the discussion!
                    </p>
                ) : (
                    comments.map((comment) => (
                        <div key={comment.id} className="flex gap-3 group relative">
                            <div className="flex-shrink-0">
                                {comment.authorAvatarUrl ? (
                                    <img src={`${comment.authorAvatarUrl}`}
                                         alt={comment.authorName}
                                         className="h-8 w-8 rounded-lg border border-cyan-500/30 shadow-[0_0_5px_rgba(6,182,212,0.2)]"/>
                                ) : (
                                    <div className="h-8 w-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 font-bold text-xs">
                                        {comment.authorName.charAt(0).toUpperCase()}
                                    </div>
                                )}
                            </div>

                            <div className="flex-1 min-w-0">
                                <div className="flex items-baseline justify-between gap-2 mb-1">
                                    <span className="text-xs font-bold text-cyan-400 truncate">{comment.authorName}</span>
                                    <span className="text-[10px] text-cyan-400 whitespace-nowrap mr-8"> {/* Додав mr-8, щоб текст не налізав на кнопку */}
                                        {format(new Date(comment.createdAt), 'MMM d, HH:mm', { locale: enUS })}
                        </span>
                                </div>

                                <div className="bg-white/5 rounded-2xl rounded-tl-none p-3 border border-white/5 group-hover:border-cyan-500/20 transition-all relative">
                                    {editingCommentId === comment.id ? (
                                        <div className="space-y-2">
                        <textarea
                            autoFocus
                            value={editText}
                            onChange={(e) => setEditText(e.target.value)}
                            className="w-full bg-black/40 border border-cyan-500/40 rounded-xl p-2 text-sm text-white outline-none focus:border-cyan-400 min-h-[60px] resize-none"
                        />
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={() => setEditingCommentId(null)}
                                                    className="text-[9px] font-black text-slate-500 uppercase hover:text-white transition-colors"
                                                >
                                                    Cancel
                                                </button>
                                                <button
                                                    onClick={() => handleSaveEdit(comment.id)}
                                                    className="text-[9px] font-black text-cyan-400 uppercase hover:text-cyan-300 transition-colors"
                                                >
                                                    Save Changes
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <>
                                            <p className="text-sm text-white leading-relaxed pr-10">{comment.text}</p>

                                            <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">

                                                <button
                                                    onClick={() => {
                                                        setEditingCommentId(comment.id);
                                                        setEditText(comment.text);
                                                    }}
                                                    className="p-1.5 text-slate-500 hover:text-cyan-400 hover:bg-cyan-400/10 rounded-lg transition-all"
                                                    title="Edit comment"
                                                >
                                                    <svg xmlns="http://www.w3.org" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125" />
                                                    </svg>
                                                </button>

                                                <button
                                                    onClick={() => setCommentToDelete(comment.id)}
                                                    className="p-1.5 text-slate-500 hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition-all"
                                                    title="Delete comment"
                                                >
                                                    <svg xmlns="http://www.w3.org" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                                                    </svg>
                                                </button>
                                            </div>
                                        </>
                                    )}                                </div>
                            </div>
                        </div>
                    ))
                )}

                {commentToDelete && (
                    <ConfirmModal
                        title="Delete comment?"
                        message="Are you sure you want to remove this message? This action is permanent."
                        confirmText="Delete"
                        cancelText="Cancel"
                        isLoading={isLoading}
                        onConfirm={async () => {
                            dispatch(clearTaskError());

                            try {
                                await dispatch(deleteComment({ taskId, commentId: commentToDelete })).unwrap();
                                setCommentToDelete(null);
                            } catch (err) {
                                setCommentToDelete(null);

                                console.error("Delete failed:", err);
                            }
                        }}                        onCancel={() => setCommentToDelete(null)}
                    />
                )}

                {serverError  && (
                    <NotificationModal
                        title="ACCESS_DENIED"
                        message={serverError}
                        buttonText="Cancel"
                        variant="error"
                        onClose={() => dispatch(clearTaskError())}
                    />
                )}

            </div>
        </div>
    );
};
