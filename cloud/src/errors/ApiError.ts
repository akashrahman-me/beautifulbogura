export type FieldError = { path: string; message: string };

/** Operational error: the handler sends `statusCode` as the HTTP status and `code` / `message` in the body. */
export class ApiError extends Error {
  readonly isOperational = true;

  constructor(
    public statusCode: number,
    message: string,
    public code = 'ERROR',
    public errors?: FieldError[],
  ) {
    super(message);
    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(msg: string, code = 'BAD_REQUEST', errors?: FieldError[]) {
    return new ApiError(400, msg, code, errors);
  }
  static unauthorized(msg = 'আবার সাইন ইন করুন', code = 'UNAUTHORIZED') {
    return new ApiError(401, msg, code);
  }
  static forbidden(msg = 'এই কাজের অনুমতি আপনার নেই', code = 'FORBIDDEN') {
    return new ApiError(403, msg, code);
  }
  static notFound(msg = 'তথ্য পাওয়া যায়নি', code = 'NOT_FOUND') {
    return new ApiError(404, msg, code);
  }
  static conflict(msg: string, code = 'CONFLICT', errors?: FieldError[]) {
    return new ApiError(409, msg, code, errors);
  }
  /** A field-level problem found by a service (business rule), shaped like a validation error. */
  static field(path: string, message: string, code = 'VALIDATION_ERROR', status = 400) {
    return new ApiError(status, message, code, [{ path, message }]);
  }
}
