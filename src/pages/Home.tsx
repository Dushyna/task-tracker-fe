import { useState } from "react";
import { Link } from "react-router-dom";
import List from "../components/List";
import CardModal from "../components/List/CardModal";
import { usePageTitle } from "../app/customHooks/usePageTitle.ts";

interface Column {
    id: string;
    title: string;
    cards: Array<{ id: string; title: string; description: string }>;
}

export default function Home() {
    usePageTitle("TrackerApp");
    const [columns, setColumns] = useState<Column[]>([
        { id: "1", title: "To Do", cards: [] },
    ]);
    const [isAddingList, setIsAddingList] = useState(false);
    const [newListTitle, setNewListTitle] = useState("");
    const [selectedCard, setSelectedCard] = useState<{ id: string; title: string; description: string } | null>(null);

    const handleAddList = () => {
        if (newListTitle.trim()) {
            const newColumn: Column = {
                id: Date.now().toString(),
                title: newListTitle.trim(),
                cards: [],
            };
            setColumns([...columns, newColumn]);
            setNewListTitle("");
        }
    };

    const handleUpdateCards = (columnId: string, cards: Column["cards"]) => {
        setColumns(
            columns.map((col) => (col.id === columnId ? { ...col, cards } : col))
        );
    };

    return (
        <>
            <div className="px-8 pt-6">
                <h2 className="text-cyan-300 text-2xl font-bold mb-2">
                    Willkommen bei der Tracker App!
                </h2>
                <p className="text-cyan-300/90 text-base mb-4">
                    Hier auf der Startseite können Sie direkt im Sandbox-Modus testen, wie man Status-Spalten anlegt und Aufgabenkarten erstellt.
                </p>

                <div className="max-w-3xl bg-slate-900/60 backdrop-blur-xl rounded-2xl border border-cyan-400/30 p-5 shadow-[0_0_25px_rgba(6,182,212,0.15)]">
                    <h3 className="text-cyan-400 font-bold text-lg mb-2">
                        Demo-Version mit Beispielprojekten testen (ohne Registrierung):
                    </h3>
                    <p className="text-slate-300 text-sm mb-3">
                        Möchten Sie realistische Praxisbeispiele (z. B. Hotel Housekeeping, Restaurant-Schichtbetrieb oder IT-Release-Planung) mit Checklisten, Markern und Kommentaren ausprobieren? So geht&apos;s:
                    </p>
                    <ol className="list-decimal list-inside space-y-1.5 text-sm text-cyan-100/90">
                        <li>
                            Klicken Sie oben rechts auf{" "}
                            <Link to="/login" className="text-cyan-400 underline hover:text-cyan-300 font-semibold">
                                Sign in
                            </Link>{" "}
                            und wählen Sie <span className="text-cyan-300 font-semibold">„Quick Demo Login“</span>.
                        </li>
                        <li>
                            Wechseln Sie danach oben im Menü auf den Tab{" "}
                            <Link to="/projects" className="text-cyan-400 underline hover:text-cyan-300 font-semibold">
                                Projects
                            </Link>
                            , um die vorbereiteten Beispielprojekte zu öffnen.
                        </li>
                        <li>
                            Verschieben Sie Aufgaben per Drag &amp; Drop, bearbeiten Sie Checklisten oder testen Sie die Filterfunktionen.
                        </li>
                    </ol>
                </div>
            </div>

            <div className="flex flex-row gap-6 p-8 items-start">
                {columns.map((column) => (
                    <List
                        key={column.id}
                        id={column.id}
                        title={column.title}
                        cards={column.cards}
                        onUpdateCards={handleUpdateCards}
                        onCardClick={setSelectedCard}
                    />
                ))}
                {isAddingList ? (
                    <div className="w-[300px] bg-slate-900/60 backdrop-blur-xl rounded-2xl border border-cyan-400/30 p-4 shadow-[0_0_30px_rgba(6,182,212,0.2)]">
                        <input
                            type="text"
                            value={newListTitle}
                            onChange={(e) => setNewListTitle(e.target.value)}
                            placeholder="Spaltenname eingeben (z. B. In Arbeit)..."
                            className="w-full px-4 py-3 bg-white rounded-xl text-slate-800 placeholder:text-slate-400 font-bold border-2 border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.3)] focus:outline-none transition-all mb-4"
                            autoFocus
                            onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                    handleAddList();
                                } else if (e.key === "Escape") {
                                    setIsAddingList(false);
                                    setNewListTitle("");
                                }
                            }}
                        />
                        <div className="flex gap-2">
                            <button
                                onClick={handleAddList}
                                className="flex-1 px-4 py-2.5 bg-gradient-to-r from-cyan-500 to-cyan-400 text-white text-xs font-black rounded-lg shadow-[0_4px_15px_rgba(6,182,212,0.4)] hover:brightness-110 transition-all uppercase"
                            >
                                Spalte hinzufügen
                            </button>
                            <button
                                onClick={() => {
                                    setIsAddingList(false);
                                    setNewListTitle("");
                                }}
                                className="px-4 py-2.5 text-slate-400 hover:text-white text-xs font-bold transition-colors"
                            >
                                Abbrechen
                            </button>
                        </div>
                    </div>
                ) : (
                    <button
                        onClick={() => setIsAddingList(true)}
                        className="w-[300px] h-fit bg-white/5 backdrop-blur-md rounded-2xl border-2 border-dashed border-cyan-400/30 text-cyan-400 hover:bg-cyan-400/10 hover:border-cyan-400 hover:shadow-[0_0_20px_rgba(6,182,212,0.2)] transition-all p-5 text-center font-bold"
                    >
                        + Spalte hinzufügen (Task-Status)
                    </button>
                )}
            </div>
            {selectedCard && (
                <CardModal card={selectedCard} onClose={() => setSelectedCard(null)} />
            )}
        </>
    );
}
