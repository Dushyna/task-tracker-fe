import type { CollaboratorDto } from "../types";

interface CollaboratorsListProps {
    collaborators: CollaboratorDto[];
    onInviteClick: () => void;
}

export const CollaboratorsList = ({ collaborators, onInviteClick }: CollaboratorsListProps) => {
    if (!collaborators) return null;
    return (
        <div className="flex items-center ml-4">
            {/* Группа аватарок с нахлестом */}
            <div className="flex items-center -space-x-2">
                {collaborators.map((member) => (
                    <div
                        key={member.userId}
                        title={`${member.email} (${member.roles?.join(", ") ?? "No roles"})`}                        className="w-9 h-9 rounded-full bg-indigo-500 border-2 border-slate-100 flex items-center justify-center text-sm font-medium text-white cursor-help hover:z-10 transition-all hover:scale-110 shadow-sm"
                    >
                        {member.email.charAt(0).toUpperCase()}
                    </div>
                ))}
            </div>

            {/* Кнопка "плюс" для вызова модалки */}
            <button
                onClick={onInviteClick}
                className="ml-3 w-9 h-9 rounded-full bg-slate-200 border-2 border-dashed border-slate-400 flex items-center justify-center text-slate-600 hover:bg-slate-300 hover:border-slate-500 transition-all shadow-sm"
                title="Invite new collaborator"
            >
                <svg
                    xmlns="http://www.w3.org"
                    fill="none" viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                    className="w-5 h-5"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
            </button>
        </div>
    );
};
