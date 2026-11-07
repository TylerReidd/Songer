"use client";

import { useEffect, useEffectEvent, useRef } from "react";

export interface AutosaveOptions<TPayload> {
  /** Changes whenever there is something new to save. */
  dirtyVersion: number;
  /** Builds the payload at save time, so it always reflects the latest state. */
  getPayload: () => TPayload;
  save: (payload: TPayload) => Promise<void>;
  onStart: () => void;
  /** Quiet period after the last edit before a save fires. */
  delayMs?: number;
  enabled?: boolean;
}

/**
 * Debounced, single-flight autosave.
 *
 * - Edits reset a debounce timer; the save fires after `delayMs` of quiet.
 * - Only one save runs at a time. Edits that arrive mid-flight are coalesced
 *   into exactly one follow-up save, so a slow response can never land on
 *   top of newer local state.
 * - `save` is responsible for dispatching success/failure; the hook only
 *   sequences the calls. That keeps the reducer the single source of truth.
 *
 * `useEffectEvent` lets the timer call the latest `save`/`getPayload` without
 * listing them as effect dependencies, which would reset the debounce on
 * every render.
 */
export function useAutosave<TPayload>({
  dirtyVersion,
  getPayload,
  save,
  onStart,
  delayMs = 800,
  enabled = true,
}: AutosaveOptions<TPayload>) {
  const inFlight = useRef(false);
  const queued = useRef(false);

  const runSave = useEffectEvent(async () => {
    if (inFlight.current) {
      queued.current = true;
      return;
    }
    inFlight.current = true;
    queued.current = false;
    try {
      onStart();
      await save(getPayload());
    } finally {
      inFlight.current = false;
      if (queued.current) void runSave();
    }
  });

  useEffect(() => {
    if (!enabled || dirtyVersion === 0) return;
    const timer = window.setTimeout(() => void runSave(), delayMs);
    return () => window.clearTimeout(timer);
  }, [dirtyVersion, delayMs, enabled]);
}

/** Warns before the tab closes while there are unsaved or in-flight edits. */
export function useUnsavedChangesWarning(active: boolean) {
  useEffect(() => {
    if (!active) return;
    const handler = (event: BeforeUnloadEvent) => {
      event.preventDefault();
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [active]);
}

/**
 * Sends the latest document with `navigator.sendBeacon` when the page is
 * being hidden or unloaded while edits are pending. Beacons survive tab
 * close, which a normal fetch or Server Action would not. The payload is
 * built at send time so it reflects the final state.
 */
export function useFlushOnHide(active: boolean, getRequest: () => { url: string; body: unknown }) {
  const send = useEffectEvent(() => {
    const { url, body } = getRequest();
    navigator.sendBeacon(url, new Blob([JSON.stringify(body)], { type: "application/json" }));
  });

  useEffect(() => {
    if (!active) return;
    const onHide = () => {
      if (document.visibilityState === "hidden") send();
    };
    document.addEventListener("visibilitychange", onHide);
    window.addEventListener("pagehide", send);
    return () => {
      document.removeEventListener("visibilitychange", onHide);
      window.removeEventListener("pagehide", send);
    };
  }, [active]);
}
