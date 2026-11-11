import { Link } from "react-router-dom";
import { usePageTitle } from "../app/customHooks/usePageTitle.ts";

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

const STEPS: StepItem[] = [
    {
        step: "01",
        title: "Projekte erstellen",
        description:
            "Lege im Tab „Projects“ für jeden Lebensbereich oder jedes Vorhaben ein eigenes Projekt an. Auf der Startseite („Home“) kannst du die Funktionen vorab direkt im Demo-Modus testen.",
        badgeColor: "bg-cyan-500/20 text-cyan-300 border-cyan-400/40",
    },
    {
        step: "02",
        title: "Status-Spalten anpassen",
        description:
            "Definiere individuelle Spalten wie „To Do“, „In Arbeit“ oder „Erledigt“. Passe deinen Workflow jederzeit flexibel an und verfolge den Fortschritt visuell.",
        badgeColor: "bg-fuchsia-500/20 text-fuchsia-300 border-fuchsia-400/40",
    },
    {
        step: "03",
        title: "Aufgaben verwalten",
        description:
            "Erstelle Aufgabenkarten, ergänze Details, Kommentare oder Anhänge und verschiebe sie einfach in die nächste Status-Spalte, sobald sich der Stand ändert.",
        badgeColor: "bg-emerald-500/20 text-emerald-300 border-emerald-400/40",
    },
];

const USE_CASES: UseCaseItem[] = [
    {
        tag: "WORK",
        title: "Arbeit & Freelancing",
        description:
            "Verwalte Kundenprojekte, plane Sprints, lade Teammitglieder über „Invite User“ ein und behalte alle Deadlines sicher im Blick.",
    },
    {
        tag: "STUDY",
        title: "Studium & Weiterbildung",
        description:
            "Organisiere Prüfungsphasen, Hausarbeiten, Literatur und Lernziele strukturiert an einem zentralen Ort.",
    },
    {
        tag: "LIFE",
        title: "Alltag & Privatleben",
        description:
            "Plane deinen nächsten Urlaub, einen Umzug, Renovierungen oder deine wöchentlichen To-dos ohne Stress.",
    },
    {
        tag: "IDEAS",
        title: "Hobby & Side-Projects",
        description:
            "Sammle Ideen für eigene App-Projekte oder kreative Vorhaben und setze sie Schritt für Schritt in die Tat um.",
    },
];

export default function About() {
    usePageTitle("TrackerApp | About");

    return (
        <div className="w-full px-4 py-6 text-slate-100 sm:px-6 md:py-10">
            <div className="mx-auto max-w-6xl space-y-8 md:space-y-12">
                {/* Hero-блок в стиле стеклянных контейнеров Home */}
                <section
                    aria-labelledby="about-hero-title"
                    className="rounded-2xl border border-cyan-400/30 bg-slate-900/60 p-6 shadow-[0_0_30px_rgba(6,182,212,0.2)] backdrop-blur-xl sm:p-8 md:p-10"
                >
                    <div className="max-w-3xl space-y-4">
            <span className="inline-block rounded-full border border-cyan-400/40 bg-cyan-400/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-cyan-300">
              Über Tracker App
            </span>

                        <h1
                            id="about-hero-title"
                            className="text-2xl font-bold tracking-tight text-cyan-300 sm:text-3xl md:text-4xl"
                        >
                            Einfach. Übersichtlich. Effektiv.
                        </h1>

                        <p className="text-sm leading-relaxed text-slate-200 sm:text-base md:text-lg">
                            Behalte den vollen Überblick über deine Projekte und erledige deine
                            Aufgaben ohne Chaos. Egal ob im Alltag, im Studium oder bei der
                            Arbeit – mit <strong className="font-bold text-cyan-400">Tracker App</strong>{" "}
                            organisierst du deine Workflows genau so, wie es zu dir passt.
                        </p>
                    </div>
                </section>

                {/* Блок "Как это работает" */}
                <section aria-labelledby="how-it-works-title" className="space-y-4 sm:space-y-6">
                    <div>
                        <h2
                            id="how-it-works-title"
                            className="text-xl font-bold text-cyan-300 sm:text-2xl"
                        >
                            So funktioniert’s in 3 Schritten
                        </h2>
                        <p className="text-xs text-cyan-400/80 sm:text-sm">
                            Vom ersten Projekt bis zur erledigten Aufgabe
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
                      SCHRITT {item.step}
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

                {/* Блок "Для каких целей использовать" */}
                <section aria-labelledby="use-cases-title" className="space-y-4 sm:space-y-6">
                    <div>
                        <h2
                            id="use-cases-title"
                            className="text-xl font-bold text-cyan-300 sm:text-2xl"
                        >
                            Wofür kannst du den TaskTracker nutzen?
                        </h2>
                        <p className="text-xs text-cyan-400/80 sm:text-sm">
                            Flexibel einsetzbar für jeden Bereich deines Lebens
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

                {/* Финальный CTA-блок с градиентной кнопкой из Home.tsx */}
                <section
                    aria-labelledby="cta-title"
                    className="flex flex-col items-start justify-between gap-4 rounded-2xl border border-cyan-400/30 bg-slate-900/60 p-6 shadow-[0_0_30px_rgba(6,182,212,0.2)] backdrop-blur-xl sm:flex-row sm:items-center sm:p-8"
                >
                    <div className="space-y-1">
                        <h2 id="cta-title" className="text-lg font-bold text-cyan-300 sm:text-xl">
                            Bereit, durchzustarten?
                        </h2>
                        <p className="text-sm text-slate-200">
                            Erstelle jetzt dein erstes Projekt oder teste das Board direkt auf der Startseite.
                        </p>
                    </div>

                    <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
                        <Link
                            to="/"
                            className="inline-flex items-center justify-center rounded-lg border border-cyan-400/40 bg-white/5 px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-cyan-300 transition-all hover:border-cyan-400 hover:bg-cyan-400/10 focus:outline-none focus:ring-2 focus:ring-cyan-400"
                        >
                            Demo testen
                        </Link>
                        <Link
                            to="/projects"
                            className="inline-flex items-center justify-center rounded-lg bg-gradient-to-r from-cyan-500 to-cyan-400 px-6 py-2.5 text-xs font-black uppercase tracking-wider text-slate-950 shadow-[0_4px_15px_rgba(6,182,212,0.4)] transition-all hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-cyan-400"
                        >
                            Zu den Projekten
                        </Link>
                    </div>
                </section>
            </div>
        </div>
    );
}
