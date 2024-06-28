"use server";

import { minioClient } from "@/services/minio";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const fileName = searchParams.get("name");

  if (!fileName) throw new Error("nome de arquivo não fornecido");

  if (!(await minioClient.bucketExists("uploads")))
    minioClient.makeBucket("uploads");

  const url = await minioClient.presignedPutObject("uploads", fileName);

  return Response.json({ url });
}
