export class MapProviderError extends Error {
  constructor(code, message, { retryable = false, status, cause } = {}) {
    super(message);
    this.name = "MapProviderError";
    this.code = code;
    this.retryable = retryable;
    if (status !== undefined) this.status = status;
    delete this.stack;
  }
}
