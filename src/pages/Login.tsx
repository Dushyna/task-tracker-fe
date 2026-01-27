import LoginForm from "../features/auth/components/LoginForm";
import {useLocation} from "react-router-dom";

export default function Login() {
    const location = useLocation();
    const params = new URLSearchParams(location.hash.split("?")[1]);
    const confirmed = params.get("confirm") === "true";

  return <LoginForm emailConfirmed={confirmed} />;
}
