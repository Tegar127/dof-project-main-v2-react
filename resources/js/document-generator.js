import html2pdf from 'html2pdf.js';

document.addEventListener('DOMContentLoaded', () => {
    // State
    let currentTab = 'nota';

    // Elements
    const tabNota = document.getElementById('tabNota');
    const tabSppd = document.getElementById('tabSppd');
    const tabPerj = document.getElementById('tabPerj');
    const inputsNota = document.getElementById('inputsNota');
    const inputsSppd = document.getElementById('inputsSppd');
    const inputsPerj = document.getElementById('inputsPerj');
    const previewNota = document.getElementById('previewNota');
    const previewSppd = document.getElementById('previewSppd');
    const previewPerj = document.getElementById('previewPerj');
    
    // Signature State for Create Page
    let sigPad = null;
    let currentParafRow = null;
    const sigModal = document.getElementById('signatureModal');
    const sigCanvas = document.getElementById('sig-canvas');
    let sigMode = 'draw'; // draw or upload
    let uploadedSig = null;

    // Inputs that trigger updates
    const allInputs = document.querySelectorAll('input, textarea');

    // Init
    init();

    function init() {
        // Set default dates
        const today = new Date().toISOString().split('T')[0];
        const dateInputs = ['notaDate', 'sppdSignDate'];
        dateInputs.forEach(id => {
            const el = document.getElementById(id);
            if(el) el.value = today;
        });

        // Event Listeners
        tabNota?.addEventListener('click', () => switchTab('nota'));
        tabSppd?.addEventListener('click', () => switchTab('sppd'));
        tabPerj?.addEventListener('click', () => switchTab('perj'));
        
        document.getElementById('btnAddNotaBasis')?.addEventListener('click', () => addList('notaBasisContainer', 'nota-basis-input', 'prevNotaBasisList'));
        document.getElementById('btnAddSppdRemember')?.addEventListener('click', () => addList('sppdRememberContainer', 'sppd-rem-input', 'prevSppdRememberList'));
        document.getElementById('btnAddSppdCC')?.addEventListener('click', () => addList('sppdCCContainer', 'sppd-cc-input', 'prevSppdCCList'));
        
        document.getElementById('btnAddPerjPoint')?.addEventListener('click', () => addPerjPoint());
        document.getElementById('btnAddPerjParaf')?.addEventListener('click', () => addPerjParaf());

        initSigModal();

        document.getElementById('btnDownload')?.addEventListener('click', downloadPDF);
        document.getElementById('btnReset')?.addEventListener('click', resetForm);

        // Input listeners
        document.addEventListener('input', (e) => {
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
                updateAll();
            }
        });

        // Click listeners for dynamic signature buttons
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('btn-paraf-ttd')) {
                openSigModal(e.target.closest('.item-row'));
            }
        });

        // Initial update
        initParafTemplate();
        updateAll();
    }

    function initParafTemplate() {
        const container = document.getElementById('perjParafContainer');
        if (!container) return;

        container.innerHTML = ''; // Clear
        addPerjParaf(); // Add first empty dynamic row
    }

    function highlightParaf(index, active) {
        const el = document.getElementById(`paraf-cell-${index}`);
        if (el) {
            if (active) {
                el.style.backgroundColor = '#eef2ff'; // indigo-50
                el.style.outline = '2px solid #818cf8'; // indigo-400
                el.style.outlineOffset = '-2px';
            } else {
                el.style.backgroundColor = 'white';
                el.style.outline = 'none';
            }
        }
    }

    function initSigModal() {
        if (!sigCanvas) return;
        
        sigPad = new SignaturePad(sigCanvas, {
            backgroundColor: 'rgba(255, 255, 255, 0)',
            penColor: 'rgb(0, 0, 0)'
        });

        const btnDraw = document.getElementById('sigTabDraw');
        const btnUpload = document.getElementById('sigTabUpload');
        const drawArea = document.getElementById('sigDrawArea');
        const uploadArea = document.getElementById('sigUploadArea');

        btnDraw.onclick = () => {
            sigMode = 'draw';
            btnDraw.className = 'flex-1 py-2 text-sm font-medium border-b-2 border-indigo-600 text-indigo-600';
            btnUpload.className = 'flex-1 py-2 text-sm font-medium border-b-2 border-transparent text-gray-500 hover:text-gray-700';
            drawArea.classList.remove('hidden');
            uploadArea.classList.add('hidden');
        };

        btnUpload.onclick = () => {
            sigMode = 'upload';
            btnUpload.className = 'flex-1 py-2 text-sm font-medium border-b-2 border-indigo-600 text-indigo-600';
            btnDraw.className = 'flex-1 py-2 text-sm font-medium border-b-2 border-transparent text-gray-500 hover:text-gray-700';
            uploadArea.classList.remove('hidden');
            drawArea.classList.add('hidden');
        };

        document.getElementById('sig-upload-input').onchange = (e) => {
            const file = e.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = (ev) => {
                uploadedSig = ev.target.result;
                const prev = document.getElementById('sig-upload-preview');
                prev.querySelector('img').src = uploadedSig;
                prev.classList.remove('hidden');
            };
            reader.readAsDataURL(file);
        };

        document.getElementById('btnSigClear').onclick = () => {
            if (sigMode === 'draw') sigPad.clear();
            else {
                uploadedSig = null;
                document.getElementById('sig-upload-input').value = '';
                document.getElementById('sig-upload-preview').classList.add('hidden');
            }
        };

        document.getElementById('btnSigCancel').onclick = () => {
            sigModal.classList.add('hidden');
        };

        document.getElementById('btnSigSave').onclick = () => {
            let data = null;
            if (sigMode === 'draw') {
                if (!sigPad.isEmpty()) data = sigPad.toDataURL();
            } else {
                data = uploadedSig;
            }

            if (data && currentParafRow) {
                currentParafRow.querySelector('.perj-paraf-sig').value = data;
                const btn = currentParafRow.querySelector('.btn-paraf-ttd');
                btn.innerHTML = `<img src="${data}" class="h-6 mx-auto">`;
                btn.classList.remove('border-dashed', 'text-indigo-500');
                btn.classList.add('bg-white', 'border-solid');
                sigModal.classList.add('hidden');
                updateAll();
            } else {
                alert("Tanda tangan kosong!");
            }
        };
    }

    function openSigModal(row) {
        currentParafRow = row;
        
        // Set dynamic label
        const code = row.querySelector('.perj-paraf-code').value;
        const name = row.querySelector('.perj-paraf-name').value;
        document.getElementById('sigModalLabel').innerText = `Untuk: ${code} - ${name}`;

        sigModal.classList.remove('hidden');
        sigPad.clear();
        uploadedSig = null;
        document.getElementById('sig-upload-input').value = '';
        document.getElementById('sig-upload-preview').classList.add('hidden');
        
        // Resize canvas
        const ratio = Math.max(window.devicePixelRatio || 1, 1);
        sigCanvas.width = sigCanvas.offsetWidth * ratio;
        sigCanvas.height = sigCanvas.offsetHeight * ratio;
        sigCanvas.getContext('2d').scale(ratio, ratio);
    }

    function switchTab(tab) {
        currentTab = tab;
        
        // UI Classes
        [tabNota, tabSppd, tabPerj].forEach(el => {
            if(el) el.className = 'flex-1 py-2 px-3 rounded font-bold border transition tab-inactive text-xs';
        });

        [inputsNota, inputsSppd, inputsPerj, previewNota, previewSppd, previewPerj].forEach(el => {
            if(el) el.classList.add('hidden');
        });

        if (tab === 'nota') {
            if(tabNota) tabNota.className = 'flex-1 py-2 px-3 rounded font-bold border transition tab-active text-xs';
            inputsNota?.classList.remove('hidden');
            previewNota?.classList.remove('hidden');
        } else if (tab === 'sppd') {
            if(tabSppd) tabSppd.className = 'flex-1 py-2 px-3 rounded font-bold border transition tab-active text-xs';
            inputsSppd?.classList.remove('hidden');
            previewSppd?.classList.remove('hidden');
        } else if (tab === 'perj') {
            if(tabPerj) tabPerj.className = 'flex-1 py-2 px-3 rounded font-bold border transition tab-active text-xs';
            inputsPerj?.classList.remove('hidden');
            previewPerj?.classList.remove('hidden');
        }

        updateAll();
    }

    function updateAll() {
        // Shared
        const docNum = document.getElementById('docNumber')?.value || '...';
        document.querySelectorAll('.prev-docNum').forEach(el => el.innerText = docNum);

        if (currentTab === 'nota') {
            setText('prevNotaTo', 'notaTo');
            setText('prevNotaFrom', 'notaFrom');
            setText('prevNotaAtt', 'notaAtt');
            setText('prevNotaSubject', 'notaSubject');
            setText('prevNotaContent', 'notaContent');
            setText('prevNotaLoc', 'notaLoc');
            setText('prevNotaPos', 'notaPos');
            setText('prevNotaDiv', 'notaDiv');
            setText('prevNotaName', 'notaName');
            
            setDate('prevNotaDate', 'notaDate');
            updateList('notaBasisContainer', 'prevNotaBasisList', 'nota-basis-input');
        } 
        else if (currentTab === 'sppd') {
            setText('prevSppdWeigh', 'sppdWeigh');
            setText('prevSppdTo', 'sppdTo');
            setText('prevSppdTask', 'sppdTask');
            setText('prevSppdDest', 'sppdDest');
            setText('prevSppdTransport', 'sppdTransport');
            setText('prevSppdFunding', 'sppdFunding');
            setText('prevSppdReport', 'sppdReport');
            setText('prevSppdClose', 'sppdClose');
            setText('prevSppdLoc', 'sppdLoc');
            setText('prevSppdSignPos', 'sppdSignPos');
            setText('prevSppdSignName', 'sppdSignName');

            setDate('prevSppdDateGo', 'sppdDateGo');
            setDate('prevSppdDateBack', 'sppdDateBack');
            setDate('prevSppdSignDate', 'sppdSignDate');

            updateList('sppdRememberContainer', 'prevSppdRememberList', 'sppd-rem-input');
            updateList('sppdCCContainer', 'prevSppdCCList', 'sppd-cc-input');
        }
        else if (currentTab === 'perj') {
            setText('prevPerjAbout', 'perjAbout');
            setText('prevPerjDay', 'perjDay');
            setText('prevPerjDateWritten', 'perjDateWritten');
            setText('prevPerjPlace', 'perjPlace');
            setText('prevPerjP1Name', 'perjP1Name');
            setText('prevPerjP1Pos', 'perjP1Pos');
            setText('prevPerjP1Auth', 'perjP1Auth');
            setText('prevPerjP2Name', 'perjP2Name');
            setText('prevPerjP2NameTop', 'perjP2Name');
            setText('prevPerjP2Info', 'perjP2Info');

            updatePerjPoints();
            updatePerjParaf();
        }
    }

    function addPerjPoint() {
        const container = document.getElementById('perjPointsContainer');
        const div = document.createElement('div');
        div.className = 'flex gap-2 item-row mt-2';
        div.innerHTML = `
            <span class="pt-2 font-bold text-gray-400">#</span>
            <textarea class="perj-point-input w-full p-2 border border-gray-300 rounded" rows="2" placeholder="Poin selanjutnya..."></textarea>
            <button type="button" class="px-3 border rounded text-red-500 hover:bg-red-50 cursor-pointer h-10">&times;</button>
        `;
        div.querySelector('button').onclick = () => { container.removeChild(div); updateAll(); };
        container.appendChild(div);
    }

    function updatePerjPoints() {
        const container = document.getElementById('perjPointsContainer');
        const list = document.getElementById('prevPerjPointsList');
        if(!container || !list) return;

        const inputs = container.getElementsByClassName('perj-point-input');
        list.innerHTML = '';
        
        Array.from(inputs).forEach((input, index) => {
            if (input.value.trim()) {
                const char = String.fromCharCode(65 + index); // A, B, C...
                const div = document.createElement('div');
                div.className = "flex items-start";
                div.innerHTML = `
                    <div class="w-8 flex-shrink-0 font-bold">${char}.</div>
                    <div class="flex-grow text-justify">${input.value}</div>
                `;
                list.appendChild(div);
            }
        });
    }

    function addPerjParaf() {
        const container = document.getElementById('perjParafContainer');
        const div = document.createElement('div');
        const index = container.children.length;
        div.className = 'bg-slate-50 p-3 rounded-lg border border-slate-200 item-row mt-2 relative group transition-colors hover:border-indigo-400';
        div.onmouseenter = () => highlightParaf(index, true);
        div.onmouseleave = () => highlightParaf(index, false);
        
        div.innerHTML = `
            <div class="grid grid-cols-2 gap-2 mb-2">
                <input type="text" class="perj-paraf-code w-full p-2 border border-gray-300 rounded text-[10px]" placeholder="Kode (DV-...)">
                <input type="text" class="perj-paraf-name w-full p-2 border border-gray-300 rounded text-[10px]" placeholder="Nama pejabat...">
            </div>
            <div class="paraf-ttd-container">
                <button type="button" class="btn-paraf-ttd w-full py-1 border border-dashed border-indigo-200 text-indigo-500 text-[10px] font-bold rounded hover:bg-white transition-all">+ TTD PARAF</button>
                <input type="hidden" class="perj-paraf-sig">
            </div>
            <button type="button" class="absolute -right-2 -top-2 bg-white text-red-500 rounded-full shadow border border-red-100 p-1 opacity-0 group-hover:opacity-100 transition-all">&times;</button>
        `;
        div.querySelector('button[type="button"].absolute').onclick = () => { container.removeChild(div); updateAll(); };
        container.appendChild(div);
        updateAll();
    }

    function updatePerjParaf() {
        const sigs = document.getElementsByClassName('perj-paraf-sig');
        const codes = document.getElementsByClassName('perj-paraf-code');
        const names = document.getElementsByClassName('perj-paraf-name');
        const rows = document.querySelectorAll('#perjParafContainer .item-row');
        
        // Sequential Visibility Logic
        Array.from(rows).forEach((row, index) => {
            if (index === 0) {
                row.classList.remove('hidden');
            } else {
                const prevSig = sigs[index - 1]?.value;
                if (prevSig) {
                    row.classList.remove('hidden');
                } else {
                    row.classList.add('hidden');
                }
            }
        });

        const container = document.querySelector('#previewPerj .paraf-container');
        if (!container) return;

        let html = `
            <table class="paraf-table">
                <tr>
                    <td rowspan="3" class="col-paraf-label">Paraf</td>
                    ${Array.from(codes).map(c => `<td class="cell-width">${c.value || '...'}</td>`).join('')}
                </tr>
                <tr class="row-name">
                    ${Array.from(names).map(n => `<td>${n.value || '...'}</td>`).join('')}
                </tr>
                <tr class="row-signature">
                    ${Array.from(sigs).map((s, index) => {
                        return `<td id="paraf-cell-${index}" class="align-middle h-[65px] transition-all duration-300">${s.value ? `<img src="${s.value}" style="max-height: 60px; margin: 0 auto; display: block;">` : ''}</td>`;
                    }).join('')}
                </tr>
            </table>
        `;
        container.innerHTML = html;
    }

    function setText(targetId, sourceId) {
        const source = document.getElementById(sourceId);
        const target = document.getElementById(targetId);
        if (source && target) {
            target.innerText = source.value.trim() ? source.value : '...';
        }
    }

    function setDate(targetId, sourceId) {
        const source = document.getElementById(sourceId);
        const target = document.getElementById(targetId);
        if (source && target) {
            target.innerText = getIndoDate(source.value);
        }
    }

    function getIndoDate(dateStr) {
        if (!dateStr) return '...';
        const date = new Date(dateStr);
        return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
    }

    function updateList(containerId, listId, inputClass) {
        const container = document.getElementById(containerId);
        const list = document.getElementById(listId);
        if(!container || !list) return;

        const inputs = container.getElementsByClassName(inputClass);
        list.innerHTML = '';
        
        let hasItem = false;
        Array.from(inputs).forEach(input => {
            if (input.value.trim()) {
                hasItem = true;
                const li = document.createElement('li');
                li.innerText = input.value;
                li.className = "mb-1 pl-1";
                list.appendChild(li);
            }
        });

        if (!hasItem) {
            const li = document.createElement('li');
            li.innerText = '...';
            li.style.listStyle = 'none';
            list.appendChild(li);
        }
    }

    function addList(containerId, inputClass, listId) {
        const container = document.getElementById(containerId);
        if(!container) return;

        const div = document.createElement('div');
        div.className = 'flex gap-2 item-row mt-2';
        
        const input = document.createElement('input');
        input.type = 'text';
        input.className = `${inputClass} w-full p-2 border border-gray-300 rounded`;
        input.placeholder = 'Poin selanjutnya...';
        input.addEventListener('input', updateAll);

        const delBtn = document.createElement('button');
        delBtn.innerHTML = '&times;';
        delBtn.className = 'px-3 border rounded text-red-500 hover:bg-red-50 cursor-pointer';
        delBtn.type = 'button';
        delBtn.onclick = function() {
            container.removeChild(div);
            updateAll();
        };

        div.appendChild(input);
        div.appendChild(delBtn);
        container.appendChild(div);
    }

    function resetForm() {
        if(confirm("Reset semua input?")) {
            document.getElementById('mainForm').reset();
            
            // Reset Lists (Naive approach: remove all dynamic rows)
            ['notaBasisContainer', 'sppdRememberContainer', 'sppdCCContainer', 'perjPointsContainer', 'perjParafContainer'].forEach(id => {
                const container = document.getElementById(id);
                if(!container) return;
                // Keep the first one
                while (container.children.length > 1) {
                    container.removeChild(container.lastChild);
                }
                // Clear the first one's input/textarea
                const input = container.querySelector('input, textarea');
                if(input) input.value = '';
            });
            
            // Reset dates
            const today = new Date().toISOString().split('T')[0];
            const nd = document.getElementById('notaDate');
            if(nd) nd.value = today;
            const sd = document.getElementById('sppdSignDate');
            if(sd) sd.value = today;

            updateAll();
        }
    }

    function downloadPDF() {
        const element = document.getElementById('paperContent');
        const fileName = currentTab === 'nota' ? 'Nota_Dinas.pdf' : 
                         (currentTab === 'sppd' ? 'Surat_Perintah_SPPD.pdf' : 'Perjanjian_Kerja_Sama.pdf');

        const images = element.getElementsByTagName('img');
        if(images.length > 0 && !images[0].complete) {
            images[0].onload = generate;
        } else {
            generate();
        }

        function generate() {
            element.style.minHeight = 'unset'; 
            const opt = {
                margin: 0,
                filename: fileName,
                image: { type: 'jpeg', quality: 0.98 },
                html2canvas: { 
                    scale: 2, 
                    useCORS: true, 
                    allowTaint: true 
                },
                jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
            };
            html2pdf().set(opt).from(element).save().then(() => {
                element.style.minHeight = '';
            });
        }
    }
});
