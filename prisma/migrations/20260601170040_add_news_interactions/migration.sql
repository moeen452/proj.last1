-- CreateTable
CREATE TABLE "news_likes" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "newsId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "news_likes_newsId_fkey" FOREIGN KEY ("newsId") REFERENCES "news_articles" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "news_likes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_news_articles" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "startupId" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "summary" TEXT,
    "content" TEXT NOT NULL,
    "author" TEXT NOT NULL,
    "imageUrl" TEXT,
    "category" TEXT,
    "sourceCompany" TEXT,
    "views" INTEGER NOT NULL DEFAULT 0,
    "likes" INTEGER NOT NULL DEFAULT 0,
    "comments" INTEGER NOT NULL DEFAULT 0,
    "shares" INTEGER NOT NULL DEFAULT 0,
    "tags" TEXT,
    "publishedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "news_articles_startupId_fkey" FOREIGN KEY ("startupId") REFERENCES "startups" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_news_articles" ("author", "category", "content", "createdAt", "id", "imageUrl", "publishedAt", "sourceCompany", "startupId", "summary", "tags", "title", "updatedAt", "views") SELECT "author", "category", "content", "createdAt", "id", "imageUrl", "publishedAt", "sourceCompany", "startupId", "summary", "tags", "title", "updatedAt", "views" FROM "news_articles";
DROP TABLE "news_articles";
ALTER TABLE "new_news_articles" RENAME TO "news_articles";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "news_likes_newsId_userId_key" ON "news_likes"("newsId", "userId");
