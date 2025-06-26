"use server";

import getUrlUploadUseCase from "@/features/product/usecases/get-url-upload.usecase"; // Updated

export async function getUrlUpload(fileExt: string) {
  return await getUrlUploadUseCase({ fileExt });
}
