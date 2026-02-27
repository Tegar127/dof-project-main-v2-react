@extends('layouts.app')

@section('title', 'ASABRI Document Generator')

@section('content')
<div class="flex flex-col lg:flex-row h-screen overflow-hidden">
    
    <!-- Sidebar Input -->
    <div class="w-full lg:w-1/3 bg-white p-0 flex flex-col border-r border-gray-200 shadow-lg z-10 h-full">
        
        <!-- Tab Navigation -->
        <div class="flex p-4 bg-gray-50 border-b gap-2">
            <button id="tabNota" class="flex-1 py-2 px-3 rounded font-bold border transition tab-active text-xs">Nota Dinas</button>
            <button id="tabSppd" class="flex-1 py-2 px-3 rounded font-bold border transition tab-inactive text-xs">SURAT PERINTAH PERJALANAN DINAS</button>
            <button id="tabPerj" class="flex-1 py-2 px-3 rounded font-bold border transition tab-inactive text-xs">Perjanjian</button>
        </div>

        <!-- Form Content -->
        <div class="p-6 overflow-y-auto flex-grow">
            <h2 class="text-xl font-bold mb-4 text-gray-800 border-b pb-2">Input Data</h2>
            
            <form id="mainForm" class="space-y-4">
                
                <div class="space-y-2">
                    <label class="block text-sm font-medium text-gray-700">Nomor Dokumen</label>
                    <input type="text" id="docNumber" class="w-full p-2 border border-gray-300 rounded" placeholder=".../...">
                </div>

                <!-- Nota Dinas Inputs -->
                <div id="inputsNota" class="space-y-4">
                    <div class="grid grid-cols-1 gap-4">
                        <input type="text" id="notaTo" class="w-full p-2 border border-gray-300 rounded" placeholder="Kepada (Yth...)">
                        <input type="text" id="notaFrom" class="w-full p-2 border border-gray-300 rounded" placeholder="Dari">
                        <input type="text" id="notaAtt" class="w-full p-2 border border-gray-300 rounded" placeholder="Lampiran">
                        <textarea id="notaSubject" rows="2" class="w-full p-2 border border-gray-300 rounded" placeholder="Hal / Perihal"></textarea>
                    </div>

                    <hr class="border-gray-200">
                    <label class="block text-sm font-medium text-gray-700">Berdasarkan (Poin)</label>
                    <div id="notaBasisContainer" class="space-y-2">
                        <div class="flex gap-2 item-row"><input type="text" class="nota-basis-input w-full p-2 border border-gray-300 rounded" placeholder="Poin..."></div>
                    </div>
                    <button type="button" id="btnAddNotaBasis" class="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded hover:bg-blue-100">+ Tambah Poin</button>

                    <label class="block text-sm font-medium text-gray-700 mt-2">Isi Paragraf</label>
                    <textarea id="notaContent" rows="4" class="w-full p-2 border border-gray-300 rounded" placeholder="Sehubungan dengan..."></textarea>

                    <div class="grid grid-cols-2 gap-2">
                        <input type="text" id="notaLoc" class="w-full p-2 border border-gray-300 rounded" placeholder="Lokasi (Jakarta)">
                        <input type="date" id="notaDate" class="w-full p-2 border border-gray-300 rounded">
                    </div>
                    <input type="text" id="notaPos" class="w-full p-2 border border-gray-300 rounded" placeholder="Jabatan">
                    <input type="text" id="notaDiv" class="w-full p-2 border border-gray-300 rounded" placeholder="Divisi">
                    <input type="text" id="notaName" class="w-full p-2 border border-gray-300 rounded" placeholder="Nama Penandatangan">
                </div>

                <!-- SPPD Inputs -->
                <div id="inputsSppd" class="hidden space-y-4">
                    
                    <div>
                        <label class="block text-sm font-medium text-gray-700">Menimbang</label>
                        <textarea id="sppdWeigh" rows="3" class="w-full p-2 border border-gray-300 rounded" placeholder="bahwa dalam rangka..."></textarea>
                    </div>

                    <div>
                        <label class="block text-sm font-medium text-gray-700">Mengingat (List)</label>
                        <div id="sppdRememberContainer" class="space-y-2">
                            <div class="flex gap-2 item-row"><input type="text" class="sppd-rem-input w-full p-2 border border-gray-300 rounded" placeholder="Peraturan..."></div>
                        </div>
                        <button type="button" id="btnAddSppdRemember" class="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded hover:bg-blue-100">+ Tambah</button>
                    </div>

                    <hr class="border-gray-200">
                    <input type="text" id="sppdTo" class="w-full p-2 border border-gray-300 rounded" placeholder="Kepada (Nama & Jabatan)">

                    <div class="bg-gray-50 p-3 rounded border border-gray-200">
                        <label class="block text-sm font-bold text-gray-700 mb-2">Detail Perintah (Untuk)</label>
                        
                        <label class="text-xs text-gray-500">Poin 1: Kegiatan</label>
                        <input type="text" id="sppdTask" class="w-full p-2 border border-gray-300 rounded mb-2" placeholder="Melaksanakan kegiatan...">
                        
                        <label class="text-xs text-gray-500">Poin 2: Detail Perjalanan</label>
                        <div class="grid grid-cols-2 gap-2 mb-2">
                            <input type="text" id="sppdDest" class="p-2 border border-gray-300 rounded" placeholder="Tujuan (Denpasar)">
                            <input type="text" id="sppdTransport" class="p-2 border border-gray-300 rounded" placeholder="Pesawat Udara">
                        </div>
                        <div class="grid grid-cols-2 gap-2 mb-2">
                            <div><span class="text-xs">Berangkat</span><input type="date" id="sppdDateGo" class="w-full p-2 border border-gray-300 rounded"></div>
                            <div><span class="text-xs">Kembali</span><input type="date" id="sppdDateBack" class="w-full p-2 border border-gray-300 rounded"></div>
                        </div>

                        <label class="text-xs text-gray-500">Poin 3, 4, 5 (Standar/Edit)</label>
                        <textarea id="sppdFunding" rows="2" class="w-full p-2 border border-gray-300 rounded mb-1" placeholder="Biaya dibebankan..."></textarea>
                        <textarea id="sppdReport" rows="2" class="w-full p-2 border border-gray-300 rounded mb-1" placeholder="Melaporkan pelaksanaan..."></textarea>
                        <textarea id="sppdClose" rows="1" class="w-full p-2 border border-gray-300 rounded" placeholder="Melaksanakan dengan tanggung jawab."></textarea>
                    </div>

                    <div class="grid grid-cols-2 gap-2">
                        <input type="text" id="sppdLoc" class="w-full p-2 border border-gray-300 rounded" placeholder="Lokasi">
                        <input type="date" id="sppdSignDate" class="w-full p-2 border border-gray-300 rounded">
                    </div>
                    <input type="text" id="sppdSignPos" class="w-full p-2 border border-gray-300 rounded" placeholder="DIREKTUR UTAMA">
                    <input type="text" id="sppdSignName" class="w-full p-2 border border-gray-300 rounded" placeholder="Nama Penandatangan">

                    <div>
                        <label class="block text-sm font-medium text-gray-700">Tembusan</label>
                        <div id="sppdCCContainer" class="space-y-2">
                            <div class="flex gap-2 item-row"><input type="text" class="sppd-cc-input w-full p-2 border border-gray-300 rounded" placeholder="Direksi..."></div>
                        </div>
                        <button type="button" id="btnAddSppdCC" class="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded hover:bg-blue-100">+ Tambah</button>
                    </div>

                </div>

                <!-- Perjanjian Inputs -->
                <div id="inputsPerj" class="hidden space-y-4">
                    <div class="space-y-2">
                        <label class="block text-sm font-bold text-gray-700 uppercase">Judul & Tentang</label>
                        <textarea id="perjAbout" rows="3" class="w-full p-2 border border-gray-300 rounded" placeholder="TENTANG SEWA MENYEWA..."></textarea>
                    </div>

                    <div class="bg-amber-50 p-3 rounded border border-amber-200 space-y-2">
                        <label class="block text-sm font-bold text-amber-800">Waktu & Tempat</label>
                        <div class="grid grid-cols-2 gap-2">
                            <input type="text" id="perjDay" class="w-full p-2 border border-gray-300 rounded" placeholder="Hari (Senin)">
                            <input type="text" id="perjDateWritten" class="w-full p-2 border border-gray-300 rounded" placeholder="Tanggal Teks (sembilan belas...)">
                        </div>
                        <input type="text" id="perjPlace" class="w-full p-2 border border-gray-300 rounded" placeholder="Tempat (Jakarta)">
                    </div>

                    <div class="space-y-2">
                        <label class="block text-sm font-bold text-gray-700 uppercase">Pihak Kesatu (ASABRI)</label>
                        <input type="text" id="perjP1Name" class="w-full p-2 border border-gray-300 rounded mb-1" placeholder="Nama Penandatangan (Hari Murti)">
                        <input type="text" id="perjP1Pos" class="w-full p-2 border border-gray-300 rounded mb-1" placeholder="Jabatan">
                        <textarea id="perjP1Auth" rows="3" class="w-full p-2 border border-gray-300 rounded" placeholder="Berdasarkan Surat Kuasa..."></textarea>
                    </div>

                    <div class="space-y-2">
                        <label class="block text-sm font-bold text-gray-700 uppercase">Pihak Kedua</label>
                        <input type="text" id="perjP2Name" class="w-full p-2 border border-gray-300 rounded mb-1" placeholder="Nama Pihak Kedua">
                        <textarea id="perjP2Info" rows="3" class="w-full p-2 border border-gray-300 rounded" placeholder="Lahir di..., Alamat..., NIK..."></textarea>
                    </div>

                    <div>
                        <label class="block text-sm font-medium text-gray-700 font-bold">Poin-poin Perjanjian (A, B...)</label>
                        <div id="perjPointsContainer" class="space-y-2">
                            <div class="flex gap-2 item-row">
                                <span class="pt-2 font-bold text-gray-400">#</span>
                                <textarea class="perj-point-input w-full p-2 border border-gray-300 rounded" rows="2" placeholder="Bahwa Pihak Kesatu adalah..."></textarea>
                            </div>
                        </div>
                        <button type="button" id="btnAddPerjPoint" class="text-xs bg-amber-50 text-amber-600 px-2 py-1 rounded hover:bg-amber-100 mt-2">+ Tambah Poin</button>
                    </div>

                    <div>
                        <label class="block text-sm font-medium text-gray-700 font-bold">Tabel Paraf</label>
                        <div id="perjParafContainer" class="space-y-2">
                            <!-- Injected by JS -->
                        </div>
                        <button type="button" id="btnAddPerjParaf" class="text-xs bg-amber-50 text-amber-600 px-2 py-1 rounded hover:bg-amber-100 mt-2">+ Tambah Baris Paraf</button>
                    </div>
                </div>
            </form>
        </div>

        <!-- Actions -->
        <div class="p-4 bg-white border-t border-gray-200 flex flex-col gap-2">
            <button id="btnDownload" class="w-full bg-blue-600 text-white py-3 rounded font-bold hover:bg-blue-700 shadow flex justify-center items-center gap-2 cursor-pointer">
                <span>DOWNLOAD PDF</span>
            </button>
            <button id="btnReset" class="w-full bg-white text-gray-700 border border-gray-300 py-2 rounded font-bold hover:bg-gray-50 flex justify-center items-center gap-2 text-sm cursor-pointer">
                <span>RESET ALL</span>
            </button>
        </div>
    </div>

    <!-- Preview Area -->
    <div class="w-full lg:w-2/3 bg-gray-500 overflow-y-auto p-8 flex justify-center">
        
        <div id="paperContent" class="paper relative">
            
            <div class="flex items-center mb-2">
                <!-- Using local asset if available, otherwise fallback to URL but note CORS issue -->
                <img src="https://pensiun.asabri.co.id/resources/img/logo_asa.png" alt="ASABRI Logo" class="h-16 mb-2" crossorigin="anonymous">
            </div>

            <!-- Preview Nota -->
            <div id="previewNota">
                <div class="paper-header">
                    <h1 class="font-bold text-lg uppercase tracking-wide">NOTA DINAS</h1>
                    <p>NOMOR <span class="prev-docNum">...</span></p>
                </div>

                <table class="info-table w-full mb-6">
                    <tr><td width="100">Kepada</td><td width="20">:</td><td>Yth. <span id="prevNotaTo">...</span></td></tr>
                    <tr><td>Dari</td><td>:</td><td><span id="prevNotaFrom">...</span></td></tr>
                    <tr><td>Lampiran</td><td>:</td><td><span id="prevNotaAtt">...</span></td></tr>
                    <tr><td>Hal</td><td>:</td><td class="font-bold"><span id="prevNotaSubject">...</span></td></tr>
                </table>

                <div class="mb-4">
                    <p class="mb-2">Berdasarkan:</p>
                    <ol id="prevNotaBasisList" class="list-numbered text-justify"></ol>
                </div>

                <div class="mb-8 text-justify leading-relaxed">
                    <p id="prevNotaContent" style="white-space: pre-wrap;">...</p>
                </div>

                <p class="mb-8">Demikian disampaikan dan untuk dijadikan periksa.</p>

                <div class="signature-section">
                    <p class="mb-1"><span id="prevNotaLoc">...</span>, <span id="prevNotaDate">...</span></p>
                    <p class="font-bold uppercase mb-0"><span id="prevNotaPos">...</span></p>
                    <p class="font-bold uppercase mb-16"><span id="prevNotaDiv">...</span></p>
                    <p class="font-bold uppercase underline"><span id="prevNotaName">...</span></p>
                </div>

                <div style="clear: both;"></div>
            </div>

            <!-- Preview SPPD -->
            <div id="previewSppd" class="hidden">
                <div class="paper-header" style="margin-bottom: 30px;">
                    <h1 class="font-bold text-lg uppercase tracking-wide">SURAT PERINTAH PERJALANAN DINAS</h1>
                    <p>NOMOR <span class="prev-docNum">...</span></p>
                </div>

                <table class="sppd-table">
                    <tr>
                        <td class="sppd-label">Menimbang</td>
                        <td class="sppd-colon">:</td>
                        <td><span id="prevSppdWeigh">...</span></td>
                    </tr>
                </table>

                <table class="sppd-table">
                    <tr>
                        <td class="sppd-label">Mengingat</td>
                        <td class="sppd-colon">:</td>
                        <td>
                            <ol id="prevSppdRememberList" class="list-numbered" style="margin-top: 0; margin-bottom: 0; padding-left: 15px;"></ol>
                        </td>
                    </tr>
                </table>

                <div class="text-center font-bold my-6">Memberi Perintah</div>

                <table class="sppd-table">
                    <tr>
                        <td class="sppd-label">Kepada</td>
                        <td class="sppd-colon"></td>
                        <td class="font-bold"><span id="prevSppdTo">...</span></td>
                    </tr>
                </table>

                <table class="sppd-table">
                    <tr>
                        <td class="sppd-label">Untuk</td>
                        <td class="sppd-colon">:</td>
                        <td>
                            <ol class="list-numbered" style="margin-top: 0; padding-left: 15px;">
                                <li class="mb-2"><span id="prevSppdTask">...</span></li>
                                
                                <li class="mb-2">
                                    Perjalanan dinas dilaksanakan, sebagai berikut:
                                    <table class="sub-table w-full mt-1">
                                        <tr><td width="100">Tujuan</td><td width="10">:</td><td><span id="prevSppdDest">...</span></td></tr>
                                        <tr><td>Berangkat</td><td>:</td><td><span id="prevSppdDateGo">...</span></td></tr>
                                        <tr><td>Kembali</td><td>:</td><td><span id="prevSppdDateBack">...</span></td></tr>
                                        <tr><td>Transportasi</td><td>:</td><td><span id="prevSppdTransport">...</span></td></tr>
                                    </table>
                                </li>

                                <li class="mb-2 text-justify"><span id="prevSppdFunding">...</span></li>
                                <li class="mb-2 text-justify"><span id="prevSppdReport">...</span></li>
                                <li class="mb-2 text-justify"><span id="prevSppdClose">...</span></li>
                            </ol>
                        </td>
                    </tr>
                </table>

                <div class="signature-section">
                    <p class="mb-1">Dikeluarkan di <span id="prevSppdLoc">...</span></p>
                    <p class="mb-1">pada tanggal <span id="prevSppdSignDate">...</span></p>
                    <p class="font-bold uppercase mb-0">DIREKSI,</p>
                    <p class="font-bold uppercase mb-16"><span id="prevSppdSignPos">...</span></p>
                    <p class="font-bold uppercase underline"><span id="prevSppdSignName">...</span></p>
                </div>

                <div style="clear: both;"></div>
                
                                <div class="mt-8 text-sm">
                
                                    <p class="font-bold underline mb-1">Tembusan:</p>
                
                                    <ol id="prevSppdCCList" class="list-numbered" style="margin-left: 15px;"></ol>
                
                                </div>
                
                            </div>
                
                
                
                            <!-- Preview Perjanjian -->
                
                            <div id="previewPerj" class="hidden">
                
                                <div class="text-center font-bold mb-8 uppercase leading-tight">
                
                                    <p class="m-0">PERJANJIAN KERJA SAMA</p>
                
                                    <p class="m-0">ANTARA</p>
                
                                    <p class="m-0">PT ASABRI (PERSERO)</p>
                
                                    <p class="m-0">DENGAN</p>
                
                                    <p id="prevPerjP2NameTop" class="m-0">...</p>
                
                                    <p class="m-0">TENTANG</p>
                
                                    <p id="prevPerjAbout" class="m-0">...</p>
                
                                    <p class="m-0">NOMOR: <span class="prev-docNum">...</span></p>
                
                                </div>
                
                
                
                                <div class="text-justify leading-normal text-[12pt]">
                
                                    <p class="mb-4">
                
                                        Pada hari ini <span id="prevPerjDay" class="font-bold">...</span>, 
                
                                        tanggal <span id="prevPerjDateWritten" class="font-bold">...</span> 
                
                                        bertempat di <span id="prevPerjPlace">...</span>, 
                
                                        kami yang bertanda tangan di bawah ini:
                
                                    </p>
                
                
                
                                    <div class="flex mb-4 items-start">
                
                                        <div class="w-8 flex-shrink-0 font-bold">1.</div>
                
                                        <div class="flex-grow">
                
                                            <span class="font-bold">PT ASABRI (Persero)</span>, 
                
                                            suatu Perseroan Terbatas yang didirikan berdasarkan Hukum Negara Republik Indonesia, 
                
                                            yang berkedudukan di Jalan Mayjen Sutoyo Nomor 11 Jakarta Timur, dalam hal ini diwakili oleh 
                
                                            <span id="prevPerjP1Name" class="font-bold">...</span> 
                
                                            dalam jabatannya selaku <span id="prevPerjP1Pos" class="font-bold">...</span> 
                
                                            <span id="prevPerjP1Auth">...</span>, 
                
                                            untuk selanjutnya disebut <span class="font-bold">"Pihak Kesatu"</span>; dan
                
                                        </div>
                
                                    </div>
                
                
                
                                    <div class="flex mb-4 items-start">
                
                                        <div class="w-8 flex-shrink-0 font-bold">2.</div>
                
                                        <div class="flex-grow">
                
                                            <span id="prevPerjP2Name" class="font-bold">...</span>, 
                
                                            <span id="prevPerjP2Info">...</span>, 
                
                                            dan untuk selanjutnya disebut <span class="font-bold">"Pihak Kedua"</span>.
                
                                        </div>
                
                                    </div>
                
                
                
                                                        <p class="mb-4">Pihak Kesatu dan Pihak Kedua selanjutnya secara bersama-sama disebut sebagai <span class="font-bold">"Para Pihak"</span> dan masing-masing disebut <span class="font-bold">"Pihak"</span>, serta dalam kedudukannya sebagaimana tersebut di atas, terlebih dulu menerangkan hal-hal sebagai berikut:</p>
                
                
                
                                    
                
                
                
                                                        <div id="prevPerjPointsList" class="space-y-4">
                
                
                
                                                            <!-- Points A, B, etc will be injected here -->
                
                
                
                                                        </div>
                
                
                
                                    
                
                
                
                                                        <!-- Paraf Table Template -->
                
                
                
                                                        <div class="paraf-container">
                
                
                
                                                            <!-- Injected by JS -->
                
                
                
                                                        </div>
                
                
                
                                                    </div>
                
                
                
                                                </div>
                
                
                
                        </div>
                
                    </div>
