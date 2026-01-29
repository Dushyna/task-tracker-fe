import axios, {
    type AxiosError,
    type AxiosInstance,
    type AxiosRequestConfig,
    type AxiosResponse,
} from "axios";
import { fetchRefreshToken, TOKEN_REFRESH_PATH } from "../features/auth/services/api.ts";

const PUBLIC_ENDPOINTS: readonly string[] = [
    "/auth/login",
    "/auth/logout",
    "/auth/forgot-password",
    "/auth/reset-password",
    "/auth/reset-password/validate",
];

const axiosInstance: AxiosInstance = axios.create({
    baseURL: "http://localhost:8080/api/v1",
    withCredentials: true,
    headers: { "Content-Type": "application/json" },
});

interface FailedRequest {
    resolve: (value?: unknown) => void;
    reject: (error: unknown) => void;
}

let isRefreshing = false;
let requestQueue: FailedRequest[] = [];

const processQueue = (error: unknown, response?: AxiosResponse | null) => {
    requestQueue.forEach((prom) => {
        if (error) prom.reject(error);
        else prom.resolve(response);
    });
    requestQueue = [];
};

axiosInstance.interceptors.response.use(
    (response: AxiosResponse) => response,
    async (error: AxiosError) => {
        const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

        const isPublic = PUBLIC_ENDPOINTS.some((path) =>
            (originalRequest.url ?? "").includes(path)
        );

        if (
            error.response?.status === 401 &&
            !originalRequest._retry &&
            !isPublic &&
            !originalRequest.url?.includes(TOKEN_REFRESH_PATH)
        ) {
            originalRequest._retry = true;

            if (!isRefreshing) {
                isRefreshing = true;
                try {
                    await fetchRefreshToken();
                    isRefreshing = false;
                    const res = await axiosInstance(originalRequest);
                    processQueue(null, res);
                    return res;
                } catch (refreshError) {
                    isRefreshing = false;
                    processQueue(refreshError);

                    const { store } = await import("../app/store");
                    store.dispatch({ type: "auth/logout/fulfilled" });

                    return Promise.reject(refreshError);
                }
            }

            return new Promise((resolve, reject) => {
                requestQueue.push({ resolve, reject });
            });
        }

        return Promise.reject(error);
    }
);

export default axiosInstance;