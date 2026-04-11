/**
 * roleUtils.js
 * Helper functions for role/jabatan-based business rules.
 *
 * Jabatan hierarchy (from `position` field on User):
 *  - 'kadiv'  → Kepala Divisi — can send to ANY division
 *  - 'kabid'  → Kepala Bidang — can only send WITHIN own division
 *  - 'staff'  → Staff         — can only send WITHIN own division
 *
 * Admin (role === 'admin') bypasses all restrictions.
 */

/**
 * Detect if the user is a Kadiv (Kepala Divisi).
 * Uses case-insensitive prefix match so "Kadiv IT", "kadiv", etc. all match.
 * @param {object} user
 * @returns {boolean}
 */
export const isKadiv = (user) => {
    if (!user?.position) return false;
    return user.position.toLowerCase().startsWith('kadiv');
};

/**
 * Returns true if the given user is allowed to send a document to the
 * specified target group.
 *
 * Rules:
 *  - Admin: always allowed.
 *  - Kadiv: always allowed (cross-division is OK).
 *  - Staff / Kabid: only allowed if target group === their own group.
 *
 * @param {object} user           - Authenticated user object
 * @param {string} targetRole     - 'group' | 'dispo' | 'user'
 * @param {string} targetValue    - Group name (when targetRole === 'group')
 * @returns {{ allowed: boolean, reason?: string }}
 */
export const canSendDocument = (user, targetRole, targetValue) => {
    // Non-group targets (dispo, user) are always permitted
    if (targetRole !== 'group') {
        return { allowed: true };
    }

    // Admin bypass
    if (user.role === 'admin') {
        return { allowed: true };
    }

    // Kadiv can send anywhere
    if (isKadiv(user)) {
        return { allowed: true };
    }

    // Staff / Kabid — only within own division
    const userGroup = user.group_name;

    if (!userGroup) {
        return {
            allowed: false,
            reason: 'Anda tidak tergabung dalam divisi manapun.',
        };
    }

    if (userGroup !== targetValue) {
        return {
            allowed: false,
            reason: `Anda hanya dapat mengirim dokumen ke divisi Anda sendiri (${userGroup}).`,
        };
    }

    return { allowed: true };
};

/**
 * Get the list of group names a user is allowed to send to.
 *  - Admin / Kadiv: all groups
 *  - Others: only their own group
 *
 * @param {object} user
 * @param {string[]} allGroupNames  - All available group names
 * @returns {string[]}
 */
export const getAllowedGroupNames = (user, allGroupNames) => {
    if (user.role === 'admin' || isKadiv(user)) {
        return allGroupNames;
    }
    // Staff / Kabid — restrict to own group only
    return allGroupNames.filter(name => name === user.group_name);
};

/**
 * Tentukan apakah pengiriman dokumen memerlukan approval atau tidak.
 *
 * Aturan:
 *  - user → reviewer (target_role: 'dispo') → WAJIB approval
 *  - user → user / group / lainnya          → TIDAK perlu approval
 *
 * @param {string} targetRole  - Target role dokumen ('dispo' | 'user' | 'group' | ...)
 * @returns {boolean}
 */
export const requiresApproval = (targetRole) => {
    return targetRole === 'dispo';
};
