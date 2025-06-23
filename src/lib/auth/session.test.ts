import { internalGetUserIdFromSession } from "./session";

describe("Auth Session Utilities", () => {
  describe("internalGetUserIdFromSession", () => {
    let consoleWarnSpy: jest.SpyInstance;

    beforeEach(() => {
      // Spy on console.warn before each test
      consoleWarnSpy = jest.spyOn(console, "warn").mockImplementation(() => {});
    });

    afterEach(() => {
      // Restore the original console.warn after each test
      consoleWarnSpy.mockRestore();
    });

    it("should return null", async () => {
      const userId = await internalGetUserIdFromSession();
      expect(userId).toBeNull();
    });

    it("should log a warning message to the console", async () => {
      await internalGetUserIdFromSession();
      expect(consoleWarnSpy).toHaveBeenCalledTimes(1);
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        "lib/auth/session: getUserIdFromSession is a placeholder and currently returns null. Replace with actual session logic."
      );
    });
  });
});
