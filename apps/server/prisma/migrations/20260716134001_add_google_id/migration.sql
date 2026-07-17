-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "username" TEXT,
    "passwordHash" TEXT,
    "googleId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "deletedAt" DATETIME
);

-- CreateTable
CREATE TABLE "profiles" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "displayName" TEXT,
    "bio" TEXT,
    "avatarUrl" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "books" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "author" TEXT NOT NULL,
    "coverUrl" TEXT,
    "isbn" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "conversations" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'GROUP',
    "bookId" TEXT,
    "lastMessageAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "conversations_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "books" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "conversation_participants" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "conversationId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "joinedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "conversation_participants_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "conversations" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "conversation_participants_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "messages" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "conversationId" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "messageType" TEXT NOT NULL DEFAULT 'TEXT',
    "status" TEXT NOT NULL DEFAULT 'SENT',
    "edited" BOOLEAN NOT NULL DEFAULT false,
    "editedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "deletedAt" DATETIME,
    CONSTRAINT "messages_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "conversations" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "messages_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "reactions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "messageId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "emoji" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "reactions_messageId_fkey" FOREIGN KEY ("messageId") REFERENCES "messages" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "reactions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "attachments" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "messageId" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "fileType" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "attachments_messageId_fkey" FOREIGN KEY ("messageId") REFERENCES "messages" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "bookmarks" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "bookId" TEXT,
    "messageId" TEXT,
    "pageNumber" INTEGER,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "bookmarks_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "bookmarks_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "books" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "bookmarks_messageId_fkey" FOREIGN KEY ("messageId") REFERENCES "messages" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "receiverId" TEXT NOT NULL,
    "senderId" TEXT,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "preview" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'CREATED',
    "read" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "notifications_receiverId_fkey" FOREIGN KEY ("receiverId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "notifications_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "reader_presences" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "activeBookId" TEXT,
    "currentChapter" TEXT,
    "typing" BOOLEAN NOT NULL DEFAULT false,
    "online" BOOLEAN NOT NULL DEFAULT false,
    "lastSeen" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "reader_presences_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "reader_presences_activeBookId_fkey" FOREIGN KEY ("activeBookId") REFERENCES "books" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "reading_progresses" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "bookId" TEXT NOT NULL,
    "pagesRead" INTEGER NOT NULL DEFAULT 0,
    "chaptersCompleted" INTEGER NOT NULL DEFAULT 0,
    "readingTime" INTEGER NOT NULL DEFAULT 0,
    "lastOpened" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "reading_progresses_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "reading_progresses_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "books" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "annotations" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "bookId" TEXT NOT NULL,
    "chapter" TEXT,
    "pageNumber" INTEGER,
    "highlightedText" TEXT,
    "notes" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "annotations_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "annotations_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "books" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "quotes" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "bookId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "pageNumber" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "quotes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "quotes_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "books" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "sessions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "userAgent" TEXT,
    "ipAddress" TEXT,
    "expiresAt" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "refresh_tokens" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "refresh_tokens_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "theme_preferences" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "themeName" TEXT NOT NULL DEFAULT 'Classic Library',
    "fontSize" TEXT NOT NULL DEFAULT 'medium',
    "reducedMotion" BOOLEAN NOT NULL DEFAULT false,
    "highContrast" BOOLEAN NOT NULL DEFAULT false,
    "largeText" BOOLEAN NOT NULL DEFAULT false,
    "masterMute" BOOLEAN NOT NULL DEFAULT false,
    "uiVolume" REAL NOT NULL DEFAULT 0.4,
    "writingVolume" REAL NOT NULL DEFAULT 0.5,
    "ambienceVolume" REAL NOT NULL DEFAULT 0.2,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "theme_preferences_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT,
    "action" TEXT NOT NULL,
    "entity" TEXT NOT NULL,
    "entityId" TEXT,
    "details" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "audit_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "users_googleId_key" ON "users"("googleId");

-- CreateIndex
CREATE UNIQUE INDEX "profiles_userId_key" ON "profiles"("userId");

-- CreateIndex
CREATE INDEX "profiles_userId_idx" ON "profiles"("userId");

-- CreateIndex
CREATE INDEX "books_title_idx" ON "books"("title");

-- CreateIndex
CREATE INDEX "conversations_bookId_idx" ON "conversations"("bookId");

-- CreateIndex
CREATE INDEX "conversations_bookId_title_idx" ON "conversations"("bookId", "title");

-- CreateIndex
CREATE INDEX "conversation_participants_conversationId_idx" ON "conversation_participants"("conversationId");

-- CreateIndex
CREATE INDEX "conversation_participants_userId_idx" ON "conversation_participants"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "conversation_participants_conversationId_userId_key" ON "conversation_participants"("conversationId", "userId");

-- CreateIndex
CREATE INDEX "messages_conversationId_idx" ON "messages"("conversationId");

-- CreateIndex
CREATE INDEX "messages_senderId_idx" ON "messages"("senderId");

-- CreateIndex
CREATE INDEX "messages_conversationId_createdAt_idx" ON "messages"("conversationId", "createdAt");

-- CreateIndex
CREATE INDEX "reactions_messageId_idx" ON "reactions"("messageId");

-- CreateIndex
CREATE INDEX "reactions_userId_idx" ON "reactions"("userId");

-- CreateIndex
CREATE INDEX "attachments_messageId_idx" ON "attachments"("messageId");

-- CreateIndex
CREATE INDEX "bookmarks_userId_idx" ON "bookmarks"("userId");

-- CreateIndex
CREATE INDEX "bookmarks_bookId_idx" ON "bookmarks"("bookId");

-- CreateIndex
CREATE INDEX "bookmarks_messageId_idx" ON "bookmarks"("messageId");

-- CreateIndex
CREATE INDEX "notifications_receiverId_idx" ON "notifications"("receiverId");

-- CreateIndex
CREATE INDEX "notifications_senderId_idx" ON "notifications"("senderId");

-- CreateIndex
CREATE INDEX "notifications_receiverId_read_idx" ON "notifications"("receiverId", "read");

-- CreateIndex
CREATE UNIQUE INDEX "reader_presences_userId_key" ON "reader_presences"("userId");

-- CreateIndex
CREATE INDEX "reader_presences_userId_idx" ON "reader_presences"("userId");

-- CreateIndex
CREATE INDEX "reader_presences_activeBookId_idx" ON "reader_presences"("activeBookId");

-- CreateIndex
CREATE INDEX "reading_progresses_userId_idx" ON "reading_progresses"("userId");

-- CreateIndex
CREATE INDEX "reading_progresses_bookId_idx" ON "reading_progresses"("bookId");

-- CreateIndex
CREATE UNIQUE INDEX "reading_progresses_userId_bookId_key" ON "reading_progresses"("userId", "bookId");

-- CreateIndex
CREATE INDEX "annotations_userId_idx" ON "annotations"("userId");

-- CreateIndex
CREATE INDEX "annotations_bookId_idx" ON "annotations"("bookId");

-- CreateIndex
CREATE INDEX "quotes_userId_idx" ON "quotes"("userId");

-- CreateIndex
CREATE INDEX "quotes_bookId_idx" ON "quotes"("bookId");

-- CreateIndex
CREATE UNIQUE INDEX "sessions_token_key" ON "sessions"("token");

-- CreateIndex
CREATE INDEX "sessions_userId_idx" ON "sessions"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "refresh_tokens_tokenHash_key" ON "refresh_tokens"("tokenHash");

-- CreateIndex
CREATE INDEX "refresh_tokens_userId_idx" ON "refresh_tokens"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "theme_preferences_userId_key" ON "theme_preferences"("userId");

-- CreateIndex
CREATE INDEX "theme_preferences_userId_idx" ON "theme_preferences"("userId");

-- CreateIndex
CREATE INDEX "audit_logs_userId_idx" ON "audit_logs"("userId");
