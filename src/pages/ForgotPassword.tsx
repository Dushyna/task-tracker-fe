import * as Yup from "yup";
import {useState} from "react";
import {useNavigate} from "react-router-dom";
import {fetchForgotPassword} from "../features/auth/services/api.ts";
import DynamicForm from "../components/ui/DynamicForm";
import type {FieldConfig} from "../components/ui/types";
import {usePageTitle} from "../app/customHooks/usePageTitle.ts";
import {useTranslation} from "react-i18next";

const initialValues = {
    email: "",
};

const ForgotPasswordPage = () => {
    const {t} = useTranslation();
    usePageTitle(t("forgotPassword.pageTitle"));
    const navigate = useNavigate();
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const fields: FieldConfig[] = [
        {
            name: "email",
            label: t("forgotPassword.emailLabel"),
            type: "email",
            placeholder: "you@example.com",
        },
    ];

    const validationSchema = Yup.object({
        email: Yup.string()
            .email(t("forgotPassword.validation.emailInvalid"))
            .required(t("forgotPassword.validation.required")),
    });

    const handleSubmit = async (values: typeof initialValues) => {
        setError(null);
        setSuccessMessage(null);
        try {
            await fetchForgotPassword(values.email);
            setSuccessMessage(t("forgotPassword.successMessage"));
        } catch (err) {
            setError(err instanceof Error ? err.message : t("forgotPassword.genericError"));
        }
    };

    return (
        <div className="min-h-screen flex items-start justify-center bg-slate-950 p-4">
            <div className="w-full max-w-md">
                <DynamicForm
                    title={t("forgotPassword.title")}
                    description={successMessage || t("forgotPassword.description")}
                    fields={fields}
                    initialValues={initialValues}
                    validationSchema={validationSchema}
                    onSubmit={handleSubmit}
                    onClose={() => navigate("/login")}
                    submitText={t("forgotPassword.submit")}
                    errorMessage={error || undefined}
                />
            </div>
        </div>
    );
};

export default ForgotPasswordPage;
