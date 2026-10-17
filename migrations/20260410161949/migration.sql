-- DropForeignKey
ALTER TABLE "CreditSale" DROP CONSTRAINT "CreditSale_outletId_fkey";

-- DropIndex
DROP INDEX "CreditSale_customerId_idx";

-- AlterTable
ALTER TABLE "CreditSale" ALTER COLUMN "outletId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "CreditSale" ADD CONSTRAINT "CreditSale_outletId_fkey" FOREIGN KEY ("outletId") REFERENCES "Outlet"("id") ON DELETE SET NULL ON UPDATE CASCADE;
