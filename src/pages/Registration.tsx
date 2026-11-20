import RegistrationForm from "../features/auth/components/RegistrationForm";
import {usePageTitle} from "../app/customHooks/usePageTitle.ts";
import {useTranslation} from "react-i18next";

export default function Registration() {
    const {t} = useTranslation();
    usePageTitle(t("register.pageTitle"));
    return <RegistrationForm/>;
}
