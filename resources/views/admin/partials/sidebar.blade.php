<div 
    class="bg-slate-200 min-h-screen text-slate-700 flex flex-col fixed left-0 top-0 bottom-0 z-20 transition-all duration-300 overflow-hidden border-r border-slate-300 shadow-lg"
    :class="sidebarOpen ? 'w-64' : 'w-20'"
>
    <!-- Logo & Toggle Section -->
    <div class="p-6 border-b border-slate-300 flex items-center justify-between bg-slate-300/30">
        <div class="flex items-center gap-3" x-show="sidebarOpen" x-transition:enter="transition ease-out duration-300" x-transition:enter-start="opacity-0" x-transition:enter-end="opacity-100">
            <div class="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center flex-shrink-0 shadow-md">
                <svg class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                </svg>
            </div>
            <span class="font-bold text-lg tracking-wide whitespace-nowrap text-slate-900">AdminPanel</span>
        </div>
        <button @click="sidebarOpen = !sidebarOpen" class="p-2 hover:bg-white rounded-xl transition-all text-slate-600 hover:text-indigo-600 border border-slate-400/30 shadow-sm bg-slate-100/50">
            <svg class="w-5 h-5 transition-transform duration-500" :class="!sidebarOpen ? 'rotate-180' : ''" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
        </button>
    </div>

    <!-- Navigation -->
    <nav class="flex-1 p-4 space-y-2 mt-4">
        <button 
            @click="activeTab = 'dashboard'" 
            :class="activeTab === 'dashboard' ? 'bg-white text-indigo-700 shadow-lg border-slate-300' : 'text-slate-600 hover:bg-white/40 hover:text-slate-900 border-transparent'"
            class="w-full flex items-center gap-4 px-4 py-3 text-sm font-bold rounded-xl transition-all group border"
            :title="!sidebarOpen ? 'Dashboard' : ''"
        >
            <svg class="w-5 h-5 flex-shrink-0" :class="activeTab === 'dashboard' ? 'text-indigo-600' : 'text-slate-500'" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <span x-show="sidebarOpen" class="whitespace-nowrap">Dashboard</span>
        </button>

        <button 
            @click="activeTab = 'users'" 
            :class="activeTab === 'users' ? 'bg-white text-indigo-700 shadow-lg border-slate-300' : 'text-slate-600 hover:bg-white/40 hover:text-slate-900 border-transparent'"
            class="w-full flex items-center gap-4 px-4 py-3 text-sm font-bold rounded-xl transition-all group border"
            :title="!sidebarOpen ? 'User Management' : ''"
        >
            <svg class="w-5 h-5 flex-shrink-0" :class="activeTab === 'users' ? 'text-indigo-600' : 'text-slate-500'" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            <span x-show="sidebarOpen" class="whitespace-nowrap">User Management</span>
        </button>

        <button 
            @click="activeTab = 'groups'"
            :class="activeTab === 'groups' ? 'bg-white text-indigo-700 shadow-lg border-slate-300' : 'text-slate-600 hover:bg-white/40 hover:text-slate-900 border-transparent'"
            class="w-full flex items-center gap-4 px-4 py-3 text-sm font-bold rounded-xl transition-all group border"
            :title="!sidebarOpen ? 'Groups Management' : ''"
        >
            <svg class="w-5 h-5 flex-shrink-0" :class="activeTab === 'groups' ? 'text-indigo-600' : 'text-slate-500'" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <span x-show="sidebarOpen" class="whitespace-nowrap">Groups Management</span>
        </button>

        <button 
            @click="activeTab = 'distributions'"
            :class="activeTab === 'distributions' ? 'bg-white text-indigo-700 shadow-lg border-slate-300' : 'text-slate-600 hover:bg-white/40 hover:text-slate-900 border-transparent'"
            class="w-full flex items-center gap-4 px-4 py-3 text-sm font-bold rounded-xl transition-all group border"
            :title="!sidebarOpen ? 'Monitoring Distribusi' : ''"
        >
            <svg class="w-5 h-5 flex-shrink-0" :class="activeTab === 'distributions' ? 'text-indigo-600' : 'text-slate-500'" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <span x-show="sidebarOpen" class="whitespace-nowrap">Monitoring Distribusi</span>
        </button>

        <button 
            @click="activeTab = 'all_documents'"
            :class="activeTab === 'all_documents' ? 'bg-white text-indigo-700 shadow-lg border-slate-300' : 'text-slate-600 hover:bg-white/40 hover:text-slate-900 border-transparent'"
            class="w-full flex items-center gap-4 px-4 py-3 text-sm font-bold rounded-xl transition-all group border"
            :title="!sidebarOpen ? 'Arsip Dokumen' : ''"
        >
            <svg class="w-5 h-5 flex-shrink-0" :class="activeTab === 'all_documents' ? 'text-indigo-600' : 'text-slate-500'" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
            </svg>
            <span x-show="sidebarOpen" class="whitespace-nowrap">Arsip Dokumen</span>
        </button>
    </nav>

    <!-- Footer -->
    <div class="p-4 border-t border-slate-300 bg-slate-300/40">
        <button 
            @click="handleLogout()"
            class="w-full flex items-center gap-4 px-4 py-3 text-sm font-bold text-red-600 hover:bg-red-50 rounded-xl transition-colors group"
            :title="!sidebarOpen ? 'Sign Out' : ''"
        >
            <svg class="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span x-show="sidebarOpen" class="whitespace-nowrap">Sign Out</span>
        </button>
    </div>
</div>
