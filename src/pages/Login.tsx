import LoginForm from "../features/auth/components/LoginForm";
import {useLocation} from "react-router-dom";
import {usePageTitle} from "../app/customHooks/usePageTitle.ts";
import {useTranslation} from "react-i18next";

export default function Login() {
    const {t} = useTranslation();
    usePageTitle(t("login.pageTitle"));
    const location = useLocation();
    const params = new URLSearchParams(location.hash.split("?")[1]);
    const confirmed = params.get("confirm") === "true";

    return <LoginForm emailConfirmed={confirmed}/>;
}
