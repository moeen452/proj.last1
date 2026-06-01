-- CreateTable
CREATE TABLE "refresh_tokens" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "token" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "userAgent" TEXT,
    "ipAddress" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "expiresAt" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "refresh_tokens_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "news_articles" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "startupId" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "summary" TEXT,
    "content" TEXT NOT NULL,
    "author" TEXT NOT NULL,
    "views" INTEGER NOT NULL DEFAULT 0,
    "tags" TEXT,
    "publishedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "news_articles_startupId_fkey" FOREIGN KEY ("startupId") REFERENCES "startups" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_notifications" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "startupId" INTEGER,
    "type" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "notifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "notifications_startupId_fkey" FOREIGN KEY ("startupId") REFERENCES "startups" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_notifications" ("createdAt", "id", "isRead", "message", "type", "userId") SELECT "createdAt", "id", "isRead", "message", "type", "userId" FROM "notifications";
DROP TABLE "notifications";
ALTER TABLE "new_notifications" RENAME TO "notifications";
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
    "logoUrl" TEXT,
    "features" TEXT,
    "photos" TEXT,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "whatsappNumber" TEXT,
    "followersCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "startups_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_startups" ("approvalStatus", "approvedAt", "category", "createdAt", "description", "id", "isSuccessStory", "name", "slug", "story", "successHighlights", "team", "updatedAt", "userId") SELECT "approvalStatus", "approvedAt", "category", "createdAt", "description", "id", "isSuccessStory", "name", "slug", "story", "successHighlights", "team", "updatedAt", "userId" FROM "startups";
DROP TABLE "startups";
ALTER TABLE "new_startups" RENAME TO "startups";
CREATE UNIQUE INDEX "startups_userId_key" ON "startups"("userId");
CREATE UNIQUE INDEX "startups_slug_key" ON "startups"("slug");
CREATE TABLE "new_users" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'owner',
    "isEmailVerified" BOOLEAN NOT NULL DEFAULT false,
    "emailVerificationToken" TEXT,
    "emailVerificationExpiry" DATETIME,
    "passwordResetToken" TEXT,
    "passwordResetExpiry" DATETIME,
    "passwordResetCode" TEXT,
    "preferredLanguage" TEXT NOT NULL DEFAULT 'ar',
    "privacySettings" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_users" ("createdAt", "email", "emailVerificationExpiry", "emailVerificationToken", "fullName", "id", "isEmailVerified", "passwordHash", "passwordResetExpiry", "passwordResetToken", "role", "updatedAt") SELECT "createdAt", "email", "emailVerificationExpiry", "emailVerificationToken", "fullName", "id", "isEmailVerified", "passwordHash", "passwordResetExpiry", "passwordResetToken", "role", "updatedAt" FROM "users";
DROP TABLE "users";
ALTER TABLE "new_users" RENAME TO "users";
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "refresh_tokens_token_key" ON "refresh_tokens"("token");
