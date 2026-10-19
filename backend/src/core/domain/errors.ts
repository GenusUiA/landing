/**
 * @file src/core/domain/errors.ts
 * @description Domain-level custom error classes representing business invariant violations and rate limiting.
 * @exports ValidationError, DuplicateSubmissionError
 */

/**
 * Error thrown when input data violates domain business validation rules.
 */
export class ValidationError extends Error {
  /**
   * Initializes a new instance of ValidationError.
   * @param message - Descriptive failure message.
   */
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

/**
 * Error thrown when duplicate lead submissions occur within the cooldown threshold.
 */
export class DuplicateSubmissionError extends Error {
  /**
   * Initializes a new instance of DuplicateSubmissionError.
   * @param message - Description indicating a duplicate lead exists.
   */
  constructor(message: string = 'Заявка с этого номера уже отправлена. Подождите немного перед повторной отправкой.') {
    super(message);
    this.name = 'DuplicateSubmissionError';
  }
}