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
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", url, true);
    xhr.setRequestHeader("Content-Type", file.type);
    xhr.onreadystatechange = () => {
      if (xhr.readyState === 4) {
        console.log("DONE STATUS: ", xhr.status);
        if (xhr.status !== 200) {
          onprogress(0);
          reject("Problema ao enviar imagem!");
          return;
        }
        onprogress(1);
        resolve("uploaded");
      }
    };
    xhr.upload.addEventListener("error", (ev) => {
      console.log("ERROR STATUS: ", xhr.status);
    });
    xhr.upload.addEventListener("progress", (ev) => {
      console.log("PROGRESS STATUS: ", xhr.status);
      onprogress(ev.loaded / ev.total);
    });
    xhr.upload.addEventListener("load", () => {
      console.log("LOAD STATUS: ", xhr.status);
      onprogress(1);
    });
    xhr.send(file);
  });
}

export function formatterPhoneNumber(value: string) {
  let newValue = value;
  newValue = newValue.replace(/\D/g, "");
  newValue = newValue.replace(/(\d{2})(\d)/, "($1) $2");
  newValue = newValue.replace(/(\d)(\d{4})$/, "$1-$2");

  return newValue;
}
