-- CreateTable
CREATE TABLE "Senha" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "numero" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "prioridade" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "guiche" INTEGER,
    "atendente" TEXT,
    "horaGeracao" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "horaChamada" DATETIME,
    "horaFinalizacao" DATETIME
);

-- CreateTable
CREATE TABLE "Usuario" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "funcao" TEXT NOT NULL,
    "guiche" INTEGER,
    "tiposAtendimento" TEXT
);

-- CreateTable
CREATE TABLE "Config" (
    "key" TEXT NOT NULL PRIMARY KEY,
    "value" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_email_key" ON "Usuario"("email");
