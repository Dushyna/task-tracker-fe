import { Link } from "react-router-dom";
import { usePageTitle } from "../app/customHooks/usePageTitle.ts";
import { useTranslation } from "react-i18next";

interface StepItem {
    step: string;
    title: string;
    description: string;
    badgeColor: string;
}

interface UseCaseItem {
    title: string;
    description: string;
    tag: string;
}

export default function About() {
    const { t } = useTranslation();
    usePageTitle(t("about.pageTitle"));

    const STEPS: StepItem[] = [
        {
            step: "01",
            title: t("about.steps.s1Title"),
            description: t("about.steps.s1Desc"),
            badgeColor: "bg-cyan-500/20 text-cyan-300 border-cyan-400/40",
        },
        {
            step: "02",
            title: t("about.steps.s2Title"),
            description: t("about.steps.s2Desc"),
            badgeColor: "bg-fuchsia-500/20 text-fuchsia-300 border-fuchsia-400/40",
        },
        {
            step: "03",
            title: t("about.steps.s3Title"),
            description: t("about.steps.s3Desc"),
            badgeColor: "bg-emerald-500/20 text-emerald-300 border-emerald-400/40",
        },
    ];

    const USE_CASES: UseCaseItem[] = [
        {
            tag: "WORK",
            title: t("about.useCases.workTitle"),
            description: t("about.useCases.workDesc"),
        },
        {
            tag: "STUDY",
            title: t("about.useCases.studyTitle"),
            description: t("about.useCases.studyDesc"),
        },
        {
            tag: "LIFE",
            title: t("about.useCases.lifeTitle"),
            description: t("about.useCases.lifeDesc"),
        },
        {
            tag: "IDEAS",
            title: t("about.useCases.ideasTitle"),
            description: t("about.useCases.ideasDesc"),
        },
    ];

    return (
        <div className="w-full px-4 py-6 text-slate-100 sm:px-6 md:py-10">
            <div className="mx-auto max-w-6xl space-y-8 md:space-y-12">
                <section
                    aria-labelledby="about-hero-title"
                    className="rounded-2xl border border-cyan-400/30 bg-slate-900/60 p-6 shadow-[0_0_30px_rgba(6,182,212,0.2)] backdrop-blur-xl sm:p-8 md:p-10"
                >
                    <div className="max-w-3xl space-y-4">
                        <span className="inline-block rounded-full border border-cyan-400/40 bg-cyan-400/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-cyan-300">
                            {t("about.badge")}
                        </span>

                        <h1
                            id="about-hero-title"
                            className="text-2xl font-bold tracking-tight text-cyan-300 sm:text-3xl md:text-4xl"
                        >
                            {t("about.heroTitle")}
                        </h1>

                        <p className="text-sm leading-relaxed text-slate-200 sm:text-base md:text-lg">
                            {t("about.heroDescStart")}
                            <strong className="font-bold text-cyan-400">Tracker App</strong>
                            {t("about.heroDescEnd")}
                        </p>
                    </div>
                </section>

                <section aria-labelledby="how-it-works-title" className="space-y-4 sm:space-y-6">
                    <div>
                        <h2
                            id="how-it-works-title"
                            className="text-xl font-bold text-cyan-300 sm:text-2xl"
                        >
                            {t("about.howItWorksTitle")}
                        </h2>
                        <p className="text-xs text-cyan-400/80 sm:text-sm">
                            {t("about.howItWorksSubtitle")}
                        </p>
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-3">
                        {STEPS.map((item) => (
                            <article
                                key={item.step}
                                className="flex flex-col justify-between rounded-2xl border border-cyan-400/30 bg-slate-900/60 p-5 shadow-[0_0_20px_rgba(6,182,212,0.15)] backdrop-blur-xl transition-all duration-200 hover:border-cyan-400/60 hover:shadow-[0_0_25px_rgba(6,182,212,0.25)] sm:p-6"
                            >
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <span
                                            className={`inline-flex items-center rounded-lg border px-2.5 py-1 text-xs font-black tracking-wider ${item.badgeColor}`}
                                        >
                                            {t("about.stepLabel", { step: item.step })}
                                        </span>
                                        <span
                                            aria-hidden="true"
                                            className="h-2.5 w-2.5 rounded-full bg-cyan-400 shadow-[0_0_10px_#22d3ee]"
                                        />
                                    </div>

                                    <h3 className="text-lg font-bold text-cyan-300">
                                        {item.title}
                                    </h3>

                                    <p className="text-sm leading-relaxed text-slate-200">
                                        {item.description}
                                    </p>
                                </div>
                            </article>
                        ))}
                    </div>
                </section>

                <section aria-labelledby="use-cases-title" className="space-y-4 sm:space-y-6">
                    <div>
                        <h2
                            id="use-cases-title"
                            className="text-xl font-bold text-cyan-300 sm:text-2xl"
                        >
                            {t("about.useCasesTitle")}
                        </h2>
                        <p className="text-xs text-cyan-400/80 sm:text-sm">
                            {t("about.useCasesSubtitle")}
                        </p>
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        {USE_CASES.map((useCase) => (
                            <article
                                key={useCase.tag}
                                className="rounded-2xl border border-cyan-400/30 bg-slate-900/60 p-5 shadow-[0_0_20px_rgba(6,182,212,0.15)] backdrop-blur-xl transition-all duration-200 hover:border-cyan-400/60 hover:shadow-[0_0_25px_rgba(6,182,212,0.25)] sm:p-6"
                            >
                                <div className="space-y-2.5">
                                    <div className="flex items-center gap-2">
                                        <span className="inline-block h-1.5 w-5 rounded-full bg-fuchsia-500" />
                                        <span className="text-xs font-black uppercase tracking-widest text-cyan-400">
                                            {useCase.tag}
                                        </span>
                                    </div>

                                    <h3 className="text-base font-bold text-white sm:text-lg">
                                        {useCase.title}
                                    </h3>

                                    <p className="text-sm leading-relaxed text-slate-200">
                                        {useCase.description}
                                    </p>
                                </div>
                            </article>
                        ))}
                    </div>
                </section>

                <section
                    aria-labelledby="cta-title"
                    className="flex flex-col items-start justify-between gap-4 rounded-2xl border border-cyan-400/30 bg-slate-900/60 p-6 shadow-[0_0_30px_rgba(6,182,212,0.2)] backdrop-blur-xl sm:flex-row sm:items-center sm:p-8"
                >
                    <div className="space-y-1">
                        <h2 id="cta-title" className="text-lg font-bold text-cyan-300 sm:text-xl">
                            {t("about.ctaTitle")}
                        </h2>
                        <p className="text-sm text-slate-200">
                            {t("about.ctaDesc")}
                        </p>
                    </div>

                    <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
                        <Link
                            to="/"
                            className="inline-flex items-center justify-center rounded-lg border border-cyan-400/40 bg-white/5 px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-cyan-300 transition-all hover:border-cyan-400 hover:bg-cyan-400/10 focus:outline-none focus:ring-2 focus:ring-cyan-400"
                        >
                            {t("about.ctaDemo")}
                        </Link>
                        <Link
                            to="/projects"
                            className="inline-flex items-center justify-center rounded-lg bg-gradient-to-r from-cyan-500 to-cyan-400 px-6 py-2.5 text-xs font-black uppercase tracking-wider text-slate-950 shadow-[0_4px_15px_rgba(6,182,212,0.4)] transition-all hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-cyan-400"
                        >
                            {t("about.ctaProjects")}
                        </Link>
                    </div>
                </section>
            </div>
        </div>
    );
}
