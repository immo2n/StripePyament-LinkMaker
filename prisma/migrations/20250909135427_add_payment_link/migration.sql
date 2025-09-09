-- CreateTable
CREATE TABLE "public"."PaymentLink" (
    "id" SERIAL NOT NULL,
    "customerId" INTEGER,
    "amount" DOUBLE PRECISION NOT NULL,
    "refundable" BOOLEAN NOT NULL,
    "clientName" TEXT,
    "clientEmail" TEXT,
    "itineraryUrl" TEXT NOT NULL,
    "stripeSecret" TEXT,
    "paymentLinkHash" VARCHAR(1000) NOT NULL,
    "successful" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PaymentLink_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PaymentLink_paymentLinkHash_key" ON "public"."PaymentLink"("paymentLinkHash");
