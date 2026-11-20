import React, {useRef, useState} from "react";
import {useAppDispatch} from "../../../app/hooks";
import {uploadTaskAttachment} from "../slice/tasksSlice";
import type {Attachment, UpdateTaskDto} from "../types";
import {useTranslation} from "react-i18next";

interface AttachmentPickerProps {
    taskId: string;
    isUpdating: boolean;
    onClose: () => void;
    onPatchTask: (fields: Partial<UpdateTaskDto>) => void;
    currentAttachments: Attachment[];
}

export const AttachmentPicker = ({
                                     taskId,
                                     isUpdating,
                                     onClose,
                                     onPatchTask,
                                     currentAttachments,
                                 }: AttachmentPickerProps) => {
    const {t} = useTranslation();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const dispatch = useAppDispatch();
    const [linkInput, setLinkInput] = useState("");
    const [linkName, setLinkName] = useState("");

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            dispatch(uploadTaskAttachment({taskId, file}));
            if (fileInputRef.current) fileInputRef.current.value = "";
            onClose();
        }
    };

    const handleAttachLink = () => {
        const rawUrl = linkInput.trim();
        if (!rawUrl) return;

        let secureUrl = rawUrl;
        if (!/^https?:\/\//i.test(rawUrl)) {
            secureUrl = `https://${rawUrl}`;
        }

        const newLink: Attachment = {
            id: "",
            name: linkName.trim() || rawUrl,
            url: secureUrl,
            type: "LINK",
            createdAt: new Date().toISOString(),
        };

        onPatchTask({attachments: [...currentAttachments, newLink]});
        setLinkInput("");
        setLinkName("");
        onClose();
    };

    return (
        <div
            onClick={(e) => e.stopPropagation()}
            className="w-[300px] bg-white border-2 border-cyan-400 rounded-3xl shadow-2xl p-6 z- mt-2 relative md:absolute md:top-0 md:right-full md:mr-4 animate-in slide-in-from-right-4"
        >
            <div className="flex justify-between items-center mb-4 text-slate-800">
                <span className="text-[11px] font-black uppercase tracking-widest">
                    {t("attachmentPicker.title")}
                </span>
                <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
                    ✕
                </button>
            </div>

            <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isUpdating}
                className="w-full bg-[#f1f2f4] hover:bg-cyan-50 text-slate-600 text-[10px] font-black py-4 rounded-2xl mb-4 border-2 border-dashed border-slate-300 hover:border-cyan-400 transition-all uppercase"
            >
                {isUpdating ? t("attachmentPicker.uploading") : t("attachmentPicker.computerFile")}
            </button>

            <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileChange}/>

            <div className="space-y-4 text-left border-t border-slate-100 pt-4">
                <div className="space-y-1">
                    <label className="text-[9px] font-black text-slate-500 uppercase ml-1">
                        {t("attachmentPicker.attachLinkLabel")}
                    </label>
                    <input
                        type="text"
                        className="w-full bg-[#f1f2f4] border-2 border-transparent rounded-xl px-4 py-2.5 text-xs outline-none focus:bg-white focus:border-cyan-400 shadow-inner text-slate-800 font-bold"
                        placeholder={t("attachmentPicker.pasteLinkPlaceholder")}
                        value={linkInput}
                        onChange={(e) => setLinkInput(e.target.value)}
                    />
                </div>
                <div className="flex justify-end pt-2">
                    <button
                        onClick={handleAttachLink}
                        className="bg-cyan-500 text-white text-[10px] font-black px-6 py-2 rounded-xl shadow-lg uppercase hover:bg-cyan-400 transition-all"
                    >
                        {t("attachmentPicker.attachLinkBtn")}
                    </button>
                </div>
            </div>
        </div>
    );
};
