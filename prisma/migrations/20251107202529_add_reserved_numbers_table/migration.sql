-- CreateTable
CREATE TABLE "reserved_numbers" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "codigo" TEXT NOT NULL,
    "numero" TEXT NOT NULL,
    "numeroCompleto" TEXT,
    "areaLocal" TEXT NOT NULL,
    "cn" TEXT NOT NULL,
    "valorMensal" REAL NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'reserved',
    "companyId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "activatedAt" DATETIME,
    "cancelledAt" DATETIME,
    CONSTRAINT "reserved_numbers_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
