/*
  Warnings:

  - A unique constraint covering the columns `[enrollmentLinkHash]` on the table `Customer` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[paymentLinkHash]` on the table `Customer` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Customer_enrollmentLinkHash_key" ON "public"."Customer"("enrollmentLinkHash");

-- CreateIndex
CREATE UNIQUE INDEX "Customer_paymentLinkHash_key" ON "public"."Customer"("paymentLinkHash");
