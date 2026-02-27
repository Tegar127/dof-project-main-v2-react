<div class="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
    <div class="p-6 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div>
            <h2 class="text-xl font-bold text-slate-800">User Management</h2>
            <p class="text-slate-500 text-sm mt-1">Manage system access and roles.</p>
        </div>
        <button
            @click="showForm = true; editingUser = null; userForm = { extra_groups: [] }"
            class="px-5 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/30 flex items-center gap-2 text-sm font-semibold"
        >
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
            New User
        </button>
    </div>

    <div class="overflow-x-auto">
        <table class="w-full text-left">
            <thead>
                <tr class="bg-slate-50/50 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    <th class="px-6 py-4">User Info</th>
                    <th class="px-6 py-4">Role</th>
                    <th class="px-6 py-4">Position</th>
                    <th class="px-6 py-4">Groups</th>
                    <th class="px-6 py-4">Total Work</th>
                    <th class="px-6 py-4 text-right">Actions</th>
                </tr>
            </thead>
            <tbody class="divide-y divide-slate-50">
                <template x-for="user in users" :key="user.id">
                    <tr class="hover:bg-slate-50/80 transition-colors group">
                        <td class="px-6 py-4">
                            <div class="flex items-center gap-4">
                                <div class="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 text-white flex items-center justify-center font-bold shadow-md shadow-indigo-500/20" x-text="user.name.charAt(0)"></div>
                                <div>
                                    <div class="font-semibold text-slate-900" x-text="user.name"></div>
                                    <div class="text-sm text-slate-500" x-text="user.email"></div>
                                </div>
                            </div>
                        </td>
                        <td class="px-6 py-4">
                            <span :class="getRoleBadge(user.role)" class="px-3 py-1 text-xs font-bold rounded-full uppercase tracking-wide">
                                <span x-text="user.role"></span>
                            </span>
                        </td>
                        <td class="px-6 py-4">
                            <span x-show="user.position" class="text-xs font-semibold uppercase tracking-wider text-slate-600 bg-slate-100 px-2 py-1 rounded" x-text="user.position"></span>
                            <span x-show="!user.position" class="text-xs text-slate-400">-</span>
                        </td>
                        <td class="px-6 py-4">
                            <div class="flex flex-wrap gap-1.5">
                                <!-- Primary Group -->
                                <div class="flex items-center gap-1.5 bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded text-[10px] font-bold border border-emerald-100" x-show="user.group_name">
                                    <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                    <span x-text="user.group_name"></span>
                                </div>
                                <!-- Extra Groups -->
                                <template x-for="g in user.groups" :key="g.id">
                                    <template x-if="g.name !== user.group_name">
                                        <div class="flex items-center gap-1.5 bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-[10px] font-bold border border-blue-100">
                                            <span class="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                                            <span x-text="g.name"></span>
                                        </div>
                                    </template>
                                </template>
                                <span x-show="!user.group_name && (!user.groups || user.groups.length === 0)" class="text-sm text-slate-400 italic">No Group</span>
                            </div>
                        </td>
                        <td class="px-6 py-4">
                            <div class="flex flex-col">
                                <span class="text-sm font-bold text-slate-700" x-text="(user.work_logs_sum_duration_minutes || 0) + ' m'"></span>
                                <span class="text-xs text-slate-400" x-text="((user.work_logs_sum_duration_minutes || 0) / 60).toFixed(1) + ' hrs'"></span>
                            </div>
                        </td>
                        <td class="px-6 py-4 text-right">
                            <div class="flex justify-end gap-2">
                                <button
                                    @click="editUser(user)"
                                    class="text-slate-400 hover:text-indigo-600 transition-colors p-2 hover:bg-indigo-50 rounded-lg"
                                    title="Edit User"
                                >
                                    <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                    </svg>
                                </button>
                                <button
                                    @click="deleteUser(user.id)"
                                    class="text-slate-400 hover:text-red-600 transition-colors p-2 hover:bg-red-50 rounded-lg"
                                    title="Delete User"
                                >
                                    <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                </button>
                            </div>
                        </td>
                    </tr>
                </template>
            </tbody>
        </table>
    </div>
</div>