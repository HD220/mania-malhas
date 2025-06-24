"use server";

import getUrlUploadUseCase from "@/features/product/usecases/getUrlUploadUseCase";

export async function getUrlUpload(fileExt: string) {
  return await getUrlUploadUseCase({ fileExt });
}
