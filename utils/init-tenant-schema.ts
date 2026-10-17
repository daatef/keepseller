// utils/init-tenant-schema.ts
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();

export async function initTenantSchema(schema: string) {
  const rawDatabaseUrl = process.env.DATABASE_URL;

  if (!rawDatabaseUrl) {
    throw new Error("❌ DATABASE_URL is missing from environment variables.");
  }

  const baseUrl = rawDatabaseUrl.split('?')[0];
  const dbUrl = `${baseUrl}?schema=${schema}&sslmode=require`;

  console.log(`🔧 Initializing tenant schema: "${schema}"`);
  console.log(`🌐 Connecting to DB with URL: ${dbUrl}`);

  const db = new PrismaClient({
    datasources: {
      db: {
        url: dbUrl,
      },
    },
  });

  try {
    await db.$connect();
    console.log(`✅ Connected to database`);

    // 1️⃣ Create schema
    await db.$executeRawUnsafe(`CREATE SCHEMA IF NOT EXISTS "${schema}"`);
    await db.$executeRawUnsafe(`SET search_path TO "${schema}"`);

    // 2️⃣ Create extension
    try {
      await db.$executeRawUnsafe(`CREATE EXTENSION IF NOT EXISTS pgcrypto`);
    } catch (extErr) {
      console.warn(`⚠️ Could not create pgcrypto extension:`, extErr);
    }

    // 3️⃣ Core tables (no FK dependencies)
    await db.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "Supplier" (
        "id" SERIAL PRIMARY KEY,
        "name" VARCHAR(255) NOT NULL,
        "phone" VARCHAR(255),
        "email" VARCHAR(255),
        "address" VARCHAR(255),
        "createdAt" TIMESTAMPTZ DEFAULT NOW(),
        "updatedAt" TIMESTAMPTZ DEFAULT NOW()
      );
    `);


    await db.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "Products" (
        "id" SERIAL PRIMARY KEY,
        "image" TEXT,
        "name" TEXT UNIQUE NOT NULL,
        "code" TEXT UNIQUE NOT NULL,
        "wholesale_price" FLOAT NOT NULL,
        "selling_price" FLOAT NOT NULL,
        "quantity_in_stock" INTEGER NOT NULL,
        "percentage_of_win" DECIMAL NOT NULL,
        "minimumAlertLevel" INTEGER NOT NULL,
        "trackInventory" BOOLEAN NOT NULL DEFAULT true
      );
    `);

    await db.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "Outlet" (
        "id" SERIAL PRIMARY KEY,
        "name" TEXT UNIQUE NOT NULL,
        "location" TEXT,
        "createdAt" TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    // 4️⃣ Purchase-related tables (depends on Products & Supplier)
    await db.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "Purchase" (
        "id" SERIAL PRIMARY KEY,
        "productId" INTEGER NOT NULL,
        "quantity" INTEGER NOT NULL,
        "totalCost" DECIMAL NOT NULL,
        "createdAt" TIMESTAMPTZ DEFAULT NOW(),
        "supplierId" INTEGER,
        CONSTRAINT fk_purchase_product FOREIGN KEY ("productId") REFERENCES "Products"("id"),
        CONSTRAINT fk_purchase_supplier FOREIGN KEY ("supplierId") REFERENCES "Supplier"("id") ON DELETE SET NULL
      );
    `);

    await db.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "ReturnPurchase" (
        "id" SERIAL PRIMARY KEY,
        "productId" INTEGER NOT NULL,
        "supplierId" INTEGER NOT NULL,
        "purchaseId" INTEGER,
        "quantity" INTEGER NOT NULL,
        "refundAmount" DECIMAL NOT NULL,
        "reason" TEXT,
        "createdAt" TIMESTAMPTZ DEFAULT NOW(),
        CONSTRAINT fk_returnpurchase_product FOREIGN KEY ("productId") REFERENCES "Products"("id") ON DELETE CASCADE,
        CONSTRAINT fk_returnpurchase_supplier FOREIGN KEY ("supplierId") REFERENCES "Supplier"("id") ON DELETE CASCADE,
        CONSTRAINT fk_returnpurchase_purchase FOREIGN KEY ("purchaseId") REFERENCES "Purchase"("id") ON DELETE SET NULL
      );
    `);

    // 5️⃣ Sale-related tables (depends on Products & Outlet & Receipt)
    await db.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "Receipt" (
        "id" SERIAL PRIMARY KEY,
        "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "outletId" INTEGER,
        "total" NUMERIC NOT NULL DEFAULT 0,
        CONSTRAINT fk_receipt_outlet FOREIGN KEY ("outletId") REFERENCES "Outlet"("id") ON DELETE SET NULL
      );
    `);

    await db.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "Sale" (
        "id" SERIAL PRIMARY KEY,
        "productId" INTEGER NOT NULL,
        "quantity" INTEGER NOT NULL,
        "total_revenue" FLOAT NOT NULL,
        "createdAt" TIMESTAMPTZ DEFAULT NOW(),
        "outletId" INTEGER,
        "receiptId" INTEGER,
        CONSTRAINT fk_sale_product FOREIGN KEY ("productId") REFERENCES "Products"("id") ON DELETE RESTRICT,
        CONSTRAINT fk_sale_outlet FOREIGN KEY ("outletId") REFERENCES "Outlet"("id") ON DELETE SET NULL,
        CONSTRAINT fk_sale_receipt FOREIGN KEY ("receiptId") REFERENCES "Receipt"("id") ON DELETE SET NULL
      );
    `);

    await db.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "ReturnSale" (
        "id" SERIAL PRIMARY KEY,
        "productId" INTEGER NOT NULL,
        "quantity" INTEGER NOT NULL,
        "refundAmount" FLOAT NOT NULL,
        "reason" TEXT,
        "createdAt" TIMESTAMPTZ DEFAULT NOW(),
        "originalSaleId" INTEGER,
        CONSTRAINT fk_returnsale_product FOREIGN KEY ("productId") REFERENCES "Products"("id"),
        CONSTRAINT fk_returnsale_original FOREIGN KEY ("originalSaleId") REFERENCES "Sale"("id")
      );
    `);

    // 6️⃣ Pocket & financial tables
    await db.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "Pocket" (
        "id" SERIAL PRIMARY KEY,
        "moneyOnHand" DECIMAL NOT NULL DEFAULT 0.0,
        "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);

    await db.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "PocketUpdate" (
        "id" SERIAL PRIMARY KEY,
        "amount" DECIMAL NOT NULL,
        "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        "pocketId" INTEGER NOT NULL,
        CONSTRAINT fk_pocketupdate_pocket FOREIGN KEY ("pocketId") REFERENCES "Pocket"("id") ON DELETE CASCADE
      );
    `);

    await db.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "Income" (
        "id" SERIAL PRIMARY KEY,
        "amount" DECIMAL NOT NULL,
        "reason" TEXT,
        "createdAt" TIMESTAMPTZ DEFAULT NOW(),
        "pocketId" INTEGER NOT NULL,
        CONSTRAINT fk_income_pocket FOREIGN KEY ("pocketId") REFERENCES "Pocket"("id") ON DELETE CASCADE
      );
    `);

    await db.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "Expense" (
        "id" SERIAL PRIMARY KEY,
        "amount" DECIMAL NOT NULL,
        "reason" TEXT,
        "createdAt" TIMESTAMPTZ DEFAULT NOW(),
        "pocketId" INTEGER NOT NULL,
        CONSTRAINT fk_expense_pocket FOREIGN KEY ("pocketId") REFERENCES "Pocket"("id") ON DELETE CASCADE
      );
    `);

    // 7️⃣ Other independent tables
    await db.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "Winning" (
        "id" SERIAL PRIMARY KEY,
        "nameOfProduct" TEXT NOT NULL,
        "winQuantity" DECIMAL NOT NULL,
        "quantityOfProducts" INTEGER NOT NULL,
        "createdAt" TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    await db.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "Booking" (
        "id" SERIAL PRIMARY KEY,
        "productName" TEXT,
        "clientName" TEXT,
        "mobileNumber" BIGINT NOT NULL,
        "quantity" INTEGER NOT NULL,
        "status" VARCHAR(20) NOT NULL DEFAULT 'PENDING',
        "notes" TEXT,
        "bookedAt" TIMESTAMPTZ DEFAULT NOW()
      );
    `);



    
await db.$executeRawUnsafe(`
  CREATE TABLE IF NOT EXISTS "Customer" (
    "id" SERIAL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "email" TEXT,
    "address" TEXT,
    "createdAt" TIMESTAMPTZ DEFAULT NOW(),
    "updatedAt" TIMESTAMPTZ DEFAULT NOW()
  );
`);


await db.$executeRawUnsafe(`
  CREATE TABLE IF NOT EXISTS "CreditSale" (
    "id" SERIAL PRIMARY KEY,
    "customerId" INTEGER NOT NULL,
    "outletId" INTEGER,

    "totalAmount" NUMERIC(10,2) NOT NULL,
    "paidAmount" NUMERIC(10,2) DEFAULT 0,
    "remaining" NUMERIC(10,2) NOT NULL,
    "status" VARCHAR(20) DEFAULT 'pending',

    "createdAt" TIMESTAMPTZ DEFAULT NOW(),
    "updatedAt" TIMESTAMPTZ DEFAULT NOW(),

    CONSTRAINT fk_creditsale_customer
      FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE CASCADE,

    CONSTRAINT fk_creditsale_outlet
      FOREIGN KEY ("outletId") REFERENCES "Outlet"("id") ON DELETE SET NULL
  );
`);


await db.$executeRawUnsafe(`
  CREATE TABLE IF NOT EXISTS "CreditSaleItem" (
    "id" SERIAL PRIMARY KEY,
    "creditSaleId" INTEGER NOT NULL,
    "productId" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL,
    "price" NUMERIC(10,2) NOT NULL,
    "createdAt" TIMESTAMPTZ DEFAULT NOW(),

    CONSTRAINT fk_item_sale
      FOREIGN KEY ("creditSaleId") REFERENCES "CreditSale"("id") ON DELETE CASCADE,

    CONSTRAINT fk_item_product
      FOREIGN KEY ("productId") REFERENCES "Products"("id") ON DELETE RESTRICT
  );
`);

    // 8️⃣ Settings table & default row
    await db.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "Setting" (
        "id" SERIAL PRIMARY KEY,
        "businessName" TEXT NOT NULL DEFAULT 'My Business',
        "businessLogoUrl" TEXT NOT NULL DEFAULT '/default-logo.png',
        "theme" VARCHAR(10) NOT NULL DEFAULT 'light',
        "language" VARCHAR(5) NOT NULL DEFAULT 'en',
        "createdAt" TIMESTAMPTZ DEFAULT NOW(),
        "updatedAt" TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    await db.$executeRawUnsafe(`
      INSERT INTO "Setting" ("businessName", "businessLogoUrl")
      SELECT 'My Business', ''
      WHERE NOT EXISTS (SELECT 1 FROM "Setting");
    `);

    console.log(`✅ Schema "${schema}" initialized successfully.`);
  } catch (err) {
    console.error(`❌ Error initializing schema "${schema}":`, err);
    throw err;
  } finally {
    await db.$disconnect();
  }
}