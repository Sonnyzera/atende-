-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Config" (
    "key" TEXT NOT NULL PRIMARY KEY,
    "value" TEXT NOT NULL
);
INSERT INTO "new_Config" ("key", "value") SELECT "key", "value" FROM "Config";
DROP TABLE "Config";
ALTER TABLE "new_Config" RENAME TO "Config";
CREATE TABLE "new_Usuario" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "senha" TEXT,
    "isAdmin" BOOLEAN NOT NULL DEFAULT false,
    "funcao" TEXT NOT NULL,
    "guiche" INTEGER,
    "tiposAtendimento" TEXT
);
INSERT INTO "new_Usuario" ("email", "funcao", "guiche", "id", "nome", "tiposAtendimento") SELECT "email", "funcao", "guiche", "id", "nome", "tiposAtendimento" FROM "Usuario";
DROP TABLE "Usuario";
ALTER TABLE "new_Usuario" RENAME TO "Usuario";
CREATE UNIQUE INDEX "Usuario_email_key" ON "Usuario"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
