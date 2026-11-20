import i18n from "i18next";
import type {ProjectLogAction} from "../../types";

export const getLogMessage = (
    action: ProjectLogAction,
    entity: "Task" | "Status",
    entityName: string,
    userEmail: string,
    userFirstName?: string,
    userLastName?: string,
    difference?: string
) => {
    const fullName = [userFirstName, userLastName].filter(Boolean).join(" ");
    const displayUser = fullName ? `${fullName} (${userEmail})` : userEmail;
    const translatedEntity =
        entity === "Task"
            ? i18n.t("projectLogs.entities.task")
            : i18n.t("projectLogs.entities.status");

    let verb = "";
    let restText = "";
    let verbColor = "text-white";

    switch (action) {
        case "CREATE":
            verb = i18n.t("projectLogs.verbs.created");
            verbColor = "text-green-500";
            restText = ` ${i18n.t("projectLogs.createDeleteRest", {
                entity: translatedEntity,
                name: entityName,
                diff: formatCreateDeleteDiff(difference),
            })}`.trimEnd();
            break;

        case "DELETE":
            verb = i18n.t("projectLogs.verbs.deleted");
            verbColor = "text-red-500";
            restText = ` ${i18n.t("projectLogs.createDeleteRest", {
                entity: translatedEntity,
                name: entityName,
                diff: formatCreateDeleteDiff(difference),
            })}`.trimEnd();
            break;

        case "MOVE":
            verb = i18n.t("projectLogs.verbs.moved");
            verbColor = "text-purple-500";
            restText = ` ${i18n.t("projectLogs.moveRest", {
                entity: translatedEntity,
                name: entityName,
                diff: formatMoveDiff(difference),
            })}`;
            break;

        case "MARKERS":
            if (difference?.startsWith("markerAdded=")) {
                verb = i18n.t("projectLogs.verbs.added");
                verbColor = "text-green-500";
            } else if (difference?.startsWith("markerRemoved=")) {
                verb = i18n.t("projectLogs.verbs.removed");
                verbColor = "text-red-500";
            }
            restText = ` ${i18n.t("projectLogs.markerRest", {
                marker: difference?.replace(/markerAdded=|markerRemoved=/, "") ?? "",
                entity: translatedEntity,
                name: entityName,
            })}`;
            break;

        case "TITLE":
            verb = i18n.t("projectLogs.verbs.changed");
            verbColor = "text-yellow-400";
            restText = ` ${i18n.t("projectLogs.titleRest", {
                entity: translatedEntity,
                diff: formatTitleDiff(difference),
            })}`;
            break;

        case "DESCRIPTION":
            verb = i18n.t("projectLogs.verbs.changed");
            verbColor = "text-yellow-400";
            restText = ` ${i18n.t("projectLogs.descriptionRest", {
                entity: translatedEntity,
                name: entityName,
                diff: formatDescriptionDiff(difference),
            })}`;
            break;

        case "DUE_DATE":
            return (
                <>
                    <span className="font-medium">{displayUser}</span>{" "}
                    {formatDueDateDiff(difference, translatedEntity, entityName)}
                </>
            );

        default:
            verb = action;
            restText = "";
    }

    return (
        <>
            <span className="font-medium">{displayUser}</span>{" "}
            <span className={`${verbColor} font-semibold`}>{verb}</span>
            <span className="text-cyan-400">{restText}</span>
        </>
    );
};

function formatDate(iso: string) {
    const date = new Date(iso);
    const locale = i18n.resolvedLanguage === "de" ? "de-DE" : "en-US";
    return date.toLocaleString(locale, {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}

function formatMoveDiff(diff?: string) {
    if (!diff) return "";
    const from = diff.match(/fromStatus=([^,]+)/)?.[1] ?? "";
    const to = diff.match(/toStatus=(.+)/)?.[1] ?? "";
    return i18n.t("projectLogs.fromTo", {from, to});
}

function formatTitleDiff(diff?: string) {
    if (!diff) return "";
    const oldTitle = diff.match(/oldTitle=([^,]+)/)?.[1] ?? "";
    const newTitle = diff.match(/newTitle=([^,]+)/)?.[1] ?? "";
    return i18n.t("projectLogs.titleDiff", {oldTitle, newTitle});
}

function formatDescriptionDiff(diff?: string) {
    if (!diff) return "";
    const oldDesc = diff.match(/oldDescription=([^,]+)/)?.[1] ?? "";
    const newDesc = diff.match(/newDescription=([^,]+)/)?.[1] ?? "";
    return i18n.t("projectLogs.descriptionDiff", {oldDesc, newDesc});
}

function formatDueDateDiff(diff?: string, translatedEntity?: string, entityName?: string) {
    if (!diff) return null;

    if (diff.startsWith("dueDateAdded=")) {
        const dateStr = diff.replace("dueDateAdded=", "");
        return (
            <>
                <span className="text-green-500 font-semibold">{i18n.t("projectLogs.verbs.set")}</span>
                <span className="text-cyan-300">
                    {" "}
                    {i18n.t("projectLogs.deadlineAdded", {
                        entity: translatedEntity,
                        name: entityName,
                        date: formatDate(dateStr),
                    })}
                </span>
            </>
        );
    }

    if (diff.startsWith("dueDateRemoved=")) {
        const dateStr = diff.replace("dueDateRemoved=", "");
        return (
            <>
                <span className="text-red-500 font-semibold">{i18n.t("projectLogs.verbs.removed")}</span>
                <span className="text-cyan-300">
                    {" "}
                    {i18n.t("projectLogs.deadlineRemoved", {
                        entity: translatedEntity,
                        name: entityName,
                        date: formatDate(dateStr),
                    })}
                </span>
            </>
        );
    }

    if (diff.startsWith("dueDateChanged=")) {
        const [from, to] = diff.replace("dueDateChanged=", "").split("->");
        return (
            <>
                <span className="text-yellow-400 font-semibold">{i18n.t("projectLogs.verbs.changed")}</span>
                <span className="text-cyan-300">
                    {" "}
                    {i18n.t("projectLogs.deadlineChanged", {
                        entity: translatedEntity,
                        name: entityName,
                        from: formatDate(from),
                        to: formatDate(to),
                    })}
                </span>
            </>
        );
    }

    return <span className="text-cyan-300">{diff}</span>;
}

function formatCreateDeleteDiff(diff?: string) {
    if (!diff) return "";

    if (diff.startsWith("createdIn=") || diff.startsWith("deletedFrom=")) {
        const status = diff.split("=")[1];
        return i18n.t("projectLogs.inStatus", {status});
    }

    return "";
}
