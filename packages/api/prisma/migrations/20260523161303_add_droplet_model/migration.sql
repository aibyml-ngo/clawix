-- CreateEnum
CREATE TYPE "DropletStatus" AS ENUM ('creating', 'active', 'off', 'archive', 'deleting');

-- CreateTable
CREATE TABLE "Droplet" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "doDropletId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "region" TEXT NOT NULL,
    "size" TEXT NOT NULL,
    "imageSlug" TEXT NOT NULL DEFAULT 'ubuntu-24-04-x64',
    "ipv4" TEXT,
    "ipv6" TEXT,
    "status" "DropletStatus" NOT NULL DEFAULT 'creating',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Droplet_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Droplet_userId_idx" ON "Droplet"("userId");

-- CreateIndex
CREATE INDEX "Droplet_doDropletId_idx" ON "Droplet"("doDropletId");

-- AddForeignKey
ALTER TABLE "Droplet" ADD CONSTRAINT "Droplet_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
