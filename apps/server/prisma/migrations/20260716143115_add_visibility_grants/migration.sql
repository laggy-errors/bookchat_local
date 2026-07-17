-- CreateTable
CREATE TABLE "visibility_grants" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "bookId" TEXT NOT NULL,
    "granterId" TEXT NOT NULL,
    "viewerId" TEXT NOT NULL,
    "visibleUserId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "visibility_grants_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "books" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "visibility_grants_granterId_fkey" FOREIGN KEY ("granterId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "visibility_grants_viewerId_fkey" FOREIGN KEY ("viewerId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "visibility_grants_visibleUserId_fkey" FOREIGN KEY ("visibleUserId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "visibility_grants_bookId_idx" ON "visibility_grants"("bookId");

-- CreateIndex
CREATE INDEX "visibility_grants_viewerId_idx" ON "visibility_grants"("viewerId");

-- CreateIndex
CREATE INDEX "visibility_grants_visibleUserId_idx" ON "visibility_grants"("visibleUserId");

-- CreateIndex
CREATE UNIQUE INDEX "visibility_grants_bookId_viewerId_visibleUserId_key" ON "visibility_grants"("bookId", "viewerId", "visibleUserId");
