import React from "react";
import Header from "../components/Header";

interface LayoutProps {
    children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {

    return (
        <div className="min-h-screen flex flex-col bg-transparent text-gray-100">
            <Header />
            <main className="flex-1 w-full max-w-7xl mx-auto px-4 py-6">
                {children}
            </main>
            <footer className="w-full bg-black/20 backdrop-blur-md border-t border-white/10 py-4 text-sm text-center text-gray-400">
                &copy; {new Date().getFullYear()} Tracker App. All rights reserved.
            </footer>
        </div>
    );
};

export default Layout;