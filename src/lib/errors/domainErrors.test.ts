import {
  DomainError,
  NotFoundError,
  ValidationError,
  DomainConflictError,
  ForbiddenError,
} from "./domainErrors";

describe("Domain Errors", () => {
  describe("DomainError", () => {
    it("should correctly set name and message", () => {
      const message = "A generic domain error occurred.";
      const error = new DomainError(message);

      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(DomainError);
      expect(error.name).toBe("DomainError");
      expect(error.message).toBe(message);
    });
  });

  describe("NotFoundError", () => {
    it("should correctly set name and message for a resource", () => {
      const resourceName = "Usuário Teste";
      const error = new NotFoundError(resourceName);

      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(DomainError);
      expect(error).toBeInstanceOf(NotFoundError);
      expect(error.name).toBe("NotFoundError");
      expect(error.message).toBe(`${resourceName} não encontrada.`);
    });

    it("should correctly set name and message with query parameters", () => {
      const resourceName = "Produto";
      const query = { id: 123, category: "electronics" };
      const error = new NotFoundError(resourceName, query);

      expect(error.name).toBe("NotFoundError");
      expect(error.message).toBe(
        `${resourceName} não encontrada para a consulta: ${JSON.stringify(query)}.`
      );
    });
  });

  describe("ValidationError", () => {
    it("should correctly set name, message, and default fieldErrors", () => {
      const message = "Validation failed.";
      const error = new ValidationError(message);

      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(DomainError);
      expect(error).toBeInstanceOf(ValidationError);
      expect(error.name).toBe("ValidationError");
      expect(error.message).toBe(message);
      expect(error.fieldErrors).toEqual({});
    });

    it("should correctly set name, message, and provided fieldErrors", () => {
      const message = "Input validation failed.";
      const fieldErrors = {
        email: ["Invalid email format.", "Email is required."],
        password: ["Password too short."],
      };
      const error = new ValidationError(message, fieldErrors);

      expect(error.name).toBe("ValidationError");
      expect(error.message).toBe(message);
      expect(error.fieldErrors).toEqual(fieldErrors);
    });
  });

  describe("DomainConflictError", () => {
    it("should correctly set name and message", () => {
      const message = "Operation conflicts with existing data.";
      const error = new DomainConflictError(message);

      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(DomainError);
      expect(error).toBeInstanceOf(DomainConflictError);
      expect(error.name).toBe("DomainConflictError");
      expect(error.message).toBe(message);
    });
  });

  describe("ForbiddenError", () => {
    it("should correctly set name and default message", () => {
      const error = new ForbiddenError();

      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(DomainError);
      expect(error).toBeInstanceOf(ForbiddenError);
      expect(error.name).toBe("ForbiddenError");
      expect(error.message).toBe("Acesso negado.");
    });

    it("should correctly set name and provided message", () => {
      const message = "User does not have permission for this action.";
      const error = new ForbiddenError(message);

      expect(error.name).toBe("ForbiddenError");
      expect(error.message).toBe(message);
    });
  });
});
