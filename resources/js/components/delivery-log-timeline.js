// Delivery Log Timeline Component
window.deliveryLogTimeline = function (documentId) {
    return {
        logs: [],
        loading: true,
        error: null,

        async init() {
            await this.loadLogs();
        },

        async loadLogs() {
            this.loading = true;
            this.error = null;

            try {
                const token = localStorage.getItem('dof_token');
                const response = await fetch(`/api/documents/${documentId}/logs`, {
                    headers: {
                        'Authorization': 'Bearer ' + token,
                        'Accept': 'application/json'
                    }
                });

                if (response.ok) {
                    this.logs = await response.json();
                } else {
                    this.error = 'Gagal memuat riwayat dokumen';
                }
            } catch (error) {
                console.error('Error loading logs:', error);
                this.error = 'Terjadi kesalahan saat memuat riwayat';
            } finally {
                this.loading = false;
            }
        },

        getActionIcon(action) {
            const icons = {
                created: 'M12 4v16m8-8H4',
                sent: 'M12 19l9 2-9-18-9 18 9-2zm0 0v-8',
                received: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
                approved: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
                rejected: 'M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z',
                revised: 'M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15',
                updated: 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z'
            };
            return icons[action] || icons.updated;
        },

        getActionColor(action) {
            const colors = {
                created: 'bg-blue-100 text-blue-600',
                sent: 'bg-sky-100 text-sky-600',
                received: 'bg-violet-100 text-violet-600',
                approved: 'bg-emerald-100 text-emerald-600',
                rejected: 'bg-red-100 text-red-600',
                revised: 'bg-amber-100 text-amber-600',
                updated: 'bg-slate-100 text-slate-600'
            };
            return colors[action] || colors.updated;
        },

        getActionLabel(action) {
            const labels = {
                created: 'Dibuat',
                sent: 'Dikirim',
                received: 'Diterima',
                approved: 'Disetujui',
                rejected: 'Ditolak',
                revised: 'Direvisi',
                updated: 'Diperbarui'
            };
            return labels[action] || 'Aktivitas';
        },

        formatDate(isoString) {
            if (!isoString) return '-';
            const date = new Date(isoString);
            return date.toLocaleDateString('id-ID', {
                day: '2-digit',
                month: 'long',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        }
    }
}
