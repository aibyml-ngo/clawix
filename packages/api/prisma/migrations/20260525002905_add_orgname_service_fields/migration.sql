-- AlterTable
ALTER TABLE "Droplet" ADD COLUMN     "serviceField" TEXT,
ADD COLUMN     "servicePackage" TEXT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "orgName" TEXT;
