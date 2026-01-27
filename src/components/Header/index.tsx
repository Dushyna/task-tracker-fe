import {Link, useNavigate} from "react-router-dom";
import {useAppDispatch, useAppSelector} from "../../app/hooks.ts";
import {logout, selectInitialized, selectIsAuthenticated, selectUser} from "../../features/auth/slice/authSlice.ts";

export default function Header() {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const isAuthenticated = useAppSelector(selectIsAuthenticated);
    const user = useAppSelector(selectUser);
    const initialized = useAppSelector(selectInitialized);

    const handleLogout = async () => {
        await dispatch(logout());
        navigate("/login");
    }

    return (
        <header className="w-full sticky top-0 z-50 px-6 py-6">
            <div className="mx-auto max-w-7xl relative group">
                <div className="relative z-10 flex items-center justify-between px-8 py-4 rounded-2xl border border-cyan-400/50 bg-slate-950/90 backdrop-blur-2xl shadow-[0_5px_15px_rgba(0,0,0,0.8),0_0_25px_rgba(6,182,212,0.8)] transition-all duration-500 ease-in-out hover:scale-[1.05] hover:shadow-[0_10px_80px_rgba(6,182,212,0.6)] origin-center">

                    <Link to="/" className="flex items-center space-x-3">
                        <div className="relative flex items-center justify-center w-20 h-20 transition-all duration-500 hover:scale-[1.35]">
                            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="absolute animate-[spin_10s_linear_infinite]">
                                <circle cx="12" cy="12" r="10" stroke="#22d3ee" strokeWidth="1" strokeDasharray="4 4" className="opacity-50" />
                            </svg>
                            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="relative drop-shadow-[0_0_8px_rgba(34,211,238,1)] transition-all duration-500">
                                <circle cx="12" cy="12" r="8" stroke="#22d3ee" strokeWidth="2" />
                                <path d="M12 8V12M12 12H16M12 12V16M12 12H8" stroke="#22d3ee" strokeWidth="2" strokeLinecap="round" />
                                <circle cx="12" cy="12" r="2" fill="white" className="animate-pulse" />
                            </svg>
                        </div>

                        <span className="text-4xl tracking-tighter drop-shadow-[0_0_10px_rgba(6,182,212,1)] transition-all duration-500 hover:scale-[1.25] flex items-baseline">
                            <span className="text-white font-black tracking-wider logo-wave-text transition-all duration-500">
                                Tracker
                            </span>
                            <span className="text-cyan-400 font-black hover:text-white transition-all duration-500 ml-1">
                                UP
                            </span>
                        </span>
                    </Link>

                    <nav className="flex items-center space-x-8">
                        <Link 
                            to="/" 
                            className="text-sm font-bold text-white hover:text-cyan-400 hover:scale-[1.35] hover:drop-shadow-[0_0_15px_rgba(6,182,212,1)] hover:text-shadow-[0_0_10px_rgba(6,182,212,0.8)] transition-all duration-300 ease-in-out"
                        >
                            Home
                        </Link>
                        <Link 
                            to="/about" 
                            className="text-sm font-bold text-white hover:text-cyan-400 hover:scale-[1.35] hover:drop-shadow-[0_0_15px_rgba(6,182,212,1)] hover:text-shadow-[0_0_10px_rgba(6,182,212,0.8)] transition-all duration-300 ease-in-out"
                        >
                            About
                        </Link>
                        <Link 
                            to="/projects" 
                            className="text-sm font-bold text-white hover:text-cyan-400 hover:scale-[1.35] hover:drop-shadow-[0_0_15px_rgba(6,182,212,1)] hover:text-shadow-[0_0_10px_rgba(6,182,212,0.8)] transition-all duration-300 ease-in-out"
                        >
                            Projects
                        </Link>

                        <div
                            className="flex items-center space-x-4 ml-6 min-w-[350px] flex-shrink-0 transition-all duration-300"
                        >
                            {initialized ? (
                                isAuthenticated ? (
                                    <>
                                        <span className="text-sm font-bold text-cyan-400/80 italic">
                                            {user?.email}
                                        </span>
                                        <button
                                            onClick={handleLogout}
                                            className="rounded-xl bg-cyan-500 border border-cyan-300/50 px-6 py-2.5 text-sm font-black text-white shadow-[0_0_20px_rgba(6,182,212,0.6)] hover:scale-[1.35] hover:bg-cyan-400 hover:shadow-[0_0_35px_rgba(6,182,212,0.9)] hover:text-shadow-[0_0_10px_rgba(255,255,255,0.8)] transition-all duration-300 ease-in-out"
                                        >
                                            Logout
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <Link
                                            to="/register"
                                            className="text-sm font-bold text-white hover:text-cyan-400 hover:scale-[1.35] hover:drop-shadow-[0_0_15px_rgba(6,182,212,1)] hover:text-shadow-[0_0_10px_rgba(6,182,212,0.8)] transition-all duration-300 ease-in-out"
                                        >
                                            Sign up
                                        </Link>
                                        <Link
                                            to="/login"
                                            className="rounded-xl bg-cyan-500 border border-cyan-300/50 px-6 py-2.5 text-sm font-black text-white shadow-[0_0_20px_rgba(6,182,212,0.6)] hover:scale-[1.35] hover:bg-cyan-400 hover:shadow-[0_0_35px_rgba(6,182,212,0.9)] hover:text-shadow-[0_0_10px_rgba(255,255,255,0.8)] transition-all duration-300 ease-in-out"
                                        >
                                            Sign in
                                        </Link>
                                    </>
                                )
                            ) : (
                                <>
                                    <div className="h-5 w-24 bg-slate-950/90 rounded animate-pulse"></div>
                                    <div className="h-10 w-20 bg-slate-950/90 rounded animate-pulse"></div>
                                </>
                            )}
                        </div>
                    </nav>
                </div>
            </div>
        </header>
    );
}