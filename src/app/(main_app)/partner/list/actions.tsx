"use server";

import { unstable_noStore as noStore } from "next/cache"; // Corrected alias

import searchPartnersUseCase from "@/features/partner/usecases/search-partners.usecase"; // Updated import

export async function getPartners(search: string, status: boolean) {
  noStore(); // Corrected usage
  // The use case now defaults status to true, but we can still pass it explicitly from here
  return await searchPartnersUseCase(search, status);
}
