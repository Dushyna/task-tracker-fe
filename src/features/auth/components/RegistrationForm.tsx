import * as Yup from "yup";
import {register, selectRegisterError} from "../slice/authSlice";
import {useAppDispatch, useAppSelector} from "../../../app/hooks";
import {useNavigate} from "react-router-dom";
import DynamicForm from "../../../components/ui/DynamicForm";
import type {FieldConfig} from "../../../components/ui/types";
import {useTranslation} from "react-i18next";

const RegistrationForm = () => {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const {t} = useTranslation();
    const authError = useAppSelector(selectRegisterError);

    const initialValues = {
        email: "",
        password: "",
        confirmPassword: "",
    };

    const fields: FieldConfig[] = [
        {
            name: "email",
            label: t("register.emailLabel"),
            type: "email",
            placeholder: "you@example.com"
        },
        {
            name: "password",
            label: t("register.passwordLabel"),
            type: "password",
            placeholder: "••••••••"
        },
        {
            name: "confirmPassword",
            label: t("register.confirmPasswordLabel"),
            type: "password",
            placeholder: "••••••••"
        },
    ];

    const validationSchema = Yup.object({
        email: Yup.string()
            .email(t("register.validation.emailInvalid"))
            .required(t("register.validation.emailRequired")),
        password: Yup.string()
            .min(8, t("register.validation.passwordMin"))
            .required(t("register.validation.passwordRequired")),
        confirmPassword: Yup.string()
            .oneOf([Yup.ref("password")], t("register.validation.passwordsMismatch"))
            .required(t("register.validation.confirmPasswordRequired")),
    });

    const handleSubmit = async (values: typeof initialValues) => {
        try {
            await dispatch(
                register({
                    email: values.email,
                    password: values.password,
                })
            ).unwrap();

            navigate("/login");
        } catch (error) {
            console.error("Registration failed:", error);
        }
    };

    return (
        <div className="min-h-screen flex items-start justify-center p-4">
            <div className="w-full max-w-md">
                <DynamicForm
                    title={t("register.title")}
                    description={t("register.description")}
                    fields={fields}
                    initialValues={initialValues}
                    validationSchema={validationSchema}
                    onSubmit={handleSubmit}
                    onClose={() => navigate("/")}
                    submitText={t("register.submit")}
                    errorMessage={authError}
                />
            </div>
        </div>
    );
};

export default RegistrationForm;
