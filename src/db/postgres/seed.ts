import { sql } from "drizzle-orm";
import env from "@/db/postgres/env";
import { db } from ".";
import { partnerTable } from "./schema/partner";
import { productTable } from "./schema/product";
import { productImagesTable } from "./schema/productImage";
import { transactionTable } from "./schema/transaction";
import { paymentTable } from "./schema/payment";
import { fakerPT_BR as faker } from '@faker-js/faker'; // Usar alias fakerPT_BR

// Tipos para os dados retornados pelos inserts, para facilitar o encadeamento
type InsertedPartner = Awaited<ReturnType<typeof db.insert<typeof partnerTable>>["returning"]>[0];
type InsertedProduct = Awaited<ReturnType<typeof db.insert<typeof productTable>>["returning"]>[0];
type InsertedTransaction = Awaited<ReturnType<typeof db.insert<typeof transactionTable>>["returning"]>[0];

/**
 * Seeds partner data into the database.
 * Creates a few sample partners with varying details.
 * @returns {Promise<InsertedPartner[]>} A promise that resolves to an array of the inserted partner records.
 */
async function seedPartners(): Promise<InsertedPartner[]> {
  console.log("🌱 Seeding partners...");
  const partnersData = [
    { name: faker.company.name(), phone: faker.phone.number('9##########'), active: true, notes: faker.lorem.sentence() }, // 11 digits
    { name: faker.person.fullName(), phone: faker.phone.number('9#########'), active: true, notes: faker.lorem.paragraph(1) }, // 10 digits
    { name: faker.company.name(), phone: faker.helpers.arrayElement([faker.phone.number('9#########'), faker.phone.number('9##########')]), active: false, notes: "Parceiro inativo para testes." },
  ];
  const insertedPartners = await db.insert(partnerTable).values(partnersData).returning();
  console.log(`-> ${insertedPartners.length} partners seeded.`);
  return insertedPartners;
}

/**
 * Seeds product data into the database.
 * Creates a specified number of sample products with random details.
 * @param {number} [count=7] - The number of products to create.
 * @returns {Promise<InsertedProduct[]>} A promise that resolves to an array of the inserted product records.
 */
async function seedProducts(count: number = 7): Promise<InsertedProduct[]> {
  console.log(`🌱 Seeding ${count} products...`);
  const productsData = [];
  for (let i = 0; i < count; i++) {
    productsData.push({
      name: faker.commerce.productName(),
      description: faker.commerce.productDescription(),
      // price é decimal(10,2) no schema, $type<number>
      price: parseFloat(faker.commerce.price({ min: 10, max: 500, dec: 2 })),
      active: faker.datatype.boolean(0.8), // 80% chance de ser ativo
    });
  }
  const insertedProducts = await db.insert(productTable).values(productsData).returning();
  console.log(`-> ${insertedProducts.length} products seeded.`);
  return insertedProducts;
}

/**
 * Seeds product image data for a given list of products.
 * Each product gets a random number of images (0-3).
 * @param {InsertedProduct[]} products - An array of product records to add images to.
 */
async function seedProductImages(products: InsertedProduct[]) {
  console.log("🌱 Seeding product images...");
  let totalImagesSeeded = 0;
  for (const product of products) {
    const numImages = faker.number.int({ min: 0, max: 3 }); // 0 a 3 imagens por produto
    if (numImages > 0) {
      const imagesData = [];
      for (let i = 0; i < numImages; i++) {
        imagesData.push({
          productId: product.id,
          name: faker.lorem.words(2).replace(" ", "_") + ".jpg", // Nome de arquivo simples
          url: faker.image.urlLoremFlickr({ category: 'product', width: 640, height: 480 }), // Usar categoria 'product'
          active: true, // Todas as imagens de seed ativas por padrão
        });
      }
      await db.insert(productImagesTable).values(imagesData);
      totalImagesSeeded += imagesData.length;
    }
  }
  console.log(`-> ${totalImagesSeeded} product images seeded.`);
}

/**
 * Seeds transaction data into the database.
 * Creates a specified number of transactions, associating them with random partners and products (for sales).
 * @param {InsertedPartner[]} partners - An array of available partner records.
 * @param {InsertedProduct[]} products - An array of available product records (used for 'E' type transaction descriptions).
 * @param {number} [count=15] - The number of transactions to create.
 * @returns {Promise<InsertedTransaction[]>} A promise that resolves to an array of the inserted transaction records.
 */
