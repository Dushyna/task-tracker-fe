import * as Yup from "yup";
import { register, selectRegisterError } from "../slice/authSlice";
import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import { useNavigate } from "react-router-dom";
import DynamicForm from "../../../components/ui/DynamicForm";
import type { FieldConfig } from "../../../components/ui/types";

const RegistrationForm = () => {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const authError = useAppSelector(selectRegisterError);

    const  initialValues = {
        email: "",
        password: "",
        confirmPassword: "",
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
        {
            name: "confirmPassword",
            label: "Confirm Password",
            type: "password",
            placeholder: "••••••••"
        },
    ];


    const validationSchema = Yup.object({
        email: Yup.string().email("Invalid email address").required("Email is required"),
        password: Yup.string().min(8, "Password must be at least 8 characters").required("Password is required"),
        confirmPassword: Yup.string()
            .oneOf([Yup.ref("password")], "Passwords must match")
            .required("Confirm Password is required"),
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
                    title="Create Account"
                    description="Enter your email and password to register"
                    fields={fields}
                    initialValues={initialValues}
                    validationSchema={validationSchema}
                    onSubmit={handleSubmit}
                    onClose={() => navigate("/")}
                    submitText="Register Now"
                    errorMessage={authError}
                />
            </div>
        </div>
    );
};

export default RegistrationForm;
