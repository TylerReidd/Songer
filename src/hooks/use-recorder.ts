"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { RECORDING_MAX_SECONDS } from "@/lib/recordings/limits";

export interface Take {
  blob: Blob;
  mimeType: string;
  durationMs: number;
}

export type RecorderStatus = "idle" | "requesting" | "recording" | "unsupported" | "denied";

/** First container the browser can produce; Chrome/Firefox give WebM/Opus, Safari gives MP4/AAC. */
function pickMimeType(): string | undefined {
  if (typeof MediaRecorder === "undefined") return undefined;
  return ["audio/webm;codecs=opus", "audio/webm", "audio/mp4", "audio/ogg;codecs=opus"].find((type) =>
    MediaRecorder.isTypeSupported(type),
  );
}

/**
 * Microphone capture with MediaRecorder, a hard stop at the time limit, and a
 * live input level for the meter. Returns the finished take to the caller;
 * uploading is the caller's job.
 */
export function useRecorder(onTake: (take: Take) => void) {
  const [status, setStatus] = useState<RecorderStatus>("idle");
  const [elapsedMs, setElapsedMs] = useState(0);
  const [level, setLevel] = useState(0);

  const recorder = useRef<MediaRecorder | null>(null);
  const stream = useRef<MediaStream | null>(null);
  const chunks = useRef<Blob[]>([]);
  const startedAt = useRef(0);
  const frame = useRef(0);
  const audio = useRef<{ context: AudioContext; analyser: AnalyserNode } | null>(null);

  const cleanup = useCallback(() => {
    cancelAnimationFrame(frame.current);
    stream.current?.getTracks().forEach((track) => track.stop());
    stream.current = null;
    void audio.current?.context.close();
    audio.current = null;
    recorder.current = null;
    setLevel(0);
  }, []);

  const stop = useCallback(() => {
    if (recorder.current?.state === "recording") recorder.current.stop();
  }, []);

  const start = useCallback(async () => {
    const mimeType = pickMimeType();
    if (!mimeType || !navigator.mediaDevices?.getUserMedia) {
      setStatus("unsupported");
      return;
    }
    setStatus("requesting");
    let mediaStream: MediaStream;
    try {
      mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch {
      setStatus("denied");
      return;
    }
    stream.current = mediaStream;

    // Input meter: read the waveform each frame and keep its peak.
    const context = new AudioContext();
    const analyser = context.createAnalyser();
    analyser.fftSize = 512;
    context.createMediaStreamSource(mediaStream).connect(analyser);
    audio.current = { context, analyser };
    const samples = new Uint8Array(analyser.fftSize);
    const tick = () => {
      analyser.getByteTimeDomainData(samples);
      let peak = 0;
      for (const sample of samples) peak = Math.max(peak, Math.abs(sample - 128) / 128);
      setLevel(peak);
      setElapsedMs(Date.now() - startedAt.current);
      if (Date.now() - startedAt.current >= RECORDING_MAX_SECONDS * 1000) stop();
      else frame.current = requestAnimationFrame(tick);
    };

    const mediaRecorder = new MediaRecorder(mediaStream, { mimeType });
    chunks.current = [];
    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) chunks.current.push(event.data);
    };
    mediaRecorder.onstop = () => {
      const durationMs = Date.now() - startedAt.current;
      const blob = new Blob(chunks.current, { type: mimeType });
      cleanup();
      setStatus("idle");
      setElapsedMs(0);
      if (blob.size > 0) onTake({ blob, mimeType, durationMs });
    };

    recorder.current = mediaRecorder;
    startedAt.current = Date.now();
    mediaRecorder.start(250);
    setStatus("recording");
    frame.current = requestAnimationFrame(tick);
  }, [cleanup, onTake, stop]);

  useEffect(() => cleanup, [cleanup]);

  return { status, elapsedMs, level, start, stop };
}
