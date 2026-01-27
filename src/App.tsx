import {Route, Routes} from "react-router-dom";
import Home from "./pages/Home";
import About from "./pages/About";
import Layout from "./layouts/Layout";
import Registration from "./pages/Registration";
import Login from "./pages/Login";
import Projects from "./pages/Projects";
import Profile from "./pages/Profile";
import PrivateRoute from "./components/PrivateRoute";
import Kanban from "./pages/Kanban";
import ForgotPassword from "./pages/ForgotPassword.tsx";
import ResetPassword from "./pages/ResetPassword.tsx";

function App() {
    return (
        <div className="relative min-h-screen bg-[#020617] overflow-hidden">
            <div className="fixed inset-0 bg-[url(/background.png)] bg-cover bg-center bg-fixed opacity-50"></div>

            <div className="fixed inset-0 pointer-events-none">
                <div
                    className="absolute top-[35%] left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent animate-pulse-flow animate-flicker"></div>
                <div
                    className="absolute top-[55%] left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-purple-500 to-transparent animate-pulse-flow animate-flicker [animation-delay:3s]"></div>
                <div
                    className="absolute top-[75%] left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-blue-500 to-transparent animate-pulse-flow animate-flicker [animation-delay:1.5s]"></div>
            </div>

            <div className="relative z-10">
                <Layout>
                    <Routes>
                        <Route index element={<Home/>}/>
                        <Route path="/about" element={<About/>}/>
                        <Route path="/register" element={<Registration/>}/>
                        <Route path="/login" element={<Login/>}/>
                        <Route path="/projects" element={<Projects/>}/>
                        <Route path="/forgot-password" element={<ForgotPassword/>}/>
                        <Route path="/reset-password" element={<ResetPassword/>}/>

                        <Route path="/profile" element={
                            <PrivateRoute>
                                <Profile/>
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