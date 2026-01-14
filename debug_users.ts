import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    const users = await prisma.usuario.findMany();
    console.log('--- USERS IN DB ---');
    console.table(users);
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
