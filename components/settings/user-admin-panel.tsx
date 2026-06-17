"use client";

import { useActionState } from "react";

import {
  createUserAction,
  updateUserAction,
  type UserAdminFormState,
} from "@/app/(workspace)/settings/actions";
import { userRoles, type User } from "@/lib/domain";

const initialState: UserAdminFormState = {};

function FieldError({ errors }: { errors?: string[] }) {
  if (!errors?.length) {
    return null;
  }

  return <p className="mt-2 text-xs text-rose-600">{errors[0]}</p>;
}

function CreateUserForm() {
  const [state, formAction, pending] = useActionState(createUserAction, initialState);

  return (
    <form action={formAction} className="space-y-4 rounded-2xl border border-dashed border-slate-200/80 p-4">
      <div className="grid gap-4 md:grid-cols-2">
        <label className="block text-sm text-slate-700">
          Name
          <input
            className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none"
            name="name"
            placeholder="New team member"
          />
          <FieldError errors={state.fieldErrors?.name} />
        </label>
        <label className="block text-sm text-slate-700">
          Email
          <input
            className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none"
            name="email"
            placeholder="user@aitoday.sg"
            type="email"
          />
          <FieldError errors={state.fieldErrors?.email} />
        </label>
        <label className="block text-sm text-slate-700">
          Role
          <select
            className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none"
            defaultValue="PROJECT_MANAGER"
            name="role"
          >
            {userRoles.map((role) => (
              <option key={role} value={role}>
                {role.replaceAll("_", " ")}
              </option>
            ))}
          </select>
          <FieldError errors={state.fieldErrors?.role} />
        </label>
        <label className="block text-sm text-slate-700">
          Capacity hours
          <input
            className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none"
            defaultValue="40"
            min="0"
            name="capacityHours"
            type="number"
          />
          <FieldError errors={state.fieldErrors?.capacityHours} />
        </label>
      </div>

      {state.message ? <p className="text-sm text-slate-600">{state.message}</p> : null}

      <button
        className="inline-flex rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white disabled:opacity-60"
        disabled={pending}
        type="submit"
      >
        {pending ? "Creating user..." : "Add User"}
      </button>
    </form>
  );
}

function UpdateUserForm({ user }: { user: User }) {
  const [state, formAction, pending] = useActionState(updateUserAction, initialState);

  return (
    <form action={formAction} className="space-y-4 rounded-2xl border border-slate-200/70 p-4">
      <input name="userId" type="hidden" value={user.id} />

      <div className="grid gap-4 md:grid-cols-2">
        <label className="block text-sm text-slate-700">
          Role
          <select
            className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none"
            defaultValue={user.role}
            name="role"
          >
            {userRoles.map((role) => (
              <option key={role} value={role}>
                {role.replaceAll("_", " ")}
              </option>
            ))}
          </select>
          <FieldError errors={state.fieldErrors?.role} />
        </label>
        <label className="block text-sm text-slate-700">
          Capacity hours
          <input
            className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none"
            defaultValue={user.capacityHours}
            min="0"
            name="capacityHours"
            type="number"
          />
          <FieldError errors={state.fieldErrors?.capacityHours} />
        </label>
      </div>

      {state.message ? <p className="text-sm text-slate-600">{state.message}</p> : null}

      <button
        className="inline-flex rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 disabled:opacity-60"
        disabled={pending}
        type="submit"
      >
        {pending ? "Saving..." : "Update User"}
      </button>
    </form>
  );
}

export function UserAdminPanel({ users }: { users: User[] }) {
  return (
    <div className="space-y-6">
      <CreateUserForm />
      <div className="space-y-4">
        {users.map((user) => (
          <div key={user.id} className="rounded-2xl bg-slate-50/70 p-4">
            <div className="mb-4">
              <p className="font-semibold text-slate-950">{user.name}</p>
              <p className="mt-1 text-sm text-slate-600">{user.email}</p>
            </div>
            <UpdateUserForm user={user} />
          </div>
        ))}
      </div>
    </div>
  );
}
