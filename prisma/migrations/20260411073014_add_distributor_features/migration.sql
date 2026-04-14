-- CreateTable
CREATE TABLE "low_stock_notifications" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "productId" TEXT NOT NULL,
    "distributorId" TEXT NOT NULL,
    "currentStock" INTEGER NOT NULL,
    "threshold" INTEGER NOT NULL,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "dismissedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "low_stock_notifications_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "low_stock_notifications_distributorId_fkey" FOREIGN KEY ("distributorId") REFERENCES "distributor_profiles" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "distributor_activities" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "distributorId" TEXT NOT NULL,
    "activityType" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "relatedOrderId" TEXT,
    "relatedProductId" TEXT,
    "metadata" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "distributor_activities_distributorId_fkey" FOREIGN KEY ("distributorId") REFERENCES "distributor_profiles" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "low_stock_notifications_productId_distributorId_createdAt_key" ON "low_stock_notifications"("productId", "distributorId", "createdAt");

-- CreateIndex
CREATE INDEX "distributor_activities_distributorId_createdAt_idx" ON "distributor_activities"("distributorId", "createdAt");
