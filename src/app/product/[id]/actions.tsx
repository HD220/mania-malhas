"use server";

import { formSchema, formType } from "./schema";

export async function onSubmit(values: formType) {
  console.log(values);
}
