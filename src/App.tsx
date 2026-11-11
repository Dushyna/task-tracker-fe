import { useLocation, Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import About from "./pages/About";
import Layout from "./layouts/Layout";
import Registration from "./pages/Registration";
import Login from "./pages/Login";
import Projects from "./pages/Projects";
import Profile from "./pages/Profile";
import PrivateRoute from "./components/PrivateRoute";
import Kanban from "./pages/Kanban";
import ResetPassword from "./pages/ResetPassword.tsx";
import ForgotPassword from "./pages/ForgotPassword.tsx";
import AnimatedStripes from "./components/ui/AnimatedStripes.tsx";

function App() {

    const location = useLocation();
    const isHomePage = location.pathname === "/";

    return (
        <div className="relative min-h-screen bg-[#020617] overflow-x-clip">
            <div className="fixed inset-0 bg-[url(/background.png)] bg-cover bg-center bg-fixed opacity-50"></div>

            {isHomePage && (<AnimatedStripes/>)}

            <div className="relative z-10">
                <Layout>
                    <Routes>
                        <Route index element={<Home />} />
                        <Route path="/about" element={<About />} />
                        <Route path="/register" element={<Registration />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/projects" element={<Projects />} />
                        <Route path="/forgot-password" element={<ForgotPassword/>}/>
                        <Route path="/reset-password" element={<ResetPassword/>}/>
                        <Route path="/profile" element={
                                <PrivateRoute>
                                    <Profile />
                                </PrivateRoute>
                            }
                        />
                        <Route path="/project/:projectId" element={<Kanban/>}/>
                    </Routes>
                </Layout>
            </div>
        </div>
    );
}

export default App;