/*
  Warnings:

  - You are about to drop the column `subscriptionId` on the `Invoice` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[userId,month]` on the table `Invoice` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "Invoice" DROP CONSTRAINT "Invoice_subscriptionId_fkey";

-- DropIndex
DROP INDEX "Invoice_subscriptionId_key";

-- AlterTable
ALTER TABLE "Invoice" DROP COLUMN "subscriptionId",
ADD COLUMN     "lines" JSONB;

-- CreateIndex
CREATE UNIQUE INDEX "Invoice_userId_month_key" ON "Invoice"("userId", "month");
