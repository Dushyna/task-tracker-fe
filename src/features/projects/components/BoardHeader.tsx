import {CollaboratorsList} from "./CollaboratorsList.tsx";
import type {CollaboratorDto} from "../types";
import type {MarkerDto} from "../../tasks/types";
import {useTranslation} from "react-i18next";

interface BoardHeaderProps {
    title: string | undefined;
    onAddStatus: () => void;
    onAddCollab: () => void;
    onOpenLogs?: () => void;
    collaborators: CollaboratorDto[] | undefined;
    searchQuery: string;
    onSearchChange: (value: string) => void;
    selectedMarkerId: string | null;
    projectMarkers: MarkerDto[];
    onMarkerClick: (id: string | null) => void;
}

export const BoardHeader = ({
                                title,
                                onAddStatus,
                                onAddCollab,
                                onOpenLogs,
                                collaborators,
                                searchQuery,
                                onSearchChange,
                                selectedMarkerId,
                                projectMarkers,
                                onMarkerClick,
                            }: BoardHeaderProps) => {
    const {t} = useTranslation();

    return (
        <div className="flex items-center gap-4 mb-8 text-cyan-400">
            <h1 className="text-2xl font-black uppercase tracking-tighter text-white">
                {title ?? t("boardHeader.loading")}
            </h1>

            <div className="flex gap-2 ml-4">
                <button
                    onClick={onAddStatus}
                    className="px-4 py-2 bg-white/5 backdrop-blur-md rounded-xl border border-cyan-400/30 text-[10px] font-black uppercase hover:bg-cyan-400/10 hover:border-cyan-400 transition-all"
                >
                    {t("boardHeader.addStatus")}
                </button>
                <button
                    onClick={onAddCollab}
                    className="px-4 py-2 bg-white/5 backdrop-blur-md rounded-xl border border-cyan-400/30 text-[10px] font-black uppercase hover:bg-cyan-400/10 hover:border-cyan-400 transition-all"
                >
                    {t("boardHeader.inviteUser")}
                </button>

                <button
                    className="px-4 py-2 bg-white/5 backdrop-blur-md rounded-xl border border-cyan-400/30 text-[10px] font-black uppercase hover:bg-cyan-400/10 hover:border-cyan-400 transition-all"
                    onClick={onOpenLogs}
                >
                    {t("boardHeader.projectLogs")}
                </button>
            </div>

            <div className="relative group flex-1 max-w-md mx-6">
                <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                    <span className="text-cyan-500/50 text-xs animate-twinkle">🔍</span>
                </div>
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => onSearchChange(e.target.value)}
                    placeholder={t("boardHeader.searchPlaceholder")}
                    className="w-full bg-black/40 border border-cyan-400/30 rounded-xl py-2 pl-10 pr-4 text-[10px] font-black text-cyan-100 placeholder:text-cyan-400 outline-none focus:border-cyan-400 focus:shadow-[0_0_15px_rgba(6,182,212,0.15)] transition-all uppercase tracking-widest"
                />
                {searchQuery && (
                    <button
                        onClick={() => onSearchChange("")}
                        className="absolute inset-y-0 right-3 flex items-center text-slate-500 hover:text-rose-400 transition-colors"
                    >
                        ✕
                    </button>
                )}
            </div>

            <div className="flex gap-1.5 items-center px-4 border-l border-white/10 ml-2">
                {projectMarkers.map((marker) => (
                    <button
                        key={marker.id}
                        onClick={() => onMarkerClick(marker.id)}
                        title={marker.name}
                        className={`w-5 h-5 rounded-md border-2 transition-all hover:scale-110 ${marker.color} ${
                            selectedMarkerId === marker.id
                                ? "border-white shadow-[0_0_12px_rgba(34,211,238,0.4)] scale-110"
                                : "border-transparent opacity-40 hover:opacity-100"
                        }`}
                    />
                ))}
                {selectedMarkerId && (
                    <button
                        onClick={() => onMarkerClick(null)}
                        className="text-[10px] text-rose-500 font-black uppercase ml-2 hover:text-rose-400 transition-colors"
                    >
                        {t("boardHeader.resetFilter")}
                    </button>
                )}
            </div>

            {collaborators && (
                <div className="ml-auto">
                    <CollaboratorsList
                        collaborators={collaborators}
                        onInviteClick={onAddCollab}
                    />
                </div>
            )}
        </div>
    );
};
