/*
  Warnings:

  - You are about to drop the `RefreshToken` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "RefreshToken";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "ApiKey" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "expirationDate" DATETIME NOT NULL,
    "userId" INTEGER NOT NULL,
    CONSTRAINT "ApiKey_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
