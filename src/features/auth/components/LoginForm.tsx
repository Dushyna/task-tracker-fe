import { useState } from "react";
import * as Yup from "yup";
import { checkAuth, login, selectLoginError } from "../slice/authSlice";
import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import { useNavigate } from "react-router-dom";
import DynamicForm from "../../../components/ui/DynamicForm";
import type { FieldConfig } from "../../../components/ui/types";

type LoginFormProps = {
    emailConfirmed?: boolean;
};

const DEMO_CREDENTIALS = {
    email: import.meta.env.VITE_DEMO_EMAIL || "demo@dushyna.site",
    password: import.meta.env.VITE_DEMO_PASSWORD || "Dushyna123!",
};

const LoginForm = ({ emailConfirmed }: LoginFormProps) => {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const loginError = useAppSelector(selectLoginError);
    const [isDemoLoading, setIsDemoLoading] = useState(false);

    const initialValues = {
        email: "",
        password: "",
    };

    const fields: FieldConfig[] = [
        {
            name: "email",
            label: "Email",
            type: "email",
            placeholder: "you@example.com"
        },
        {
            name: "password",
            label: "Password",
            type: "password",
            placeholder: "••••••••"
        },
    ];

    const validationSchema = Yup.object({
        email: Yup.string().email("Invalid email address").required("Email is required"),
        password: Yup.string().min(8, "Password must be at least 8 characters").required("Password is required"),
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
                    title="Sign In"
                    description={emailConfirmed
                        ? "🎉 Email confirmed! Please log in."
                        : "Enter your credentials to access the system"
                    }
                    fields={fields}
                    initialValues={initialValues}
                    validationSchema={validationSchema}
                    onSubmit={handleSubmit}
                    onClose={() => navigate("/")}
                    submitText="Login"
                    errorMessage={loginError}
                />

                <div className="mt-3 rounded-xl border border-cyan-500/30 bg-[#0b1622]/80 backdrop-blur-md p-4 shadow-[0_0_20px_rgba(6,182,212,0.12)]">
                    <div className="flex items-center justify-center mb-3">
                        <span className="text-[11px] font-medium tracking-wider uppercase text-cyan-400/70">
                            Portfolio Guest Access
                        </span>
                    </div>

                    <button
                        type="button"
                        onClick={handleDemoLogin}
                        disabled={isDemoLoading}
                        className="w-full py-2.5 px-4 rounded-lg border border-cyan-400/60 bg-cyan-500/10 text-cyan-300 font-semibold tracking-wide hover:bg-cyan-500/20 hover:border-cyan-400 hover:shadow-[0_0_15px_rgba(34,211,238,0.35)] transition-all duration-200 cursor-pointer disabled:opacity-50"
                    >
                        {isDemoLoading ? "Connecting to Demo..." : "Quick Demo Login"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default LoginForm;
