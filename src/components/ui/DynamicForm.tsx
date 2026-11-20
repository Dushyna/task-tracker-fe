import {type FormikValues, useFormik} from "formik";
import type {FormikHelpers} from "formik";
import * as Yup from "yup";
import NeonButton from "./buttons/NeonButton.tsx";
import FormContainer from "./FormContainer";
import type {FieldConfig} from "./types";
import {getErrorMessage} from "../../utils/utils";
import {useState} from "react";
import ConfirmModal from "./ConfirmModal.tsx";
import {useNavigate} from "react-router-dom";
import {useTranslation} from "react-i18next";

type DynamicFormProps<T extends FormikValues> = {
    title: string;
    description?: string;
    fields: FieldConfig[];
    initialValues: T;
    validationSchema: Yup.ObjectSchema<T>;
    onSubmit: (values: T, formikHelpers: FormikHelpers<T>) => void;
    onClose: () => void;
    submitText?: string;
    errorMessage?: string;
    isLoading?: boolean;
    showForgotPassword?: boolean;
};

function DynamicForm<T extends FormikValues>({
                                                 title,
                                                 description,
                                                 fields,
                                                 initialValues,
                                                 validationSchema,
                                                 onSubmit,
                                                 onClose,
                                                 submitText,
                                                 errorMessage,
                                                 isLoading,
                                                 showForgotPassword,
                                             }: DynamicFormProps<T>) {
    const {t} = useTranslation();
    const formik = useFormik<T>({
        initialValues,
        validationSchema,
        onSubmit,
    });
    const [showConfirm, setShowConfirm] = useState(false);

    const [passwordVisibility, setPasswordVisibility] = useState<Record<string, boolean>>({});

    const togglePassword = (fieldName: string) => {
        setPasswordVisibility((prev) => ({
            ...prev,
            [fieldName]: !prev[fieldName],
        }));
    };
    const navigate = useNavigate();

    const handleClose = () => {
        if (formik.dirty) {
            setShowConfirm(true);
            return;
        }
        onClose();
    };

    const handleConfirmDiscard = () => {
        setShowConfirm(false);
        onClose();
    };
    const handleCancelDiscard = () => {
        setShowConfirm(false);
    };

    const resolvedSubmitText = submitText ?? t("dynamicForm.defaultSubmit");
    const isLoginForm = showForgotPassword ?? (title === "Sign In" || title === "Anmelden");

    return (
        <FormContainer
            title={title}
            description={description}
            onClose={handleClose}
            errorMessage={errorMessage}
            submitButton={
                <NeonButton
                    isLoading={isLoading}
                    size="lg"
                    variant="primary"
                    type="submit"
                    onClick={formik.submitForm}
                    className="w-full justify-center"
                >
                    {resolvedSubmitText}
                </NeonButton>
            }
        >
            {fields.map((field) => (
                <div className="space-y-2" key={field.name}>
                    <label className="block text-sm font-medium text-cyan-300 text-neon">
                        {field.label}
                    </label>

                    {field.type === "textarea" ? (
                        <textarea
                            {...formik.getFieldProps(field.name)}
                            rows={field.rows || 4}
                            placeholder={field.placeholder}
                            className={`w-full px-3 py-2 text-sm rounded-md border bg-black text-cyan-300 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 transition-shadow shadow-neon ${
                                formik.touched[field.name] && formik.errors[field.name]
                                    ? "border-red-500 focus:ring-red-500 shadow-red-500/40"
                                    : "border-cyan-400/30"
                            }`}
                        />
                    ) : (
                        <div className="relative">
                            <input
                                {...formik.getFieldProps(field.name)}
                                type={
                                    field.type === "password"
                                        ? passwordVisibility[field.name]
                                            ? "text"
                                            : "password"
                                        : field.type || "text"
                                }
                                placeholder={field.placeholder}
                                className={`w-full px-3 py-2 text-sm rounded-md border bg-black text-cyan-300 caret-cyan-300 placeholder-gray-500 autofill:text-cyan-300
  autofill:bg-black focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 transition-shadow shadow-neon ${
                                    formik.touched[field.name] && formik.errors[field.name]
                                        ? "border-red-500 focus:ring-red-500 shadow-red-500/40"
                                        : "border-cyan-400/30"
                                }`}
                            />
                            {field.type === "password" && (
                                <button
                                    type="button"
                                    onClick={() => togglePassword(field.name)}
                                    className="absolute inset-y-0 right-3 flex items-center text-cyan-400/60 hover:text-cyan-400 transition-colors"
                                >
                                    {passwordVisibility[field.name] ? "🔒" : "👁️"}
                                </button>
                            )}
                        </div>
                    )}

                    {formik.touched[field.name] && formik.errors[field.name] && (
                        <p className="text-sm text-red-500">
                            {getErrorMessage(formik.errors[field.name])}
                        </p>
                    )}

                    {field.name === "password" && isLoginForm && (
                        <div className="flex justify-end pr-1">
                            <button
                                type="button"
                                onClick={() => navigate("/forgot-password")}
                                className="text-[10px] text-cyan-400/50 hover:text-cyan-400 uppercase font-black tracking-tighter transition-all duration-300 hover:tracking-normal active:scale-95"
                            >
                                {t("dynamicForm.forgotPassword")}
                            </button>
                        </div>
                    )}
                </div>
            ))}
            {showConfirm && (
                <ConfirmModal
                    title={t("dynamicForm.discardTitle")}
                    message={t("dynamicForm.discardMessage")}
                    confirmText={t("dynamicForm.discardConfirm")}
                    cancelText={t("dynamicForm.discardCancel")}
                    onConfirm={handleConfirmDiscard}
                    onCancel={handleCancelDiscard}
                />
            )}
        </FormContainer>
    );
}

export default DynamicForm;
