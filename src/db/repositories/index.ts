import { db } from "@/lib/db-config/postgres";

// Import the factory functions, potentially aliasing them if their exported names
// are the same as the constants we want to export here.
import { userRepository as userRepositoryFactory } from "@/features/user/db/user-repository";
import { notificationRepository as notificationRepositoryFactory } from "@/features/notification/db/notification-repository";
import { productRepository as productRepositoryFactory } from "@/features/product/db/productRepository";
import { partnerRepository as partnerRepositoryFactory } from "@/features/partner/db/partnerRepository";
import { transactionRepository as transactionRepositoryFactory } from "@/features/transaction/db/transactionRepository";
import { paymentRepository as paymentRepositoryFactory } from "@/features/payment/db/payment-repository";

// Instantiate repositories by calling their factory functions with the db instance
export const userRepository = userRepositoryFactory(db);
export const notificationRepository = notificationRepositoryFactory(db);
export const productRepository = productRepositoryFactory(db);
export const partnerRepository = partnerRepositoryFactory(db);
export const transactionRepository = transactionRepositoryFactory(db);
export const paymentRepository = paymentRepositoryFactory(db);
