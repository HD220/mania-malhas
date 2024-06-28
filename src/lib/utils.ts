import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export async function uploadS3(
  url: string,
  file: File,
  onprogress: (progress: number) => void
) {
  const send = new Promise((resolve, reject) => {
    try {
      const xhr = new XMLHttpRequest();
      xhr.open("PUT", url);
      xhr.setRequestHeader("Content-Type", file.type);
      xhr.upload.addEventListener("progress", (ev) =>
        onprogress(ev.loaded / ev.total)
      );
      xhr.upload.addEventListener("load", () => onprogress(1));
      xhr.send(file);
      resolve("uploaded");
    } catch (error) {
      reject(error);
    }
  });
}

function arrayBufferToArray(buffer: ArrayBuffer) {
  return Array.from(new Uint8Array(buffer));
}

function arrayToHex(array: number[]) {
  return array.map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

export async function createHashFromFile(file: File) {
  const buffer = Buffer.from(await file.arrayBuffer());
  const hashBuffer = await window.crypto.subtle.digest("SHA-256", buffer);
  return arrayToHex(arrayBufferToArray(hashBuffer));
}
