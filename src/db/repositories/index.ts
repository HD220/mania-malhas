import { db } from "@/db/postgres";

// Import the factory functions, potentially aliasing them if their exported names
// are the same as the constants we want to export here.
import { userRepository as userRepositoryFactory } from "./userRepository";
import { notificationRepository as notificationRepositoryFactory } from "./notificationRepository";
import { productRepository as productRepositoryFactory } from "./productRepository";
import { partnerRepository as partnerRepositoryFactory } from "./partnerRepository";
import { transactionRepository as transactionRepositoryFactory } from "./transactionRepository";
import { paymentRepository as paymentRepositoryFactory } from "./paymentRepository";

// Instantiate repositories by calling their factory functions with the db instance
export const userRepository = userRepositoryFactory(db);
export const notificationRepository = notificationRepositoryFactory(db);
export const productRepository = productRepositoryFactory(db);
export const partnerRepository = partnerRepositoryFactory(db);
export const transactionRepository = transactionRepositoryFactory(db);
export const paymentRepository = paymentRepositoryFactory(db);
