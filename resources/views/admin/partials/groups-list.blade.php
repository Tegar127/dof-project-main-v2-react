<div class="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
    <!-- List View -->
    <div x-show="groupViewMode === 'list'">
        <div class="p-6 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div>
                <h2 class="text-xl font-bold text-slate-800">Groups Management</h2>
                <p class="text-slate-500 text-sm mt-1">Organize users into functional groups.</p>
            </div>
            <button
                @click="showForm = true; editingGroup = null; groupForm = { invited_users: [], is_private: false }"
                class="px-5 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/30 flex items-center gap-2 text-sm font-semibold"
            >
                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                </svg>
                New Group
            </button>
        </div>

        <div class="p-6">
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <template x-for="group in groups" :key="group.id">
                    <div class="group relative bg-white border border-slate-200 rounded-xl p-5 hover:border-indigo-500/50 hover:shadow-lg hover:shadow-indigo-500/10 transition-all duration-300">
                        <div class="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                             <button @click="editGroup(group)" class="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">
                                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                             </button>
                             <button @click="deleteGroup(group.id)" class="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                             </button>
                        </div>
                        
                        <div @click="loadGroupDetails(group.id)" class="cursor-pointer">
                            <div class="flex items-center gap-4">
                                <div class="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                                    <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                    </svg>
                                </div>
                                <div class="flex-1 min-w-0">
                                    <h3 class="font-bold text-slate-800 text-lg truncate" x-text="group.name"></h3>
                                    <div class="flex items-center gap-2 mt-1">
                                        <span x-show="group.is_private" class="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-600 border border-amber-100">Private</span>
                                        <span x-show="!group.is_private" class="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-100">Public</span>
                                        <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-600 border border-blue-100" x-text="(group.total_minutes || 0) + ' m'"></span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </template>
            </div>
        </div>
    </div>

    <!-- Details View -->
    <div x-show="groupViewMode === 'details'" style="display: none;">
        <div class="p-6 border-b border-slate-100 flex justify-between items-center bg-indigo-50/50">
            <div class="flex items-center gap-4">
                <button 
                    @click="closeGroupDetails()" 
                    class="p-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-500 transition-colors"
                >
                    <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                </button>
                <div>
                    <h3 class="text-xl font-bold text-slate-800" x-text="selectedGroup?.group.name || 'Group Details'"></h3>
                    <p class="text-sm text-slate-500 mt-1">
                        Total Work Time: <span class="font-bold text-indigo-600" x-text="(selectedGroup?.group.total_minutes || 0) + ' Minutes'"></span>
                    </p>
                </div>
            </div>
        </div>

        <div class="p-6 bg-slate-50 min-h-[400px]">
            <template x-if="loadingGroupDetails">
                <div class="flex items-center justify-center h-full py-12">
                    <div class="text-center text-slate-500">
                        <div class="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                        Loading details...
                    </div>
                </div>
            </template>

            <template x-if="!loadingGroupDetails && selectedGroup">
                <div>
                    <!-- List View -->
                    <div x-show="!viewingDocumentHistory">
                        <div class="flex justify-between items-center mb-4">
                             <h4 class="text-xs font-bold text-slate-500 uppercase tracking-wider">Documents Worked On</h4>
                        </div>
                        
                        <template x-if="selectedGroup.documents.length === 0">
                            <div class="text-center py-12 text-slate-400 border-2 border-dashed border-slate-200 rounded-xl bg-white">
                                <svg class="w-12 h-12 mx-auto mb-3 opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                No work logged for this group yet.
                            </div>
                        </template>

                        <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
                            <template x-for="doc in selectedGroup.documents" :key="doc.id">
                                <div class="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:border-indigo-300 transition-colors">
                                    <div class="flex justify-between items-start">
                                        <div class="flex-1">
                                            <div class="flex items-center gap-2 mb-2">
                                                <span class="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider" 
                                                      :class="doc.type === 'nota' ? 'bg-indigo-50 text-indigo-600' : 'bg-emerald-50 text-emerald-600'"
                                                      x-text="doc.type"></span>
                                            </div>
                                            <h4 class="font-bold text-slate-800 text-sm mb-1 line-clamp-2" x-text="doc.title"></h4>
                                            <p class="text-xs text-slate-500">Last worked: <span x-text="new Date(doc.last_worked).toLocaleDateString('id-ID')"></span></p>
                                        </div>
                                        <div class="text-right pl-4">
                                            <div class="text-xl font-bold text-indigo-600" x-text="doc.total_minutes + ' m'"></div>
                                            <div class="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Total Time</div>
                                        </div>
                                    </div>
                                    <div class="mt-4 pt-4 border-t border-slate-100 flex justify-end gap-2">
                                        <button 
                                            @click="loadDocumentVersions(doc.id, doc.title)"
                                            class="text-xs flex items-center gap-1.5 text-slate-600 hover:text-indigo-600 font-medium px-3 py-1.5 bg-slate-50 hover:bg-indigo-50 rounded-lg transition-colors border border-slate-200 hover:border-indigo-200"
                                        >
                                            <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            History
                                        </button>
                                        <button 
                                            x-show="doc.status !== 'approved'"
                                            @click="openDeleteModal(doc.id, doc.title)"
                                            class="text-xs flex items-center gap-1.5 text-slate-600 hover:text-red-600 font-medium px-3 py-1.5 bg-slate-50 hover:bg-red-50 rounded-lg transition-colors border border-slate-200 hover:border-red-200"
                                        >
                                            <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            </template>
                        </div>
                    </div>

                    <!-- History View -->
                    <div x-show="viewingDocumentHistory" style="display: none;">
                        <div class="flex items-center gap-3 mb-6">
                            <button @click="closeDocumentHistory()" class="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                </svg>
                                Back
                            </button>
                            <h4 class="text-lg font-bold text-slate-800 truncate flex-1">
                                History: <span class="text-indigo-600" x-text="viewingDocumentHistoryTitle"></span>
                            </h4>
                        </div>

                        <div x-show="loadingVersions" class="text-center py-12 text-slate-500">
                             <div class="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                            Loading versions...
                        </div>
                        
                        <div x-show="!loadingVersions && documentVersions.length === 0" class="text-center py-12 text-slate-400 border-2 border-dashed border-slate-200 rounded-xl bg-white">
                            No version history found.
                        </div>

                        <div x-show="!loadingVersions && documentVersions.length > 0" class="max-w-3xl mx-auto space-y-6 relative">
                             <!-- Timeline Line -->
                             <div class="absolute left-5 top-5 bottom-5 w-0.5 bg-slate-200"></div>

                            <template x-for="ver in documentVersions" :key="ver.id">
                                <div class="relative pl-12">
                                     <!-- Dot -->
                                    <div class="absolute left-0 top-0 w-10 h-10 rounded-full border-4 border-slate-50 bg-indigo-600 flex items-center justify-center text-white font-bold text-xs shadow-sm z-10">
                                        <span x-text="'v' + ver.version_number"></span>
                                    </div>

                                    <div class="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                                        <div class="flex flex-col sm:flex-row justify-between sm:items-center gap-2 mb-4">
                                            <div class="flex items-center gap-2 text-sm text-slate-500">
                                                <span>Updated on</span>
                                                <span class="font-semibold text-slate-700" x-text="formatDate(ver.created_at)"></span>
                                            </div>
                                            <div class="flex items-center gap-2 text-sm bg-slate-50 px-3 py-1 rounded-full w-fit">
                                                <div class="w-5 h-5 rounded-full bg-slate-200 flex items-center justify-center font-bold text-[10px] text-slate-600">
                                                    <span x-text="ver.updater ? ver.updater.name.charAt(0) : 'S'"></span>
                                                </div>
                                                <span class="text-slate-600"><span class="font-semibold" x-text="ver.updater ? ver.updater.name : 'System'"></span></span>
                                            </div>
                                        </div>
                                        
                                        <div class="bg-slate-50 p-4 rounded-lg border border-slate-100">
                                            <p class="text-sm text-slate-600 italic whitespace-pre-line leading-relaxed" x-text="ver.change_summary || 'No change summary.'"></p>
                                        </div>
                                    </div>
                                </div>
                            </template>
                        </div>
                    </div>
                </div>
            </template>
        </div>
    </div>
</div>