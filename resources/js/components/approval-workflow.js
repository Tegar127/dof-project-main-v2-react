// Approval Workflow Component
window.approvalWorkflow = function (documentId, isAuthor = false) {
    return {
        approvals: [],
        loading: true,
        error: null,
        showApproveModal: false,
        showRejectModal: false,
        currentApproval: null,
        notes: '',

        async init() {
            await this.loadApprovals();
        },

        async loadApprovals() {
            this.loading = true;
            this.error = null;

            try {
                const token = localStorage.getItem('dof_token');
                const response = await fetch(`/api/documents/${documentId}/approvals`, {
                    headers: {
                        'Authorization': 'Bearer ' + token,
                        'Accept': 'application/json'
                    }
                });

                if (response.ok) {
                    this.approvals = await response.json();
                } else {
                    this.error = 'Gagal memuat approval';
                }
            } catch (error) {
                console.error('Error loading approvals:', error);
                this.error = 'Terjadi kesalahan saat memuat approval';
            } finally {
                this.loading = false;
            }
        },

        openApproveModal(approval) {
            this.currentApproval = approval;
            this.notes = '';
            this.showApproveModal = true;
        },

        openRejectModal(approval) {
            this.currentApproval = approval;
            this.notes = '';
            this.showRejectModal = true;
        },

        async confirmApprove() {
            if (!this.currentApproval) return;

            try {
                const token = localStorage.getItem('dof_token');
                const response = await fetch(`/api/documents/${documentId}/approvals/${this.currentApproval.id}/approve`, {
                    method: 'POST',
                    headers: {
                        'Authorization': 'Bearer ' + token,
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ notes: this.notes })
                });

                if (response.ok) {
                    await this.loadApprovals();
                    this.showApproveModal = false;
                    this.currentApproval = null;
                    this.notes = '';

                    // Emit event to refresh document
                    window.dispatchEvent(new CustomEvent('document-updated'));
                } else {
                    const data = await response.json();
                    alert(data.message || 'Gagal menyetujui dokumen');
                }
            } catch (error) {
                console.error('Error approving:', error);
                alert('Terjadi kesalahan saat menyetujui dokumen');
            }
        },

        async confirmReject() {
            if (!this.currentApproval || !this.notes.trim()) {
                alert('Catatan penolakan harus diisi');
                return;
            }

            try {
                const token = localStorage.getItem('dof_token');
                const response = await fetch(`/api/documents/${documentId}/approvals/${this.currentApproval.id}/reject`, {
                    method: 'POST',
                    headers: {
                        'Authorization': 'Bearer ' + token,
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ notes: this.notes })
                });

                if (response.ok) {
                    await this.loadApprovals();
                    this.showRejectModal = false;
                    this.currentApproval = null;
                    this.notes = '';

                    // Emit event to refresh document
                    window.dispatchEvent(new CustomEvent('document-updated'));
                } else {
                    const data = await response.json();
                    alert(data.message || 'Gagal menolak dokumen');
                }
            } catch (error) {
                console.error('Error rejecting:', error);
                alert('Terjadi kesalahan saat menolak dokumen');
            }
        },

        getStatusIcon(status) {
            const icons = {
                pending: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
                approved: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
                rejected: 'M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z'
            };
            return icons[status] || icons.pending;
        },

        getStatusColor(status) {
            const colors = {
                pending: 'bg-amber-100 text-amber-700 border-amber-200',
                approved: 'bg-emerald-100 text-emerald-700 border-emerald-200',
                rejected: 'bg-red-100 text-red-700 border-red-200'
            };
            return colors[status] || colors.pending;
        },

        getStatusLabel(status) {
            const labels = {
                pending: 'Menunggu',
                approved: 'Disetujui',
                rejected: 'Ditolak'
            };
            return labels[status] || 'Pending';
        },

        canApprove(approval) {
            const user = JSON.parse(localStorage.getItem('dof_user') || '{}');

            // Check if user is assigned approver
            if (approval.approver_id && approval.approver_id !== user.id) {
                return false;
            }

            // Check if user has required position
            if (approval.approver_position && user.position !== approval.approver_position) {
                return false;
            }

            // Check if approval is pending
            return approval.status === 'pending';
        },

        getProgressPercentage() {
            if (this.approvals.length === 0) return 0;
            const approved = this.approvals.filter(a => a.status === 'approved').length;
            return Math.round((approved / this.approvals.length) * 100);
        }
    }
}
