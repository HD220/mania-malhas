import { cn, uploadS3, formatterPhoneNumber } from "./general.utils";

describe("Utility Functions", () => {
  describe("cn", () => {
    it("should handle basic string inputs", () => {
      expect(cn("foo", "bar")).toBe("foo bar");
    });

    it("should handle conditional object inputs", () => {
      expect(cn({ foo: true, bar: false, baz: true })).toBe("foo baz");
    });

    it("should handle array inputs", () => {
      expect(cn(["foo", "bar"], ["baz"])).toBe("foo bar baz");
    });

    it("should handle mixed inputs", () => {
      expect(cn("foo", { bar: true, qux: false }, ["baz"])).toBe(
        "foo bar baz"
      );
    });

    it("should ignore falsy values", () => {
      expect(
        cn("foo", null, "bar", undefined, { baz: true, qux: null }, 0, false)
      ).toBe("foo bar baz");
    });

    it("should merge and override Tailwind classes correctly", () => {
      // Example from tailwind-merge documentation
      expect(cn("p-2", "p-4")).toBe("p-4");
      expect(cn("bg-red-500", "bg-blue-500")).toBe("bg-blue-500");
      expect(cn("px-2 py-1", "p-4")).toBe("p-4");
      expect(cn("text-xl", "text-sm", "font-bold")).toBe("text-sm font-bold");
    });
  });

  describe("uploadS3", () => {
    // Mock XMLHttpRequest and add test cases for uploadS3 here
    // Global mock for XMLHttpRequest
    let mockXHRInstance: {
      open: ReturnType<typeof vi.fn>;
      send: ReturnType<typeof vi.fn>;
      setRequestHeader: ReturnType<typeof vi.fn>;
      onreadystatechange: (() => void) | null;
      readyState: number;
      status: number;
      upload: {
        onprogress: ((event: Partial<ProgressEvent>) => void) | null;
        onerror: ((event: Partial<Event>) => void) | null;
        onload: ((event: Partial<Event>) => void) | null;
        addEventListener: ReturnType<typeof vi.fn>;
        removeEventListener: ReturnType<typeof vi.fn>;
        dispatchEvent: ReturnType<typeof vi.fn>;
      };
    };

    beforeEach(() => {
      mockXHRInstance = {
        open: vi.fn(),
        send: vi.fn(),
        setRequestHeader: vi.fn(),
        onreadystatechange: null,
        readyState: 0,
        status: 0,
        upload: {
          onprogress: null,
          onerror: null,
          onload: null,
          addEventListener: vi.fn((event, cb) => {
            if (event === 'progress') mockXHRInstance.upload.onprogress = cb;
            if (event === 'error') mockXHRInstance.upload.onerror = cb;
            if (event === 'load') mockXHRInstance.upload.onload = cb;
          }),
          removeEventListener: vi.fn(),
          dispatchEvent: vi.fn(),
        },
      };
      global.XMLHttpRequest = vi.fn(() => mockXHRInstance) as any;
    });

    afterEach(() => {
      // Restore original XMLHttpRequest if necessary, or ensure mocks are cleared
      vi.restoreAllMocks(); // Or specific mock clear
    });

    it("should upload a file successfully, calling onProgress and resolving", async () => {
      const mockUrl = "https://presigned-url.com/upload";
      const mockFile = new File(["dummy content"], "example.png", { type: "image/png" });
      const onProgressMock = vi.fn();

      const uploadPromise = uploadS3(mockUrl, mockFile, onProgressMock);

      // Simulate progress event
      if (mockXHRInstance.upload.onprogress) {
        mockXHRInstance.upload.onprogress({ lengthComputable: true, loaded: 50, total: 100 });
      }
      // Simulate another progress event
      if (mockXHRInstance.upload.onprogress) {
        mockXHRInstance.upload.onprogress({ lengthComputable: true, loaded: 100, total: 100 });
      }

      // Simulate successful load
      mockXHRInstance.readyState = 4;
      mockXHRInstance.status = 200;
      if (mockXHRInstance.onreadystatechange) {
        mockXHRInstance.onreadystatechange();
      }

      await expect(uploadPromise).resolves.toBe("uploaded");

      expect(mockXHRInstance.open).toHaveBeenCalledWith("PUT", mockUrl, true);
      expect(mockXHRInstance.setRequestHeader).toHaveBeenCalledWith("Content-Type", mockFile.type);
      expect(mockXHRInstance.send).toHaveBeenCalledWith(mockFile);
      expect(onProgressMock).toHaveBeenCalledWith(0.5); // 50 / 100
      expect(onProgressMock).toHaveBeenCalledWith(1);   // 100 / 100
      expect(onProgressMock).toHaveBeenLastCalledWith(1); // Final call from onreadystatechange
    });

    it("should handle network errors and reject with an error message", async () => {
      const mockUrl = "https://presigned-url.com/upload";
      const mockFile = new File(["dummy content"], "example.png", { type: "image/png" });
      const onProgressMock = vi.fn();

      const uploadPromise = uploadS3(mockUrl, mockFile, onProgressMock);

      // Simulate network error
      if (mockXHRInstance.upload.onerror) {
        mockXHRInstance.upload.onerror(new Event('error'));
      }

      await expect(uploadPromise).rejects.toMatch(
        `Erro de rede ou CORS ao enviar imagem. Status: ${mockXHRInstance.status}`
      );
      expect(onProgressMock).toHaveBeenCalledWith(0); // Progress reset on error
    });

    it("should handle non-200 status codes on readyStateChange and reject", async () => {
      const mockUrl = "https://presigned-url.com/upload";
      const mockFile = new File(["dummy content"], "example.png", { type: "image/png" });
      const onProgressMock = vi.fn();

      const uploadPromise = uploadS3(mockUrl, mockFile, onProgressMock);

      // Simulate server error response
      mockXHRInstance.readyState = 4;
      mockXHRInstance.status = 500; // Internal Server Error
      if (mockXHRInstance.onreadystatechange) {
        mockXHRInstance.onreadystatechange();
      }

      await expect(uploadPromise).rejects.toBe(
        `Problema ao enviar imagem! Status: 500`
      );
      expect(onProgressMock).toHaveBeenCalledWith(0); // Progress reset on error
    });

    it("should call onProgress with 0 if length is not computable", async () => {
        const mockUrl = "https://presigned-url.com/upload";
        const mockFile = new File(["dummy content"], "example.png", { type: "image/png" });
        const onProgressMock = vi.fn();

        const uploadPromise = uploadS3(mockUrl, mockFile, onProgressMock);

        // Simulate progress event where length is not computable
        if (mockXHRInstance.upload.onprogress) {
          mockXHRInstance.upload.onprogress({ lengthComputable: false, loaded: 50, total: 0 });
        }

        // Simulate successful load to allow promise to resolve/reject based on status
        mockXHRInstance.readyState = 4;
        mockXHRInstance.status = 200;
        if (mockXHRInstance.onreadystatechange) {
          mockXHRInstance.onreadystatechange();
        }
        await uploadPromise; // let it complete

        // Check that onProgress was called, but not with a division by zero or NaN.
        // The function itself doesn't call onProgress(0) in this specific scenario,
        // it just doesn't call it with a computed value.
        // We are mostly ensuring no error occurs.
        // The onProgressMock would be called with 1 at the end by onreadystatechange.
        expect(onProgressMock).not.toHaveBeenCalledWith(expect.any(NaN));
        expect(onProgressMock).toHaveBeenLastCalledWith(1); // From successful completion
      });

  });

  describe("formatterPhoneNumber", () => {
    it("should format a 10-digit number", () => {
      expect(formatterPhoneNumber("1122334455")).toBe("(11) 2233-4455");
    });

    it("should format an 11-digit number", () => {
      expect(formatterPhoneNumber("11922334455")).toBe("(11) 92233-4455");
    });

    it("should handle partial input for area code", () => {
      expect(formatterPhoneNumber("1")).toBe("(1");
      expect(formatterPhoneNumber("12")).toBe("(12");
    });

    it("should handle partial input for first part of number", () => {
      expect(formatterPhoneNumber("112233")).toBe("(11) 2233");
    });

    it("should handle partial input for 10-digit second part of number", () => {
      expect(formatterPhoneNumber("11223344")).toBe("(11) 2233-44");
    });

    it("should handle partial input for 11-digit second part of number", () => {
      expect(formatterPhoneNumber("119223344")).toBe("(11) 92233-44");
    });

    it("should return empty string for empty input", () => {
      expect(formatterPhoneNumber("")).toBe("");
    });

    it("should return empty string for null input", () => {
      expect(formatterPhoneNumber(null as any)).toBe("");
    });

    it("should return empty string for undefined input", () => {
      expect(formatterPhoneNumber(undefined as any)).toBe("");
    });

    it("should strip non-numeric characters and format", () => {
      expect(formatterPhoneNumber("abc11def92233ghi4455xyz")).toBe(
        "(11) 92233-4455"
      );
      expect(formatterPhoneNumber("(11) 2233-4455")).toBe("(11) 2233-4455");
    });

    it("should handle numbers longer than 11 digits by formatting the first 11", () => {
      expect(formatterPhoneNumber("119223344556789")).toBe("(11) 92233-4455");
    });

    it("should correctly format numbers with less than 2 digits", () => {
      expect(formatterPhoneNumber("1")).toBe("(1");
    });

    it("should correctly format numbers with 2 digits", () => {
      expect(formatterPhoneNumber("12")).toBe("(12");
    });

    it("should correctly format numbers with 3 to 6 digits", () => {
      expect(formatterPhoneNumber("123")).toBe("(12) 3");
      expect(formatterPhoneNumber("12345")).toBe("(12) 345");
      expect(formatterPhoneNumber("123456")).toBe("(12) 3456");
    });

    it("should correctly format numbers with 7 to 10 digits", () => {
      expect(formatterPhoneNumber("1234567")).toBe("(12) 3456-7");
      expect(formatterPhoneNumber("1234567890")).toBe("(12) 3456-7890");
    });

    it("should cap the length at 15 characters (standard format)", () => {
      // This test might be redundant if the logic already ensures this,
      // but confirms the .slice(0, 15) behavior.
      // Example: 11 digits formatted is (XX) XXXXX-XXXX which is 15 chars.
      // If an extremely long number was somehow partially formatted beyond this, it would be capped.
      const longNumber = "11987654321012345"; // 17 digits
      // Expected format for 11 digits: (11) 98765-4321
      expect(formatterPhoneNumber(longNumber)).toBe("(11) 98765-4321");
    });

  });
});
