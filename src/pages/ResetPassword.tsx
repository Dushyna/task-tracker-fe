import ResetPasswordForm from "../features/auth/components/ResetPasswordForm.tsx";
import {usePageTitle} from "../app/customHooks/usePageTitle.ts";
import {useTranslation} from "react-i18next";

const ResetPassword = () => {
    const {t} = useTranslation();
    usePageTitle(t("resetPassword.pageTitle"));
    return <ResetPasswordForm/>;
};

export default ResetPassword;
