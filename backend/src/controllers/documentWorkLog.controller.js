import * as documentWorkLogService from '../services/documentWorkLog.service.js';
import { catchAsync } from '../utils/catchAsync.js';
import { sendSuccess } from '../utils/responses.js';

export const storeWorkLog = catchAsync(async (req, res) => {
    const { id: documentId } = req.params;
    const { start_time, end_time } = req.body;

    // Asumsi logic otentikasi memasukkan data user ke req.user
    const userId = req.user.id;
    const groupName = req.user.group_name || null;

    const workLog = await documentWorkLogService.storeWorkLog({
        documentId,
        userId,
        groupName,
        startTime: start_time,
        endTime: end_time
    });

    return sendSuccess(res, 201, 'Log waktu berhasil disimpan.', workLog);
});

export const getWorkLogs = catchAsync(async (req, res) => {
    const { id: documentId } = req.params;
    const workLogs = await documentWorkLogService.getWorkLogs(documentId);

    return sendSuccess(res, 200, 'Work logs retrieved successfully.', workLogs);
});
