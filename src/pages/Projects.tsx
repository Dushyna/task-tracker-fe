import ProjectsList from "../features/projects/components/ProjectsList";
import {usePageTitle} from "../app/customHooks/usePageTitle.ts";
import {useTranslation} from "react-i18next";

export default function Projects() {
    const {t} = useTranslation();
    usePageTitle(t("projectsList.pageTitle"));
    return (
        <div className="flex gap-6">
            <ProjectsList/>
        </div>
    );
}
