-- CreateEnum
CREATE TYPE "State" AS ENUM ('trialing', 'active', 'past_due', 'deleted', 'paused');

-- CreateTable
CREATE TABLE "Book" (
    "id" TEXT NOT NULL,
    "owner" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" BIGINT NOT NULL,
    "cfi" TEXT,
    "percentage" DOUBLE PRECISION,
    "definitions" TEXT[],

    CONSTRAINT "Book_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Subscription" (
    "cancel_url" TEXT NOT NULL,
    "checkout_id" TEXT NOT NULL,
    "currency" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "marketing_consent" INTEGER NOT NULL,
    "next_bill_date" TEXT NOT NULL,
    "passthrough" TEXT NOT NULL,
    "quantity" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "status" "State" NOT NULL,
    "subscription_id" TEXT NOT NULL,
    "subscription_plan_id" TEXT NOT NULL,
    "unit_price" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "update_url" TEXT NOT NULL,
    "paused_at" TEXT,
    "paused_from" TEXT,
    "paused_reason" TEXT,
    "cancellation_effective_date" TEXT,

    CONSTRAINT "Subscription_pkey" PRIMARY KEY ("subscription_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Subscription_email_key" ON "Subscription"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Subscription_user_id_key" ON "Subscription"("user_id");
