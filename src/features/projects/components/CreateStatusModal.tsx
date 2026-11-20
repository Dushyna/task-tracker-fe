import {useEffect, useRef, useState} from "react";
import {useAppSelector} from "../../../app/hooks";
import {selectIsLoading} from "../../statuses/slice/taskStatusSlice";
import {useTranslation} from "react-i18next";

type Props = {
    isOpen: boolean;
    onClose: () => void;
    onCreate: (name: string, position: number) => void;
    maxPosition: number;
};

export function CreateStatusModal({
                                      isOpen,
                                      onClose,
                                      onCreate,
                                      maxPosition,
                                  }: Props) {
    const {t} = useTranslation();
    const [name, setName] = useState("");
    const [position, setPosition] = useState(maxPosition);
    const inputRef = useRef<HTMLInputElement>(null);
    const isLoading = useAppSelector(selectIsLoading);

    useEffect(() => {
        if (isOpen) {
            setPosition(maxPosition);
            inputRef.current?.focus();
        }
    }, [isOpen, maxPosition]);

    if (!isOpen) return null;

    const handleSubmit = () => {
        if (!name.trim()) return;
        onCreate(name.trim(), position);
        setName("");
    };

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-96 text-black">
                <h2 className="text-lg font-semibold mb-4">
                    {t("createStatusModal.title")}
                </h2>

                <input
                    ref={inputRef}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={t("createStatusModal.placeholder")}
                    className="w-full border rounded px-3 py-2 mb-3"
                />

                <label className="block text-sm text-gray-600 mb-1">
                    {t("createStatusModal.positionLabel", {max: maxPosition})}
                </label>

                <input
                    type="number"
                    min={0}
                    max={maxPosition}
                    value={position}
                    onChange={(e) => setPosition(Number(e.target.value))}
                    className="w-full border rounded px-3 py-2 mb-4"
                />

                <div className="flex justify-end gap-2">
                    <button
                        onClick={onClose}
                        disabled={isLoading}
                        className="px-3 py-1.5 border rounded"
                    >
                        {t("createStatusModal.cancel")}
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={isLoading || !name.trim()}
                        className={`px-3 py-1.5 bg-cyan-400 text-white rounded flex items-center justify-center gap-2 transition-all ${
                            isLoading ? "opacity-70 cursor-not-allowed" : "hover:bg-cyan-500"
                        }`}
                    >
                        {isLoading ? (
                            <>
                                {/* Spinner */}
                                <svg
                                    className="animate-spin h-4 w-4 text-white"
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                >
                                    <circle
                                        className="opacity-25"
                                        cx="12"
                                        cy="12"
                                        r="10"
                                        stroke="currentColor"
                                        strokeWidth="4"
                                    ></circle>
                                    <path
                                        className="opacity-75"
                                        fill="currentColor"
                                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                    ></path>
                                </svg>
                                <span>{t("createStatusModal.creating")}</span>
                            </>
                        ) : (
                            t("createStatusModal.create")
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
