import { z } from 'zod';

export const loginSchema = z.object({
    body: z.object({
        email: z.string().email('Format email tidak valid'),
        password: z.string().min(1, 'Password diperlukan')
    })
});

export const createUserSchema = z.object({
    body: z.object({
        name: z.string().min(1, 'Nama diperlukan').max(255),
        email: z.string().email('Format email tidak valid'),
        password: z.string().min(3, 'Password minimal 3 karakter'),
        role: z.enum(['admin', 'user', 'reviewer']),
        group_name: z.string().nullable().optional(),
        position: z.enum(['direksi', 'kadiv', 'kabid', 'staff']).nullable().optional(),
        extra_groups: z.array(z.number()).nullable().optional()
    })
});

export const updateUserSchema = z.object({
    body: z.object({
        name: z.string().max(255).optional(),
        email: z.string().email('Format email tidak valid').optional(),
        password: z.string().min(3, 'Password minimal 3 karakter').optional(),
        role: z.enum(['admin', 'user', 'reviewer']).optional(),
        group_name: z.string().nullable().optional(),
        position: z.enum(['direksi', 'kadiv', 'kabid', 'staff']).nullable().optional(),
        extra_groups: z.array(z.number()).nullable().optional()
    })
});

export const createGroupSchema = z.object({
    body: z.object({
        name: z.string().min(1, 'Nama group diperlukan').max(255),
        is_private: z.boolean().optional().default(false),
        invited_users: z.array(z.number()).optional()
    })
});

export const updateGroupSchema = z.object({
    body: z.object({
        name: z.string().min(1, 'Nama group diperlukan').max(255).optional(),
        is_private: z.boolean().optional(),
        invited_users: z.array(z.number()).optional()
    })
});

export const createFolderSchema = z.object({
    body: z.object({
        name: z.string().min(1, 'Nama folder diperlukan').max(255),
        parent_id: z.number().nullable().optional(),
        type: z.enum(['category', 'year', 'month', 'department', 'status', 'custom']).nullable().optional(),
        metadata: z.record(z.any()).nullable().optional(),
        order: z.number().nullable().optional()
    })
});

export const updateFolderSchema = z.object({
    body: z.object({
        name: z.string().min(1, 'Nama folder diperlukan').max(255).optional(),
        parent_id: z.number().nullable().optional(),
        type: z.enum(['category', 'year', 'month', 'department', 'status', 'custom']).nullable().optional(),
        metadata: z.record(z.any()).nullable().optional(),
        order: z.number().nullable().optional()
    })
});

export const moveDocumentSchema = z.object({
    body: z.object({
        folder_id: z.number().nullable()
    })
});

const approvalItemSchema = z.object({
    position: z.enum(['direksi', 'kadiv', 'kabid', 'staff']).nullable().optional(),
    approver_id: z.number().nullable().optional(),
    sequence: z.number().optional()
});

export const createDocumentSchema = z.object({
    body: z.object({
        title: z.string().min(1, 'Title required').max(255),
        type: z.enum(['nota', 'sppd', 'perj']),
        status: z.string().optional(),
        content_data: z.record(z.any()).optional(),
        history_log: z.array(z.any()).optional(),
        target: z.object({ type: z.string().optional(), value: z.string().optional() }).optional(),
        folder_id: z.number().nullable().optional(),
        deadline: z.string().nullable().optional(),
        approval_count: z.number().min(0).max(10).optional(),
        approvals: z.array(approvalItemSchema).optional()
    })
});

export const updateDocumentSchema = z.object({
    body: z.object({
        status: z.string().optional(),
        content_data: z.record(z.any()).optional(),
        history_log: z.array(z.any()).optional(),
        feedback: z.string().nullable().optional(),
        forward_note: z.string().nullable().optional(),
        target: z.object({ type: z.string().optional(), value: z.string().optional() }).optional(),
        folder_id: z.number().nullable().optional(),
        deadline: z.string().nullable().optional(),
        increment_version: z.boolean().optional(),
        approvals: z.array(approvalItemSchema.extend({ status: z.string().optional() })).optional()
    })
});

export const approveDocumentSchema = z.object({
    body: z.object({ notes: z.string().nullable().optional() })
});

export const rejectDocumentSchema = z.object({
    body: z.object({ notes: z.string().min(1, 'Catatan penolakan wajib diisi') })
});

export const updateApprovalSequenceSchema = z.object({
    body: z.object({
        approvals: z.array(z.object({
            id: z.number(),
            sequence: z.number().min(1)
        }))
    })
});

export const distributeDocumentSchema = z.object({
    body: z.object({
        recipients: z.array(z.object({
            type: z.enum(['all', 'group', 'user']),
            id: z.number().nullable().optional()
        })).min(1, 'Minimal satu penerima diperlukan'),
        notes: z.string().nullable().optional()
    })
});
