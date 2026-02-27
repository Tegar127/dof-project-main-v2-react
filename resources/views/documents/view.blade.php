@extends('layouts.app')

@section('title', 'Detail Dokumen - DOF')

@section('content')
<div class="min-h-screen bg-slate-50/50 font-sans text-slate-900" x-data="documentDetailApp()" x-init="init()">
    <!-- Loading State -->
    <div x-show="loading" class="flex items-center justify-center min-h-screen">
        <div class="text-center">
            <div class="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p class="text-slate-600">Memuat dokumen...</p>
        </div>
    </div>

    <!-- Main Content -->
    <div x-show="!loading && document" class="max-w-7xl mx-auto px-6 py-8">
        <!-- Header -->
        <div class="mb-8">
            <a href="/dashboard" class="inline-flex items-center text-indigo-600 hover:text-indigo-700 mb-4">
                <svg class="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Kembali ke Dashboard
            </a>

            <div class="flex items-start justify-between">
                <div class="flex-1">
                    <div class="flex items-center gap-3 mb-2">
                        <span :class="{
                                'bg-indigo-100 text-indigo-700': document?.type === 'nota',
                                'bg-emerald-100 text-emerald-700': document?.type === 'sppd',
                                'bg-amber-100 text-amber-700': document?.type === 'perj'
                              }" 
                              class="px-3 py-1 rounded-full text-xs font-semibold uppercase">
                            <span x-text="document?.type === 'perj' ? 'Perjanjian' : (document?.type === 'sppd' ? 'SPPD' : 'Nota Dinas')"></span>
                        </span>
                        <span class="text-sm text-slate-500">
                            Versi <span x-text="document?.version" class="font-mono font-semibold"></span>
                        </span>
                    </div>
                    <h1 class="text-3xl font-bold text-slate-900 mb-2" x-text="document?.title"></h1>
                    <div class="flex items-center gap-4 text-sm text-slate-600">
                        <div class="flex items-center gap-2">
                            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            <span x-text="document?.author_name"></span>
                        </div>
                        <div class="flex items-center gap-2">
                            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <span x-text="formatDate(document?.created_at)"></span>
                        </div>
                    </div>
                </div>

                <!-- Status Badge -->
                <div>
                    <span :class="getStatusClass(document?.status)" class="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold border">
                        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span x-text="getStatusLabel(document?.status)"></span>
                    </span>
                </div>
            </div>
        </div>

        <!-- Deadline Alert -->
        <div x-show="document?.deadline" class="mb-6">
            <div x-data="deadlineManager(null)" 
                 x-effect="setDeadline(document?.deadline)"
                 :class="getDeadlineColor()" 
                 class="p-4 rounded-lg border flex items-center justify-between">
                <div class="flex items-center gap-3">
                    <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                        <div class="font-semibold">
                            <span x-show="!isOverdue">Batas Waktu:</span>
                            <span x-show="isOverdue">Melewati Batas Waktu!</span>
                        </div>
                        <div class="text-sm" x-text="formatDeadlineDate()"></div>
                    </div>
                </div>
                <div class="text-right">
                    <div class="font-bold" x-text="timeRemaining"></div>
                    <div class="text-xs" x-show="!isOverdue">tersisa</div>
                </div>
            </div>
        </div>

        <!-- Main Grid -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <!-- Left Column: Timeline & Approvals -->
            <div class="lg:col-span-2 space-y-6">
                <!-- Approval Workflow -->
                <div x-show="document?.approvals && document.approvals.length > 0" class="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                    <h2 class="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                        <svg class="w-5 h-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Alur Persetujuan
                    </h2>
                    <div x-data="approvalWorkflow('{{ $documentId }}', document?.author_id === currentUser?.id)" x-init="init()">
                        <!-- Progress Bar -->
                        <div class="mb-6">
                            <div class="flex justify-between text-sm mb-2">
                                <span class="text-slate-600">Progress</span>
                                <span class="font-semibold text-indigo-600" x-text="getProgressPercentage() + '%'"></span>
                            </div>
                            <div class="w-full bg-slate-200 rounded-full h-2">
                                <div class="bg-indigo-600 h-2 rounded-full transition-all duration-500" :style="'width: ' + getProgressPercentage() + '%'"></div>
                            </div>
                        </div>

                        <!-- Approval Steps -->
                        <div class="space-y-3">
                            <template x-for="(approval, index) in approvals" :key="approval.id">
                                <div class="flex items-start gap-4 p-4 rounded-lg border" :class="getStatusColor(approval.status)">
                                    <div class="flex-shrink-0">
                                        <div class="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm" :class="approval.status === 'approved' ? 'bg-emerald-600 text-white' : approval.status === 'rejected' ? 'bg-red-600 text-white' : 'bg-white'">
                                            <span x-text="index + 1"></span>
                                        </div>
                                    </div>
                                    <div class="flex-1">
                                        <div class="font-semibold text-sm mb-1">
                                            <span x-text="approval.approver_name || approval.approver_position || 'Menunggu Assignment'"></span>
                                        </div>
                                        <div class="text-xs text-slate-600 mb-2">
                                            <span x-text="getStatusLabel(approval.status)"></span>
                                            <span x-show="approval.approved_at"> • <span x-text="new Date(approval.approved_at).toLocaleDateString('id-ID')"></span></span>
                                        </div>
                                        <div x-show="approval.notes" class="text-xs bg-white/50 p-2 rounded">
                                            <span x-text="approval.notes"></span>
                                        </div>
                                    </div>
                                    <div x-show="canApprove(approval)" class="flex gap-2">
                                        <button @click="openApproveModal(approval)" class="px-3 py-1 bg-emerald-600 text-white rounded-lg text-xs font-medium hover:bg-emerald-700">
                                            Setuju
                                        </button>
                                        <button @click="openRejectModal(approval)" class="px-3 py-1 bg-red-600 text-white rounded-lg text-xs font-medium hover:bg-red-700">
                                            Tolak
                                        </button>
                                    </div>
                                </div>
                            </template>
                        </div>

                        <!-- Approve Modal -->
                        <div x-show="showApproveModal" x-cloak class="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
                            <div @click.away="showApproveModal = false" class="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
                                <h3 class="text-xl font-bold mb-4">Setujui Dokumen</h3>
                                <textarea x-model="notes" placeholder="Catatan (opsional)" class="w-full p-3 border rounded-lg mb-4" rows="3"></textarea>
                                <div class="flex gap-3">
                                    <button @click="showApproveModal = false" class="flex-1 py-2 bg-slate-100 rounded-lg">Batal</button>
                                    <button @click="confirmApprove()" class="flex-1 py-2 bg-emerald-600 text-white rounded-lg">Setujui</button>
                                </div>
                            </div>
                        </div>

                        <!-- Reject Modal -->
                        <div x-show="showRejectModal" x-cloak class="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
                            <div @click.away="showRejectModal = false" class="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
                                <h3 class="text-xl font-bold mb-4">Tolak Dokumen</h3>
                                <textarea x-model="notes" placeholder="Alasan penolakan (wajib)" class="w-full p-3 border rounded-lg mb-4" rows="3" required></textarea>
                                <div class="flex gap-3">
                                    <button @click="showRejectModal = false" class="flex-1 py-2 bg-slate-100 rounded-lg">Batal</button>
                                    <button @click="confirmReject()" class="flex-1 py-2 bg-red-600 text-white rounded-lg">Tolak</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- History & Versions -->
                <div class="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    <div x-data="documentHistory('{{ $documentId }}')" x-init="init()">
                        <!-- Header with Tabs -->
                        <div class="border-b border-slate-200">
                            <div class="flex">
                                <button @click="activeTab = 'logs'" 
                                        class="flex-1 px-6 py-4 text-sm font-bold text-center border-b-2 transition-colors duration-200"
                                        :class="activeTab === 'logs' ? 'border-indigo-600 text-indigo-600 bg-indigo-50/50' : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'">
                                    <span class="flex items-center justify-center gap-2">
                                        <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                        Riwayat Pengiriman
                                    </span>
                                </button>
                                <button @click="activeTab = 'versions'" 
                                        class="flex-1 px-6 py-4 text-sm font-bold text-center border-b-2 transition-colors duration-200"
                                        :class="activeTab === 'versions' ? 'border-indigo-600 text-indigo-600 bg-indigo-50/50' : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'">
                                    <span class="flex items-center justify-center gap-2">
                                        <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                                        Versi Dokumen
                                    </span>
                                </button>
                            </div>
                        </div>

                        <div class="p-6">
                            <!-- Tab: Logs -->
                            <div x-show="activeTab === 'logs'">
                                <div x-show="loadingLogs" class="text-center py-8 text-slate-500">Memuat riwayat...</div>
                                <div x-show="errorLogs" class="text-center py-8 text-red-600" x-text="errorLogs"></div>
                                
                                <div x-show="!loadingLogs && !errorLogs" class="relative">
                                    <!-- Timeline Line -->
                                    <div class="absolute left-5 top-4 bottom-4 w-0.5 bg-gradient-to-b from-indigo-200 via-slate-200 to-transparent"></div>
                                    
                                    <!-- Timeline Items -->
                                    <div class="space-y-4">
                                        <template x-for="log in logs" :key="log.id">
                                            <div class="relative pl-14">
                                                <!-- Icon -->
                                                <div class="absolute left-0 w-10 h-10 rounded-full flex items-center justify-center shadow-md border-2 border-white" :class="getActionColor(log.action)">
                                                    <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                                                        <path stroke-linecap="round" stroke-linejoin="round" :d="getActionIcon(log.action)" />
                                                    </svg>
                                                </div>
                                                
                                                <!-- Content -->
                                                <div class="bg-white rounded-xl p-5 border-2 border-slate-100 hover:border-indigo-100 hover:shadow-md transition-all duration-200">
                                                    <div class="flex items-start justify-between mb-3">
                                                        <div class="flex-1">
                                                            <div class="flex items-center gap-2 mb-1">
                                                                <span class="font-bold text-slate-900 text-base" x-text="getActionLabel(log.action)"></span>
                                                                <span class="px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full text-xs font-mono font-semibold" x-text="'v' + log.version"></span>
                                                            </div>
                                                            <div class="flex items-center gap-2 text-sm">
                                                                <div class="flex items-center gap-1.5 text-slate-700">
                                                                    <svg class="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                                    </svg>
                                                                    <span class="font-medium" x-text="log.user_name"></span>
                                                                </div>
                                                                <span x-show="log.user_position" class="px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded-md text-xs font-semibold uppercase tracking-wide" x-text="log.user_position"></span>
                                                                
                                                                <!-- Group Info -->
                                                                <span x-show="log.metadata?.group || log.user?.group_name" 
                                                                      class="flex items-center gap-1 text-slate-500 text-xs border-l border-slate-300 pl-2 ml-1">
                                                                    <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                                                    </svg>
                                                                    <span x-text="log.metadata?.group || log.user?.group_name"></span>
                                                                </span>
                                                            </div>
                                                        </div>
                                                        <div class="flex items-center gap-1.5 text-xs text-slate-500 bg-slate-50 px-3 py-1.5 rounded-lg">
                                                            <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                            </svg>
                                                            <span x-text="formatDate(log.created_at)"></span>
                                                        </div>
                                                    </div>
                                                    <div x-show="log.notes" class="text-sm text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100 leading-relaxed" x-text="log.notes"></div>
                                                    
                                                    <!-- Changes Detail -->
                                                    <template x-if="log.changes && log.changes !== 'Penyimpanan otomatis.'">
                                                        <div class="mt-3 p-3 bg-blue-50/50 border border-blue-100 rounded-lg">
                                                            <div class="text-xs font-bold text-blue-700 mb-1 flex items-center gap-1">
                                                                <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                                                Detail Perubahan
                                                            </div>
                                                            <p class="text-xs text-slate-600 whitespace-pre-line leading-relaxed italic" x-text="log.changes"></p>
                                                        </div>
                                                    </template>

                                                    <div x-show="log.status_from && log.status_to" class="mt-3 flex items-center gap-2 text-xs">
                                                        <span class="text-slate-500">Perubahan Status:</span>
                                                        <span class="px-2 py-1 bg-slate-100 text-slate-700 rounded font-semibold" x-text="log.status_from"></span>
                                                        <svg class="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                                        </svg>
                                                        <span class="px-2 py-1 bg-indigo-100 text-indigo-700 rounded font-semibold" x-text="log.status_to"></span>
                                                    </div>
                                                </div>
                                            </div>
                                        </template>
                                    </div>
                                </div>
                            </div>

                            <!-- Tab: Versions -->
                            <div x-show="activeTab === 'versions'" style="display: none;">
                                <div x-show="loadingVersions" class="text-center py-8 text-slate-500">Memuat versi...</div>
                                <div x-show="errorVersions" class="text-center py-8 text-red-600" x-text="errorVersions"></div>

                                <div x-show="!loadingVersions && versions.length === 0" class="text-center py-8 text-slate-500">Belum ada riwayat versi.</div>

                                <div x-show="!loadingVersions && versions.length > 0" class="space-y-4">
                                    <template x-for="ver in versions" :key="ver.id">
                                        <div class="bg-white p-4 rounded-xl border border-slate-200 hover:border-indigo-200 hover:shadow-sm transition-all">
                                            <div class="flex justify-between items-start mb-3">
                                                <div class="flex items-center gap-3">
                                                    <span class="px-3 py-1 rounded-lg text-xs font-bold bg-blue-50 text-blue-600 border border-blue-100" x-text="'v' + ver.version_number"></span>
                                                    <div class="flex flex-col">
                                                        <span class="text-xs text-slate-400">Diperbarui pada</span>
                                                        <span class="text-sm font-semibold text-slate-700" x-text="formatDate(ver.created_at)"></span>
                                                    </div>
                                                </div>
                                                <div x-show="canRestore()" class="ml-4">
                                                    <button 
                                                        @click="restoreVersion(ver.id)" 
                                                        class="text-xs px-3 py-1.5 bg-white border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 hover:text-indigo-600 transition-colors flex items-center gap-1"
                                                    >
                                                        <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                                                        Pulihkan
                                                    </button>
                                                </div>
                                            </div>
                                            
                                            <div class="bg-slate-50 p-3 rounded-lg border border-slate-100 mb-2">
                                                <p class="text-sm text-slate-600 italic whitespace-pre-line leading-relaxed" x-text="ver.change_summary || 'Tidak ada detail perubahan.'"></p>
                                            </div>

                                            <div class="flex items-center gap-2 text-xs text-slate-500">
                                                <div class="w-5 h-5 rounded-full bg-slate-200 flex items-center justify-center font-bold text-[10px] text-slate-600">
                                                    <span x-text="ver.updater ? ver.updater.name.charAt(0) : 'S'"></span>
                                                </div>
                                                <span>Diperbarui oleh <span class="font-semibold" x-text="ver.updater ? ver.updater.name : 'System'"></span></span>
                                            </div>
                                        </div>
                                    </template>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Right Column: Read Receipts & Info -->
            <div class="space-y-6">
                <!-- Read Receipts -->
                <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                    <h2 class="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                        <svg class="w-5 h-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        Dibaca Oleh
                    </h2>
                    <div x-data="readReceiptTracker('{{ $documentId }}')" x-init="init()">
                        <div x-show="loading" class="text-center py-4 text-slate-500 text-sm">Memuat...</div>
                        <div x-show="!loading && receipts.length === 0" class="text-center py-4 text-slate-400 text-sm">
                            Belum ada yang membaca
                        </div>
                        <div x-show="!loading && receipts.length > 0" class="space-y-3">
                            <template x-for="receipt in receipts" :key="receipt.id">
                                <div class="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                                    <div class="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-sm">
                                        <span x-text="getInitials(receipt.user?.name)"></span>
                                    </div>
                                    <div class="flex-1 min-w-0">
                                        <div class="font-semibold text-sm text-slate-900 truncate" x-text="receipt.user?.name"></div>
                                        <div class="text-xs" :class="getPositionBadgeColor(receipt.user_position)">
                                            <span x-text="getPositionLabel(receipt.user_position)"></span>
                                        </div>
                                        <div class="text-xs text-slate-500 mt-1" x-text="formatDate(receipt.read_at)"></div>
                                    </div>
                                </div>
                            </template>
                        </div>
                    </div>
                </div>

                <!-- Document Info -->
                <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                    <h2 class="text-lg font-bold text-slate-900 mb-4">Informasi Dokumen</h2>
                    <div class="space-y-3 text-sm">
                        <div>
                            <div class="text-slate-500 mb-1">Nomor Dokumen</div>
                            <div class="font-mono font-semibold" x-text="document?.content_data?.docNumber || '-'"></div>
                        </div>
                        <div x-show="document?.folder">
                            <div class="text-slate-500 mb-1">Folder</div>
                            <div class="font-semibold" x-text="document?.folder?.name || '-'"></div>
                        </div>
                        <div>
                            <div class="text-slate-500 mb-1">Dibuat</div>
                            <div x-text="formatDate(document?.created_at)"></div>
                        </div>
                        <div>
                            <div class="text-slate-500 mb-1">Terakhir Diubah</div>
                            <div x-text="formatDate(document?.updated_at)"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>

