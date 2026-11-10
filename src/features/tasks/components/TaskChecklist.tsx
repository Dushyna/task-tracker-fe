import React, { useState } from "react";
import type { ChecklistItem } from "../types";

interface TaskChecklistProps {
    items: ChecklistItem[];
    onSync: (newItems: ChecklistItem[]) => void;
    isCreating: boolean;
    onCloseCreating: () => void;
}

export const TaskChecklist =React.memo( ({ items, onSync, isCreating, onCloseCreating }: TaskChecklistProps) => {
    const [newItemText, setNewItemText] = useState("");

    const completedCount = items.filter(i => i.completed).length;
    const totalCount = items.length;
    const progress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

    const addItem = () => {
        if (newItemText.trim()) {
            onSync([...items, { text: newItemText, completed: false }]);
            setNewItemText("");
        }
    };

    const toggleItem = (itemToToggle: ChecklistItem) => {
        const updated = items.map(item =>
            (item.id === itemToToggle.id || item.text === itemToToggle.text)
                ? { ...item, completed: !item.completed }
                : item
        );
        onSync(updated);
    };

    const deleteItem = (itemToDelete: ChecklistItem) => {
        onSync(items.filter(item =>
            item.id ? item.id !== itemToDelete.id : item.text !== itemToDelete.text
        ));
    };

    if (items.length === 0 && !isCreating) return null;

    return (
        <div className="space-y-4 pt-4 border-t border-slate-200 animate-in slide-in-from-left-4">
            <div className="flex items-center justify-between">
                <h4 className="text-sm font-black text-cyan-400 uppercase tracking-[0.2em] flex items-center gap-3">
                    <span className="text-lg">✅</span>
                    Checklist
                    <span className="text-[10px] bg-cyan-500/10 text-cyan-400 px-2 py-0.5 rounded-lg border border-cyan-500/20 ml-1">
            {completedCount}/{totalCount}
        </span>
                </h4>                <button onClick={onCloseCreating} className="text-[9px] text-cyan-400 hover:text-rose-500 font-black uppercase">Hide</button>
            </div>

            <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden border border-slate-300/50">
                <div className="h-full bg-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.5)] transition-all duration-700" style={{ width: `${progress}%` }} />
            </div>

            <div className="space-y-2">
                {items.map((item, index) => (
                    <div key={item.id || index} className="flex items-center gap-3 group">
                        <button onClick={() => toggleItem(item)} className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${item.completed ? 'bg-cyan-500 border-cyan-500' : 'bg-white border-slate-300'}`}>
                            {item.completed && <span className="text-white text-xs">✓</span>}
                        </button>
                        <span className={`text-sm font-bold flex-1 ${item.completed ? 'text-cyan-400 line-through' : 'text-cyan-600'}`}>{item.text}</span>
                        <button onClick={() => deleteItem(item)} className="p-1 md:opacity-0 md:group-hover:opacity-100 text-rose-400 hover:text-rose-600 transition-opacity">✕</button>
                    </div>
                ))}
            </div>

            <div className="flex gap-2">
                <input
                    className="flex-1 bg-white border-2 border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-cyan-400 outline-none text-black"
                    placeholder="Add an item..."
                    value={newItemText}
                    onChange={(e) => setNewItemText(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && addItem()}
                />
                <button onClick={addItem} className="bg-cyan-500 text-white px-4 py-2 rounded-lg text-[10px] font-black uppercase shadow-md">Add</button>
            </div>
        </div>
    );
});
