<div class="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
    <div class="p-6">
        <div class="flex justify-between items-center mb-6">
            <h3 class="text-xl font-bold text-slate-900" x-text="editingGroup ? 'Edit Group' : 'Create New Group'"></h3>
            <button @click="cancelForm()" class="text-slate-400 hover:text-slate-600 transition-colors">
                <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
        </div>
        
        <form @submit.prevent="saveGroup()" class="space-y-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div class="space-y-6">
                    <div>
                        <label class="block text-sm font-semibold text-slate-700 mb-1.5">Group Name</label>
                        <input type="text" x-model="groupForm.name" required class="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all" placeholder="e.g., Marketing, HR, Finance">
                    </div>

                    <div class="bg-slate-50 p-4 rounded-xl border border-slate-100">
                        <div class="flex items-start gap-3">
                             <div class="flex h-6 items-center">
                                <input type="checkbox" id="is_private" x-model="groupForm.is_private" class="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600">
                             </div>
                             <div>
                                <label for="is_private" class="text-sm font-bold text-slate-900">Private Group</label>
                                <p class="text-xs text-slate-500 mt-0.5">Only invited members can see this group in their dashboard.</p>
                             </div>
                        </div>
                    </div>
                </div>

                <div>
                    <label class="block text-sm font-semibold text-slate-700 mb-2">Invite Members (Initial Setup)</label>
                    <div class="border border-slate-200 rounded-lg max-h-48 overflow-y-auto bg-slate-50 p-2 space-y-1 custom-scrollbar">
                         <template x-for="user in users" :key="user.id">
                            <label class="flex items-center gap-3 p-2 hover:bg-white rounded-lg cursor-pointer transition-colors group">
                                <input type="checkbox" :value="user.id" x-model="groupForm.invited_users" class="rounded text-indigo-600 focus:ring-indigo-500 border-slate-300 bg-white">
                                <div class="flex-1 min-w-0">
                                    <div class="text-sm font-medium text-slate-800 truncate" x-text="user.name"></div>
                                    <div class="text-xs text-slate-500 truncate" x-text="user.email + (user.group_name ? ' • ' + user.group_name : '')"></div>
                                </div>
                            </label>
                         </template>
                         <div x-show="users.length === 0" class="text-center py-4 text-xs text-slate-400">
                            No users available to invite.
                         </div>
                    </div>
                    <p class="text-[10px] text-slate-400 mt-2 italic">Note: These users will be added to this group's membership list.</p>
                </div>
            </div>

            <div class="flex justify-end gap-3 pt-6 border-t border-slate-100">
                <button type="button" @click="cancelForm()" class="px-6 py-2.5 border border-slate-300 text-slate-700 font-medium rounded-xl hover:bg-slate-50 transition-colors">
                    Cancel
                </button>
                <button type="submit" class="px-8 py-2.5 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-500/30">
                    <span x-text="editingGroup ? 'Update Group' : 'Create Group'"></span>
                </button>
            </div>
        </form>
    </div>
</div>