<script>
function documentHistory(documentId) {
    return {
        activeTab: 'logs',
        logs: [],
        versions: [],
        loadingLogs: false,
        loadingVersions: false,
        errorLogs: null,
        errorVersions: null,
        currentUser: null,

        async init() {
            const userData = localStorage.getItem('dof_user');
            if (userData) {
                this.currentUser = JSON.parse(userData);
            }
            this.loadLogs();
            this.loadVersions();

            // Listen for global document updates to refresh history
            window.addEventListener('document-updated', () => {
                this.loadLogs();
                this.loadVersions();
            });
        },

        async loadLogs() {
            this.loadingLogs = true;
            this.errorLogs = null;
            try {
                const token = localStorage.getItem('dof_token');
                const response = await fetch(`/api/documents/${documentId}/logs`, {
                    headers: { 'Authorization': 'Bearer ' + token, 'Accept': 'application/json' }
                });
                if (response.ok) this.logs = await response.json();
                else this.errorLogs = 'Gagal memuat riwayat dokumen';
            } catch (error) {
                console.error('Error loading logs:', error);
                this.errorLogs = 'Terjadi kesalahan saat memuat riwayat';
            } finally {
                this.loadingLogs = false;
            }
        },

        async loadVersions() {
            this.loadingVersions = true;
            this.errorVersions = null;
            try {
                const token = localStorage.getItem('dof_token');
                const response = await fetch(`/api/documents/${documentId}/versions`, {
                    headers: { 'Authorization': 'Bearer ' + token, 'Accept': 'application/json' }
                });
                if (response.ok) this.versions = await response.json();
                else this.errorVersions = 'Gagal memuat versi dokumen';
            } catch (error) {
                console.error('Error loading versions:', error);
                this.errorVersions = 'Terjadi kesalahan saat memuat versi';
            } finally {
                this.loadingVersions = false;
            }
        },

        async restoreVersion(versionId) {
            if (!confirm('Apakah Anda yakin ingin mengembalikan dokumen ke versi ini? Perubahan saat ini akan tersimpan sebagai versi baru.')) return;

            try {
                const token = localStorage.getItem('dof_token');
                const response = await fetch(`/api/documents/${documentId}/versions/${versionId}/restore`, {
                    method: 'POST',
                    headers: { 'Authorization': 'Bearer ' + token, 'Accept': 'application/json' }
                });
                
                if (response.ok) {
                    alert('Dokumen berhasil dipulihkan!');
                    window.location.reload();
                } else {
                    alert('Gagal memulihkan versi.');
                }
            } catch (e) {
                console.error(e);
                alert('Terjadi kesalahan saat memulihkan versi.');
            }
        },
        
        canRestore() {
            // Simplified permission check: only if user is logged in. 
            // In a real app, you might want to check if they are the author or admin.
            // But the backend will enforce security anyway.
            return this.currentUser && (this.currentUser.role === 'admin' || this.currentUser.role === 'user');
        },

        formatDate(isoString) {
            if (!isoString) return '-';
            const date = new Date(isoString);
            return date.toLocaleDateString('id-ID', {
                day: '2-digit', month: 'long', year: 'numeric',
                hour: '2-digit', minute: '2-digit'
            });
        },

        getActionIcon(action) {
            const icons = {
                created: 'M12 4v16m8-8H4',
                sent: 'M12 19l9 2-9-18-9 18 9-2zm0 0v-8',
                received: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
                approved: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
                rejected: 'M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z',
                revised: 'M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15',
                updated: 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z'
            };
            return icons[action] || icons.updated;
        },

        getActionColor(action) {
            const colors = {
                created: 'bg-blue-100 text-blue-600',
                sent: 'bg-sky-100 text-sky-600',
                received: 'bg-violet-100 text-violet-600',
                approved: 'bg-emerald-100 text-emerald-600',
                rejected: 'bg-red-100 text-red-600',
                revised: 'bg-amber-100 text-amber-600',
                updated: 'bg-slate-100 text-slate-600'
            };
            return colors[action] || colors.updated;
        },

        getActionLabel(action) {
            const labels = {
                created: 'Dibuat',
                sent: 'Dikirim',
                received: 'Diterima',
                approved: 'Disetujui',
                rejected: 'Ditolak',
                revised: 'Direvisi',
                updated: 'Diperbarui'
            };
            return labels[action] || 'Aktivitas';
        }
    }
}