</div>

<!-- Signature Modal for Create Page -->
<div id="signatureModal" class="fixed inset-0 z-[100] bg-black/50 hidden flex items-center justify-center p-4">
    <div class="bg-white rounded-xl shadow-lg max-w-lg w-full p-6">
        <h3 class="text-xl font-bold mb-1 text-slate-800">Tanda Tangan Paraf</h3>
        <p id="sigModalLabel" class="text-xs text-indigo-600 font-bold mb-4 uppercase tracking-wider"></p>

        <!-- Tabs -->
        <div class="flex border-b border-gray-200 mb-4">
            <button id="sigTabDraw" class="flex-1 py-2 text-sm font-medium border-b-2 border-indigo-600 text-indigo-600">Gambar Manual</button>
            <button id="sigTabUpload" class="flex-1 py-2 text-sm font-medium border-b-2 border-transparent text-gray-500 hover:text-gray-700">Upload Gambar</button>
        </div>
        
        <div id="sigDrawArea" class="border-2 border-dashed border-gray-300 rounded-lg bg-gray-50 relative h-64 w-full mb-4 overflow-hidden touch-none">
            <canvas id="sig-canvas" class="absolute inset-0 w-full h-full cursor-crosshair"></canvas>
        </div>

        <div id="sigUploadArea" class="hidden border-2 border-dashed border-gray-300 rounded-lg bg-gray-50 relative h-64 w-full mb-4 flex flex-col items-center justify-center p-4 text-center">
            <svg class="w-10 h-10 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
            <p class="text-sm text-gray-500 mb-4">Upload gambar (PNG/JPG)</p>
            <input type="file" id="sig-upload-input" accept="image/*" class="text-xs">
            <div id="sig-upload-preview" class="hidden mt-2 max-h-32 overflow-hidden">
                <img src="" class="max-h-32 mx-auto">
            </div>
        </div>

        <div class="flex gap-3">
            <button id="btnSigClear" class="px-4 py-2 text-red-600 hover:bg-red-50 rounded font-medium">Hapus</button>
            <div class="flex-1"></div>
            <button id="btnSigCancel" class="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded font-medium">Batal</button>
            <button id="btnSigSave" class="px-6 py-2 bg-indigo-600 text-white rounded font-medium hover:bg-indigo-700">Simpan</button>
        </div>
    </div>
</div>

@endsection
