export class DomainError extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
  }
}

export class NotFoundError extends DomainError {
  constructor(resourceName: string, query?: Record<string, any>) {
    const queryStr = query ? ` for query: ${JSON.stringify(query)}` : "";
    super(`${resourceName} not found${queryStr}.`);
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
