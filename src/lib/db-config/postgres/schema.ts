import { userTable } from "@/features/user/db/schema";
import { productTable, productImagesTable } from "@/features/product/db/schema";
import { partnerTable } from "@/features/partner/db/schema";
import { paymentTable } from "@/features/payment/db/schema";
import { transactionTable } from "@/features/transaction/db/schema";
import { notificationTable, notificationTypeEnum } from "@/features/notification/db/schema";

const schema = {
  userTable,
  productTable,
  productImagesTable,
  partnerTable,
  paymentTable,
  transactionTable,
  notificationTable,
  notificationTypeEnum,
};

export default schema;
