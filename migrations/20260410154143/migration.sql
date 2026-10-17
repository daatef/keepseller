/*
  Warnings:

  - Added the required column `outletId` to the `CreditSale` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "CreditSale" ADD COLUMN     "outletId" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "CreditSale" ADD CONSTRAINT "CreditSale_outletId_fkey" FOREIGN KEY ("outletId") REFERENCES "Outlet"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
