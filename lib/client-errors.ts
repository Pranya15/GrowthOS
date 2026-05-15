export function toClientErrorMessage(error: unknown, fallback: string) {
  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }

  if (typeof error === "string" && error.trim()) {
    return error;
  }

  if (typeof Event !== "undefined" && error instanceof Event) {
    return fallback;
  }

  return fallback;
}

export function isAbortLikeError(error: unknown) {
  return error instanceof Error && error.name === "AbortError";
}
