import { useState } from "react";
import type {InviteModalProps, ProjectRole} from "../types";

export function InviteModal({ isOpen, onClose, onInvite, error }: InviteModalProps) {
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
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100]">
            <div className="bg-white p-6 rounded-lg shadow-xl w-96 text-black">
                <h2 className="text-xl font-bold mb-4">Invite Collaborator</h2>

                <input
                    type="email"
                    placeholder="User email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full border p-2 rounded mb-4 focus:ring-2 focus:ring-blue-500 outline-none"
                />

                <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as ProjectRole)}
                    className="w-full border p-2 rounded mb-4"
                >
                    <option value="MEMBER">Member</option>
                    <option value="ADMIN">Admin</option>
                    <option value="VIEWER">Viewer</option>
                </select>

                {error && <p className="text-red-500 text-sm mb-4 font-medium">{error}</p>}

                <div className="flex justify-end gap-2">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 border rounded hover:bg-gray-100 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={handleInviteClick}
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                    >
                        Invite
                    </button>
                </div>
            </div>
        </div>
    );
}
