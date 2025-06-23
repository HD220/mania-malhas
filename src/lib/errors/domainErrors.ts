/**
 * @fileoverview Defines custom domain-specific error classes.
 * These errors are used throughout the application to represent specific failure scenarios
 * related to business logic or data validation, providing more context than generic Error objects.
 * @module lib/errors/domainErrors
 */

/**
 * Base class for all custom domain errors.
 * Ensures that the error name is set to the class name.
 * @class DomainError
 * @extends {Error}
 */
export class DomainError extends Error {
  /**
   * Creates an instance of DomainError.
   * @param {string} message - The error message.
   */
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
  }
}

/**
 * Represents an error indicating that a requested resource was not found.
 * @class NotFoundError
 * @extends {DomainError}
 */
export class NotFoundError extends DomainError {
  /**
   * Creates an instance of NotFoundError.
   * @param {string} resourceName - The name or identifier of the resource that was not found (e.g., "User", "Product with ID 123").
   * @param {Record<string, any>} [query] - Optional query parameters that were used when searching for the resource, for additional context.
   */
  constructor(resourceName: string, query?: Record<string, any>) {
    const queryStr = query ? ` para a consulta: ${JSON.stringify(query)}` : "";
    // Adapting the message to Portuguese, assuming the resourceName itself is already in Portuguese or contextually makes sense.
    // If resourceName is like "Transaction with ID X", then "Transaction with ID X não encontrada."
    // If resourceName is "Transação", then "Transação não encontrada."
    super(`${resourceName} não encontrada${queryStr}.`);
    this.name = "NotFoundError";
  }
}

/**
 * Represents an error indicating that input data failed validation.
 * Can optionally include a record of specific field errors.
 * @class ValidationError
 * @extends {DomainError}
 */
export class ValidationError extends DomainError {
  /**
   * A record of field-specific validation errors.
   * Keys are field names, and values are arrays of error messages for that field.
   * @type {Record<string, string[]>}
   */
  public fieldErrors: Record<string, string[]>;

  /**
   * Creates an instance of ValidationError.
   * @param {string} message - A general error message for the validation failure.
   * @param {Record<string, string[]>} [fieldErrors={}] - Specific errors for each field.
   */
  constructor(message: string, fieldErrors: Record<string, string[]> = {}) {
    super(message);
    this.name = "ValidationError";
    this.fieldErrors = fieldErrors;
  }
}

// Você pode adicionar outros erros de domínio conforme necessário, como:
// export class AuthenticationError extends DomainError { ... }
// export class AuthorizationError extends DomainError { ... }
// export class InvalidOperationError extends DomainError { ... }

/**
 * Represents an error indicating a conflict in the domain logic,
 * such as attempting an operation that violates business rules or data integrity.
 * For example, trying to delete a resource that is still referenced by other entities.
 * @class DomainConflictError
 * @extends {DomainError}
 */
export class DomainConflictError extends DomainError {
  /**
   * Creates an instance of DomainConflictError.
   * @param {string} message - The error message describing the conflict.
   */
  constructor(message: string) {
    super(message);
    this.name = "DomainConflictError";
  }
}

/**
 * Represents an error indicating that an operation is forbidden for the current user
 * due to insufficient permissions.
 * @class ForbiddenError
 * @extends {DomainError}
 */
export class ForbiddenError extends DomainError {
  /**
   * Creates an instance of ForbiddenError.
   * @param {string} [message="Acesso negado."] - The error message. Defaults to "Acesso negado.".
   */
  constructor(message: string = "Acesso negado.") {
    super(message);
    this.name = "ForbiddenError";
  }
}
