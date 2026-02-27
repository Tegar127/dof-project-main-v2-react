// Read Receipt Tracker Component
window.readReceiptTracker = function (documentId) {
    return {
        receipts: [],
        loading: true,
        error: null,

        async init() {
            await this.loadReceipts();
        },

        async loadReceipts() {
            this.loading = true;
            this.error = null;

            try {
                const token = localStorage.getItem('dof_token');
                const response = await fetch(`/api/documents/${documentId}`, {
                    headers: {
                        'Authorization': 'Bearer ' + token,
                        'Accept': 'application/json'
                    }
                });

                if (response.ok) {
                    const document = await response.json();
                    this.receipts = document.read_receipts || [];
                } else {
                    this.error = 'Gagal memuat read receipts';
                }
            } catch (error) {
                console.error('Error loading receipts:', error);
                this.error = 'Terjadi kesalahan saat memuat read receipts';
            } finally {
                this.loading = false;
            }
        },

        formatDate(isoString) {
            if (!isoString) return '-';
            const date = new Date(isoString);
            return date.toLocaleDateString('id-ID', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        },

        getPositionBadgeColor(position) {
            const colors = {
                direksi: 'bg-purple-100 text-purple-700',
                kadiv: 'bg-blue-100 text-blue-700',
                kabid: 'bg-indigo-100 text-indigo-700',
                staff: 'bg-slate-100 text-slate-700'
            };
            return colors[position] || colors.staff;
        },

        getPositionLabel(position) {
            const labels = {
                direksi: 'Direksi',
                kadiv: 'Kepala Divisi',
                kabid: 'Kepala Bidang',
                staff: 'Staff'
            };
            return labels[position] || position || 'Unknown';
        },

        getInitials(name) {
            if (!name) return '?';
            return name
                .split(' ')
                .map(n => n[0])
                .join('')
                .toUpperCase()
                .substring(0, 2);
        }
    }
}
