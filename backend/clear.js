const { PrismaClient } = require('@prisma/client'); const prisma = new PrismaClient(); async function main() { await prisma.documentChunk.deleteMany(); console.log('Cleared'); } main();  
