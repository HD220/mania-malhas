import { useState } from "react";

export function useUploadProgress() {
  const [error, setError] = useState<string>();
  const [progress, setProgress] = useState<number>(0);

  function addListeners(xhr: XMLHttpRequest) {
    xhr.upload.addEventListener("error", (e) => {
      setError("ops, an error occurred.");
    });
  }

  function upload(
    file: File,
    url: string,
    onProgress: (progress: number) => void
  ) {
    const xhr = new XMLHttpRequest();
    xhr.upload.addEventListener("progress", (e) => {
      if (e.lengthComputable) {
        onProgress(e.loaded / e.total);
      }
    });

    xhr.upload.addEventListener("load", (e) => {
      onProgress(1);
    });

    xhr.open("PUT", url);
    xhr.setRequestHeader("Content-Type", file.type);

    const start = () => {
      xhr.send(file);
    };

    return {
      start,
      abort: xhr.abort,
    };
  }

  return {
    progress,
    upload,
  };
}
