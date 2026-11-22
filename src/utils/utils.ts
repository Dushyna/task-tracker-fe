import type {FormikErrors} from "formik";

export const getErrorMessage = <T extends Record<string, unknown>>(
    error: string | string[] | FormikErrors<T> | FormikErrors<T>[] | undefined
): string => {
    if (!error) return "";
    if (typeof error === "string") return error;
    if (Array.isArray(error)) {
        return error
            .map((e) => (typeof e === "string" ? e : JSON.stringify(e)))
            .join(", ");
    }
    return JSON.stringify(error);
};
