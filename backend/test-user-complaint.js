import pg from 'pg';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
async function run() {
  const docs = await prisma.document.findMany({ select: { id: true, content_data: true } });
  console.log(docs);
}
run();
