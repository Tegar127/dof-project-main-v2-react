import prisma from '../config/database.js';

export const getDistributedDocuments = async (user) => {
    const where = {
        status: { in: ['sent', 'received', 'approved'] }
    };

    if (user.role !== 'admin') {
        where.author_id = Number(user.id);
    }

    return await prisma.document.findMany({
        where,
        include: { author: { select: { name: true } } },
        orderBy: { updated_at: 'desc' }
    });
};

export const getDocumentDistributions = async (documentId) => {
    return await prisma.documentDistribution.findMany({
        where: { document_id: Number(documentId) }
    });
};

export const createDistribution = async (distributionData) => {
    await prisma.documentDistribution.create({
        data: {
            ...distributionData,
            document_id: Number(distributionData.document_id)
        }
    });
};
