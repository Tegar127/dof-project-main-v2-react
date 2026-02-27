import * as distService from '../services/documentDistribution.service.js';
import { catchAsync } from '../utils/catchAsync.js';
import { sendSuccess } from '../utils/responses.js';

export const getMonitoringData = catchAsync(async (req, res) => {
    const data = await distService.getMonitoringData(req.user);
    return res.status(200).json(data);
});

export const distributeDocument = catchAsync(async (req, res) => {
    const { recipients, notes } = req.body;
    await distService.distributeDocument(req.params.id, req.user, recipients, notes);
    return sendSuccess(res, 200, 'Dokumen berhasil didistribusikan.');
});

export const getDistributionDetails = catchAsync(async (req, res) => {
    const details = await distService.getDistributionDetails(req.params.id);
    return res.status(200).json(details);
});
