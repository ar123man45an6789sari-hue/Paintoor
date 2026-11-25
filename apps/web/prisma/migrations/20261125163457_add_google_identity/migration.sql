/*
  Warnings:

  - A unique constraint covering the columns `[email]` on the table `Profile` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[googleSub]` on the table `Profile` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Profile" ADD COLUMN     "email" TEXT,
ADD COLUMN     "googleSub" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Profile_email_key" ON "Profile"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Profile_googleSub_key" ON "Profile"("googleSub");
