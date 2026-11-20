import { createPortal } from "react-dom";
import * as Yup from "yup";
import DynamicForm from "../../../components/ui/DynamicForm";
import type { EditProjectDto } from "../types";
import { useTranslation } from "react-i18next";

type ProjectEditModalProps = {
    project: EditProjectDto;
    onClose: () => void;
    onSubmit: (values: { title: string; description: string }) => void;
    isLoading?: boolean;
    errorMessage?: string;
};

const NAME_REGEX = /^[A-Z][a-zA-Z0-9 ]{2,49}$/;

export default function ProjectEditModal({
                                             project,
                                             onClose,
                                             onSubmit,
                                             isLoading,
                                             errorMessage,
                                         }: ProjectEditModalProps) {
    const { t } = useTranslation();

    const validationSchema = Yup.object({
        title: Yup.string()
            .required(t("projectEditModal.validation.titleRequired"))
            .matches(NAME_REGEX, t("projectEditModal.validation.titleInvalid")),
        description: Yup.string().required(
            t("projectEditModal.validation.descriptionRequired")
        ),
    });

    return createPortal(
        <div className="fixed inset-0 z- flex items-center justify-center bg-black/50">
            <DynamicForm
                title={t("projectEditModal.title")}
                description={t("projectEditModal.description")}
                fields={[
                    {
                        name: "title",
                        label: t("projectEditModal.titleLabel"),
                        placeholder: t("projectEditModal.titlePlaceholder"),
                    },
                    {
                        name: "description",
                        label: t("projectEditModal.descriptionLabel"),
                        type: "textarea",
                        placeholder: t("projectEditModal.descriptionPlaceholder"),
                        rows: 4,
                    },
                ]}
                initialValues={{
                    title: project.title,
                    description: project.description,
                }}
                validationSchema={validationSchema}
                onSubmit={onSubmit}
                onClose={onClose}
                submitText={t("projectEditModal.submit")}
                isLoading={isLoading}
                errorMessage={errorMessage}
            />
        </div>,
        document.body
    );
}
