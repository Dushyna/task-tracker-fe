import React, {useEffect} from "react";
import {useAppDispatch, useAppSelector} from "../../../../app/hooks.ts";
import {selectCurrentProjectLogs, getProjectLogs} from "../../slice/projectsSlice.ts";
import ProjectLogItem from "./ProjectLogItem.tsx";
import PulsedStripe from "../../../../components/ui/PulsedStripe.tsx";
import {useTranslation} from "react-i18next";

interface ProjectLogsModalProps {
    isOpen: boolean;
    onClose: () => void;
    projectId: string;
}

export const ProjectLogModal: React.FC<ProjectLogsModalProps> = ({isOpen, onClose, projectId}) => {
    const dispatch = useAppDispatch();
    const {t} = useTranslation();
    const logs = useAppSelector(selectCurrentProjectLogs);

    useEffect(() => {
        if (isOpen) {
            dispatch(getProjectLogs(projectId));
        }
    }, [isOpen, projectId, dispatch]);

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
            onClick={onClose}
        >
            <div
                className="bg-slate-900 w-full max-w-5xl rounded-xl shadow-xl overflow-hidden border border-cyan-500/20 hover:border-cyan-500/40"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="relative w-full">
                    <div
                        className="absolute w-full h-full bg-gradient-to-r from-slate-900 via-cyan-950 to-slate-900"></div>
                    <div className="flex relative h-20 items-center justify-center">
                        <h2 className="text-xl font-bold text-white text-neon-strong uppercase">
                            {t("projectLogs.modalTitle")}
                        </h2>
                    </div>
                    <PulsedStripe height="2px"></PulsedStripe>
                </div>

                <div className="max-h-[60vh] overflow-y-auto px-6 py-4 space-y-2">
                    {logs.length === 0 ? (
                        <div className="text-cyan-500 text-sm">{t("projectLogs.noLogs")}</div>
                    ) : (
                        logs.map((log, index) => (
                            <ProjectLogItem key={`${log.createdAt}-${index}`} log={log}/>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};
