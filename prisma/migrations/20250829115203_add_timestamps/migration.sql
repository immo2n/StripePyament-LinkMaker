-- AlterTable
ALTER TABLE "public"."Customer" ADD COLUMN     "enrollHashTimestamp" TIMESTAMP(3),
ADD COLUMN     "paymentHashTimestamp" TIMESTAMP(3);
