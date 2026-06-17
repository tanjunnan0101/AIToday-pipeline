"use client";

import { useActionState } from "react";

import {
  createEntityCommentAction,
  type CreateEntityCommentFormState,
} from "@/app/(workspace)/comments/actions";
import type { CommentRecord } from "@/lib/domain";

const initialState: CreateEntityCommentFormState = {};

function FieldError({ errors }: { errors?: string[] }) {
  if (!errors?.length) return null;
  return <p className="mt-2 text-xs text-rose-600">{errors[0]}</p>;
}

export function EntityCommentForm({
  entityType,
  entityId,
  revalidateTarget,
}: {
  entityType: CommentRecord["entityType"];
  entityId: string;
  revalidateTarget: string;
}) {
  const [state, formAction, pending] = useActionState(createEntityCommentAction, initialState);

  return (
    <form action={formAction} className="space-y-4 rounded-2xl border border-dashed border-slate-200/80 p-4">
      <input name="entityType" type="hidden" value={entityType} />
      <input name="entityId" type="hidden" value={entityId} />
      <input name="revalidateTarget" type="hidden" value={revalidateTarget} />

      <label className="block text-sm text-slate-700">
        Add comment
        <textarea
          className="mt-2 min-h-24 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none"
          name="message"
          placeholder="Internal note, blocker detail, or client-facing update..."
        />
        <FieldError errors={state.fieldErrors?.message} />
      </label>

      <label className="flex items-center gap-3 text-sm text-slate-700">
        <input className="size-4 rounded border border-slate-300" name="clientFacing" type="checkbox" />
        Mark as client-facing
      </label>

      {state.message ? <p className="text-sm text-slate-600">{state.message}</p> : null}

      <button
        className="inline-flex rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white disabled:opacity-60"
        disabled={pending}
        type="submit"
      >
        {pending ? "Saving comment..." : "Add Comment"}
      </button>
    </form>
  );
}
