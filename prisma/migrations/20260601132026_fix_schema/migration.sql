/*
  Warnings:

  - You are about to drop the column `features` on the `startups` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "news_articles" ADD COLUMN "category" TEXT;
ALTER TABLE "news_articles" ADD COLUMN "imageUrl" TEXT;
ALTER TABLE "news_articles" ADD COLUMN "sourceCompany" TEXT;

-- CreateTable
CREATE TABLE "categories" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "slug" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "favorites" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "startupId" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "favorites_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "favorites_startupId_fkey" FOREIGN KEY ("startupId") REFERENCES "startups" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "events" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT,
    "type" TEXT,
    "location" TEXT,
    "date" DATETIME,
    "time" TEXT,
    "price" TEXT,
    "isOnline" BOOLEAN NOT NULL DEFAULT false,
    "status" TEXT,
    "tags" TEXT,
    "imageUrl" TEXT,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "support_messages" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "funding_rounds" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "startupId" INTEGER NOT NULL,
    "roundType" TEXT NOT NULL,
    "amount" TEXT NOT NULL,
    "roundDate" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "funding_rounds_startupId_fkey" FOREIGN KEY ("startupId") REFERENCES "startups" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_startups" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "category" TEXT,
    "description" TEXT,
    "story" TEXT,
    "team" TEXT,
    "isSuccessStory" BOOLEAN NOT NULL DEFAULT false,
    "successHighlights" TEXT,
    "approvalStatus" TEXT NOT NULL DEFAULT 'pending',
    "approvedAt" DATETIME,
    "rating" REAL NOT NULL DEFAULT 0,
    "reviewsCount" INTEGER NOT NULL DEFAULT 0,
    "email" TEXT,
    "phone" TEXT,
    "address" TEXT,
    "websiteUrl" TEXT,
    "coverUrl" TEXT,
    "logoUrl" TEXT,
    "foundedYear" TEXT,
    "location" TEXT,
    "vision" TEXT,
    "mission" TEXT,
    "featuredImage" TEXT,
    "stage" TEXT,
    "technologies" TEXT,
    "services" TEXT,
    "officeHours" TEXT,
    "photos" TEXT,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "whatsappNumber" TEXT,
    "followersCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "startups_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_startups" ("address", "approvalStatus", "approvedAt", "category", "createdAt", "description", "email", "followersCount", "id", "isFeatured", "isSuccessStory", "logoUrl", "name", "phone", "photos", "rating", "reviewsCount", "slug", "story", "successHighlights", "team", "updatedAt", "userId", "websiteUrl", "whatsappNumber") SELECT "address", "approvalStatus", "approvedAt", "category", "createdAt", "description", "email", "followersCount", "id", "isFeatured", "isSuccessStory", "logoUrl", "name", "phone", "photos", "rating", "reviewsCount", "slug", "story", "successHighlights", "team", "updatedAt", "userId", "websiteUrl", "whatsappNumber" FROM "startups";
DROP TABLE "startups";
ALTER TABLE "new_startups" RENAME TO "startups";
CREATE UNIQUE INDEX "startups_userId_key" ON "startups"("userId");
CREATE UNIQUE INDEX "startups_slug_key" ON "startups"("slug");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "categories_slug_key" ON "categories"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "favorites_userId_startupId_key" ON "favorites"("userId", "startupId");
