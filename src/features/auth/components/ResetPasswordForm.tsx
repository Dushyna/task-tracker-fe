import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import * as Yup from "yup";
import axiosInstance from "../../../lib/axiosInstance.ts";
import { fetchResetPassword } from "../services/api";
import DynamicForm from "../../../components/ui/DynamicForm";
import type { FieldConfig } from "../../../components/ui/types";
import { useTranslation } from "react-i18next";

const initialValues = {
    newPassword: "",
    confirmPassword: "",
};

const ResetPasswordForm = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { t } = useTranslation();
    const token = searchParams.get("token");

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const fields: FieldConfig[] = [
        {
            name: "newPassword",
            label: t("resetPassword.newPasswordLabel"),
            type: "password",
            placeholder: "••••••••"
        },
        {
            name: "confirmPassword",
            label: t("resetPassword.confirmPasswordLabel"),
            type: "password",
            placeholder: "••••••••"
        }
    ];

    const validationSchema = Yup.object({
        newPassword: Yup.string()
            .min(8, t("resetPassword.validation.passwordMin"))
            .required(t("resetPassword.validation.required")),
        confirmPassword: Yup.string()
            .oneOf([Yup.ref("newPassword")], t("resetPassword.validation.passwordsMismatch"))
            .required(t("resetPassword.validation.required")),
    });

    useEffect(() => {
        if (!token) {
            setError(t("resetPassword.errors.missingToken"));
            setLoading(false);
            return;
        }

        const validateToken = async () => {
            try {
                await axiosInstance.get("/auth/reset-password/validate", {
                    params: { token },
                });
                setLoading(false);
            } catch {
                setError(t("resetPassword.errors.invalidLink"));
                setLoading(false);
            }
        };

        void validateToken();
    }, [token, t]);

    const handleSubmit = async (values: typeof initialValues) => {
        setError(null);
        try {
            await fetchResetPassword({
                token: token!,
                newPassword: values.newPassword
            });
            setSuccess(true);
            setTimeout(() => navigate("/login"), 3000);
        } catch {
            setError(t("resetPassword.errors.failed"));
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-950 text-cyan-400 font-black uppercase tracking-widest animate-pulse">
                {t("resetPassword.checkingLink")}
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-start justify-center bg-slate-950 p-4">
            <div className="w-full max-w-md">
                <DynamicForm
                    title={t("resetPassword.title")}
                    description={success
                        ? t("resetPassword.descriptionSuccess")
                        : t("resetPassword.description")
                    }
                    fields={fields}
                    initialValues={initialValues}
                    validationSchema={validationSchema}
                    onSubmit={handleSubmit}
                    onClose={() => navigate("/login")}
                    submitText={t("resetPassword.submit")}
                    errorMessage={error || undefined}
                />
            </div>
        </div>
    );
};

export default ResetPasswordForm;
