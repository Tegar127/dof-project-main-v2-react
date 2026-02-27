import * as documentApprovalService from '../services/documentApproval.service.js';
import { catchAsync } from '../utils/catchAsync.js';
import { sendSuccess } from '../utils/responses.js';

export const getApprovals = catchAsync(async (req, res) => {
    const approvals = await documentApprovalService.getApprovals(req.params.id);
    return res.status(200).json(approvals);
});

export const approveDocument = catchAsync(async (req, res) => {
    const document = await documentApprovalService.approveDocument(
        req.params.documentId,
        req.params.approvalId,
        req.user,
        req.body.notes
    );
    return sendSuccess(res, 200, 'Document approved successfully', { document });
});

export const rejectDocument = catchAsync(async (req, res) => {
    const document = await documentApprovalService.rejectDocument(
        req.params.documentId,
        req.params.approvalId,
        req.user,
        req.body.notes
    );
    return sendSuccess(res, 200, 'Document rejected', { document });
});

export const updateSequence = catchAsync(async (req, res) => {
    const approvals = await documentApprovalService.updateSequence(
        req.params.id,
        req.body.approvals,
        req.user
    );
    return sendSuccess(res, 200, 'Sequence updated', { approvals });
});
