import { type ClassValue, clsx } from "clsx";
import { createHash } from "crypto";
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

export async function createHashFromFile(file: File) {
  const buffer = Buffer.from(await file.arrayBuffer());
  const fingerPrint = createHash("sha256").update(buffer).digest("hex");

  return fingerPrint;
}
