import * as Yup from "yup";
import DynamicForm from "../../../components/ui/DynamicForm";
import {useAppDispatch, useAppSelector} from "../../../app/hooks";
import {
    createProject,
    selectCreateProjectErrorMessage,
} from "../slice/projectsSlice";
import {useState} from "react";
import {usePageTitle} from "../../../app/customHooks/usePageTitle.ts";
import {selectUser} from "../../auth/slice/authSlice";
import {Link} from "react-router-dom";
import NeonButton from "../../../components/ui/buttons/NeonButton.tsx";
import {useTranslation} from "react-i18next";

type ProjectFormProps = {
    onClose: () => void;
};

const NAME_REGEX = /^[A-Z][a-zA-Z0-9 ]{2,49}$/;

const ProjectForm = ({onClose}: ProjectFormProps) => {
    const {t} = useTranslation();
    usePageTitle(t("projectForm.pageTitle"));
    const [isSubmitting, setIsSubmitting] = useState(false);
    const dispatch = useAppDispatch();
    const projectError = useAppSelector(selectCreateProjectErrorMessage);
    const currentUser = useAppSelector(selectUser);

    const handleSubmit = async (values: { title: string; description: string }) => {
        if (!currentUser) return;
        setIsSubmitting(true);
        try {
            await dispatch(createProject(values)).unwrap();
            onClose();
        } catch (error) {
            console.error("Failed to create project:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!currentUser) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md">
                <div
                    className="w-full max-w-md rounded-2xl border border-rose-500/30 bg-slate-900 p-8 shadow-[0_0_50px_rgba(244,63,94,0.1)] text-center">
                    <div className="mb-4 flex justify-center text-rose-500">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5}
                             stroke="currentColor" className="w-12 h-12">
                            <path strokeLinecap="round" strokeLinejoin="round"
                                  d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z"/>
                        </svg>
                    </div>

                    <h2 className="mb-2 text-2xl font-black text-rose-500">
                        {t("projectForm.accessDeniedTitle")}
                    </h2>

                    <p className="mb-8 text-slate-400 text-sm">
                        {t("projectForm.authRequired")}
                    </p>

                    <div className="flex flex-col gap-4">
                        <Link to="/login" className="w-full">
                            <NeonButton variant="primary" className="w-full border-white text-white">
                                {t("projectForm.login")}
                            </NeonButton>
                        </Link>

                        <div onClick={onClose}>
                            <NeonButton variant="primary" className="w-full border-rose-500 text-rose-500">
                                {t("projectForm.cancel")}
                            </NeonButton>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <DynamicForm
            title={t("projectForm.title")}
            description={t("projectForm.description")}
            initialValues={{title: "", description: ""}}
            validationSchema={Yup.object({
                title: Yup.string()
                    .required(t("projectForm.validation.titleRequired"))
                    .matches(NAME_REGEX, t("projectForm.validation.titleInvalid")),
                description: Yup.string().required(
                    t("projectForm.validation.descriptionRequired")
                ),
            })}
            fields={[
                {
                    name: "title",
                    label: t("projectForm.titleLabel"),
                    placeholder: t("projectForm.titlePlaceholder"),
                },
                {
                    name: "description",
                    label: t("projectForm.descriptionLabel"),
                    type: "textarea",
                    placeholder: t("projectForm.descriptionPlaceholder"),
                    rows: 4,
                },
            ]}
            onSubmit={handleSubmit}
            isLoading={isSubmitting}
            onClose={onClose}
            submitText={t("projectForm.submit")}
            errorMessage={projectError || undefined}
        />
    );
};

export default ProjectForm;
