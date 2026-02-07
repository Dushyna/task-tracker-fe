import * as Yup from "yup";
import DynamicForm from "../../../components/ui/DynamicForm";
import {useAppDispatch, useAppSelector} from "../../../app/hooks";
import {
    createProject,
    selectCreateProjectErrorMessage,
} from "../slice/projectsSlice";
import {useState} from "react";
import {usePageTitle} from "../../../app/customHooks/usePageTitle.ts";
import { selectUser } from "../../auth/slice/authSlice";
import {Link} from "react-router-dom";
import NeonButton from "../../../components/ui/NeonButton.tsx";

type ProjectFormProps = {
    onClose: () => void;
};

const NAME_REGEX = /^[A-Z][a-zA-Z0-9 ]{2,49}$/;

const ProjectForm = ({ onClose }: ProjectFormProps) => {
    usePageTitle("TrackerApp | New project");
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
        }finally {
            setIsSubmitting(false);
        }

    };
    if (!currentUser) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md">
                <div className="w-full max-w-md rounded-2xl border border-rose-500/30 bg-slate-900 p-8 shadow-[0_0_50px_rgba(244,63,94,0.1)] text-center">
                    <div className="mb-4 flex justify-center text-rose-500">
                        <svg xmlns="http://www.w3.org" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
                        </svg>
                    </div>

                    <h2 className="mb-2 text-2xl font-black text-rose-500 uppercase tracking-tighter">
                        Access Denied
                    </h2>

                    <p className="mb-8 text-slate-400 text-sm">
                        Authorization required to initialize grid
                    </p>

                    <div className="flex flex-col gap-4">
                        <Link to="/login" className="w-full">
                            <NeonButton variant="primary" className="w-full border-rose-500 text-rose-500">
                                GO_TO_LOGIN
                            </NeonButton>
                        </Link>

                        <button
                            onClick={onClose}
                            className="text-[10px] uppercase tracking-widest text-slate-600 hover:text-slate-400 transition-colors"
                        >
                            [ Abort Operation ]
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <DynamicForm
            title="New Project"
            description="Enter the project title and description"
            initialValues={{ title: "", description: "" }}
            validationSchema={Yup.object({
                title: Yup.string()
                    .required("Title is required")
                    .matches(
                        NAME_REGEX,
                        "Project title should be at least 3 characters long and start with a capital letter. Special characters cannot be used"
                    ),
                description: Yup.string().required("Description is required"),
            })}
            fields={[
                { name: "title", label: "Title", placeholder: "New Website Development" },
                { name: "description", label: "Description", type: "textarea", placeholder: "A Project to develop a new company website", rows: 4 },
            ]}
            onSubmit={handleSubmit}
            isLoading={isSubmitting}
            onClose={onClose}
            submitText="Create Project"
            errorMessage={projectError || undefined}
        />
    );
};

export default ProjectForm;

