window.dashboardApp = function () {
    return {
        currentUser: null,
        token: null,
        documents: [],
        filteredDocs: [],
        searchTerm: '',
        selectedFolder: null,
        typeFilter: 'all',
        dateFrom: '',
        dateTo: '',
        deadlineFilter: 'all', // all, upcoming, overdue, none
        showCreateModal: false,
        showDeleteModal: false,
        docToDelete: null,
        documentName: '',
        documentType: null,
        showSuccessModal: false,
        alertMessage: '',
        folders: [],
        
        // Distribution Monitoring
        distributions: [],
        showDistributionModal: false,
        selectedDocForDist: null,
        recipientType: 'all',
        recipientId: null,
        distributionNotes: '',
        allUsers: [],
        allGroups: [],
        
        // Notifications
        notifications: [],
        showNotifications: false,

        async init() {
            // Check for success messages in URL
            const urlParams = new URLSearchParams(window.location.search);
            if (urlParams.get('success') === 'sent') {
                this.alertMessage = 'Dokumen berhasil dikirim ke tujuan!';
                this.showSuccessModal = true;

                // Clean up URL without refreshing
                window.history.replaceState({}, document.title, window.location.pathname);
            }

            // Check authentication
            const userData = localStorage.getItem('dof_user');
            const token = localStorage.getItem('dof_token');

            if (!userData || !token) {
                window.location.href = '/login';
                return;
            }

            this.currentUser = JSON.parse(userData);
            this.token = token;

            // Refresh user data (await to ensure role is up to date)
            await this.refreshUserData();

            // Load data
            await this.loadDocuments();
            await this.loadFolders();
            await this.loadNotifications();
            await this.loadDistributions();
            await this.loadRecipients();
            await this.autoOrganize();

            // Watch filters
            this.$watch('searchTerm', () => this.loadDocuments());
            this.$watch('selectedFolder', () => this.filterDocuments());
            this.$watch('deadlineFilter', () => this.filterDocuments());
            this.$watch('typeFilter', () => this.loadDocuments());
            this.$watch('dateFrom', () => this.filterDocuments());
            this.$watch('dateTo', () => this.filterDocuments());

            // Listen for folder events
            window.addEventListener('folder-selected', (e) => {
                this.selectedFolder = e.detail.folderId;
            });

            window.addEventListener('document-moved', () => {
                this.loadDocuments();
            });
            
            // Poll for notifications every minute
            setInterval(() => this.loadNotifications(), 60000);
        },

        async loadNotifications() {
            try {
                const response = await fetch('/api/notifications', {
                    headers: {
                        'Authorization': 'Bearer ' + this.token,
                        'Accept': 'application/json'
                    }
                });

                if (response.ok) {
                    this.notifications = await response.json();
                }
            } catch (error) {
                console.error('Error loading notifications:', error);
            }
        },

        async markAsRead(id) {
            try {
                await fetch(`/api/notifications/${id}/read`, {
                    method: 'POST',
                    headers: {
                        'Authorization': 'Bearer ' + this.token,
                        'Accept': 'application/json'
                    }
                });
                await this.loadNotifications();
            } catch (error) {
                console.error('Error marking notification as read:', error);
            }
        },

        async markAllAsRead() {
            try {
                await fetch(`/api/notifications/read-all`, {
                    method: 'POST',
                    headers: {
                        'Authorization': 'Bearer ' + this.token,
                        'Accept': 'application/json'
                    }
                });
                await this.loadNotifications();
            } catch (error) {
                console.error('Error marking all notifications as read:', error);
            }
        },

        async refreshUserData() {
            try {
                const response = await fetch('/api/user', {
                    headers: {
                        'Authorization': 'Bearer ' + this.token,
                        'Accept': 'application/json'
                    }
                });

                if (response.ok) {
                    const user = await response.json();
                    this.currentUser = user;
                    localStorage.setItem('dof_user', JSON.stringify(user));

                    // Re-check admin role
                    if (this.currentUser.role === 'admin') {
                        window.location.href = '/admin';
                    }
                } else if (response.status === 401) {
                    // Token invalid, force logout
                    this.handleLogout();
                }
            } catch (error) {
                console.error('Error refreshing user data:', error);
            }
        },

        async loadDocuments() {
            try {
                const params = new URLSearchParams({
                    search: this.searchTerm,
                    type: this.typeFilter !== 'all' ? this.typeFilter : '',
                    // Additional filters can be added here
                });

                const response = await fetch(`/api/documents?${params.toString()}`, {
                    headers: {
                        'Authorization': 'Bearer ' + this.token,
                        'Accept': 'application/json'
                    }
                });

                if (response.ok) {
                    this.documents = await response.json();
                    this.filterDocuments(); // Still do some local filtering if needed
                }
            } catch (error) {
                console.error('Error loading documents:', error);
            }
        },

        filterDocuments() {
            let docs = this.documents;

            // Since backend now handles search and type, we primarily filter by other local UI states
            // Filter by folder
            if (this.selectedFolder) {
                docs = docs.filter(d => d.folder_id == this.selectedFolder);
            }

            // Filter by date range (local for now)
            if (this.dateFrom) {
                const from = new Date(this.dateFrom);
                from.setHours(0, 0, 0, 0);
                docs = docs.filter(d => new Date(d.created_at) >= from);
            }
            if (this.dateTo) {
                const to = new Date(this.dateTo);
                to.setHours(23, 59, 59, 999);
                docs = docs.filter(d => new Date(d.created_at) <= to);
            }

            // Filter by deadline
            if (this.deadlineFilter !== 'all') {
                const now = new Date();

                if (this.deadlineFilter === 'upcoming') {
                    docs = docs.filter(d => {
                        if (!d.deadline) return false;
                        const deadline = new Date(d.deadline);
                        return deadline > now;
                    });
                } else if (this.deadlineFilter === 'overdue') {
                    docs = docs.filter(d => {
                        if (!d.deadline) return false;
                        const deadline = new Date(d.deadline);
                        return deadline < now;
                    });
                } else if (this.deadlineFilter === 'none') {
                    docs = docs.filter(d => !d.deadline);
                }
            }

            this.filteredDocs = docs;
        },

        async loadFolders() {
            try {
                const response = await fetch('/api/folders', {
                    headers: {
                        'Authorization': 'Bearer ' + this.token,
                        'Accept': 'application/json'
                    }
                });

                if (response.ok) {
                    this.folders = await response.json();
                }
            } catch (error) {
                console.error('Error loading folders:', error);
            }
        },

        async autoOrganize() {
            // Logic to move documents without folders to their category folders
            const docsWithoutFolder = this.documents.filter(d => !d.folder_id);
            for (const doc of docsWithoutFolder) {
                let folderName = 'Draft';
                if (doc.type === 'nota') folderName = 'Nota Dinas';
                else if (doc.type === 'sppd') folderName = 'Surat Perintah (SPPD)';
                else if (doc.type === 'perj') folderName = 'Perjanjian Kerja Sama';
                
                const folder = this.folders.find(f => f.name === folderName);
                if (folder) {
                    await fetch(`/api/folders/move/${doc.id}`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': 'Bearer ' + this.token,
                            'Accept': 'application/json'
                        },
                        body: JSON.stringify({ folder_id: folder.id })
                    });
                }
            }
            if (docsWithoutFolder.length > 0) {
                await this.loadDocuments();
                await this.loadFolders();
            }
        },

        handleCreate(type) {
            this.documentType = type;
            this.showCreateModal = true;
        },

        async confirmCreate() {
            if (!this.documentName.trim()) {
                alert('Nama dokumen tidak boleh kosong!');
                return;
            }

            // Create document in backend immediately (Single Source of Truth)
            try {
                const response = await fetch('/api/documents', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer ' + this.token,
                        'Accept': 'application/json'
                    },
                    body: JSON.stringify({
                        title: this.documentName,
                        type: this.documentType,
                        status: 'draft'
                    })
                });

                if (response.ok) {
                    const result = await response.json();
                    window.location.href = `/editor/${result.id}`;
                } else {
                    console.error('Failed to create document', await response.text());
                    alert('Gagal membuat dokumen. Silakan coba lagi.');
                }
            } catch (error) {
                console.error('Error creating document:', error);
                alert('Terjadi kesalahan koneksi.');
            }
        },

        handleDelete(docId, docTitle) {
            this.docToDelete = { id: docId, title: docTitle };
            this.showDeleteModal = true;
        },

        async confirmDelete() {
            if (!this.docToDelete) return;

            try {
                const response = await fetch(`/api/documents/${this.docToDelete.id}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': 'Bearer ' + this.token,
                        'Accept': 'application/json'
                    }
                });

                if (response.ok) {
                    await this.loadDocuments();
                    this.showDeleteModal = false;
                    this.docToDelete = null;
                } else {
                    const data = await response.json();
                    alert(data.message || 'Gagal menghapus dokumen.');
                }
            } catch (error) {
                console.error('Error deleting document:', error);
                alert('Terjadi kesalahan saat menghapus dokumen.');
            }
        },

        handleLogout() {
            localStorage.removeItem('dof_user');
            window.location.href = '/login';
        },

        formatDate(isoString) {
            if (!isoString) return { d: '-', t: '-' };
            const date = new Date(isoString);
            const d = date.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
            const t = date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
            return { d, t };
        },

        getStatusClass(status) {
            const classes = {
                draft: 'bg-slate-100 text-slate-600',
                pending_review: 'bg-amber-100 text-amber-700',
                needs_revision: 'bg-red-100 text-red-700',
                approved: 'bg-emerald-100 text-emerald-700',
                sent: 'bg-indigo-100 text-indigo-700',
                received: 'bg-emerald-100 text-emerald-700'
            };
            return classes[status] || classes.draft;
        },

        getStatusLabel(doc) {
            const status = typeof doc.status === 'object' ? doc.status.value : doc.status;
            const labels = {
                draft: 'Draft',
                pending_review: 'Review',
                needs_revision: 'Revisi',
                approved: 'Approved',
                sent: 'Dikirim',
                received: 'Diterima'
            };
            return labels[status] || 'Draft';
        },

        getDeadlineStatus(deadline) {
            if (!deadline) return null;

            const now = new Date();
            const deadlineDate = new Date(deadline);
            const diff = deadlineDate - now;
            const daysRemaining = diff / (1000 * 60 * 60 * 24);

            if (diff < 0) return 'overdue';
            if (daysRemaining < 1) return 'urgent';
            if (daysRemaining < 3) return 'soon';
            return 'normal';
        },

        getDeadlineColor(status) {
            const colors = {
                overdue: 'text-red-600',
                urgent: 'text-red-600',
                soon: 'text-amber-600',
                normal: 'text-emerald-600'
            };
            return colors[status] || 'text-slate-600';
        },

        formatDeadline(deadline) {
            if (!deadline) return '';

            const now = new Date();
            const deadlineDate = new Date(deadline);
            const diff = deadlineDate - now;
            const days = Math.floor(diff / (1000 * 60 * 60 * 24));
            const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

            if (diff < 0) {
                return 'Terlambat';
            } else if (days > 0) {
                return `${days} hari`;
            } else if (hours > 0) {
                return `${hours} jam`;
            } else {
                return 'Segera';
            }
        },

        getPositionLabel(position) {
            const labels = {
                direksi: 'Direksi',
                kadiv: 'Kepala Divisi',
                kabid: 'Kepala Bidang',
                staff: 'Staff'
            };
            return labels[position] || position || '-';
        },

        async loadDistributions() {
            try {
                const response = await fetch('/api/distributions', {
                    headers: {
                        'Authorization': 'Bearer ' + this.token,
                        'Accept': 'application/json'
                    }
                });

                if (response.ok) {
                    this.distributions = await response.json();
                }
            } catch (error) {
                console.error('Error loading distributions:', error);
            }
        },

        async loadRecipients() {
            try {
                // Load users
                const userRes = await fetch('/api/users', {
                    headers: {
                        'Authorization': 'Bearer ' + this.token,
                        'Accept': 'application/json'
                    }
                });
                if (userRes.ok) this.allUsers = await userRes.json();

                // Load groups
                const groupRes = await fetch('/api/groups', {
                    headers: {
                        'Authorization': 'Bearer ' + this.token,
                        'Accept': 'application/json'
                    }
                });
                if (groupRes.ok) this.allGroups = await groupRes.json();
            } catch (error) {
                console.error('Error loading recipients:', error);
            }
        },

        openDistributeModal(doc) {
            this.selectedDocForDist = doc;
            this.recipientType = 'all';
            this.recipientId = null;
            this.distributionNotes = '';
            this.showDistributionModal = true;
        },

        async confirmDistribute() {
            if (!this.selectedDocForDist) return;
            if (this.recipientType !== 'all' && !this.recipientId) {
                alert('Penerima harus dipilih!');
                return;
            }

            try {
                const response = await fetch(`/api/documents/${this.selectedDocForDist.id}/distribute`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer ' + this.token,
                        'Accept': 'application/json'
                    },
                    body: JSON.stringify({
                        recipients: [{
                            type: this.recipientType,
                            id: this.recipientId
                        }],
                        notes: this.distributionNotes
                    })
                });

                if (response.ok) {
                    this.showDistributionModal = false;
                    this.alertMessage = 'Dokumen berhasil didistribusikan!';
                    this.showSuccessModal = true;
                    await this.loadDistributions();
                    await this.loadDocuments();
                } else {
                    const data = await response.json();
                    alert(data.message || 'Gagal mendistribusikan dokumen.');
                }
            } catch (error) {
                console.error('Error distributing document:', error);
                alert('Terjadi kesalahan saat mendistribusikan dokumen.');
            }
        }
    }
}
