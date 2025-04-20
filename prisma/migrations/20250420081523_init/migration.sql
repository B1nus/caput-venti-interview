-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Transaction" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "amount" TEXT NOT NULL,
    "currency" TEXT NOT NULL,
    "senderId" INTEGER,
    "receiverId" INTEGER,
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "senderNote" TEXT NOT NULL,
    "receiverNote" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'COMPLETED',
    CONSTRAINT "Transaction_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Transaction_receiverId_fkey" FOREIGN KEY ("receiverId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Transaction" ("amount", "currency", "id", "receiverId", "receiverNote", "senderId", "senderNote", "status", "timestamp") SELECT "amount", "currency", "id", "receiverId", "receiverNote", "senderId", "senderNote", "status", "timestamp" FROM "Transaction";
DROP TABLE "Transaction";
ALTER TABLE "new_Transaction" RENAME TO "Transaction";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
