@extends('layouts.app')

@section('title', 'Dashboard - DOF')

@section('content')
<div class="min-h-screen bg-slate-50/50 font-sans text-slate-900" x-data="dashboardApp()" x-init="init()">
    <!-- Success Modal -->
    <div x-show="showSuccessModal" x-cloak x-transition class="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
        <div @click.away="showSuccessModal = false" class="bg-white rounded-xl shadow-2xl max-w-sm w-full p-6 text-center">
            <div class="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4 text-emerald-600">
                <svg class="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
            </div>
            <h3 class="text-xl font-bold mb-2 text-slate-800">Berhasil!</h3>
            <p class="text-gray-500 text-sm mb-6" x-text="alertMessage"></p>
            <button 
                @click="showSuccessModal = false" 
                class="w-full py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-medium transition-colors shadow-sm"
            >
                Tutup
            </button>
        </div>
    </div>

    <!-- Create Document Modal -->
    <div x-show="showCreateModal" x-cloak x-transition class="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
        <div @click.away="showCreateModal = false" class="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <h3 class="text-xl font-bold mb-2 text-slate-800" x-text="'Buat ' + (documentType === 'nota' ? 'Nota Dinas' : 'SPPD') + ' Baru'"></h3>
            <p class="text-gray-500 text-sm mb-6">Masukkan nama dokumen untuk melanjutkan</p>

            <div class="space-y-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Nama Dokumen</label>
                    <input
                        type="text"
                        class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                        :placeholder="documentType === 'nota' ? 'Contoh: Nota Dinas Rapat Koordinasi' : 'Contoh: SPPD Jakarta Mei 2026'"
                        x-model="documentName"
                        @keyup.enter="confirmCreate()"
                    />
                </div>

                <div class="flex gap-3 pt-2">
                    <button
                        @click="showCreateModal = false; documentName = ''; documentType = null"
                        class="flex-1 py-2.5 text-gray-600 hover:text-gray-800 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
                    >
                        Batal
                    </button>
                    <button
                        @click="confirmCreate()"
                        class="flex-1 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium transition-colors shadow-sm"
                    >
                        Lanjutkan
                    </button>
                </div>
            </div>
        </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div x-show="showDeleteModal" x-cloak x-transition class="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
        <div @click.away="showDeleteModal = false" class="bg-white rounded-xl shadow-2xl max-w-sm w-full p-6 text-center">
            <div class="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg class="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
            </div>
            <h3 class="text-xl font-bold text-slate-800 mb-2">Hapus Dokumen?</h3>
            <p class="text-slate-500 mb-6">
                Apakah anda yakin ingin menghapus <span class="font-bold text-slate-700" x-text="'\"' + docToDelete?.title + '\"'"></span>? Tindakan ini tidak dapat dibatalkan.
            </p>
            <div class="flex gap-3">
                <button 
                    @click="showDeleteModal = false"
                    class="flex-1 py-2.5 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 font-semibold transition-colors"
                >
                    Batal
                </button>
                <button 
                    @click="confirmDelete()"
                    class="flex-1 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 font-semibold transition-colors shadow-sm"
                >
                    Ya, Hapus
                </button>
            </div>
        </div>
    </div>

    <!-- Distribute Modal -->
    <div x-show="showDistributionModal" x-cloak x-transition class="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
        <div @click.away="showDistributionModal = false" class="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <h3 class="text-xl font-bold mb-2 text-slate-800">Distribusikan Dokumen Final</h3>
            <p class="text-gray-500 text-sm mb-6" x-text="selectedDocForDist?.title"></p>

            <div class="space-y-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Tipe Penerima</label>
                    <select x-model="recipientType" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none">
                        <option value="all">Semua User</option>
                        <option value="group">Grup Spesifik</option>
                        <option value="user">User Spesifik</option>
                    </select>
                </div>

                <div x-show="recipientType === 'group'">
                    <label class="block text-sm font-medium text-gray-700 mb-2">Pilih Grup</label>
                    <select x-model="recipientId" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none">
                        <option value="">Pilih Grup...</option>
                        <template x-for="group in allGroups" :key="group.id">
                            <option :value="group.id" x-text="group.name"></option>
                        </template>
                    </select>
                </div>

                <div x-show="recipientType === 'user'">
                    <label class="block text-sm font-medium text-gray-700 mb-2">Pilih User</label>
                    <select x-model="recipientId" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none">
                        <option value="">Pilih User...</option>
                        <template x-for="user in allUsers" :key="user.id">
                            <option :value="user.id" x-text="user.name + ' (' + user.position + ')'"></option>
                        </template>
                    </select>
                </div>

                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Catatan (Opsional)</label>
                    <textarea x-model="distributionNotes" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" rows="3"></textarea>
                </div>

                <div class="flex gap-3 pt-2">
                    <button
                        @click="showDistributionModal = false"
                        class="flex-1 py-2.5 text-gray-600 hover:text-gray-800 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
                    >
                        Batal
                    </button>
                    <button
                        @click="confirmDistribute()"
                        class="flex-1 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium transition-colors shadow-sm"
                    >
                        Distribusikan
                    </button>
                </div>
            </div>
        </div>
    </div>

    <!-- Top Decoration -->
    <div class="h-64 bg-slate-900 absolute top-0 left-0 right-0 z-0">
        <div class="absolute inset-0 bg-gradient-to-br from-indigo-600 to-blue-800 opacity-80"></div>
        <div class="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
    </div>

    <div class="relative z-10 max-w-6xl mx-auto px-6 py-8">
        <!-- Header Section -->
        <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
            <div class="text-white">
                <div class="flex items-center gap-3 mb-2 opacity-90">
                    <div class="w-8 h-8 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center font-bold text-sm border border-white/10" x-text="currentUser?.name?.charAt(0)"></div>
                    <span class="font-medium tracking-wide text-sm" x-text="currentUser?.role === 'reviewer' ? 'Reviewer Panel' : 'Staff Workspace'"></span>
                </div>
                <h1 class="text-3xl md:text-4xl font-bold tracking-tight">Halo, <span x-text="currentUser?.name?.split(' ')[0]"></span> 👋</h1>
                <p class="text-blue-100 mt-2 text-lg">Kelola dokumen dinas anda dengan mudah dan cepat.</p>
            </div>

            <div class="flex items-center gap-4">
                <!-- Notifications -->
                <div class="relative">
                    <button 
                        @click="showNotifications = !showNotifications"
                        class="relative bg-white/10 hover:bg-white/20 text-white backdrop-blur-md p-2.5 rounded-xl transition-all border border-white/10"
                    >
                        <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                        </svg>
                        <div x-show="notifications.length > 0" class="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full border border-slate-900"></div>
                    </button>

                    <!-- Dropdown -->
                    <div 
                        x-show="showNotifications" 
                        @click.away="showNotifications = false"
                        x-transition
                        class="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden z-50 origin-top-right text-slate-800"
                        style="display: none;"
                    >
                        <div class="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                            <h3 class="font-bold text-sm">Notifikasi</h3>
                            <button 
                                x-show="notifications.length > 0"
                                @click="markAllAsRead()"
                                class="text-xs text-indigo-600 hover:text-indigo-700 font-medium"
                            >
                                Tandai semua dibaca
                            </button>
                        </div>
                        <div class="max-h-96 overflow-y-auto">
                            <template x-if="notifications.length === 0">
                                <div class="p-8 text-center text-slate-400 text-sm">
                                    Tidak ada notifikasi baru
                                </div>
                            </template>
                            <template x-for="notif in notifications" :key="notif.id">
                                <div 
                                    @click="markAsRead(notif.id)"
                                    class="p-4 border-b border-slate-50 hover:bg-slate-50 transition-colors cursor-pointer relative group"
                                >
                                    <div class="flex gap-3">
                                        <div class="flex-shrink-0 mt-1">
                                            <div class="w-8 h-8 rounded-full flex items-center justify-center" 
                                                 :class="notif.data.type === 'danger' ? 'bg-red-100 text-red-600' : 'bg-indigo-100 text-indigo-600'">
                                                <svg x-show="notif.data.type === 'danger'" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                                <svg x-show="notif.data.type !== 'danger'" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                            </div>
                                        </div>
                                        <div class="flex-1">
                                            <p class="text-sm font-semibold text-slate-800" x-text="notif.data.title"></p>
                                            <p class="text-xs text-slate-600 mt-1" x-text="notif.data.message"></p>
                                            <div x-show="notif.data.reason" class="mt-2 p-2 bg-slate-100 rounded text-xs text-slate-600 italic">
                                                "<span x-text="notif.data.reason"></span>"
                                            </div>
                                            <p class="text-[10px] text-slate-400 mt-2" x-text="new Date(notif.created_at).toLocaleString('id-ID')"></p>
                                        </div>
                                    </div>
                                </div>
                            </template>
                        </div>
                    </div>
                </div>

                <button
                    @click="handleLogout()"
                    class="bg-white/10 hover:bg-white/20 text-white backdrop-blur-md px-4 py-2.5 rounded-xl text-sm font-medium transition-all border border-white/10 flex items-center gap-2"
                >
                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Sign Out
                </button>
            </div>
        </div>

        <!-- Quick Actions & Stats -->
        <div class="mb-12">
            <div class="flex items-center gap-3 mb-6">
                <div class="h-8 w-1.5 bg-indigo-400 rounded-full shadow-[0_0_10px_rgba(129,140,248,0.5)]"></div>
                <h2 class="text-white font-bold text-xl tracking-tight">Buat Dokumen Baru</h2>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                <!-- Card 1: Nota Dinas -->
                <button 
                    x-show="currentUser?.role === 'user'" 
                    @click="handleCreate('nota')" 
                    class="group relative bg-white p-6 rounded-3xl shadow-sm border border-slate-200 hover:border-indigo-500/50 transition-all hover:shadow-2xl hover:shadow-indigo-500/10 hover:-translate-y-1 overflow-hidden text-left"
                >
                    <div class="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                        <svg class="w-20 h-20" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zM13 9V3.5L18.5 9H13z"/>
                        </svg>
                    </div>
                    
                    <div class="relative z-10">
                        <div class="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 mb-5 group-hover:scale-110 transition-transform group-hover:bg-indigo-600 group-hover:text-white shadow-sm shadow-indigo-100">
                            <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                        </div>
                        <h3 class="text-lg font-bold text-slate-800 mb-2">Nota Dinas</h3>
                        <p class="text-slate-500 text-xs leading-relaxed mb-4">Buat draf nota dinas resmi standar.</p>
                        <div class="flex items-center text-indigo-600 font-semibold text-xs group-hover:gap-2 transition-all">
                            Mulai Buat 
                            <svg class="w-3 h-3 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                            </svg>
                        </div>
                    </div>
                </button>

                <!-- Card 2: SPPD -->
                <button 
                    x-show="currentUser?.role === 'user'" 
                    @click="handleCreate('sppd')" 
                    class="group relative bg-white p-6 rounded-3xl shadow-sm border border-slate-200 hover:border-emerald-500/50 transition-all hover:shadow-2xl hover:shadow-emerald-500/10 hover:-translate-y-1 overflow-hidden text-left"
                >
                    <div class="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                        <svg class="w-20 h-20" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71z"/>
                        </svg>
                    </div>
                    
                    <div class="relative z-10">
                        <div class="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 mb-5 group-hover:scale-110 transition-transform group-hover:bg-emerald-600 group-hover:text-white shadow-sm shadow-emerald-100">
                            <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                        </div>
                        <h3 class="text-lg font-bold text-slate-800 mb-2">SPPD</h3>
                        <p class="text-slate-500 text-xs leading-relaxed mb-4">Surat Perintah Perjalanan Dinas.</p>
                        <div class="flex items-center text-emerald-600 font-semibold text-xs group-hover:gap-2 transition-all">
                            Mulai Buat 
                            <svg class="w-3 h-3 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                            </svg>
                        </div>
                    </div>
                </button>

                <!-- Card 3: Perjanjian Kerja Sama -->
                <button 
                    x-show="currentUser?.role === 'user'" 
                    @click="handleCreate('perj')" 
                    class="group relative bg-white p-6 rounded-3xl shadow-sm border border-slate-200 hover:border-amber-500/50 transition-all hover:shadow-2xl hover:shadow-amber-500/10 hover:-translate-y-1 overflow-hidden text-left"
                >
                    <div class="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                        <svg class="w-20 h-20" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M19 3h-4.18C14.4 1.84 13.3 1 12 1s-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm2 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
                        </svg>
                    </div>
                    
                    <div class="relative z-10">
                        <div class="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600 mb-5 group-hover:scale-110 transition-transform group-hover:bg-amber-600 group-hover:text-white shadow-sm shadow-amber-100">
                            <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                            </svg>
                        </div>
                        <h3 class="text-lg font-bold text-slate-800 mb-2">Perjanjian</h3>
                        <p class="text-slate-500 text-xs leading-relaxed mb-4">Perjanjian Kerja Sama (PKS).</p>
                        <div class="flex items-center text-amber-600 font-semibold text-xs group-hover:gap-2 transition-all">
                            Mulai Buat 
                            <svg class="w-3 h-3 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                            </svg>
                        </div>
                    </div>
                </button>

                <!-- Card 4: Stats -->
                <div 
                    x-show="currentUser?.role === 'user'"
                    class="bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 p-6 rounded-3xl shadow-xl shadow-slate-900/20 text-white relative overflow-hidden"
                >
                    <div class="absolute -bottom-8 -right-8 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl"></div>
                    <div class="relative z-10 h-full flex flex-col justify-between">
                        <div>
                            <div class="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-1">Total Dokumen</div>
                            <div class="text-4xl font-black tracking-tight" x-text="filteredDocs.length"></div>
                        </div>
                        <div class="mt-4 flex flex-col gap-2">
                            <div class="flex items-center justify-between text-xs">
                                <span class="text-slate-400">Disetujui</span>
                                <span class="font-bold text-emerald-400" x-text="filteredDocs.filter(d => d.status === 'approved').length"></span>
                            </div>
                            <div class="w-full bg-white/5 h-1 rounded-full overflow-hidden">
                                <div class="bg-emerald-400 h-full rounded-full transition-all duration-500" :style="'width: ' + (filteredDocs.length > 0 ? (filteredDocs.filter(d => d.status === 'approved').length / filteredDocs.length * 100) : 0) + '%'"></div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Reviewer Cards -->
                <template x-if="currentUser?.role === 'reviewer'">
                    <div class="col-span-3 grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div class="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
                            <div class="w-12 h-12 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center">
                                <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <div>
                                <div class="text-2xl font-bold text-slate-800" x-text="filteredDocs.filter(d => d.status === 'pending_review').length"></div>
                                <div class="text-slate-500 text-sm">Menunggu Review</div>
                            </div>
                        </div>
                        <div class="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
                            <div class="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
                                <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <div>
                                <div class="text-2xl font-bold text-slate-800" x-text="filteredDocs.filter(d => d.status === 'approved').length"></div>
                                <div class="text-slate-500 text-sm">Telah Disetujui</div>
                            </div>
                        </div>
                    </div>
                </template>
            </div>
        </div>

        <!-- Distribution Monitoring Section -->
        <div x-show="distributions.length > 0" class="mb-12">
            <div class="flex items-center gap-3 mb-6">
                <div class="h-8 w-1.5 bg-emerald-500 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.3)]"></div>
                <h2 class="text-slate-800 font-bold text-xl tracking-tight">Monitoring Distribusi Dokumen Final</h2>
            </div>
            
            <div class="relative group" x-data="{ 
                canScrollLeft: false, 
                canScrollRight: false,
                checkScroll() {
                    const container = this.$refs.container;
                    if (!container) return;
                    this.canScrollLeft = container.scrollLeft > 10;
                    this.canScrollRight = container.scrollLeft < (container.scrollWidth - container.clientWidth - 10);
                },
                scroll(direction) {
                    const container = this.$refs.container;
                    if (!container) return;
                    const scrollAmount = Math.min(container.clientWidth * 0.8, 400);
                    container.scrollBy({
                        left: direction === 'left' ? -scrollAmount : scrollAmount,
                        behavior: 'smooth'
                    });
                }
            }" x-init="setTimeout(() => checkScroll(), 500); $watch('distributions', () => $nextTick(() => checkScroll()))">
                
                <!-- Prev Button -->
                <button 
                    x-show="canScrollLeft"
                    @click="scroll('left')" 
                    class="absolute -left-4 top-1/2 -translate-y-1/2 z-20 bg-white/90 backdrop-blur shadow-xl rounded-full p-2.5 text-emerald-600 border border-emerald-100 hover:bg-emerald-50 transition-all focus:outline-none"
                    x-transition:enter="transition ease-out duration-300"
                    x-transition:enter-start="opacity-0 scale-90"
                    x-transition:enter-end="opacity-100 scale-100"
                    x-transition:leave="transition ease-in duration-200"
                    x-transition:leave-start="opacity-100 scale-100"
                    x-transition:leave-end="opacity-0 scale-90"
                >
                    <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
                    </svg>
                </button>
                
                <!-- Next Button -->
                <button 
                    x-show="canScrollRight"
                    @click="scroll('right')" 
                    class="absolute -right-4 top-1/2 -translate-y-1/2 z-20 bg-white/90 backdrop-blur shadow-xl rounded-full p-2.5 text-emerald-600 border border-emerald-100 hover:bg-emerald-50 transition-all focus:outline-none"
                    x-transition:enter="transition ease-out duration-300"
                    x-transition:enter-start="opacity-0 scale-90"
                    x-transition:enter-end="opacity-100 scale-100"
                    x-transition:leave="transition ease-in duration-200"
                    x-transition:leave-start="opacity-100 scale-100"
                    x-transition:leave-end="opacity-0 scale-90"
                >
                    <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                    </svg>
                </button>

                <!-- Container -->
                <div 
                    x-ref="container"
                    @scroll.debounce.50ms="checkScroll()"
                    class="flex overflow-x-auto gap-6 pb-6 no-scrollbar snap-x snap-mandatory scroll-smooth -mx-4 px-4"
                >
                    <template x-for="dist in distributions" :key="dist.id">
                        <div class="min-w-[85vw] md:min-w-[400px] snap-start">
                            <div class="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex flex-col gap-4 h-full hover:shadow-md transition-shadow">
                                <div class="flex justify-between items-start">
                                    <div class="flex items-center gap-3">
                                        <div class="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center font-bold">
                                            <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                            </svg>
                                        </div>
                                        <div>
                                            <h3 class="font-bold text-slate-800 text-sm line-clamp-1" x-text="dist.title"></h3>
                                            <p class="text-[10px] text-slate-500" x-text="'Didistribusikan: ' + formatDate(dist.distributed_at).d"></p>
                                        </div>
                                    </div>
                                    <div class="text-right">
                                        <div class="text-lg font-black text-indigo-600" x-text="dist.percentage + '%'"></div>
                                        <div class="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Terbaca</div>
                                    </div>
                                </div>
                                
                                <div class="space-y-2 mt-auto">
                                    <div class="flex justify-between text-xs font-medium">
                                        <span class="text-slate-500" x-text="dist.read_count + ' dari ' + dist.total_expected + ' user'"></span>
                                        <span class="text-slate-800 font-bold" x-text="dist.percentage + '%'"></span>
                                    </div>
                                    <div class="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                                        <div class="bg-emerald-500 h-full rounded-full transition-all duration-1000" :style="'width: ' + dist.percentage + '%'"></div>
                                    </div>
                                </div>

                                <div class="flex justify-between items-center pt-3 border-t border-slate-50">
                                    <span class="text-[10px] px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full font-bold uppercase tracking-tight" x-text="dist.status_label"></span>
                                    <a :href="'/documents/' + dist.id" class="text-xs text-indigo-600 font-bold hover:text-indigo-800 flex items-center gap-1">
                                        Lihat Detail
                                        <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                                        </svg>
                                    </a>
                                </div>
                            </div>
                        </div>
                    </template>
                </div>
            </div>
        </div>

        <!-- Documents Table -->
        <div class="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
            <!-- Toolbar -->
            <div class="p-5 border-b border-slate-100 bg-white">
                <div class="flex flex-col md:flex-row justify-between items-center gap-4 mb-4">
                    <h2 class="font-bold text-slate-800 flex items-center gap-2">
                        <svg class="w-5 h-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        Daftar Dokumen
                    </h2>
                    <div class="relative w-full sm:w-96">
                        <svg class="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <input
                            type="text"
                            placeholder="Cari judul, nomor, perihal, atau nama..."
                            class="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                            x-model="searchTerm"
                        />
                    </div>
                </div>

                <!-- Advanced Filters -->
                <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-50">
                    <div>
                        <label class="block text-[10px] font-bold text-slate-400 uppercase mb-1 ml-1">Tipe Dokumen</label>
                        <select x-model="typeFilter" @change="filterDocuments()" class="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500/20 outline-none">
                            <option value="all">Semua Tipe</option>
                            <option value="nota">Nota Dinas</option>
                            <option value="sppd">SPPD</option>
                            <option value="perj">Perjanjian</option>
                        </select>
                    </div>
                    <div>
                        <label class="block text-[10px] font-bold text-slate-400 uppercase mb-1 ml-1">Dari Tanggal</label>
                        <input type="date" x-model="dateFrom" @change="filterDocuments()" class="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500/20 outline-none">
                    </div>
                    <div>
                        <label class="block text-[10px] font-bold text-slate-400 uppercase mb-1 ml-1">Sampai Tanggal</label>
                        <input type="date" x-model="dateTo" @change="filterDocuments()" class="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500/20 outline-none">
                    </div>
                </div>
            </div>

            <!-- Table -->
            <div class="overflow-x-auto">
                <table class="w-full text-left border-collapse">
                    <thead>
                        <tr class="bg-slate-50/50 border-b border-slate-100 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                            <th class="px-6 py-4">Dokumen</th>
                            <th class="px-6 py-4">Tipe</th>
                            <th class="px-6 py-4">Tanggal</th>
                            <th class="px-6 py-4">Deadline</th>
                            <th class="px-6 py-4">Status</th>
                            <th class="px-6 py-4 text-right">Aksi</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-50">
                        <template x-if="filteredDocs.length === 0">
                            <tr>
                                <td colspan="6" class="px-6 py-12 text-center">
                                    <div class="flex flex-col items-center justify-center text-slate-400">
                                        <svg class="w-12 h-12 mb-3 opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                        <p>Tidak ada dokumen ditemukan.</p>
                                    </div>
                                </td>
                            </tr>
                        </template>
                        <template x-for="doc in filteredDocs" :key="doc.id">
                            <tr class="hover:bg-slate-50/80 transition-colors group">
                                <td class="px-6 py-4">
                                    <div class="flex items-center gap-3">
                                        <div :class="{
                                                'bg-indigo-50 text-indigo-600': doc.type === 'nota',
                                                'bg-emerald-50 text-emerald-600': doc.type === 'sppd',
                                                'bg-amber-50 text-amber-600': doc.type === 'perj'
                                             }" class="w-10 h-10 rounded-lg flex items-center justify-center text-lg font-bold flex-shrink-0">
                                            <span x-text="doc.type === 'nota' ? 'N' : (doc.type === 'sppd' ? 'S' : 'P')"></span>
                                        </div>
                                        <div>
                                            <div class="font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors" x-text="doc.title"></div>
                                            <div class="text-xs text-slate-500 font-mono mt-0.5" x-text="doc.content_data?.docNumber || doc.data?.docNumber || 'No Ref'"></div>
                                            
                                            <!-- Sender Info for Receiver -->
                                            <template x-if="doc.author_id !== currentUser?.id">
                                                <div class="text-xs text-slate-500 mt-1 flex items-center gap-1">
                                                    <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                    </svg>
                                                    <span x-text="'Dari: ' + (doc.author?.group_name || doc.author_name || 'Unknown')"></span>
                                                </div>
                                            </template>
                                        </div>
                                    </div>
                                </td>
                                <td class="px-6 py-4">
                                    <span class="text-sm text-slate-600 font-medium capitalize bg-slate-100 px-2 py-1 rounded-md" x-text="doc.type"></span>
                                </td>
                                <td class="px-6 py-4">
                                    <div class="text-sm text-slate-700 font-medium" x-text="formatDate(doc.created_at).d"></div>
                                    <div class="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                                        <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <span x-text="formatDate(doc.created_at).t"></span>
                                    </div>
                                </td>
                                <td class="px-6 py-4">
                                    <div x-show="doc.deadline" class="flex items-center gap-2">
                                        <svg class="w-4 h-4" :class="getDeadlineColor(getDeadlineStatus(doc.deadline))" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <span class="text-sm font-medium" :class="getDeadlineColor(getDeadlineStatus(doc.deadline))" x-text="formatDeadline(doc.deadline)"></span>
                                    </div>
                                    <div x-show="!doc.deadline" class="text-xs text-slate-400">-</div>
                                </td>
                                <td class="px-6 py-4">
                                    <span :class="getStatusClass(doc.status)" class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold">
                                        <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <span x-text="getStatusLabel(doc)"></span>
                                        
                                        <!-- Read Receipt for Sender -->
                                        <template x-if="doc.status === 'received' && doc.author_id === currentUser.id">
                                            <svg class="w-4 h-4 text-violet-600 ml-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" title="Dibaca oleh penerima">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7M5 13l4 4L19 7" /> <!-- Double check style -->
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4" />
                                            </svg>
                                        </template>
                                    </span>
                                </td>
                                <td class="px-6 py-4 text-right">
                                    <div class="flex items-center justify-end gap-2">
                                        <a
                                            :href="'/documents/' + doc.id"
                                            class="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-white border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50 hover:text-indigo-600 hover:border-indigo-200 transition-all shadow-sm"
                                        >
                                            <span>Detail</span>
                                        </a>
                                        <a
                                            :href="'/editor/' + doc.id"
                                            class="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition-all shadow-sm"
                                        >
                                            <span x-text="currentUser?.role === 'reviewer' ? 'Review' : 'Edit'"></span>
                                        </a>
                                        
                                        <!-- Distribute Button for Admin Only -->
                                        <template x-if="currentUser?.role === 'admin' && (doc.status === 'approved' || doc.status === 'sent')">
                                            <button
                                                @click="openDistributeModal(doc)"
                                                class="inline-flex items-center justify-center px-3 py-2 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 transition-all shadow-sm"
                                                title="Distribusikan Dokumen Final (Admin Only)"
                                            >
                                                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                                                </svg>
                                            </button>
                                        </template>

                                        <template x-if="currentUser?.role === 'user' && doc.author_id === currentUser?.id">
                                            <button
                                                @click="handleDelete(doc.id, doc.title)"
                                                :disabled="doc.status === 'approved'"
                                                :class="doc.status === 'approved' ? 'opacity-50 cursor-not-allowed bg-slate-100 text-slate-400 hover:bg-slate-100 hover:text-slate-400' : 'bg-white text-red-500 hover:text-red-700 hover:bg-red-50 hover:border-red-200'"
                                                class="inline-flex items-center justify-center px-3 py-2 rounded-lg border border-slate-200 transition-all shadow-sm"
                                                title="Hapus Dokumen"
                                            >
                                                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                            </button>
                                        </template>
                                    </div>
                                </td>
                            </tr>
                        </template>
                    </tbody>
                </table>
            </div>

            <!-- Footer -->
            <template x-if="filteredDocs.length > 0">
                <div class="p-4 border-t border-slate-100 bg-slate-50/30 text-xs text-slate-400 flex justify-between items-center">
                    <span x-text="'Menampilkan ' + filteredDocs.length + ' dokumen'"></span>
                </div>
            </template>
        </div>
    </div>
</div>


@endsection