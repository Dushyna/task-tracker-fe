import { isAxiosError } from "axios";
import i18n from "i18next";

const BACKEND_ERROR_MAP: Record<string, string> = {
    // Auth & Security
    "Invalid username or password.": "errors.invalidCredentials",
    "Authorization required: token missing": "errors.unauthorized",
    "Full authentication is required to access this resource": "errors.unauthorized",
    "Invalid refresh token": "errors.unauthorized",
    "Access Denied": "errors.forbidden",
    "Validation failed for one or more fields": "errors.validationFailed",
    "Invalid UUID": "errors.invalidId",

    // Confirmation & Password Reset
    "Invalid confirmation code format": "errors.invalidConfirmationCode",
    "Confirmation Code is already expired": "errors.confirmationCodeExpired",
    "Token expired": "errors.resetTokenExpired",
    "Reset token has expired": "errors.resetTokenExpired",

    // User & Avatar
    "User not found": "errors.userNotFoundGeneric",
    "User already exists": "errors.emailAlreadyRegistered",
    "Invalid avatar file: must be PNG or JPEG and <= 5MB": "errors.invalidAvatarFile",
    "Failed to process avatar file on server": "errors.updateAvatar",

    // Projects & Collaborators
    "Project not found": "errors.projectNotFound",
    "Title and description are required": "errors.projectTitleDescriptionRequired",
    "Cannot invite another OWNER": "errors.cannotInviteOwner",
    "User is already a collaborator in this project": "errors.alreadyCollaborator",
    "Marker does not belong to this project": "errors.markerWrongProject",

    // Tasks & Task Statuses
    "Task not found": "errors.taskNotFound",
    "Tasks Status not found": "errors.taskStatusNotFound",
    "TaskStatus not found": "errors.taskStatusNotFound",
    "Status not found": "errors.taskStatusNotFound",
    "Invalid tasks status payload": "errors.invalidTaskStatusPayload",
    "Status name cannot be empty": "errors.statusNameEmpty",
    "Title must not be blank": "errors.titleBlank",
    "Deadline cannot be in the past!": "errors.deadlineInPast",
    "Invalid date format. Use ISO format (YYYY-MM-DDTHH:mm:ss)": "errors.invalidDateFormat",

    // Attachments
    "File is empty": "errors.fileEmpty",
    "You don't have permission to upload files to this task": "errors.forbidden",
    "Could not store file. Please try again!": "errors.uploadFile",
    "Attachment not found": "errors.attachmentNotFound",
    "Attachment does not belong to this task": "errors.attachmentWrongTask",
    "You don't have permission to delete this attachment": "errors.forbidden",

    // Comments
    "Comment does not belong to this task": "errors.commentWrongTask",
    "You can only delete your own comments": "errors.ownCommentsOnly",
    "You can only edit your own comments": "errors.ownCommentsOnly",
};

export const getLocalizedApiError = (err: unknown, fallbackKey: string): string => {
    if (isAxiosError(err)) {
        if (err.response?.status === 409 && !err.response?.data?.message) {
            return i18n.t("errors.emailAlreadyRegistered");
        }

        const serverMessage = err.response?.data?.message || err.response?.data?.error;

        if (typeof serverMessage === "string") {
            const trimmed = serverMessage.trim();

            if (trimmed.startsWith("User not found:")) {
                const email = trimmed.replace("User not found:", "").trim();
                return i18n.t("errors.userNotFound", { email });
            }

            if (trimmed.startsWith("Failed to send email to ")) {
                const email = trimmed.replace(/^(Failed to send email to )+/, "").trim();
                return i18n.t("errors.emailSendingFailed", { email });
            }

            if (
                trimmed.startsWith("Template not found:") ||
                trimmed.startsWith("Failed to process template:")
            ) {
                return i18n.t("errors.internalServer");
            }

            const mappedKey = BACKEND_ERROR_MAP[trimmed];
            if (mappedKey) {
                return i18n.t(mappedKey);
            }

            if (trimmed) {
                return trimmed;
            }
        }
    }

    return i18n.t(fallbackKey);
};

export const throwLocalizedAxiosError = (err: unknown, fallbackKey: string): never => {
    if (isAxiosError(err)) {
        throw new Error(getLocalizedApiError(err, fallbackKey));
    }
    throw err;
};
