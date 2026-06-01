-- AlterTable
ALTER TABLE "startups" ADD COLUMN "features" TEXT;

-- CreateTable
CREATE TABLE "contacts" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "startupId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "title" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "imageUrl" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "contacts_startupId_fkey" FOREIGN KEY ("startupId") REFERENCES "startups" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
