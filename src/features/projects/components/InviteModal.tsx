import {useState} from "react";
import type {InviteModalProps, ProjectRole} from "../types";
import {useTranslation} from "react-i18next";

export function InviteModal({isOpen, onClose, onInvite, error}: InviteModalProps) {
    const {t} = useTranslation();
    const [email, setEmail] = useState("");
    const [role, setRole] = useState<ProjectRole>("MEMBER");

    if (!isOpen) return null;

    const handleInviteClick = () => {
        if (email.trim()) {
            onInvite(email, role);
            setEmail("");
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[100]">
            <div className="bg-white p-6 rounded-lg shadow-xl w-96 text-black">
                <h2 className="text-xl font-bold mb-4">
                    {t("inviteModal.title")}
                </h2>

                <input
                    type="email"
                    placeholder={t("inviteModal.emailPlaceholder")}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full border p-2 rounded mb-4 focus:ring-2 focus:ring-cyan-400 outline-none"
                />

                <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as ProjectRole)}
                    className="w-full border p-2 rounded mb-4"
                >
                    <option value="MEMBER">{t("inviteModal.roles.member")}</option>
                    <option value="ADMIN">{t("inviteModal.roles.admin")}</option>
                    <option value="VIEWER">{t("inviteModal.roles.viewer")}</option>
                </select>

                {error && <p className="text-red-500 text-sm mb-4 font-medium">{error}</p>}

                <div className="flex justify-end gap-2">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 border rounded hover:bg-gray-100 transition-colors"
                    >
                        {t("inviteModal.cancel")}
                    </button>
                    <button
                        type="button"
                        onClick={handleInviteClick}
                        className="px-4 py-2 bg-cyan-400 text-white rounded hover:bg-cyan-500 transition-colors"
                    >
                        {t("inviteModal.invite")}
                    </button>
                </div>
            </div>
        </div>
    );
}
