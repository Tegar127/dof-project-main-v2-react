window.adminApp = function() {
    return {
        activeTab: 'dashboard',
        sidebarOpen: true,
        showForm: false, // Replaces modals
        users: [],
        groups: [],
        
        // Group View State (Master-Detail)
        groupViewMode: 'list', // 'list' or 'details'
        selectedGroup: null, // Stores currently viewed group details
        loadingGroupDetails: false,
        
        // Document History State
        viewingDocumentHistory: null,
        viewingDocumentHistoryTitle: '',
        documentVersions: [],
        loadingVersions: false,

        // All Documents State
        allDocuments: [],
        searchAllDocs: '',

        // Distribution Management State
        distributions: [],
        approvedDocuments: [],
        searchApproved: '',
        distViewMode: 'list', // 'list', 'distribute', 'details'
        selectedDocForDist: null,
        distributeForm: {
            recipientType: 'all',
            recipientId: null,
            notes: ''
        },
        selectedDocDetails: null,

        // Delete State
        showDeleteModal: false,
        docToDelete: null,
        deleteReason: '',

        editingUser: null,
        editingGroup: null,
        userForm: { extra_groups: [] },
        groupForm: { invited_users: [], is_private: false },
        token: null,
        notification: {
            show: false,
            message: '',
            type: 'success'
        },

        async init() {
            const userData = localStorage.getItem('dof_user');
            this.token = localStorage.getItem('dof_token');

            if (!userData || !this.token) {
                window.location.href = '/login';
                return;
            }

            const currentUser = JSON.parse(userData);
            if (currentUser.role !== 'admin') {
                window.location.href = '/dashboard';  
                return;
            }

            await this.loadUsers();
            await this.loadGroups();
            await this.loadDistributions();
            await this.loadAllDocuments();
            await this.loadApprovedDocuments();
        },

        async loadAllDocuments() {
            try {
                const response = await fetch('/api/documents', {
                    headers: { 
                        'Authorization': 'Bearer ' + this.token,
                        'Accept': 'application/json' 
                    }
                });
                if (response.ok) {
                    this.allDocuments = await response.json();
                }
            } catch (error) {
                console.error('Error loading all documents:', error);
            }
        },

        get filteredAllDocs() {
            // Only include Approved and Final (Sent/Received) statuses
            const archiveDocs = this.allDocuments.filter(d => {
                const status = typeof d.status === 'object' ? d.status.value : d.status;
                return ['approved', 'sent', 'received'].includes(status);
            });

            if (!this.searchAllDocs) return archiveDocs;
            const s = this.searchAllDocs.toLowerCase();
            return archiveDocs.filter(d => 
                d.title.toLowerCase().includes(s) || 
                (d.content_data?.docNumber || '').toLowerCase().includes(s) ||
                d.author_name.toLowerCase().includes(s)
            );
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
                this.showNotification('Error loading distributions', 'error');
            }
        },

        get finalizedDistributions() {
            return this.distributions.filter(d => ['sent', 'received'].includes(d.status));
        },

        async loadApprovedDocuments() {
            try {
                const response = await fetch('/api/documents', {
                    headers: { 
                        'Authorization': 'Bearer ' + this.token,
                        'Accept': 'application/json' 
                    }
                });
                if (response.ok) {
                    const allDocs = await response.json();
                    // Filter for only APPROVED status
                    this.approvedDocuments = allDocs.filter(d => 
                        (typeof d.status === 'object' ? d.status.value === 'approved' : d.status === 'approved')
                    );
                }
            } catch (error) {
                console.error('Error loading approved documents:', error);
            }
        },

        get filteredApprovedDocs() {
            if (!this.searchApproved) return this.approvedDocuments;
            const s = this.searchApproved.toLowerCase();
            return this.approvedDocuments.filter(d => 
                d.title.toLowerCase().includes(s) || 
                (d.content_data?.docNumber || '').toLowerCase().includes(s)
            );
        },

        openDistributeModal(doc) {
            this.selectedDocForDist = doc;
            this.distributeForm = {
                recipientType: 'all',
                recipientId: null,
                notes: ''
            };
            this.distViewMode = 'distribute';
            window.scrollTo({ top: 0, behavior: 'smooth' });
        },

        async confirmDistribute() {
            if (!this.selectedDocForDist) return;
            if (this.distributeForm.recipientType !== 'all' && !this.distributeForm.recipientId) {
                this.showNotification('Pilih penerima terlebih dahulu', 'error');
                return;
            }

            try {
                const response = await fetch(`/api/documents/${this.selectedDocForDist.id}/distribute`, {
                    method: 'POST',
                    headers: {
                        'Authorization': 'Bearer ' + this.token,
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    body: JSON.stringify({
                        recipients: [{
                            type: this.distributeForm.recipientType,
                            id: this.distributeForm.recipientId
                        }],
                        notes: this.distributeForm.notes
                    })
                });

                if (response.ok) {
                    this.showNotification('Dokumen berhasil didistribusikan');
                    this.distViewMode = 'list';
                    await this.loadDistributions();
                    await this.loadApprovedDocuments();
                } else {
                    const data = await response.json();
                    this.showNotification(data.message || 'Error distributing document', 'error');
                }
            } catch (error) {
                this.showNotification('Error distributing document', 'error');
            }
        },

        async openDistributionDetails(docId) {
            try {
                const response = await fetch(`/api/distributions/${docId}`, {
                    headers: { 
                        'Authorization': 'Bearer ' + this.token,
                        'Accept': 'application/json' 
                    }
                });
                if (response.ok) {
                    this.selectedDocDetails = await response.json();
                    this.distViewMode = 'details';
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                }
            } catch (error) {
                this.showNotification('Error loading distribution details', 'error');
            }
        },

        closeDistView() {
            this.distViewMode = 'list';
            this.selectedDocForDist = null;
            this.selectedDocDetails = null;
        },

        showNotification(message, type = 'success') {
            this.notification.message = message;
            this.notification.type = type;
            this.notification.show = true;
            setTimeout(() => {
                this.notification.show = false;
            }, 3000);
        },

        openDeleteModal(docId, docTitle) {
            this.docToDelete = { id: docId, title: docTitle };
            this.deleteReason = '';
            this.showDeleteModal = true;
        },

        async confirmDelete() {
            if (!this.docToDelete) return;

            try {
                const response = await fetch(`/api/documents/${this.docToDelete.id}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': 'Bearer ' + this.token,
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    body: JSON.stringify({ reason: this.deleteReason })
                });

                if (response.ok) {
                    this.showNotification('Document deleted successfully');
                    this.showDeleteModal = false;
                    this.docToDelete = null;

                    if (this.selectedGroup) {
                        await this.loadGroupDetails(this.selectedGroup.group.id);
                    }
                } else {
                    const data = await response.json();
                    this.showNotification(data.message || 'Error deleting document', 'error');
                }
            } catch (error) {
                this.showNotification('Error deleting document', 'error');
            }
        },

        async loadGroupDetails(groupId) {
            this.loadingGroupDetails = true;
            this.groupViewMode = 'details'; 
            this.selectedGroup = null; 
            this.closeDocumentHistory(); 
            
            try {
                const response = await fetch(`/api/groups-stats/${groupId}`, {
                    headers: { 
                        'Authorization': 'Bearer ' + this.token,
                        'Accept': 'application/json' 
                    }
                });
                if (response.ok) {
                    this.selectedGroup = await response.json();
                } else {
                    this.showNotification('Error loading group details', 'error');
                    this.groupViewMode = 'list';
                }
            } catch (error) {
                this.showNotification('Error loading group details', 'error');
                this.groupViewMode = 'list';
            } finally {
                this.loadingGroupDetails = false;
            }
        },

        closeGroupDetails() {
            this.groupViewMode = 'list';
            this.selectedGroup = null;
            this.closeDocumentHistory();
        },

        async loadDocumentVersions(docId, docTitle) {
            this.viewingDocumentHistory = docId;
            this.viewingDocumentHistoryTitle = docTitle;
            this.loadingVersions = true;
            this.documentVersions = [];

            try {
                const response = await fetch(`/api/documents/${docId}/versions`, {
                    headers: { 
                        'Authorization': 'Bearer ' + this.token,
                        'Accept': 'application/json' 
                    }
                });
                if (response.ok) {
                    this.documentVersions = await response.json();
                } else {
                    this.showNotification('Error loading document versions', 'error');
                }
            } catch (error) {
                this.showNotification('Error loading versions', 'error');
            } finally {
                this.loadingVersions = false;
            }
        },

        closeDocumentHistory() {
            this.viewingDocumentHistory = null;
            this.viewingDocumentHistoryTitle = '';
            this.documentVersions = [];
        },

        formatDate(isoString) {
            if (!isoString) return '-';
            const date = new Date(isoString);
            return date.toLocaleDateString('id-ID', {
                day: '2-digit', month: 'short', year: 'numeric',
                hour: '2-digit', minute: '2-digit'
            });
        },

        async loadUsers() {
            try {
                const response = await fetch('/api/users', {
                    headers: { 
                        'Authorization': 'Bearer ' + this.token,
                        'Accept': 'application/json' 
                    }
                });
                if (response.ok) {
                    this.users = await response.json();
                }
            } catch (error) {
                this.showNotification('Error loading users', 'error');
            }
        },

        async loadGroups() {
            try {
                const response = await fetch('/api/groups', {
                    headers: { 
                        'Authorization': 'Bearer ' + this.token,
                        'Accept': 'application/json' 
                    }
                });
                if (response.ok) {
                    this.groups = await response.json();
                }
            } catch (error) {
                this.showNotification('Error loading groups', 'error');
            }
        },

        cancelForm() {
            this.showForm = false;
            this.editingUser = null;
            this.editingGroup = null;
            this.userForm = { extra_groups: [] };
            this.groupForm = { invited_users: [], is_private: false };
        },

        editUser(user) {
            this.editingUser = user.id;
            this.userForm = {
                name: user.name,
                email: user.email,
                role: user.role,
                group_name: user.group_name,
                position: user.position,
                extra_groups: user.groups ? user.groups.map(g => g.id) : []
            };
            this.showForm = true;
        },

        async saveUser() {
            try {
                const method = this.editingUser ? 'PUT' : 'POST';
                const url = this.editingUser ? `/api/users/${this.editingUser}` : '/api/users';
                
                const response = await fetch(url, {
                    method: method,
                    headers: {
                        'Authorization': 'Bearer ' + this.token,
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    body: JSON.stringify(this.userForm)
                });

                if (response.ok) {
                    await this.loadUsers();
                    this.cancelForm();
                    this.showNotification('User saved successfully');
                } else {
                    const data = await response.json();
                    this.showNotification(data.message || 'Error saving user', 'error');
                }
            } catch (error) {
                this.showNotification('An unexpected error occurred.', 'error');
            }
        },

        async deleteUser(userId) {
            if (!confirm('Are you sure you want to delete this user?')) return;

            try {
                const response = await fetch(`/api/users/${userId}`, {
                    method: 'DELETE',
                    headers: { 
                        'Authorization': 'Bearer ' + this.token,
                        'Accept': 'application/json' 
                    }
                });

                if (response.ok) {
                    await this.loadUsers();
                    this.showNotification('User deleted successfully');
                } else {
                    this.showNotification('Error deleting user', 'error');
                }
            } catch (error) {
                this.showNotification('Error deleting user', 'error');
            }
        },

        editGroup(group) {
            this.editingGroup = group.id;
            this.groupForm = {
                name: group.name,
                is_private: !!group.is_private,
                invited_users: [] // We'll need to load members if needed, but for now empty
            };
            // Optional: load members for the form
            this.showForm = true;
        },

        async saveGroup() {
            try {
                const method = this.editingGroup ? 'PUT' : 'POST';
                const url = this.editingGroup ? `/api/groups/${this.editingGroup}` : '/api/groups';
                
                const response = await fetch(url, {
                    method: method,
                    headers: {
                        'Authorization': 'Bearer ' + this.token,
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    body: JSON.stringify(this.groupForm)
                });

                if (response.ok) {
                    await this.loadGroups();
                    this.cancelForm();
                    this.showNotification('Group saved successfully');
                } else {
                    const data = await response.json();
                    this.showNotification(data.message || 'Error saving group', 'error');
                }
            } catch (error) {
                this.showNotification('An unexpected error occurred.', 'error');
            }
        },

        async deleteGroup(groupId) {
            if (!confirm('Are you sure you want to delete this group?')) return;
            try {
                const response = await fetch(`/api/groups/${groupId}`, {
                    method: 'DELETE',
                    headers: { 
                        'Authorization': 'Bearer ' + this.token,
                        'Accept': 'application/json' 
                    }
                });
                if (response.ok) {
                    await this.loadGroups();
                    this.showNotification('Group deleted successfully');
                } else {
                    this.showNotification('Error deleting group', 'error');
                }
            } catch (error) {
                this.showNotification('Error deleting group', 'error');
            }
        },

        getRoleBadge(role) {
            const badges = {
                admin: 'bg-purple-100 text-purple-800',
                user: 'bg-blue-100 text-blue-800',
                reviewer: 'bg-green-100 text-green-800'
            };
            return badges[role] || 'bg-gray-100 text-gray-800';
        },

        handleLogout() {
            localStorage.removeItem('dof_user');
            localStorage.removeItem('dof_token');
            window.location.href = '/login';
        }
    }
}