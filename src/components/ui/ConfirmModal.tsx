import NeonButton from "./buttons/NeonButton.tsx";
import {createPortal} from 'react-dom';
import {useTranslation} from "react-i18next";


type ConfirmModalProps = {
    title?: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    onConfirm: () => void;
    onCancel: () => void;
    isLoading?: boolean;
};


const ConfirmModal = ({
                          title,
                          message,
                          confirmText,
                          cancelText,
                          onConfirm,
                          onCancel,
                          isLoading = false,
                      }: ConfirmModalProps) => {
    const {t} = useTranslation();

    const resolvedTitle = title ?? t("confirmModal.defaultTitle");
    const resolvedConfirmText = confirmText ?? t("confirmModal.defaultConfirm");
    const resolvedCancelText = cancelText ?? t("confirmModal.defaultCancel");

    const modalContent = (
        <div className="fixed inset-0 z-[200] flex items-center justify-center animate-in fade-in duration-300">
            <div className="absolute inset-0 bg-transparent" onClick={onCancel}/>

            <div
                className="relative w-full max-w-md rounded-xl border border-cyan-400/30 bg-black p-6 shadow-[0_0_20px_rgba(34,211,238,0.2)] animate-in zoom-in-95 duration-200">
                <h2 className="mb-2 text-lg font-bold uppercase tracking-tighter text-cyan-300 shadow-cyan-500/50">
                    {resolvedTitle}
                </h2>

                <p className="mb-6 text-sm text-gray-400 uppercase tracking-tight leading-relaxed">
                    {message}
                </p>

                <div className="flex justify-end gap-3">
                    <NeonButton
                        size="sm"
                        variant="primary"
                        onClick={onCancel}
                        disabled={isLoading}
                    >
                        {resolvedCancelText}
                    </NeonButton>

                    <NeonButton
                        size="sm"
                        variant="warning"
                        onClick={onConfirm}
                        disabled={isLoading}
                        className="border-rose-500 text-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.2)] flex items-center justify-center gap-2"
                    >
                        {isLoading ? (
                            <>
                                <svg className="animate-spin h-3 w-3 text-rose-500" xmlns="http://www.w3.org"
                                     fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor"
                                            strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor"
                                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                <span>{t("confirmModal.processing")}</span>
                            </>
                        ) : (
                            resolvedConfirmText
                        )}
                    </NeonButton>
                </div>
            </div>
        </div>
    );
    return createPortal(modalContent, document.body);
};

export default ConfirmModal;
