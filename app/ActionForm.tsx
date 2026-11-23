"use client";

import { useActionState, useEffect, useState } from "react";
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
  const [dismissed, setDismissed] = useState<ActionState | null>(null);

  // Next keeps left pages alive (hidden) so state survives navigation; effects still clean up on leave.
  // Success messages fade after 5s; any message is dismissed when the user navigates away.
  useEffect(() => {
    const t = state.ok ? setTimeout(() => setDismissed(state), 5000) : undefined;
    return () => {
      clearTimeout(t);
      setDismissed(state);
    };
  }, [state]);

  const show = state !== dismissed;
  return (
    // key change remounts the form (and children's state) so inputs clear after each successful save
    <form key={resetOnSuccess ? state.at : undefined} action={formAction} className={className}>
      {children}
      <button disabled={pending}>{pending ? "Saving…" : submit}</button>
      <p className={`msg ${state.error ? "error" : "ok"}`} role="status">
        {show && (state.error ?? state.ok)}
      </p>
    </form>
  );
}
