-- AlterTable
ALTER TABLE "public"."Customer" ADD COLUMN     "enrollmentLinkHash" VARCHAR(1000),
ADD COLUMN     "paymentLinkHash" VARCHAR(1000);
