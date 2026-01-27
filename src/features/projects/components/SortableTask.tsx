import type { Task } from "../../tasks/types";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useAppDispatch } from "../../../app/hooks";
import { deleteTask } from "../../tasks/slice/tasksSlice"; // Убедись, что экшен создан

export function SortableTask({ task }: { task: Task }) {
    const dispatch = useAppDispatch();

    const {
        setNodeRef,
        attributes,
        listeners,
        transform,
        transition,
        isDragging
    } = useSortable({ id: task.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1, // Визуальный эффект при перетаскивании
    };

    const handleDelete = (e: React.MouseEvent) => {
        // КРИТИЧНО: предотвращает срабатывание перетаскивания и открытия карточки
        e.stopPropagation();

        if (window.confirm(`Are you sure you want to delete "${task.title}"?`)) {
            dispatch(deleteTask(task.id));
        }
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            // Добавили group для появления кнопки при наведении
            className="group relative bg-white rounded p-3 shadow-sm cursor-grab hover:shadow-md transition-shadow border border-transparent hover:border-slate-200"
        >
            {/* Область захвата для dnd-kit */}
            <div {...attributes} {...listeners}>
                <div className="font-semibold text-black pr-6">{task.title}</div>
                {task.description && (
                    <div className="text-sm text-slate-600 mt-1 line-clamp-2">
                        {task.description}
                    </div>
                )}
            </div>

            {/* Кнопка удаления в стиле Trello (появляется при hover) */}
            <button
                onClick={handleDelete}
                title="Delete task"
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-all"
            >
                <svg
                    xmlns="http://www.w3.org"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                    className="w-4 h-4"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                </svg>
            </button>
        </div>
    );
}
