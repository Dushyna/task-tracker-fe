import {useEffect, useRef, useState, useCallback} from "react";
import {useAppSelector} from "../../../app/hooks";
import {selectIsLoading} from "../../tasks/slice/tasksSlice";
import {useTranslation} from "react-i18next";

export function TaskModal({
                              isOpen,
                              onClose,
                              onCreate,
                              statusName,
                          }: {
    isOpen: boolean;
    onClose: () => void;
    onCreate: (title: string, description: string) => void;
    statusName: string;
}) {
    const {t} = useTranslation();
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [error, setError] = useState("");
    const titleRef = useRef<HTMLInputElement>(null);
    const isLoading = useAppSelector(selectIsLoading);

    // Используем useCallback, чтобы handleClose не пересоздавалась
    const handleClose = useCallback(() => {
        setTitle("");
        setDescription("");
        setError("");
        onClose();
    }, [onClose]);

    // Focus on title input when modal opens
    useEffect(() => {
        if (isOpen && titleRef.current) {
            titleRef.current.focus();
        }
    }, [isOpen]);

    // Close modal on Esc
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                handleClose();
            }
        };
        document.addEventListener("keydown", handleEsc);
        return () => document.removeEventListener("keydown", handleEsc);
    }, [handleClose]);  // handleClose в зависимостях, чтобы использовать актуальную версию

    if (!isOpen) return null;

    const handleSubmit = () => {

        if (title.trim() === "") {
            setError(t("taskModal.titleRequired"));
            return;
        }

        // Clear error and call onCreate
        setError("");
        onCreate(title, description);
        setTitle("");
        setDescription("");
    };

    return (
        <div className="fixed inset-0 bg-black/60 bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-96 text-black shadow-lg">
                <h2 className="text-lg font-semibold mb-4">{t("taskModal.heading", {statusName})}</h2>
                <input
                    ref={titleRef}
                    type="text"
                    placeholder={t("taskModal.titlePlaceholder")}
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className={`w-full px-2 py-1 text-sm text-[#0f172a] font-bold focus:outline-none bg-transparent placeholder:text-slate-400 ${
                        error ? "border-red-500" : "border-gray-300"
                    }`}
                />
                <textarea
                    placeholder={t("taskModal.descriptionPlaceholder")}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className={`w-full px-2 py-1 text-sm text-[#0f172a] font-bold focus:outline-none bg-transparent placeholder:text-slate-400 ${
                        error && description.length > 200 ? "border-red-500" : "border-gray-300"
                    }`}
                />
                {error && <p className="text-red-500 text-sm mb-3">{error}</p>}
                <div className="flex justify-end gap-2">
                    <button
                        onClick={handleClose}
                        disabled={isLoading}
                        className="px-3 py-1 rounded border hover:bg-gray-100 transition"
                    >
                        {t("taskModal.cancel")}
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={isLoading}
                        className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-cyan-500 to-cyan-400 text-white text-xs font-black rounded-lg shadow-[0_4px_15px_rgba(6,182,212,0.4)] hover:brightness-110 transition-all uppercase ${
                            isLoading ? "opacity-70 cursor-not-allowed" : ""
                        }`}
                    >
                        {isLoading ? (
                            <>
                                {/* Spinner */}
                                <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org" fill="none"
                                     viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor"
                                            strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor"
                                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                <span>{t("taskModal.creating")}</span>
                            </>
                        ) : (
                            t("taskModal.create")
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
