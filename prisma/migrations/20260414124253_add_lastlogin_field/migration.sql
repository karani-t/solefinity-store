-- AlterTable
ALTER TABLE "users" ADD COLUMN "lastLogin" DATETIME;
ALTER TABLE "users" ADD COLUMN "resetToken" TEXT;
ALTER TABLE "users" ADD COLUMN "resetTokenExpiry" DATETIME;

-- CreateTable
CREATE TABLE "support_tickets" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "ticketNumber" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "priority" TEXT NOT NULL DEFAULT 'MEDIUM',
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "attachments" TEXT,
    "resolution" TEXT,
    "resolvedBy" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "resolvedAt" DATETIME,
    CONSTRAINT "support_tickets_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ticket_responses" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "ticketId" TEXT NOT NULL,
    "respondentId" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "attachments" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ticket_responses_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "support_tickets" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ticket_responses_respondentId_fkey" FOREIGN KEY ("respondentId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "support_tickets_ticketNumber_key" ON "support_tickets"("ticketNumber");

-- CreateIndex
CREATE INDEX "support_tickets_userId_status_createdAt_idx" ON "support_tickets"("userId", "status", "createdAt");

-- CreateIndex
CREATE INDEX "ticket_responses_ticketId_createdAt_idx" ON "ticket_responses"("ticketId", "createdAt");
