import { useState } from "react";
import {useSensor, useSensors,
    PointerSensor, TouchSensor, closestCorners, defaultDropAnimationSideEffects
} from "@dnd-kit/core";
import type {DragStartEvent, DragEndEvent}from "@dnd-kit/core";
import { useAppDispatch } from "../../../app/hooks";
import { updateTask } from "../../tasks/slice/tasksSlice";
import type {Task, UpdateTaskDto} from "../../tasks/types";
import type { TaskStatus } from "../../statuses/types";
import {updateTaskStatusesOrder} from "../../statuses/slice/taskStatusSlice.ts";
import {arrayMove} from "@dnd-kit/sortable";

export const useKanbanDnd = (tasks: Task[], statuses: TaskStatus[]) => {
    const dispatch = useAppDispatch();
    const [activeTask, setActiveTask] = useState<Task | null>(null);

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
        useSensor(TouchSensor, {
            activationConstraint: { delay: 250, tolerance: 5 }
        })
    );

    const handleDragStart = (event: DragStartEvent) => {
        const task = tasks.find(t => t.id === event.active.id);
        if (task) setActiveTask(task);
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        setActiveTask(null);
        if (!over) return;

        const activeId = String(active.id);
        const overId = String(over.id);

        if (active.data.current?.type === 'Status') {
            const oldIndex = statuses.findIndex(s => s.id === activeId);
            const newIndex = statuses.findIndex(s => s.id === overId);

            if (oldIndex !== newIndex && oldIndex !== -1 && newIndex !== -1) {
                const newOrder = arrayMove(statuses, oldIndex, newIndex).map((s, index) => ({
                    ...s,
                    position: index
                }));
                dispatch(updateTaskStatusesOrder(newOrder));
            }
            return;
        }


        const task = tasks.find(t => t.id === activeId);
        if (!task) return;

        let newStatusId: string;
        if (statuses.some(s => s.id === overId)) {
            newStatusId = overId;
        } else {
            const overTask = tasks.find(t => t.id === overId);
            newStatusId = overTask ? overTask.statusId : task.statusId;
        }

        if (task.statusId !== newStatusId) {
            const updateDto: Partial<UpdateTaskDto> = { statusId: newStatusId };
            dispatch(updateTask({ id: activeId, dto: updateDto as UpdateTaskDto }));
        }
    };

    const dropAnimation = {
        sideEffects: defaultDropAnimationSideEffects({
            styles: { active: { opacity: '0.5' } },
        }),
    };

    return {
        sensors,
        activeTask,
        handleDragStart,
        handleDragEnd,
        collisionDetection: closestCorners,
        dropAnimation
    };
};
