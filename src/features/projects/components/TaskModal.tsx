import { useEffect, useRef, useState, useCallback } from "react";

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
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [error, setError] = useState("");
    const titleRef = useRef<HTMLInputElement>(null);

    // Используем useCallback, чтобы handleClose не пересоздавалась
    const handleClose = useCallback(() => {
        setTitle("");
        setDescription("");
        setError("");
        onClose();  // на этом месте важно, чтобы onClose был в зависимостях
    }, [onClose]);  // onClose - зависимость, т.к. она приходит как пропс и может изменяться

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
            setError("Title is required.");
            return;
        }

        // Clear error and call onCreate
        setError("");
        onCreate(title, description);
        setTitle("");
        setDescription("");
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-96 text-black shadow-lg">
                <h2 className="text-lg font-semibold mb-4">Add Task to {statusName}</h2>
                <input
                    ref={titleRef}
                    type="text"
                    placeholder="Title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className={`w-full mb-1 border rounded px-2 py-1 ${
                        error ? "border-red-500" : "border-gray-300"
                    }`}
                />
                <textarea
                    placeholder="Description (optional, max 200 chars)"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className={`w-full mb-1 border rounded px-2 py-1 ${
                        error && description.length > 200 ? "border-red-500" : "border-gray-300"
                    }`}
                />
                {error && <p className="text-red-500 text-sm mb-3">{error}</p>}
                <div className="flex justify-end gap-2">
                    <button
                        onClick={handleClose}
                        className="px-3 py-1 rounded border hover:bg-gray-100 transition"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        className="px-3 py-1 rounded bg-blue-500 text-white hover:bg-blue-600 transition"
                    >
                        Create
                    </button>
                </div>
            </div>
        </div>
    );
}