async function seedTransactions(partners: InsertedPartner[], products: InsertedProduct[], count: number = 15): Promise<InsertedTransaction[]> {
  console.log(`🌱 Seeding ${count} transactions...`);
  if (partners.length === 0) {
    console.log("⚠️ No partners to assign transactions to. Skipping transaction seeding.");
    return [];
  }
  const transactionsData = [];
  const statuses = ["Pendente", "Pago", "Cancelado"];
  const transactionTypes = ["E", "S"] as const;

  for (let i = 0; i < count; i++) {
    const partner = faker.helpers.arrayElement(partners);
    const type = faker.helpers.arrayElement(transactionTypes);
    let description = "";
    if (type === 'E' && products.length > 0) { // Venda de produto
      const product = faker.helpers.arrayElement(products);
      description = `Venda - ${product.name}`;
    } else if (type === 'S') { // Compra ou Despesa
      description = faker.finance.transactionDescription();
    } else {
      description = faker.lorem.sentence(3);
    }

    transactionsData.push({
      partnerId: partner.id,
      description: description.substring(0,100),
      type: type,
      // value é decimal(10,2) no schema, $type<number>
      value: parseFloat(faker.finance.amount({ min: 20, max: type === 'E' ? 600 : 300, dec: 2 })),
      date: faker.date.recent({ days: 90 }),
      due_date: faker.date.between({ from: faker.date.recent({days: 30}), to: faker.date.future({years: 1})}),
      status: faker.helpers.arrayElement(statuses),
      // transactionId (self-ref) can be null
    });
  }
  const insertedTransactions = await db.insert(transactionTable).values(transactionsData).returning();
  console.log(`-> ${insertedTransactions.length} transactions seeded.`);
  return insertedTransactions;
}

/**
 * Seeds payment data for a given list of transactions.
 * Creates payments for transactions that are 'Pago' or 'Pendente'.
 * For 'Pago' transactions, it might create a single full payment or multiple partial payments.
 * For 'Pendente' transactions, it has a chance to create a partial payment.
 * @param {InsertedTransaction[]} transactions - An array of transaction records to add payments to.
 */
async function seedPayments(transactions: InsertedTransaction[]) {
  console.log("🌱 Seeding payments...");
  if (transactions.length === 0) {
    console.log("⚠️ No transactions to assign payments to. Skipping payment seeding.");
    return;
  }
  let paymentCount = 0;
  for (const transaction of transactions) {
    // transaction.value should already be a number due to z.coerce.number() in selectTransactionSchema
    const transactionValue = transaction.value;
    const transactionDate = new Date(transaction.date); // Ensure date is a Date object

    if (transaction.status === "Cancelado") continue;

    if (transaction.status === "Pago") {
      if (faker.datatype.boolean(0.8)) {
        await db.insert(paymentTable).values({
          transactionId: transaction.id,
          value: transactionValue,
          date: faker.date.between({ from: transactionDate, to: new Date() }),
        });
        paymentCount++;
      } else {
        let remainingToPay = transactionValue;
        const numPayments = faker.number.int({min: 2, max: 3});
        for(let i=0; i < numPayments && remainingToPay > 0.01; i++) {
          let paymentValueNum;
          if (i === numPayments - 1 || remainingToPay < 20) { // Pagar o restante se for o último ou pequeno
            paymentValueNum = remainingToPay;
          } else {
            // Garante que não pague mais que o restante, e não menos que um valor mínimo (ex: 10)
            const maxPaymentThisTime = Math.max(10, remainingToPay / (numPayments - i));
            paymentValueNum = parseFloat(faker.finance.amount({min: 10, max: maxPaymentThisTime, dec: 2}));
            paymentValueNum = Math.min(paymentValueNum, remainingToPay); // Não exceder o restante
          }
          paymentValueNum = parseFloat(paymentValueNum.toFixed(2)); // Arredondar para 2 casas decimais

          if(paymentValueNum < 0.01) continue;

          await db.insert(paymentTable).values({
            transactionId: transaction.id,
            value: paymentValueNum,
            date: faker.date.between({ from: transactionDate, to: new Date() }),
          });
          remainingToPay -= paymentValueNum;
          paymentCount++;
        }
      }
    } else if (transaction.status === "Pendente" && faker.datatype.boolean(0.4)) { // 40% chance de ter pagamento parcial para pendentes
      const partialPaymentValue = parseFloat(faker.finance.amount({ min: 10, max: Math.max(10, transactionValue * 0.5), dec: 2 }));
      if (partialPaymentValue < transactionValue && partialPaymentValue > 0.01) {
        await db.insert(paymentTable).values({
          transactionId: transaction.id,
          value: partialPaymentValue,
          date: faker.date.between({ from: transactionDate, to: new Date() }),
        });
        paymentCount++;
      }
    }
  }
  console.log(`-> ${paymentCount} payments seeded.`);
}


