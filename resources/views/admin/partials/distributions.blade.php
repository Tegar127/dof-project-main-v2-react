<div x-show="activeTab === 'distributions'" x-transition:enter="transition ease-out duration-300" x-transition:enter-start="opacity-0 translate-y-4" x-transition:enter-end="opacity-100 translate-y-0">
    
    <!-- 1. VIEW MODE: LIST -->
    <div x-show="distViewMode === 'list'" class="space-y-8">
        
        <!-- Header Section -->
        <div class="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm gap-6">
            <div class="space-y-1">
                <div class="flex items-center gap-2 text-indigo-600 font-bold text-xs uppercase tracking-widest">
                    <span class="w-2 h-2 rounded-full bg-indigo-600"></span>
                    Sistem Publikasi Dokumen
                </div>
                <h2 class="text-3xl font-bold text-slate-900 tracking-tight">Monitoring & Distribusi Final</h2>
                <p class="text-slate-500 font-medium text-sm">Pantau penyebaran dokumen dan kelola pengiriman baru dengan mudah.</p>
            </div>
            <button 
                @click="loadDistributions(); loadApprovedDocuments();" 
                class="flex items-center gap-3 px-6 py-3 bg-indigo-50 text-indigo-700 rounded-xl text-sm font-bold hover:bg-indigo-100 transition-all border border-indigo-100"
            >
                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Perbarui Data
            </button>
        </div>

        <!-- Monitoring Section -->
        <div class="space-y-6">
            <h3 class="text-lg font-bold text-slate-800 flex items-center gap-2 px-2">
                <svg class="w-5 h-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2-0 01-2-2z" />
                </svg>
                Riwayat Publikasi Final
            </h3>
            
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <template x-for="dist in finalizedDistributions" :key="dist.id">
                    <div class="bg-white rounded-[1.5rem] border border-slate-200 p-6 shadow-sm hover:border-indigo-300 transition-all group relative overflow-hidden">
                        <!-- Final Badge -->
                        <div class="absolute -right-10 top-5 rotate-45 bg-indigo-600 text-white text-[8px] font-black py-1 px-10 shadow-sm uppercase tracking-widest">FINAL</div>
                        
                        <div class="flex justify-between items-start mb-6">
                            <div class="w-12 h-12 bg-slate-50 text-slate-700 rounded-xl flex items-center justify-center border border-slate-100 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                                <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                            </div>
                            <div class="text-right">
                                <div class="text-2xl font-bold text-slate-900" x-text="dist.percentage + '%'"></div>
                                <div class="text-[10px] font-bold text-slate-400 uppercase">Dibaca</div>
                            </div>
                        </div>
                        
                        <div class="mb-6">
                            <h4 class="font-bold text-slate-900 text-base line-clamp-1" x-text="dist.title"></h4>
                            <p class="text-xs text-slate-500 mt-1 font-medium" x-text="'Oleh: ' + dist.author_name"></p>
                        </div>

                        <div class="space-y-2">
                            <div class="flex justify-between text-[11px] font-bold text-slate-500">
                                <span x-text="dist.read_count + ' / ' + dist.total_expected + ' Orang'"></span>
                            </div>
                            <div class="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                                <div class="bg-indigo-600 h-full rounded-full transition-all duration-1000" :style="'width: ' + dist.percentage + '%'"></div>
                            </div>
                        </div>
                        
                        <button 
                            @click="openDistributionDetails(dist.id)"
                            class="w-full mt-6 py-3 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-xl transition-all border border-slate-100"
                        >
                            Detail Penerima
                        </button>
                    </div>
                </template>
            </div>
        </div>

        <!-- Queue Section (Clean Light Version) -->
        <div class="bg-white rounded-[2rem] border border-slate-200 overflow-hidden shadow-sm">
            <div class="p-8 border-b border-slate-100 flex flex-col md:flex-row justify-between items-center gap-6 bg-slate-50/50">
                <div>
                    <h3 class="text-xl font-bold text-slate-900">Antrian Publikasi Baru</h3>
                    <p class="text-slate-500 text-sm mt-1 font-medium">Dokumen yang sudah disetujui & siap dipublikasikan.</p>
                </div>
                <div class="relative w-full md:w-80">
                    <input
                        type="text"
                        placeholder="Cari dokumen..."
                        class="w-full pl-11 pr-4 py-3 bg-white border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-medium"
                        x-model="searchApproved"
                    />
                    <svg class="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                </div>
            </div>

            <div class="overflow-x-auto">
                <table class="w-full text-left">
                    <thead>
                        <tr class="text-[11px] font-bold text-slate-500 uppercase tracking-wider bg-slate-50">
                            <th class="px-8 py-4">Judul Dokumen</th>
                            <th class="px-6 py-4">Author</th>
                            <th class="px-6 py-4">Tipe</th>
                            <th class="px-8 py-4 text-right">Aksi</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-100">
                        <template x-for="doc in filteredApprovedDocs" :key="doc.id">
                            <tr class="hover:bg-slate-50 transition-colors">
                                <td class="px-8 py-5">
                                    <div class="font-bold text-slate-900 text-sm" x-text="doc.title"></div>
                                    <div class="text-xs text-slate-400 font-mono mt-0.5" x-text="doc.content_data?.docNumber || 'No-Ref'"></div>
                                </td>
                                <td class="px-6 py-5">
                                    <div class="text-sm text-slate-700 font-medium" x-text="doc.author_name"></div>
                                </td>
                                <td class="px-6 py-5">
                                    <span class="px-3 py-1 bg-slate-100 text-slate-600 rounded-lg text-[10px] font-bold uppercase" x-text="doc.type"></span>
                                </td>
                                <td class="px-8 py-5 text-right">
                                    <button 
                                        @click="openDistributeModal(doc)"
                                        class="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white text-xs font-bold rounded-xl hover:bg-indigo-700 transition-all shadow-sm"
                                    >
                                        Publikasikan
                                    </button>
                                </td>
                            </tr>
                        </template>
                    </tbody>
                </table>
            </div>
        </div>
    </div>

    <!-- 2. VIEW MODE: DISTRIBUTE (Wizard Light) -->
    <div x-show="distViewMode === 'distribute'" class="max-w-4xl mx-auto" x-transition>
        <div class="bg-white rounded-[2rem] border border-slate-200 shadow-xl overflow-hidden">
            <div class="p-8 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                <div class="flex items-center gap-4">
                    <button @click="closeDistView()" class="p-2 hover:bg-white rounded-full transition-all border border-transparent hover:border-slate-200">
                        <svg class="w-6 h-6 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                    </button>
                    <div>
                        <h3 class="text-xl font-bold text-slate-900">Proses Pengiriman Final</h3>
                        <p class="text-sm text-slate-500 font-medium" x-text="selectedDocForDist?.title"></p>
                    </div>
                </div>
                <span class="px-4 py-1.5 bg-indigo-600 text-white rounded-full text-[10px] font-bold uppercase tracking-widest" x-text="selectedDocForDist?.type"></span>
            </div>
            
            <div class="p-10 space-y-10">
                <!-- Select Target -->
                <div class="space-y-4">
                    <div class="flex items-center gap-3">
                        <div class="w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center text-sm font-bold">1</div>
                        <h4 class="font-bold text-slate-800">Pilih Sasaran Penerima</h4>
                    </div>
                    
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <button @click="distributeForm.recipientType = 'all'" :class="distributeForm.recipientType === 'all' ? 'border-indigo-600 bg-indigo-50 text-indigo-700 shadow-sm' : 'border-slate-200 bg-white text-slate-500'" class="flex flex-col items-center p-6 border-2 rounded-2xl transition-all">
                            <svg class="w-8 h-8 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                            <span class="text-xs font-bold uppercase">Semua User</span>
                        </button>
                        <button @click="distributeForm.recipientType = 'group'" :class="distributeForm.recipientType === 'group' ? 'border-indigo-600 bg-indigo-50 text-indigo-700 shadow-sm' : 'border-slate-200 bg-white text-slate-500'" class="flex flex-col items-center p-6 border-2 rounded-2xl transition-all">
                            <svg class="w-8 h-8 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                            <span class="text-xs font-bold uppercase">Grup / Divisi</span>
                        </button>
                        <button @click="distributeForm.recipientType = 'user'" :class="distributeForm.recipientType === 'user' ? 'border-indigo-600 bg-indigo-50 text-indigo-700 shadow-sm' : 'border-slate-200 bg-white text-slate-500'" class="flex flex-col items-center p-6 border-2 rounded-2xl transition-all">
                            <svg class="w-8 h-8 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            <span class="text-xs font-bold uppercase">User Spesifik</span>
                        </button>
                    </div>

                    <div x-show="distributeForm.recipientType !== 'all'" x-transition class="pt-4">
                        <select x-model="distributeForm.recipientId" class="w-full p-4 bg-white border border-slate-300 rounded-xl text-sm font-bold text-slate-700 focus:border-indigo-500 outline-none shadow-sm">
                            <option value="">-- Pilih Target Penerima --</option>
                            <template x-if="distributeForm.recipientType === 'group'">
                                <template x-for="group in groups" :key="group.id">
                                    <option :value="group.id" x-text="group.name"></option>
                                </template>
                            </template>
                            <template x-if="distributeForm.recipientType === 'user'">
                                <template x-for="user in users" :key="user.id">
                                    <option :value="user.id" x-text="user.name + ' (' + (user.position || 'Staff').toUpperCase() + ')'"></option>
                                </template>
                            </template>
                        </select>
                    </div>
                </div>

                <!-- Add Note -->
                <div class="space-y-4">
                    <div class="flex items-center gap-3">
                        <div class="w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center text-sm font-bold">2</div>
                        <h4 class="font-bold text-slate-800">Catatan Distribusi</h4>
                    </div>
                    <textarea x-model="distributeForm.notes" class="w-full p-4 bg-white border border-slate-300 rounded-xl text-sm font-medium text-slate-700 focus:border-indigo-500 outline-none shadow-sm" rows="3" placeholder="Tulis instruksi atau catatan tambahan di sini..."></textarea>
                </div>

                <!-- Action -->
                <div class="flex gap-4 pt-6 border-t border-slate-100">
                    <button @click="confirmDistribute()" class="flex-1 py-4 bg-indigo-600 text-white font-bold text-sm rounded-xl hover:bg-indigo-700 transition-all shadow-md active:scale-95">
                        Konfirmasi & Kirim Sekarang
                    </button>
                    <button @click="closeDistView()" class="px-8 py-4 bg-white text-slate-500 font-bold text-sm rounded-xl hover:bg-slate-100 transition-all border border-slate-200">
                        Batal
                    </button>
                </div>
            </div>
        </div>
    </div>

    <!-- 3. VIEW MODE: DETAILS -->
    <div x-show="distViewMode === 'details'" class="space-y-6" x-transition>
        
        <div class="flex justify-between items-center bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <button @click="closeDistView()" class="flex items-center gap-2 text-slate-500 hover:text-indigo-600 font-bold text-xs uppercase transition-all">
                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Kembali
            </button>
            <div class="flex items-center gap-6">
                <div class="text-right">
                    <h4 class="font-bold text-slate-900" x-text="selectedDocDetails?.document?.title"></h4>
                    <p class="text-xs text-slate-500 font-medium">Laporan Keterbacaan Pegawai</p>
                </div>
            </div>
        </div>

        <div class="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
            <div class="overflow-x-auto">
                <table class="w-full text-left">
                    <thead>
                        <tr class="text-[11px] font-bold text-slate-500 uppercase tracking-wider bg-slate-50">
                            <th class="px-8 py-5">Nama Pegawai</th>
                            <th class="px-6 py-5">Jabatan</th>
                            <th class="px-6 py-5 text-center">Status</th>
                            <th class="px-8 py-5 text-right">Waktu Diakses</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-100">
                        <template x-for="rec in selectedDocDetails?.recipients" :key="rec.user_id">
                            <tr class="hover:bg-slate-50/50 transition-colors">
                                <td class="px-8 py-5">
                                    <div class="text-sm font-bold text-slate-900" x-text="rec.user_name"></div>
                                    <div class="text-[10px] text-slate-400 font-bold" x-text="'USER ID: ' + rec.user_id"></div>
                                </td>
                                <td class="px-6 py-5">
                                    <span class="text-xs text-slate-500 font-bold capitalize" x-text="rec.user_position || 'Staff'"></span>
                                </td>
                                <td class="px-6 py-5 text-center">
                                    <template x-if="rec.is_read">
                                        <span class="inline-flex px-3 py-1 bg-emerald-50 text-emerald-700 text-[10px] font-bold rounded-lg border border-emerald-100">
                                            SUDAH BACA
                                        </span>
                                    </template>
                                    <template x-if="!rec.is_read">
                                        <span class="inline-flex px-3 py-1 bg-slate-100 text-slate-400 text-[10px] font-bold rounded-lg">
                                            BELUM BACA
                                        </span>
                                    </template>
                                </td>
                                <td class="px-8 py-5 text-right text-xs text-slate-500 font-mono font-bold" x-text="rec.read_at ? formatDate(rec.read_at) : '---'"></td>
                            </tr>
                        </template>
                    </tbody>
                </table>
            </div>
        </div>
    </div>
</div>
