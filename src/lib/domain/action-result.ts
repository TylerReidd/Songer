/**
 * Uniform return type for Server Actions. Actions never throw for expected
 * failures (validation, missing rows, stale revisions); they return a typed
 * error the UI can render. Unexpected failures still throw and are caught by
 * the nearest error boundary.
 */
export type ActionErrorCode = "validation" | "not_found" | "conflict" | "unauthorized" | "failed";

export type ActionResult<T = void> =
  | { ok: true; data: T }
  | { ok: false; code: ActionErrorCode; message: string };

export const ok = <T>(data: T): ActionResult<T> => ({ ok: true, data });
export const fail = <T = never>(code: ActionErrorCode, message: string): ActionResult<T> => ({
  ok: false,
  code,
  message,
});
