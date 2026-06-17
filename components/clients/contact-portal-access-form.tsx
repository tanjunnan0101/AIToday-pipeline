"use client";

import { useActionState } from "react";

import {
  updateContactPortalAccessAction,
  type ContactPortalAccessState,
} from "@/app/(workspace)/clients/contact-actions";
import type { ClientContact } from "@/lib/domain";

const initialState: ContactPortalAccessState = {};

export function ContactPortalAccessForm({
  clientId,
  contact,
}: {
  clientId: string;
  contact: ClientContact;
}) {
  const [state, formAction, pending] = useActionState(
    updateContactPortalAccessAction,
    initialState,
  );

  return (
    <form action={formAction} className="mt-3">
      <input name="clientId" type="hidden" value={clientId} />
      <input name="contactId" type="hidden" value={contact.id} />
      <input name="portalAccess" type="hidden" value={contact.portalAccess ? "false" : "true"} />
      {state.message ? <p className="mb-2 text-xs text-slate-600">{state.message}</p> : null}
      <button
        className="inline-flex rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 disabled:opacity-60"
        disabled={pending}
        type="submit"
      >
        {pending
          ? "Saving..."
          : contact.portalAccess
            ? "Revoke portal access"
            : "Grant portal access"}
      </button>
    </form>
  );
}
