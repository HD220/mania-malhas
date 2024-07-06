"use server";

import getUrlUploadUseCase from "@/usecases/product/getUrlUploadUseCase";

export async function getUrlUpload(fileExt: string) {
  return await getUrlUploadUseCase({ fileExt });
}
