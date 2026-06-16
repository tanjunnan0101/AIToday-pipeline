"use client";

import { useMemo, useOptimistic, useTransition } from "react";

import {
  DndContext,
  PointerSensor,
  closestCorners,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";

import { moveTaskAction } from "@/app/(workspace)/kanban/actions";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader } from "@/components/ui/card";
import { taskStatuses, type Task, type User } from "@/lib/domain";

function KanbanCard({ task, ownerName }: { task: Task; ownerName: string }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: task.id,
    data: {
      taskId: task.id,
      status: task.status,
    },
  });

  return (
    <div
      ref={setNodeRef}
      className="rounded-2xl border border-slate-200/70 bg-slate-50/70 p-4 shadow-sm"
      style={{
        opacity: isDragging ? 0.55 : 1,
        transform: transform
          ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
          : undefined,
      }}
      {...attributes}
      {...listeners}
    >
      <p className="font-semibold text-slate-950">{task.title}</p>
      <p className="mt-1 text-sm text-slate-600">{ownerName}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        <Badge tone={task.priority === "URGENT" ? "danger" : "warning"}>
          {task.priority}
        </Badge>
        <Badge tone={task.blocker ? "danger" : "default"}>
          {task.blocker ? "Blocked" : "Clear"}
        </Badge>
      </div>
    </div>
  );
}

function KanbanColumn({
  status,
  tasks,
  users,
}: {
  status: Task["status"];
  tasks: Task[];
  users: User[];
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: status,
  });

  return (
    <Card key={status} className={`min-h-64 ${isOver ? "ring-2 ring-cyan-400" : ""}`}>
      <CardHeader title={status.replaceAll("_", " ")} body={`${tasks.length} tasks`} />
      <div ref={setNodeRef} className="space-y-3 rounded-2xl transition">
        {tasks.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 px-4 py-6 text-sm text-slate-500">
            No tasks in this column yet.
          </div>
        ) : null}
        {tasks.map((task) => {
          const owner = users.find((user) => user.id === task.primaryOwnerId);

          return (
            <KanbanCard
              key={task.id}
              ownerName={owner?.name ?? "Unassigned"}
              task={task}
            />
          );
        })}
      </div>
    </Card>
  );
}

export function KanbanBoard({ tasks, users }: { tasks: Task[]; users: User[] }) {
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));
  const [isPending, startTransition] = useTransition();
  const [optimisticTasks, applyOptimisticTaskMove] = useOptimistic(
    tasks,
    (currentTasks, update: { taskId: string; status: Task["status"] }) =>
      currentTasks.map((task) =>
        task.id === update.taskId
          ? {
              ...task,
              status: update.status,
              blocker: update.status === "BLOCKED",
              completionPercent:
                update.status === "COMPLETED" ? 100 : task.completionPercent,
            }
          : task,
      ),
  );

  const groupedTasks = useMemo(
    () =>
      Object.fromEntries(
        taskStatuses.map((status) => [
          status,
          optimisticTasks.filter((task) => task.status === status),
        ]),
      ) as Record<Task["status"], Task[]>,
    [optimisticTasks],
  );

  function handleDragEnd(event: DragEndEvent) {
    const taskId = String(event.active.id);
    const nextStatus = event.over?.id;

    if (!nextStatus || !taskStatuses.includes(String(nextStatus) as Task["status"])) {
      return;
    }

    const currentTask = optimisticTasks.find((task) => task.id === taskId);
    if (!currentTask || currentTask.status === nextStatus) {
      return;
    }

    applyOptimisticTaskMove({ taskId, status: nextStatus as Task["status"] });

    startTransition(async () => {
      await moveTaskAction({ taskId, status: String(nextStatus) });
    });
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-sm text-slate-500">
        <p>Drag tasks between columns to persist status changes.</p>
        {isPending ? <p>Saving...</p> : null}
      </div>
      <DndContext
        collisionDetection={closestCorners}
        onDragEnd={handleDragEnd}
        sensors={sensors}
      >
        <div className="grid gap-4 xl:grid-cols-7">
          {taskStatuses.map((status) => (
            <KanbanColumn
              key={status}
              status={status}
              tasks={groupedTasks[status]}
              users={users}
            />
          ))}
        </div>
      </DndContext>
    </div>
  );
}
