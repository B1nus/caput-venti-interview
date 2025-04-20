/*
  Warnings:

  - You are about to drop the column `description` on the `Transaction` table. All the data in the column will be lost.
  - Added the required column `receiverNote` to the `Transaction` table without a default value. This is not possible if the table is not empty.
  - Added the required column `senderNote` to the `Transaction` table without a default value. This is not possible if the table is not empty.
  - Made the column `senderId` on table `Transaction` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `privateKey` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `publicKey` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Transaction" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "amount" TEXT NOT NULL,
    "currency" TEXT NOT NULL,
    "senderId" INTEGER NOT NULL,
    "receiverId" INTEGER NOT NULL,
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "senderNote" TEXT NOT NULL,
    "receiverNote" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'COMPLETED',
    CONSTRAINT "Transaction_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Transaction_receiverId_fkey" FOREIGN KEY ("receiverId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Transaction" ("amount", "currency", "id", "receiverId", "senderId", "status", "timestamp") SELECT "amount", "currency", "id", "receiverId", "senderId", "status", "timestamp" FROM "Transaction";
DROP TABLE "Transaction";
ALTER TABLE "new_Transaction" RENAME TO "Transaction";
CREATE TABLE "new_User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'USER',
    "publicKey" TEXT NOT NULL,
    "privateKey" TEXT NOT NULL
);
INSERT INTO "new_User" ("createdAt", "id", "name", "password", "role", "updatedAt") SELECT "createdAt", "id", "name", "password", "role", "updatedAt" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_name_key" ON "User"("name");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
