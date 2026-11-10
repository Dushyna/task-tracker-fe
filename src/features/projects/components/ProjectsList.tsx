import {useEffect, useState} from "react";
import {Link} from "react-router-dom";
import {useAppDispatch, useAppSelector} from "../../../app/hooks";
import {
    getMyProjects,
    selectProjects,
    deleteProject,
    selectDeleteProjectErrorMessage,
    clearDeleteError,
    updateProject,
    selectUpdateProjectErrorMessage,
} from "../slice/projectsSlice";
import NeonButton from "../../../components/ui/buttons/NeonButton.tsx";
import ConfirmModal from "../../../components/ui/ConfirmModal";
import NotificationModal from "../../../components/ui/NotificationModal";
import ProjectEditModal from "./ProjectEditModal.tsx";
import type {EditProjectDto} from "../types";
import MainButton from "../../../components/ui/buttons/MainButton.tsx";
import ProjectForm from "./ProjectForm.tsx";

export default function ProjectsList() {
    const dispatch = useAppDispatch();
    const projects = useAppSelector(selectProjects);
    const deleteError = useAppSelector(selectDeleteProjectErrorMessage);
    const isUpdating = useAppSelector(state => state.projects.isUpdatingProject);
    const updateError = useAppSelector(selectUpdateProjectErrorMessage);
    const [projectToEdit, setProjectToEdit] = useState<EditProjectDto | null>(null);
    const [projectToDelete, setProjectToDelete] = useState<{ id: string, title: string } | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [showForm, setShowForm] = useState<boolean>(false);

    useEffect(() => {
        dispatch(getMyProjects());
    }, [dispatch]);


    const openEdit = (project: { id: string; title: string; description: string }) => {
        console.log("OPEN EDIT");
        setProjectToEdit(project);
    };

    const openConfirm = (id: string, title: string) => {
        setProjectToDelete({id, title});
    };

    const handleConfirmDelete = async () => {
        if (!projectToDelete) return;

        setIsDeleting(true);
        await dispatch(deleteProject(projectToDelete.id));

        setIsDeleting(false);
        if (!deleteError) {
            setProjectToDelete(null);
        }
    };

    const handleUpdate = (values: {
        title: string;
        description: string;
    }) => {
        if (!projectToEdit) return;

        dispatch(
            updateProject({
                id: projectToEdit.id,
                dto: values,
            })
        )
            .unwrap()
            .then(() => setProjectToEdit(null));
    };
    console.log("projectToEdit:", projectToEdit);
    return (
        <section className="flex-1 p-4 md:p-8 min-h-screen border border-cyan-900/50 rounded-2xl bg-transparent">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8 md:mb-10">
                <h2 className="text-cyan-300 text-2xl md:text-3xl font-black uppercase tracking-[0.2em] text-glow">
                    Projects
                </h2>

                <MainButton onClick={() => setShowForm(true)} className="w-full sm:w-auto text-center justify-center">
                    New Project
                </MainButton>
            </div>

            <div
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 bg-transparent">
                {projects?.map((project) => (
                    <div
                        key={project.id}
                        className="group relative bg-black/40 border border-cyan-900/50 rounded-2xl p-5 md:p-6 transition-all duration-500 hover:border-cyan-400 hover:shadow-[0_0_30px_rgba(6,182,212,0.1)] flex flex-col justify-between min-h-[160px]"
                    >
                        <Link to={`/project/${project.id}`} className="absolute inset-0 z-10"
                              aria-label={`Open ${project.title}`}/>
                        <div className="relative z-0 mb-6">
                            <h3 className="text-cyan-400 text-lg md:text-xl font-black uppercase mb-2 group-hover:text-cyan-200 transition-colors line-clamp-2">
                                {project.title}
                            </h3>
                            <p className="text-slate-500 text-sm line-clamp-2">
                                {project.description}
                            </p>
                        </div>

                        <div className="flex justify-end gap-3 relative z-20 mt-auto">
                            <NeonButton
                                size="sm"
                                variant="primary"
                                className="w-20 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300"
                                onClick={() => openEdit(project)}
                            >
                                Edit
                            </NeonButton>

                            <NeonButton
                                size="sm"
                                variant="primary"
                                className="w-20 md:opacity-0 md:group-hover:opacity-100 border-rose-500/50 text-rose-500 hover:border-rose-400 transition-opacity duration-300"
                                onClick={() => {
                                    openConfirm(project.id, project.title);
                                }}
                            >
                                Delete
                            </NeonButton>
                        </div>
                    </div>
                ))}
            </div>

            {showForm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 ">
                    <div className="w-full max-w-2xl px-4">
                        <ProjectForm onClose={() => setShowForm(false)} />
                    </div>
                </div>
            )}

            {/* ConfirmModal */}
            {projectToDelete && (
                <ConfirmModal
                    title="Delete project?"
                    message={`Are you sure you want to delete "${projectToDelete.title}"? All data will be wiped from the grid.`}
                    confirmText={isDeleting ? "Deleting..." : "Delete"}
                    cancelText="Cancel"
                    onConfirm={handleConfirmDelete}
                    onCancel={() => setProjectToDelete(null)}
                />
            )}

            {deleteError && (
                <NotificationModal
                    title="ACCESS_DENIED"
                    message={deleteError}
                    variant="error"
                    onClose={() => {
                        dispatch(clearDeleteError());
                        setProjectToDelete(null);
                    }}
                />
            )}

            {projectToEdit && (
                <ProjectEditModal
                    project={projectToEdit}
                    onClose={() => setProjectToEdit(null)}
                    onSubmit={handleUpdate}
                    isLoading={isUpdating}
                    errorMessage={updateError}
                />
            )}
        </section>
    );
}
