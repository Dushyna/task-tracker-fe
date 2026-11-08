import { useSortable } from "@dnd-kit/sortable";
import type { ReactNode } from 'react';
import { CSS } from "@dnd-kit/utilities";
import { Column } from "./Column";
import type { TaskStatus } from "../../statuses/types";
import type { DraggableAttributes } from "@dnd-kit/core";
import type { SyntheticListenerMap } from "@dnd-kit/core/dist/hooks/utilities";

export interface SortableColumnProps {
    status: TaskStatus;
    allStatusNames: string[];
    children: ReactNode;
    onAddTask: () => void;
    onDelete?: () => void;
    canDelete?: boolean;
    dragAttributes?: DraggableAttributes;
    dragListeners?: SyntheticListenerMap;
}

export function SortableColumn(props: SortableColumnProps) {
    const {
        setNodeRef,
        transform,
        transition,
        isDragging,
        attributes, // Извлекаем отсюда
        listeners,  // Извлекаем отсюда
    } = useSortable({
        id: props.status.id,
        data: {
            type: "Status",
        },
    });

    const style = {
        transform: CSS.Translate.toString(transform),
        transition,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`${isDragging ? "opacity-30" : "opacity-100"} transition-opacity h-full`}
        >
            {/* Убрали лишний div! Передаем слушатели напрямую в компонент Column */}
            <Column
                {...props}
                dragAttributes={attributes}
                dragListeners={listeners}
            />
        </div>
    );
}
