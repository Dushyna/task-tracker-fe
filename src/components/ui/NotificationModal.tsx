import NeonButton from "./buttons/NeonButton.tsx";
import { useTranslation } from "react-i18next";

type NotificationModalProps = {
    title?: string;
    message: string;
    buttonText?: string;
    onClose: () => void;
    variant?: "error" | "info";
};

const NotificationModal = ({
                               title,
                               message,
                               buttonText,
                               onClose,
                               variant = "error"
                           }: NotificationModalProps) => {
    const { t } = useTranslation();
    const resolvedTitle = title ?? t("notificationModal.defaultTitle");
    const resolvedButtonText = buttonText ?? t("notificationModal.defaultButton");

    const colorClass = variant === "error" ? "text-rose-500 border-rose-500/30" : "text-cyan-400 border-cyan-400/30";

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
            <div className={`w-full max-w-md rounded-2xl border bg-black p-8 shadow-2xl ${colorClass}`}>
                <h2 className={`mb-4 text-xl font-black uppercase tracking-tighter ${variant === "error" ? "text-rose-500" : "text-cyan-300"}`}>
                    {resolvedTitle}
                </h2>

                <p className="mb-8 text-sm text-slate-400 leading-relaxed uppercase tracking-tight">
                    {message}
                </p>

                <div className="flex justify-end">
                    <NeonButton
                        size="md"
                        variant="primary"
                        onClick={onClose}
                        className={variant === "error" ? "border-rose-500 text-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.3)]" : ""}
                    >
                        {resolvedButtonText}
                    </NeonButton>
                </div>
            </div>
        </div>
    );
};

export default NotificationModal;
