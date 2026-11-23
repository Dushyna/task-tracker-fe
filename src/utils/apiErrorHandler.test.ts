import { AxiosError, AxiosHeaders } from "axios";
import { beforeEach, describe, expect, it, vi } from "vitest";
import i18n from "i18next";
import { getLocalizedApiError, throwLocalizedAxiosError } from "./apiErrorHandler";

vi.mock("i18next", () => ({
    default: {
        t: vi.fn((key: string, options?: Record<string, unknown>) =>
            options ? `${key}:${JSON.stringify(options)}` : key
        ),
    },
}));

const createAxiosError = (status?: number, data?: unknown): AxiosError => {
    const headers = new AxiosHeaders();
    return new AxiosError(
        "Request failed",
        "ERR_BAD_REQUEST",
        { headers },
        {},
        status !== undefined
            ? {
                status,
                statusText: "Error",
                headers,
                config: { headers },
                data,
            }
            : undefined
    );
};

describe("apiErrorHandler", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe("getLocalizedApiError", () => {
        it("returns emailAlreadyRegistered on 409 status without message", () => {
            const err = createAxiosError(409, {});
            const result = getLocalizedApiError(err, "errors.fallback");

            expect(i18n.t).toHaveBeenCalledWith("errors.emailAlreadyRegistered");
            expect(result).toBe("errors.emailAlreadyRegistered");
        });

        it("parses dynamic 'User not found:' prefix with email", () => {
            const err = createAxiosError(404, { message: "  User not found: test@example.com  " });
            const result = getLocalizedApiError(err, "errors.fallback");

            expect(i18n.t).toHaveBeenCalledWith("errors.userNotFound", {
                email: "test@example.com",
            });
            expect(result).toBe('errors.userNotFound:{"email":"test@example.com"}');
        });

        it("parses dynamic 'Failed to send email to ' prefix (including repeated prefix)", () => {
            const err = createAxiosError(500, {
                message: "Failed to send email to Failed to send email to user@domain.de",
            });
            const result = getLocalizedApiError(err, "errors.fallback");

            expect(i18n.t).toHaveBeenCalledWith("errors.emailSendingFailed", {
                email: "user@domain.de",
            });
            expect(result).toBe('errors.emailSendingFailed:{"email":"user@domain.de"}');
        });

        it("maps template errors to internalServer", () => {
            const err1 = createAxiosError(500, { message: "Template not found: welcome.html" });
            const err2 = createAxiosError(500, { error: "Failed to process template: reset.html" });

            expect(getLocalizedApiError(err1, "errors.fallback")).toBe("errors.internalServer");
            expect(getLocalizedApiError(err2, "errors.fallback")).toBe("errors.internalServer");
        });

        it.each([
            ["Invalid username or password.", "errors.invalidCredentials"],
            ["Access Denied", "errors.forbidden"],
            ["Confirmation Code is already expired", "errors.confirmationCodeExpired"],
            ["Project not found", "errors.projectNotFound"],
            ["TaskStatus not found", "errors.taskStatusNotFound"],
            ["Deadline cannot be in the past!", "errors.deadlineInPast"],
            ["Attachment does not belong to this task", "errors.attachmentWrongTask"],
            ["You can only delete your own comments", "errors.ownCommentsOnly"],
        ])("maps known backend message '%s' -> '%s'", (backendMessage, expectedKey) => {
            const err = createAxiosError(400, { message: backendMessage });
            const result = getLocalizedApiError(err, "errors.fallback");

            expect(i18n.t).toHaveBeenCalledWith(expectedKey);
            expect(result).toBe(expectedKey);
        });

        it("supports 'error' field when 'message' is absent", () => {
            const err = createAxiosError(403, { error: "Access Denied" });
            expect(getLocalizedApiError(err, "errors.fallback")).toBe("errors.forbidden");
        });

        it("returns raw trimmed server message if not present in BACKEND_ERROR_MAP", () => {
            const err = createAxiosError(400, { message: "  Custom unmapped error  " });
            const result = getLocalizedApiError(err, "errors.fallback");

            expect(i18n.t).not.toHaveBeenCalled();
            expect(result).toBe("Custom unmapped error");
        });

        it("returns localized fallbackKey on network error without response", () => {
            const err = createAxiosError(undefined, undefined);
            const result = getLocalizedApiError(err, "errors.network");

            expect(i18n.t).toHaveBeenCalledWith("errors.network");
            expect(result).toBe("errors.network");
        });

        it("returns localized fallbackKey for non-Axios errors", () => {
            const result = getLocalizedApiError(new Error("Unexpected"), "errors.unknown");

            expect(i18n.t).toHaveBeenCalledWith("errors.unknown");
            expect(result).toBe("errors.unknown");
        });
    });

    describe("throwLocalizedAxiosError", () => {
        it("throws a localized Error when given an AxiosError", () => {
            const err = createAxiosError(401, { message: "Invalid refresh token" });

            expect(() => throwLocalizedAxiosError(err, "errors.fallback")).toThrow(
                "errors.unauthorized"
            );
        });

        it("rethrows the original error unchanged if it is not an AxiosError", () => {
            const originalError = new TypeError("Cannot read properties of undefined");

            expect(() => throwLocalizedAxiosError(originalError, "errors.fallback")).toThrow(
                originalError
            );
        });
    });
});
