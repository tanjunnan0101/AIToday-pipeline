import { EntityCommentForm } from "@/components/comments/entity-comment-form";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader } from "@/components/ui/card";
import { CreateTaskForm } from "@/components/tasks/create-task-form";
import { SubtaskForm } from "@/components/tasks/subtask-form";
import { deleteTaskAction } from "@/app/(workspace)/tasks/actions";
import { listClients, listComments, listStages, listSubtasks, listTasks, listUsers } from "@/lib/data-access";
import { formatHours } from "@/lib/utils";

export default async function TasksPage() {
  const [tasks, stages, users, clients, subtasks, comments] = await Promise.all([
    listTasks(),
    listStages(),
    listUsers(),
    listClients(),
    listSubtasks(),
    listComments(),
  ]);

  return (
    <div className="grid gap-6 xl:grid-cols-[0.95fr_1.35fr]">
      <Card>
        <CardHeader
          eyebrow="Create task"
          title="Add operational work"
          body="Use this to create top-level delivery tasks, assign owners, and optionally expose work in client-facing views."
        />
        <CreateTaskForm clients={clients} stages={stages} tasks={tasks} users={users} />
      </Card>

      <Card>
        <CardHeader
          eyebrow="Task table"
          title="Operational work items"
          body="Assignments, priorities, blockers, and estimated-vs-actual effort are all modeled at the task layer."
        />
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="text-left text-slate-400">
              <tr>
                <th className="border-b border-slate-200 px-3 py-3">Task</th>
                <th className="border-b border-slate-200 px-3 py-3">Stage</th>
                <th className="border-b border-slate-200 px-3 py-3">Owner</th>
                <th className="border-b border-slate-200 px-3 py-3">Status</th>
                <th className="border-b border-slate-200 px-3 py-3">Hours</th>
              </tr>
            </thead>
            <tbody>
              {tasks.map((task) => {
                const stage = stages.find((entry) => entry.id === task.stageId);
                const owner = users.find((user) => user.id === task.primaryOwnerId);
                const taskSubtasks = subtasks.filter((subtask) => subtask.taskId === task.id);
                const taskComments = comments.filter(
                  (comment) => comment.entityType === "TASK" && comment.entityId === task.id,
                );

                return (
                  <tr key={task.id} className="border-b border-slate-100">
                    <td className="px-3 py-4">
                      <p className="font-medium text-slate-950">{task.title}</p>
                      <p className="mt-1 text-slate-500">{task.description}</p>
                      <details className="mt-4 rounded-2xl border border-slate-200/80 bg-slate-50/60 p-4">
                        <summary className="cursor-pointer text-sm font-medium text-slate-700">
                          Edit task
                        </summary>
                        <div className="mt-4 space-y-4">
                          <CreateTaskForm
                            clients={clients}
                            mode="edit"
                            stages={stages}
                            task={task}
                            tasks={tasks}
                            users={users}
                          />
                          <form action={async () => {
                            "use server";
                            await deleteTaskAction(task.id);
                          }}>
                            <button
                              className="inline-flex rounded-full border border-rose-200 px-4 py-2 text-sm font-medium text-rose-700"
                              type="submit"
                            >
                              Delete Task
                            </button>
                          </form>
                        </div>
                      </details>
                      <details className="mt-4 rounded-2xl border border-slate-200/80 bg-white p-4">
                        <summary className="cursor-pointer text-sm font-medium text-slate-700">
                          Subtasks ({taskSubtasks.length})
                        </summary>
                        <div className="mt-4 space-y-4">
                          <SubtaskForm taskId={task.id} />
                          {taskSubtasks.length ? (
                            taskSubtasks.map((subtask) => (
                              <div
                                key={subtask.id}
                                className="rounded-2xl border border-slate-200/70 bg-slate-50/60 p-4"
                              >
                                <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                                  <div>
                                    <p className="font-medium text-slate-950">{subtask.title}</p>
                                    <p className="text-sm text-slate-600">
                                      {subtask.startDate} to {subtask.endDate}
                                    </p>
                                  </div>
                                  <Badge tone={subtask.status === "COMPLETED" ? "success" : "info"}>
                                    {subtask.status.replaceAll("_", " ")}
                                  </Badge>
                                </div>
                                <p className="mt-2 text-sm text-slate-600">
                                  {formatHours(subtask.actualHours)} / {formatHours(subtask.estimatedHours)}
                                </p>
                                <div className="mt-4">
                                  <SubtaskForm subtask={subtask} taskId={task.id} />
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="rounded-2xl border border-dashed border-slate-200/80 p-4 text-sm text-slate-500">
                              No subtasks added yet.
                            </div>
                          )}
                        </div>
                      </details>
                      <details className="mt-4 rounded-2xl border border-slate-200/80 bg-white p-4">
                        <summary className="cursor-pointer text-sm font-medium text-slate-700">
                          Comments ({taskComments.length})
                        </summary>
                        <div className="mt-4 space-y-4">
                          <EntityCommentForm
                            entityId={task.id}
                            entityType="TASK"
                            revalidateTarget="/tasks"
                          />
                          {taskComments.length ? (
                            taskComments.map((comment) => {
                              const author = users.find((user) => user.id === comment.authorId);
                              return (
                                <div key={comment.id} className="rounded-2xl border border-slate-200/70 p-4 text-sm">
                                  <p className="font-medium text-slate-950">{author?.name ?? "Unknown user"}</p>
                                  <p className="mt-1 text-slate-600">{comment.message}</p>
                                </div>
                              );
                            })
                          ) : (
                            <div className="rounded-2xl border border-dashed border-slate-200/80 p-4 text-sm text-slate-500">
                              No comments added yet.
                            </div>
                          )}
                        </div>
                      </details>
                    </td>
                    <td className="px-3 py-4 text-slate-600">
                      {stage?.name ?? "Unmapped stage"}
                    </td>
                    <td className="px-3 py-4 text-slate-600">{owner?.name ?? "Unassigned"}</td>
                    <td className="px-3 py-4">
                      <Badge tone={task.blocker ? "danger" : "info"}>
                        {task.status.replaceAll("_", " ")}
                      </Badge>
                    </td>
                    <td className="px-3 py-4 text-slate-600">
                      {formatHours(task.actualHours)} / {formatHours(task.estimatedHours)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
