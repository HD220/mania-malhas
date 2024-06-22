import { useState } from "react";

export function useUploadProgress() {
  //   const [data, setData] = useState();
  const [error, setError] = useState<string>();
  const [progress, setProgress] = useState(0);

  function addListeners(xhr: XMLHttpRequest) {
    xhr.upload.addEventListener("progress", (e) => {
      if (e.lengthComputable) {
        setProgress(e.loaded / e.total);
      }
    });

    xhr.upload.addEventListener("load", (e) => {
      setProgress(1);
    });

    xhr.upload.addEventListener("error", (e) => {
      setError("ops, an error occurred.");
    });
  }

  function upload(file: File, url: string) {
    const formData = new FormData();
    console.log(file);
    formData.append(file.name, file);

    const xhr = new XMLHttpRequest();
    addListeners(xhr);

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
    error,
    progress,
    upload,
  };
}
