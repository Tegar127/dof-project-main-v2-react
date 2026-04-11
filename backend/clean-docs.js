import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Cleaning document data...');
  
  await prisma.notification.deleteMany({});
  await prisma.documentWorkLog.deleteMany({});
  await prisma.documentDistribution.deleteMany({});
  await prisma.documentReadReceipt.deleteMany({});
  await prisma.documentLog.deleteMany({});
  await prisma.documentApproval.deleteMany({});
  await prisma.documentVersion.deleteMany({});
  await prisma.document.deleteMany({});
  
  // optionally reset sequence for document id if on postgres
  try {
     await prisma.$executeRawUnsafe(`ALTER SEQUENCE documents_id_seq RESTART WITH 1;`);
  } catch(e) {
     console.log('Could not reset sequence, ignored.');
  }
  
  console.log('Done!');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
