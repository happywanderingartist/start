export class MapProviderError extends Error {
  constructor(code, message, { retryable = false, status, cause } = {}) {
    super(message, cause === undefined ? undefined : { cause });
    this.name = "MapProviderError";
    this.code = code;
    this.retryable = retryable;
    if (status !== undefined) this.status = status;
  }
}
