import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import { getMyProjects, selectProjects, deleteProject } from "../slice/projectsSlice";
import NeonButton from "../../../components/ui/NeonButton";
import ConfirmModal from "../../../components/ui/ConfirmModal"; // Твоя форма підтвердження

export default function ProjectsList() {
    const dispatch = useAppDispatch();
    const projects = useAppSelector(selectProjects);

    const [projectToDelete, setProjectToDelete] = useState<{id: string, title: string} | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        dispatch(getMyProjects());
    }, [dispatch]);

    const openConfirm = (id: string, title: string) => {
        setProjectToDelete({ id, title });
    };

    const handleConfirmDelete = async () => {
        if (!projectToDelete) return;

        setIsDeleting(true);
        try {
            await dispatch(deleteProject(projectToDelete.id)).unwrap();
            setProjectToDelete(null);
        } catch (error) {
            console.error("Failed to delete project:", error);
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <section className="p-8 min-h-screen bg-[#020617]">
            <h2 className="text-cyan-300 text-3xl font-black uppercase tracking-[0.2em] mb-10 text-glow">
                SYSTEM_PROJECTS
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {projects?.map((project) => (
                    <div
                        key={project.id}
                        className="group relative bg-black/40 border border-cyan-900/50 rounded-2xl p-6 transition-all duration-500 hover:border-cyan-400 hover:shadow-[0_0_30px_rgba(6,182,212,0.1)]"
                    >
                        <Link to={`/project/${project.id}`} className="block mb-6">
                            <h3 className="text-cyan-400 text-xl font-black uppercase mb-2 group-hover:text-cyan-200 transition-colors">
                                {project.title}
                            </h3>
                            <p className="text-slate-500 text-sm line-clamp-2">
                                {project.description}
                            </p>
                        </Link>

                        <div className="flex justify-end">
                            <NeonButton
                                size="sm"
                                variant="primary"
                                className="opacity-0 group-hover:opacity-100 border-rose-500/50 text-rose-500"
                                onClick={() => openConfirm(project.id, project.title)}
                            >
                                DELETE
                            </NeonButton>
                        </div>
                    </div>
                ))}
            </div>

            {/* Твоя форма підтвердження */}
            {projectToDelete && (
                <ConfirmModal
                    title="PROJECT_TERMINATION"
                    message={`Are you sure you want to delete "${projectToDelete.title}"? All data will be wiped from the grid.`}
                    confirmText={isDeleting ? "WIPING..." : "CONFIRM_DELETE"}
                    cancelText="ABORT"
                    onConfirm={handleConfirmDelete}
                    onCancel={() => setProjectToDelete(null)}
                />
            )}
        </section>
    );
}
