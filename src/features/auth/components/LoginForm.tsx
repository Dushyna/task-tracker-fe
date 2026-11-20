import {useState} from "react";
import * as Yup from "yup";
import {checkAuth, login, selectLoginError} from "../slice/authSlice";
import {useAppDispatch, useAppSelector} from "../../../app/hooks";
import {useNavigate} from "react-router-dom";
import DynamicForm from "../../../components/ui/DynamicForm";
import type {FieldConfig} from "../../../components/ui/types";
import {useTranslation} from "react-i18next";

type LoginFormProps = {
    emailConfirmed?: boolean;
};

const DEMO_CREDENTIALS = {
    email: import.meta.env.VITE_DEMO_EMAIL || "demo@dushyna.site",
    password: import.meta.env.VITE_DEMO_PASSWORD || "Dushyna123!",
};

const LoginForm = ({emailConfirmed}: LoginFormProps) => {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const {t} = useTranslation();
    const loginError = useAppSelector(selectLoginError);
    const [isDemoLoading, setIsDemoLoading] = useState(false);

    const initialValues = {
        email: "",
        password: "",
    };

    const fields: FieldConfig[] = [
        {
            name: "email",
            label: t("login.emailLabel"),
            type: "email",
            placeholder: "you@example.com"
        },
        {
            name: "password",
            label: t("login.passwordLabel"),
            type: "password",
            placeholder: "••••••••"
        },
    ];

    const validationSchema = Yup.object({
        email: Yup.string()
            .email(t("login.validation.emailInvalid"))
            .required(t("login.validation.emailRequired")),
        password: Yup.string()
            .min(8, t("login.validation.passwordMin"))
            .required(t("login.validation.passwordRequired")),
    });

    const handleSubmit = async (values: typeof initialValues) => {
        const dispatchResult = await dispatch(login(values));
        if (login.fulfilled.match(dispatchResult)) {
            await dispatch(checkAuth());
            navigate("/");
        }
    };

    const handleDemoLogin = async () => {
        setIsDemoLoading(true);
        try {
            await handleSubmit(DEMO_CREDENTIALS);
        } finally {
            setIsDemoLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-start justify-center bg-transparent p-4">
            <div className="w-full max-w-md relative">
                <DynamicForm
                    title={t("login.title")}
                    description={emailConfirmed
                        ? t("login.descriptionConfirmed")
                        : t("login.description")
                    }
                    fields={fields}
                    initialValues={initialValues}
                    validationSchema={validationSchema}
                    onSubmit={handleSubmit}
                    onClose={() => navigate("/")}
                    submitText={t("login.submit")}
                    errorMessage={loginError}
                    showForgotPassword={true}
                />

                <div
                    className="mt-3 rounded-xl border border-cyan-500/30 bg-[#0b1622]/80 backdrop-blur-md p-4 shadow-[0_0_20px_rgba(6,182,212,0.12)]">
                    <div className="flex items-center justify-center mb-3">
                        <span className="text-[11px] font-medium tracking-wider uppercase text-cyan-400/70">
                            {t("login.guestAccess")}
                        </span>
                    </div>

                    <button
                        type="button"
                        onClick={handleDemoLogin}
                        disabled={isDemoLoading}
                        className="w-full py-2.5 px-4 rounded-lg border border-cyan-400/60 bg-cyan-500/10 text-cyan-300 font-semibold tracking-wide hover:bg-cyan-500/20 hover:border-cyan-400 hover:shadow-[0_0_15px_rgba(34,211,238,0.35)] transition-all duration-200 cursor-pointer disabled:opacity-50"
                    >
                        {isDemoLoading ? t("login.demoLoading") : t("login.demoButton")}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default LoginForm;
