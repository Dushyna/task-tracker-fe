import {getLogMessage} from "./projectLogFormatter.tsx";
import type {ProjectLog} from "../../types";


interface ProjectLogsItemProps {
    log: ProjectLog;
}

const ProjectLogItem = ({log}: ProjectLogsItemProps) => {
    return (
        <div className="bg-slate-800 rounded-md p-3 flex justify-between items-center gap-4 text-sm text-white hover:bg-slate-600/60 transition-colors">
            <div className="flex items-center gap-2">
                {log.userAvatar ? (
                    <img
                        src={`${log.userAvatar}`}
                        alt="avatar"
                        className="h-7 w-7 rounded-full object-cover"
                    />
                ) : (
                    <div className="h-7 w-7 rounded-full bg-cyan-400 flex items-center justify-center text-white font-semibold">
                        {log.userEmail.charAt(0).toUpperCase()}
                    </div>
                )}
                <span className="font-medium">
                    {getLogMessage(
                        log.action,
                        log.entity,
                        log.entityName,
                        log.userEmail,
                        log.userFirstName,
                        log.userLastName,
                        log.difference
                    )}
                </span>
            </div>
                <div className="text-xs text-cyan-500 whitespace-nowrap">
                    {new Date(log.createdAt).toLocaleString()}
                </div>
        </div>
    );
};

export default ProjectLogItem;