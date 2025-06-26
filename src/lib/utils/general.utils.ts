/**
 * @fileoverview Utility functions for the application.
 * This module provides helper functions for various tasks such as class name merging,
 * file uploading, and phone number formatting.
 * @module utils
 */

import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merges multiple class values into a single string, resolving Tailwind CSS class conflicts.
 * It uses `clsx` to concatenate class names and `tailwind-merge` to handle conflicting
 * Tailwind utility classes correctly.
 *
 * @function cn
 * @param {...ClassValue} inputs - An array of class values. These can be strings, arrays, or objects.
 * @returns {string} A string of combined and merged class names.
 * @example
 * cn("p-4", "bg-red-500", { "text-white": true }); // => "p-4 bg-red-500 text-white"
 * cn("p-2", "p-4"); // => "p-4" (p-4 overrides p-2 due to tailwind-merge)
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/**
 * Uploads a file to a specified URL (presumably an S3 pre-signed URL) using XMLHttpRequest.
 * Provides progress updates via a callback function.
 *
 * @async
 * @function uploadS3
 * @param {string} url - The pre-signed URL to which the file will be uploaded (PUT request).
 * @param {File} file - The file object to upload.
 * @param {(progress: number) => void} onprogress - A callback function that receives progress updates.
 *                                                 The progress is a number between 0 (0%) and 1 (100%).
 *                                                 It's called with 0 on error before rejection, and 1 on successful load.
 * @returns {Promise<string>} A promise that resolves with the string "uploaded" upon successful upload.
 *                            Rejects with an error message string if the upload fails (e.g., non-200 status).
 * @remarks
 * - This function uses `XMLHttpRequest` directly for fine-grained control over the upload process,
 *   including progress tracking.
 * - It sets the `Content-Type` header based on the file's type.
 * - Includes basic console logging for different stages of the upload.
 */
export async function uploadS3(
  url: string,
  file: File,
  onprogress: (progress: number) => void
): Promise<string> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", url, true);
    xhr.setRequestHeader("Content-Type", file.type);

    xhr.onreadystatechange = () => {
      if (xhr.readyState === 4) { // DONE
        console.log("uploadS3: DONE, status:", xhr.status);
        if (xhr.status >= 200 && xhr.status < 300) { // Check for success status codes (2xx)
          onprogress(1); // Ensure progress is 100%
          resolve("uploaded");
        } else {
          onprogress(0); // Reset progress on failure
          reject(`Problema ao enviar imagem! Status: ${xhr.status}`);
        }
      }
    };

    xhr.upload.onerror = () => {
      console.error("uploadS3: ERROR, status:", xhr.status, xhr.statusText);
      onprogress(0);
      reject(`Erro de rede ou CORS ao enviar imagem. Status: ${xhr.status}`);
    };

    xhr.upload.onprogress = (ev) => {
      if (ev.lengthComputable) {
        console.log("uploadS3: PROGRESS, status:", xhr.status, `${((ev.loaded / ev.total) * 100).toFixed(0)}%`);
        onprogress(ev.loaded / ev.total);
      }
    };

    xhr.upload.onload = () => {
      // This event fires when the request (upload part) has successfully completed.
      // However, the server's response (confirming the PUT) is handled by onreadystatechange.
      // We can ensure progress is marked as 1 if we reach here and status is okay,
      // but final resolution should be in onreadystatechange.
      console.log("uploadS3: LOAD (upload complete), status:", xhr.status);
      // If we want to be optimistic here, we could call onprogress(1),
      // but it's better to wait for readystate 4 and a 2xx status.
    };

    xhr.send(file);
  });
}

/**
 * Formats a string value into a Brazilian phone number format (e.g., "(XX) XXXXX-XXXX").
 * It removes all non-digit characters and then applies the formatting.
 *
 * @function formatterPhoneNumber
 * @param {string} value - The phone number string to format.
 * @returns {string} The formatted phone number string.
 *                   Returns an empty string if the input is empty or only contains non-digits.
 * @example
 * formatterPhoneNumber("11999998888"); // => "(11) 99999-8888"
 * formatterPhoneNumber("1112345678");  // => "(11) 1234-5678"
 * formatterPhoneNumber("abc11def999998888xyz"); // => "(11) 99999-8888"
 */
export function formatterPhoneNumber(value: string): string {
  if (!value) return "";
  let newValue = value;
  newValue = newValue.replace(/\D/g, ""); // Remove all non-digits

  if (newValue.length === 0) return "";

  // Apply formatting based on length
  if (newValue.length <= 2) {
    return `(${newValue}`;
  }
  if (newValue.length <= 6) { // (XX) X to (XX) XXXX
    return `(${newValue.slice(0, 2)}) ${newValue.slice(2)}`;
  }
  if (newValue.length <= 10) { // (XX) XXXXX-X to (XX) XXXXX-XXXX
     newValue = newValue.replace(/(\d{2})(\d{4})(\d{1,4})/, "($1) $2-$3");
  } else { // (XX) XXXXX-XXXX (for numbers with 11 digits like mobile) or longer
     newValue = newValue.replace(/(\d{2})(\d{5})(\d{4}).*/, "($1) $2-$3");
  }
  // Cap the length to the standard (XX) XXXXX-XXXX format (15 chars)
  return newValue.slice(0, 15);
}
