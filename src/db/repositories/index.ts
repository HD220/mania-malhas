import { db } from "@/db/postgres"; // Assuming db instance is exported from here
import { UserRepository } from "./userRepository";
import { NotificationRepository } from "./notificationRepository";
import { ProductRepository } from "./productRepository";
import { PartnerRepository } from "./partnerRepository";
import { TransactionRepository } from "./transactionRepository";
import { PaymentRepository } from "./paymentRepository";

// Instantiate repositories with the db instance
export const userRepository = new UserRepository(db);
export const notificationRepository = new NotificationRepository(db);
export const productRepository = new ProductRepository(db);
export const partnerRepository = new PartnerRepository(db);
export const transactionRepository = new TransactionRepository(db);
export const paymentRepository = new PaymentRepository(db);
