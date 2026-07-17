-- CreateTable
CREATE TABLE "book_memberships" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "bookId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'MEMBER',
    "joinedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "book_memberships_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "books" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "book_memberships_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_books" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "author" TEXT NOT NULL,
    "coverUrl" TEXT,
    "isbn" TEXT,
    "creatorId" TEXT,
    "joinCode" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "books_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_books" ("author", "coverUrl", "createdAt", "id", "isbn", "title", "updatedAt") SELECT "author", "coverUrl", "createdAt", "id", "isbn", "title", "updatedAt" FROM "books";
DROP TABLE "books";
ALTER TABLE "new_books" RENAME TO "books";
CREATE UNIQUE INDEX "books_joinCode_key" ON "books"("joinCode");
CREATE INDEX "books_title_idx" ON "books"("title");
CREATE INDEX "books_joinCode_idx" ON "books"("joinCode");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "book_memberships_bookId_idx" ON "book_memberships"("bookId");

-- CreateIndex
CREATE INDEX "book_memberships_userId_idx" ON "book_memberships"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "book_memberships_bookId_userId_key" ON "book_memberships"("bookId", "userId");
