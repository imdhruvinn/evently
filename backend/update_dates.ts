import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const events = await prisma.event.findMany();
  for (const event of events) {
    if (event.startTime < new Date()) {
      const start = new Date(event.startTime);
      const end = new Date(event.endTime);
      
      // Shift by 30 days
      start.setDate(start.getDate() + 30);
      end.setDate(end.getDate() + 30);
      
      // If still in the past, shift by another 60 days
      if (start < new Date()) {
        start.setDate(start.getDate() + 60);
        end.setDate(end.getDate() + 60);
      }

      await prisma.event.update({
        where: { id: event.id },
        data: {
          startTime: start,
          endTime: end,
        }
      });
      console.log(`Updated event: ${event.name}`);
    }
  }
  console.log('Finished updating event dates!');
}

main().catch(console.error).finally(() => prisma.$disconnect());
