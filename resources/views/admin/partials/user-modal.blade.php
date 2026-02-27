<div class="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
    <div class="p-6">
        <div class="flex justify-between items-center mb-6">
            <h3 class="text-xl font-bold text-slate-900" x-text="editingUser ? 'Edit User' : 'Add New User'"></h3>
            <button @click="cancelForm()" class="text-slate-400 hover:text-slate-600 transition-colors">
                <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
        </div>
        
        <form @submit.prevent="saveUser()" class="space-y-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label class="block text-sm font-semibold text-slate-700 mb-1.5">Full Name</label>
                    <input type="text" x-model="userForm.name" required class="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all" placeholder="John Doe">
                </div>

                <div>
                    <label class="block text-sm font-semibold text-slate-700 mb-1.5">Email Address</label>
                    <input type="email" x-model="userForm.email" required class="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all" placeholder="john@example.com">
                </div>

                <div>
                    <label class="block text-sm font-semibold text-slate-700 mb-1.5">Password <span x-show="editingUser" class="text-xs font-normal text-slate-400 ml-1">(Leave blank to keep current)</span></label>
                    <input type="password" x-model="userForm.password" :required="!editingUser" class="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all" placeholder="••••••••">
                </div>

                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label class="block text-sm font-semibold text-slate-700 mb-1.5">Role</label>
                        <select x-model="userForm.role" required class="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all">
                            <option value="">Select Role</option>
                            <option value="admin">Admin</option>
                            <option value="user">User</option>
                            <option value="reviewer">Reviewer</option>
                        </select>
                    </div>

                    <div>
                        <label class="block text-sm font-semibold text-slate-700 mb-1.5">Primary Group</label>
                        <select x-model="userForm.group_name" class="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all">
                            <option value="">No Group</option>
                            <template x-for="group in groups" :key="group.id">
                                <option :value="group.name" x-text="group.name"></option>
                            </template>
                        </select>
                    </div>
                </div>

                <div>
                    <label class="block text-sm font-semibold text-slate-700 mb-1.5">Position (Jabatan)</label>
                    <select x-model="userForm.position" class="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all">
                        <option value="">Select Position</option>
                        <option value="direksi">Direksi</option>
                        <option value="kadiv">Kepala Divisi (KADIV)</option>
                        <option value="kabid">Kepala Bidang (KABID)</option>
                        <option value="staff">Staff</option>
                    </select>
                </div>

                <div>
                    <label class="block text-sm font-semibold text-slate-700 mb-2">Additional Group Memberships</label>
                    <div class="border border-slate-200 rounded-lg max-h-32 overflow-y-auto bg-slate-50 p-3 grid grid-cols-1 sm:grid-cols-2 gap-2 custom-scrollbar">
                         <template x-for="group in groups" :key="group.id">
                            <label class="flex items-center gap-2 p-1 hover:bg-white rounded cursor-pointer transition-colors">
                                <input type="checkbox" :value="group.id" x-model="userForm.extra_groups" class="rounded text-indigo-600 focus:ring-indigo-500 border-slate-300">
                                <span class="text-xs font-medium text-slate-700 truncate" x-text="group.name"></span>
                            </label>
                         </template>
                    </div>
                </div>
            </div>

            <div class="flex justify-end gap-3 pt-6 border-t border-slate-100">
                <button type="button" @click="cancelForm()" class="px-6 py-2.5 border border-slate-300 text-slate-700 font-medium rounded-xl hover:bg-slate-50 transition-colors">
                    Cancel
                </button>
                <button type="submit" class="px-8 py-2.5 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-500/30">
                    <span x-text="editingUser ? 'Update User' : 'Save User'"></span>
                </button>
            </div>
        </form>
    </div>
</div>