// Folder Browser Component
window.folderBrowser = function () {
    return {
        folders: [],
        currentFolder: null,
        loading: true,
        error: null,
        showCreateModal: false,
        newFolderName: '',
        newFolderParentId: null,

        async init() {
            await this.loadFolders();
        },

        async loadFolders() {
            this.loading = true;
            this.error = null;

            try {
                const token = localStorage.getItem('dof_token');
                const response = await fetch('/api/folders', {
                    headers: {
                        'Authorization': 'Bearer ' + token,
                        'Accept': 'application/json'
                    }
                });

                if (response.ok) {
                    this.folders = await response.json();
                } else {
                    this.error = 'Gagal memuat folder';
                }
            } catch (error) {
                console.error('Error loading folders:', error);
                this.error = 'Terjadi kesalahan saat memuat folder';
            } finally {
                this.loading = false;
            }
        },

        async selectFolder(folderId) {
            try {
                const token = localStorage.getItem('dof_token');
                const response = await fetch(`/api/folders/${folderId}`, {
                    headers: {
                        'Authorization': 'Bearer ' + token,
                        'Accept': 'application/json'
                    }
                });

                if (response.ok) {
                    this.currentFolder = await response.json();

                    // Emit event for document list to filter
                    window.dispatchEvent(new CustomEvent('folder-selected', {
                        detail: { folderId }
                    }));
                }
            } catch (error) {
                console.error('Error selecting folder:', error);
            }
        },

        openCreateModal(parentId = null) {
            this.newFolderParentId = parentId;
            this.newFolderName = '';
            this.showCreateModal = true;
        },

        async createFolder() {
            if (!this.newFolderName.trim()) {
                alert('Nama folder tidak boleh kosong');
                return;
            }

            try {
                const token = localStorage.getItem('dof_token');
                const response = await fetch('/api/folders', {
                    method: 'POST',
                    headers: {
                        'Authorization': 'Bearer ' + token,
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        name: this.newFolderName,
                        parent_id: this.newFolderParentId,
                        type: 'custom'
                    })
                });

                if (response.ok) {
                    await this.loadFolders();
                    this.showCreateModal = false;
                    this.newFolderName = '';
                    this.newFolderParentId = null;
                } else {
                    alert('Gagal membuat folder');
                }
            } catch (error) {
                console.error('Error creating folder:', error);
                alert('Terjadi kesalahan saat membuat folder');
            }
        },

        async moveDocument(documentId, folderId) {
            try {
                const token = localStorage.getItem('dof_token');
                const response = await fetch(`/api/documents/${documentId}/move`, {
                    method: 'POST',
                    headers: {
                        'Authorization': 'Bearer ' + token,
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ folder_id: folderId })
                });

                if (response.ok) {
                    // Emit event to refresh document list
                    window.dispatchEvent(new CustomEvent('document-moved'));
                    return true;
                } else {
                    const data = await response.json();
                    alert(data.message || 'Gagal memindahkan dokumen');
                    return false;
                }
            } catch (error) {
                console.error('Error moving document:', error);
                alert('Terjadi kesalahan saat memindahkan dokumen');
                return false;
            }
        },

        getFolderIcon(type) {
            const icons = {
                category: 'M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01',
                year: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
                month: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
                department: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4',
                status: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2',
                custom: 'M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z'
            };
            return icons[type] || icons.custom;
        }
    }
}
