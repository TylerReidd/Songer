/** Shared by the recorder UI and the upload route so both enforce the same rules. */
export const RECORDING_MAX_SECONDS = 60;
export const RECORDING_MAX_BYTES = 2 * 1024 * 1024;
export const RECORDINGS_PER_SONG = 10;

/** Container types browsers produce with MediaRecorder; parameters like ";codecs=opus" are stripped before checking. */
export const RECORDING_MIME_TYPES = ["audio/webm", "audio/mp4", "audio/ogg", "audio/mpeg", "audio/wav"] as const;

export function baseMimeType(value: string): string {
  return value.split(";")[0].trim().toLowerCase();
}
