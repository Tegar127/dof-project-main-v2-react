import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const calculateDurationInMinutes = (start, end) => {
    const startTime = new Date(start);
    const endTime = new Date(end);

    // Hitung selisih dalam milidetik (milliseconds)
    const diffMs = endTime - startTime;
    // Konversi milidetik ke menit (1 menit = 60000 ms)
    const diffMins = Math.floor(diffMs / 60000);

    // Aturan yang sama dengan Laravel: minimal 1 menit
    return diffMins < 1 ? 1 : diffMins;
};

export const storeWorkLog = async ({ documentId, userId, groupName, startTime, endTime }) => {
    const duration_minutes = calculateDurationInMinutes(startTime, endTime);

    const workLog = await prisma.documentWorkLog.create({
        data: {
            document_id: parseInt(documentId),
            user_id: userId,
            group_name: groupName,
            start_time: new Date(startTime),
            end_time: new Date(endTime),
            duration_minutes,
            status: 'finished'
        }
    });

    return workLog;
};

export const getWorkLogs = async (documentId) => {
    return await prisma.documentWorkLog.findMany({
        where: {
            document_id: parseInt(documentId)
        },
        include: {
            user: {
                select: {
                    id: true,
                    name: true,
                    email: true
                }
            }
        },
        orderBy: {
            created_at: 'desc'
        }
    });
};
