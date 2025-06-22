export class DomainError extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
  }
}

export class NotFoundError extends DomainError {
  constructor(resourceName: string, query?: Record<string, any>) {
    const queryStr = query ? ` para a consulta: ${JSON.stringify(query)}` : "";
    // Adapting the message to Portuguese, assuming the resourceName itself is already in Portuguese or contextually makes sense.
    // If resourceName is like "Transaction with ID X", then "Transaction with ID X não encontrada."
    // If resourceName is "Transação", then "Transação não encontrada."
    super(`${resourceName} não encontrada${queryStr}.`);
    this.name = "NotFoundError";
  }
}

export class ValidationError extends DomainError {
  public fieldErrors: Record<string, string[]>;

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

export class DomainConflictError extends DomainError {
  constructor(message: string) {
    super(message);
    this.name = "DomainConflictError";
  }
}
