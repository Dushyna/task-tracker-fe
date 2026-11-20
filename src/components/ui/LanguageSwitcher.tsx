import { useTranslation } from "react-i18next";

export default function LanguageSwitcher() {
    const { i18n } = useTranslation();
    const currentLang = i18n.resolvedLanguage || "de";

    const changeLanguage = (lng: "de" | "en") => {
        void i18n.changeLanguage(lng);
    };

    return (
        <div
            role="group"
            aria-label="Language switcher"
            className="inline-flex items-center rounded-xl border border-cyan-400/40 bg-slate-900/80 p-1 shadow-[0_0_12px_rgba(6,182,212,0.25)]"
        >
            <button
                type="button"
                onClick={() => changeLanguage("de")}
                className={`px-2.5 py-1 text-xs font-black tracking-wider rounded-lg transition-all duration-300 cursor-pointer ${
                    currentLang === "de"
                        ? "bg-cyan-500 text-slate-950 shadow-[0_0_12px_rgba(6,182,212,0.8)]"
                        : "text-slate-300 hover:text-cyan-400"
                }`}
            >
                DE
            </button>
            <button
                type="button"
                onClick={() => changeLanguage("en")}
                className={`px-2.5 py-1 text-xs font-black tracking-wider rounded-lg transition-all duration-300 cursor-pointer ${
                    currentLang === "en"
                        ? "bg-cyan-500 text-slate-950 shadow-[0_0_12px_rgba(6,182,212,0.8)]"
                        : "text-slate-300 hover:text-cyan-400"
                }`}
            >
                EN
            </button>
        </div>
    );
}