function documentDetailApp() {
    return {
        document: null,
        currentUser: null,
        loading: true,
        documentId: '{{ $documentId }}',

        async init() {
            const userData = localStorage.getItem('dof_user');
            const token = localStorage.getItem('dof_token');
            
            if (!userData || !token) {
                window.location.href = '/login';
                return;
            }

            this.currentUser = JSON.parse(userData);
            await this.loadDocument();

            // Listen for updates
            window.addEventListener('document-updated', () => {
                this.loadDocument();
            });
        },

        async loadDocument() {
            try {
                const token = localStorage.getItem('dof_token');
                const response = await fetch(`/api/documents/${this.documentId}`, {
                    headers: {
                        'Authorization': 'Bearer ' + token,
                        'Accept': 'application/json'
                    }
                });

                if (response.ok) {
                    this.document = await response.json();
                } else if (response.status === 401) {
                    window.location.href = '/login';
                } else {
                    alert('Gagal memuat dokumen');
                }
            } catch (error) {
                console.error('Error loading document:', error);
                alert('Terjadi kesalahan saat memuat dokumen');
            } finally {
                this.loading = false;
            }
        },

        formatDate(isoString) {
            if (!isoString) return '-';
            const date = new Date(isoString);
            return date.toLocaleDateString('id-ID', {
                day: '2-digit',
                month: 'long',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        },

        getStatusClass(status) {
            const classes = {
                draft: 'bg-slate-100 text-slate-700 border-slate-200',
                pending_review: 'bg-amber-100 text-amber-700 border-amber-200',
                needs_revision: 'bg-red-100 text-red-700 border-red-200',
                approved: 'bg-emerald-100 text-emerald-700 border-emerald-200',
                sent: 'bg-sky-100 text-sky-700 border-sky-200',
                received: 'bg-violet-100 text-violet-700 border-violet-200'
            };
            return classes[status] || classes.draft;
        },

        getStatusLabel(status) {
            const labels = {
                draft: 'Draft',
                pending_review: 'Menunggu Review',
                needs_revision: 'Perlu Revisi',
                approved: 'Disetujui',
                sent: 'Terkirim',
                received: 'Diterima'
            };
            return labels[status] || 'Unknown';
        }
    }
}
</script>
@endsection
