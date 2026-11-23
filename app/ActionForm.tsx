"use client";

import { useActionState } from "react";
import type { ActionState } from "./actions";

type Props = {
  action: (s: ActionState, f: FormData) => Promise<ActionState>;
  submit: string;
  children: React.ReactNode;
  className?: string;
  resetOnSuccess?: boolean;
};

/** Form wired to a server action, showing its success/error message. */
export function ActionForm({ action, submit, children, className = "card", resetOnSuccess = true }: Props) {
  const [state, formAction, pending] = useActionState(action, {});
  return (
    // key change remounts the form so inputs clear after a successful save
    <form key={resetOnSuccess ? state.ok : undefined} action={formAction} className={className}>
      {children}
      <button disabled={pending}>{pending ? "Saving…" : submit}</button>
      <p className={`msg ${state.error ? "error" : "ok"}`} role="status">
        {state.error ?? state.ok}
      </p>
    </form>
  );
}
