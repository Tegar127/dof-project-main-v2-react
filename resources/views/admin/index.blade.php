@extends('layouts.app')

@section('title', 'Admin Panel - DOF')

@section('content')
<div class="min-h-screen bg-slate-50 font-sans" x-data="adminApp()" x-init="init()">
    
    <!-- Sidebar -->
    @include('admin.partials.sidebar')

    <!-- Main Content -->
    <div 
        class="transition-all duration-300 p-8"
        :class="sidebarOpen ? 'ml-64' : 'ml-20'"
    >
        
        <!-- Header -->
        <div class="flex justify-between items-center mb-8">
            <div>
                <h1 class="text-2xl font-bold text-slate-800" x-text="activeTab === 'dashboard' ? 'Admin Dashboard' : (activeTab === 'users' ? 'User Management' : (activeTab === 'groups' ? 'Group Management' : (activeTab === 'distributions' ? 'Monitoring Distribusi' : 'Arsip Seluruh Dokumen')))"></h1>
                <p class="text-slate-500 mt-1" x-text="activeTab === 'dashboard' ? 'Overview of your system performance.' : (activeTab === 'all_documents' ? 'Database pusat seluruh dokumen di dalam sistem.' : (activeTab === 'distributions' ? 'Pantau penyebaran dan status baca dokumen final.' : 'Kelola struktur organisasi dan hak akses.'))"></p>
            </div>
            <div class="flex items-center gap-3">
                <span class="text-sm text-slate-500 bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm">
                    {{ now()->format('l, d M Y') }}
                </span>
            </div>
        </div>

        <!-- Dashboard Tab (Stats moved here) -->
        <div x-show="activeTab === 'dashboard'" x-transition:enter="transition ease-out duration-300" x-transition:enter-start="opacity-0 translate-y-2" x-transition:enter-end="opacity-100 translate-y-0">
            @include('admin.partials.stats')
            
            <!-- Additional Dashboard Content can go here later -->
            <div class="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div class="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <h3 class="font-bold text-slate-800 mb-4">Quick Links</h3>
                    <div class="grid grid-cols-2 gap-4">
                        <button @click="activeTab = 'users'" class="p-4 bg-slate-50 rounded-xl border border-slate-100 hover:border-indigo-500 hover:bg-indigo-50 transition-all text-left group">
                            <div class="text-indigo-600 mb-2 group-hover:scale-110 transition-transform">
                                <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                            </div>
                            <div class="text-sm font-bold text-slate-800">Manage Users</div>
                        </button>
                        <button @click="activeTab = 'distributions'" class="p-4 bg-slate-50 rounded-xl border border-slate-100 hover:border-indigo-500 hover:bg-indigo-50 transition-all text-left group">
                            <div class="text-indigo-600 mb-2 group-hover:scale-110 transition-transform">
                                <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                            </div>
                            <div class="text-sm font-bold text-slate-800">Monitoring</div>
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Users Tab -->
        <div x-show="activeTab === 'users'" x-transition:enter="transition ease-out duration-300" x-transition:enter-start="opacity-0 translate-y-2" x-transition:enter-end="opacity-100 translate-y-0">
            <!-- Form View -->
            <div x-show="showForm" class="mb-8">
                @include('admin.partials.user-modal')
            </div>
            
            <!-- Table View -->
            <div x-show="!showForm">
                @include('admin.partials.users-table')
            </div>
        </div>

        <!-- Groups Tab -->
        <div x-show="activeTab === 'groups'" x-transition:enter="transition ease-out duration-300" x-transition:enter-start="opacity-0 translate-y-2" x-transition:enter-end="opacity-100 translate-y-0" style="display: none;">
            <!-- Form View -->
            <div x-show="showForm" class="mb-8">
                @include('admin.partials.group-modal')
            </div>

            <!-- List/Details View -->
            <div x-show="!showForm">
                @include('admin.partials.groups-list')
            </div>
        </div>

        <!-- Distributions Tab -->
        @include('admin.partials.distributions')

        <!-- All Documents Tab -->
        <div x-show="activeTab === 'all_documents'" x-transition:enter="transition ease-out duration-300" x-transition:enter-start="opacity-0 translate-y-2" x-transition:enter-end="opacity-100 translate-y-0" style="display: none;">
            <div class="bg-white rounded-[2rem] shadow-sm border border-slate-200 overflow-hidden">
                <div class="p-8 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-6 bg-slate-50/50">
                    <div>
                        <h3 class="font-bold text-slate-900 text-lg">Arsip Approved & Final</h3>
                        <p class="text-xs text-slate-500 font-medium">Kumpulan seluruh dokumen yang sudah disetujui atau sudah didistribusikan.</p>
                    </div>
                    <div class="relative w-full sm:w-80">
                        <input type="text" x-model="searchAllDocs" placeholder="Cari judul, nomor, author..." class="w-full pl-11 pr-4 py-3 bg-white border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-medium">
                        <svg class="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                    </div>
                </div>
                <div class="overflow-x-auto">
                    <table class="w-full text-left">
                        <thead>
                            <tr class="text-[11px] font-bold text-slate-500 uppercase tracking-wider bg-slate-50">
                                <th class="px-8 py-4">Informasi Dokumen</th>
                                <th class="px-6 py-4">Author</th>
                                <th class="px-6 py-4">Status</th>
                                <th class="px-6 py-4">Waktu Dibuat</th>
                                <th class="px-8 py-4 text-right">Kelola</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-slate-100">
                            <template x-for="doc in filteredAllDocs" :key="doc.id">
                                <tr class="hover:bg-slate-50 transition-colors">
                                    <td class="px-8 py-5">
                                        <div class="font-bold text-slate-900 text-sm" x-text="doc.title"></div>
                                        <div class="text-xs text-slate-400 font-mono mt-0.5" x-text="doc.content_data?.docNumber || 'NON-REF'"></div>
                                    </td>
                                    <td class="px-6 py-5 text-sm text-slate-700 font-medium" x-text="doc.author_name"></td>
                                    <td class="px-6 py-5">
                                        <template x-if="['sent', 'received'].includes(typeof doc.status === 'object' ? doc.status.value : doc.status)">
                                            <span class="px-3 py-1 bg-indigo-600 text-white text-[10px] font-bold rounded-lg uppercase tracking-wider shadow-sm">FINAL</span>
                                        </template>
                                        <template x-if="!['sent', 'received'].includes(typeof doc.status === 'object' ? doc.status.value : doc.status)">
                                            <span class="px-3 py-1 bg-slate-100 text-slate-600 text-[10px] font-bold rounded-lg uppercase" x-text="typeof doc.status === 'object' ? doc.status.label : doc.status"></span>
                                        </template>
                                    </td>
                                    <td class="px-6 py-5 text-xs text-slate-500 font-medium" x-text="formatDate(doc.created_at)"></td>
                                    <td class="px-8 py-5 text-right">
                                        <div class="flex justify-end gap-2">
                                            <a :href="'/documents/' + doc.id" class="p-2.5 bg-slate-50 text-slate-600 rounded-xl hover:bg-indigo-600 hover:text-white transition-all border border-slate-200">
                                                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                            </a>
                                            <button @click="openDeleteModal(doc.id, doc.title)" class="p-2.5 bg-slate-50 text-red-500 rounded-xl hover:bg-red-600 hover:text-white transition-all border border-slate-200">
                                                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            </template>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>

    <!-- Delete Confirmation Modal (Keeping this as modal as it's a critical confirmation) -->
    <div x-show="showDeleteModal" x-cloak class="fixed inset-0 z-[60] bg-black/50 flex items-center justify-center p-4">
        <div @click.away="showDeleteModal = false" class="bg-white rounded-xl shadow-2xl max-w-sm w-full p-6">
            <h3 class="text-xl font-bold mb-2 text-slate-800">Delete Document?</h3>
            <p class="text-gray-500 text-sm mb-4">
                You are about to delete <strong x-text="docToDelete?.title"></strong>. This will notify the author.
            </p>
            
            <div class="mb-6">
                <label class="block text-xs font-bold text-gray-700 mb-1">Reason for Deletion</label>
                <textarea 
                    x-model="deleteReason" 
                    class="w-full p-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
                    rows="3"
                    placeholder="e.g., Duplicate document, Incorrect format..."
                ></textarea>
            </div>

            <div class="flex gap-3">
                <button
                    @click="showDeleteModal = false; docToDelete = null"
                    class="flex-1 py-2.5 text-gray-600 hover:text-gray-800 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
                >
                    Cancel
                </button>
                <button
                    @click="confirmDelete()"
                    class="flex-1 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium transition-colors shadow-sm"
                >
                    Delete
                </button>
            </div>
        </div>
    </div>

    <!-- Toast Notification -->
    <div x-show="notification.show" 
         x-transition:enter="transition ease-out duration-300"
         x-transition:enter-start="opacity-0 transform translate-y-2"
         x-transition:enter-end="opacity-100 transform translate-y-0"
         x-transition:leave="transition ease-in duration-200"
         x-transition:leave-start="opacity-100 transform translate-y-0"
         x-transition:leave-end="opacity-0 transform translate-y-2"
         class="fixed bottom-4 right-4 z-50 flex items-center w-full max-w-xs p-4 rounded-lg shadow-lg border"
         :class="{
            'bg-green-50 text-green-800 border-green-200': notification.type === 'success',
            'bg-red-50 text-red-800 border-red-200': notification.type === 'error'
         }"
         role="alert">
        <div class="inline-flex items-center justify-center flex-shrink-0 w-8 h-8 rounded-lg"
             :class="{
                'bg-green-100 text-green-500': notification.type === 'success',
                'bg-red-100 text-red-500': notification.type === 'error'
             }">
            <template x-if="notification.type === 'success'">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
            </template>
            <template x-if="notification.type === 'error'">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </template>
        </div>
        <div class="ml-3 text-sm font-medium" x-text="notification.message"></div>
        <button type="button" @click="notification.show = false" class="ml-auto -mx-1.5 -my-1.5 rounded-lg focus:ring-2 p-1.5 inline-flex h-8 w-8"
                :class="{
                    'bg-green-50 text-green-500 hover:bg-green-200 focus:ring-green-400': notification.type === 'success',
                    'bg-red-50 text-red-500 hover:bg-red-200 focus:ring-red-400': notification.type === 'error'
                }">
            <span class="sr-only">Close</span>
            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path></svg>
        </button>
    </div>
    
</div>
@vite('resources/js/admin/index.js')
@endsection