async function main() {
  if (!env.DB_SEEDING) {
    throw new Error('You must set DB_SEEDING to "true" when running seeds');
  }

  console.log("⏳ Starting database reset and seed process...");
  const start = Date.now();

  console.log("  Dropping enums and tables...");
  const resetQuery = sql`
		-- Delete enums first if they depend on tables or vice-versa (though typically tables depend on enums)
    -- Order might matter if enums are used as column types.
    -- Safer to drop tables first, then enums if enums are not column types directly used in FKs or similar.
    -- However, if enums are column types, they might prevent table drop or need to be dropped carefully.
    -- Given the CASCADE, dropping tables first should be okay.
		DO $$ DECLARE
		    r RECORD;
		BEGIN
		    FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = current_schema()) LOOP
		        EXECUTE 'DROP TABLE IF EXISTS ' || quote_ident(r.tablename) || ' CASCADE';
		    END LOOP;
		END $$;
		
		DO $$ DECLARE
			r RECORD;
		BEGIN
			FOR r IN (select t.typname as enum_name
			from pg_type t 
				join pg_enum e on t.oid = e.enumtypid  
				join pg_catalog.pg_namespace n ON n.oid = t.typnamespace
			where n.nspname = current_schema() AND t.typtype = 'e') LOOP -- Ensure it's an enum type
				EXECUTE 'DROP TYPE IF EXISTS ' || quote_ident(r.enum_name) || ' CASCADE'; -- Add CASCADE here too
			END LOOP;
		END $$;
		`;
  await db.execute(resetQuery);
  console.log("  ✅ Database reset complete.");

  // Re-run migrations to recreate tables and enums
  // This is crucial as the above script drops everything.
  // The `pg:migrate` script should be run. Here we simulate its effect by
  // assuming tables are recreated by an external migration step if this script is only for seeding.
  // For a self-contained seed script that also handles schema, one would use Drizzle's migrate() function.
  // However, the existing pg:migrate script is separate.
  // For now, this seed script will ASSUME migrations have been run after this reset if run standalone.
  // Or, if run via `npm run pg:seed` which might be part of a larger flow.
  // To make it self-contained for a "reset and seed" dev task, we'd need to call migrate here.
  // Let's add a placeholder for that idea
  console.log("ℹ️  Please ensure migrations are run if tables were dropped and not recreated by this script.");
  // For a true self-contained seed after reset, you might:
  // import { migrate } from 'drizzle-orm/postgres-js/migrator';
  // await migrate(db, { migrationsFolder: 'src/db/postgres/migrations' });
  // console.log("✅ Migrations applied by seed script.");
  // For now, we assume migrations are handled externally if this script only drops/seeds.
  console.log("‼️ IMPORTANT: If tables were dropped, ensure migrations (e.g., `npm run pg:migrate`) are run to recreate the schema before seeding data, unless this script is part of a flow that handles it.");


  // Seed data
  const partners = await seedPartners();
  const products = await seedProducts();
  await seedProductImages(products);
  if (partners.length > 0) {
    const transactions = await seedTransactions(partners, products);
    if (transactions.length > 0) {
      await seedPayments(transactions);
    }
  } else {
    console.log(" Lacking partners, skipping transaction and payment seeding.")
  }


  const end = Date.now();
  console.log(`\n🎉 Seed process finished in ${(end - start) / 1000}s.`);
  process.exit(0);
}

main().catch((err) => {
  console.error("❌ Seed script failed:");
  console.error(err);
  process.exit(1);
});

// async function resetTable(db: dbType["db"], table: Table) {
//   return db.execute(
//     sql.raw(`TRUNCATE TABLE ${getTableName(table)} RESTART IDENTITY CASCADE`)
//   );
// }

// for (const table of [
//   schema.user,
// ]) {
//   await resetTable(db, table);
// }

// await seeds.user(db);

// await connection.end();
