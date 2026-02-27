<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="utf-8">
    <title>{{ $document->title }} - Print</title>
    <style>
        @page {
            size: A4;
            margin: 20mm;
        }
        body {
            font-family: "Times New Roman", Times, serif;
            font-size: 11pt;
            line-height: 1.4;
            color: #000000;
            background-color: #ffffff;
            margin: 0;
            padding: 0;
        }
        .container {
            width: 100%;
            max-width: 210mm;
            margin: 0 auto;
        }
        .header {
            text-align: center;
            margin-bottom: 20px;
        }
        .header h1 {
            font-size: 14pt;
            font-weight: bold;
            margin: 0 0 5px 0;
            text-transform: uppercase;
        }
        .header p {
            margin: 0;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 10px;
        }
        td {
            vertical-align: top;
            padding: 2px 0;
        }
        .info-table td {
            padding-bottom: 5px;
        }
        .list-numbered {
            padding-left: 25px;
            margin: 0 0 10px 0;
        }
        .list-numbered li {
            margin-bottom: 4px;
        }
        .text-justify {
            text-align: justify;
        }
        .text-center {
            text-align: center;
        }
        .font-bold {
            font-weight: bold;
        }
        .uppercase {
            text-transform: uppercase;
        }
        .underline {
            text-decoration: underline;
        }
        .signature-section {
            float: right;
            width: 280px;
            text-align: center;
            margin-top: 30px;
        }
        .signature-image {
            height: 96px; /* 24 * 4 approx */
            width: 100%;
            object-fit: contain;
            display: block;
            margin: 5px auto;
        }
        .paraf-box {
            margin-top: 30px;
            border: 1px solid black;
            width: 150px;
            font-size: 10pt;
            border-collapse: collapse;
            clear: both;
        }
        .paraf-box td {
            border: 1px solid black;
            padding: 2px 5px;
        }
        .bg-gray {
            background-color: #f3f4f6 !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
        }
        
        /* SPPD Specific */
        .sppd-label { width: 100px; font-weight: bold; }
        .sppd-colon { width: 20px; text-align: center; }

        /* Perjanjian Specific */
        .paraf-table {
            border-collapse: collapse;
            width: 85%;
            font-family: Arial, sans-serif;
            font-size: 10pt;
            margin-top: 40px;
        }
        .paraf-table td {
            border: 1px solid black;
            text-align: center;
            padding: 4px 8px;
            vertical-align: middle;
            background-color: white !important;
        }
        .paraf-table .col-paraf-label { width: 40px; font-weight: normal; }
        .paraf-table .cell-width { width: 100px; }
        .paraf-table .row-name { height: 20px; }
        .paraf-table .row-signature { height: 65px; }
        
        /* Utility to clear floats */
        .clearfix::after {
            content: "";
            clear: both;
            display: table;
        }
    </style>
</head>
<body onload="window.print()">
    <div class="container clearfix">
        
        @php
            $numberingHelper = function($i, $s) {
                $s = $s ?: '1.';
                if ($s === 'a.') return chr(97 + $i) . '.';
                if ($s === 'A.') return chr(65 + $i) . '.';
                if ($s === 'a)') return chr(97 + $i) . ')';
                if ($s === 'A)') return chr(65 + $i) . ')';
                if ($s === '1.') return ($i + 1) . '.';
                if ($s === 'I.') {
                    $roman = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'];
                    return ($roman[$i] ?? ($i + 1)) . '.';
                }
                if ($s === '-') return '-';
                if ($s === '*') return '•';
                return ($i + 1) . '.';
            };
        @endphp

        <!-- Logo -->
        <div style="margin-bottom: 10px;">
             <img src="{{ asset('images/logo_asa.png') }}" alt="Logo" style="height: 60px;">
        </div>

        @if($document->type === 'nota')
            <!-- NOTA DINAS -->
            <div class="header">
                <h1>NOTA DINAS</h1>
                <p>NOMOR {{ $document->content_data['docNumber'] ?? '...' }}</p>
            </div>

            <table class="info-table">
                <tr><td width="100" style="vertical-align: top;">Kepada</td><td width="20" style="vertical-align: top;">:</td><td>
                    @if(is_array($document->content_data['to'] ?? null))
                        @foreach($document->content_data['to'] as $index => $to)
                            <div style="display: flex;">
                                @if(count($document->content_data['to']) > 1)
                                    <div style="width: 20px; flex-shrink: 0;">{{ $index + 1 }}.</div>
                                @endif
                                <div>Yth. {{ $to ?: '...' }}</div>
                            </div>
                        @endforeach
                    @else
                        Yth. {{ $document->content_data['to'] ?? '...' }}
                    @endif
                </td></tr>
                <tr><td>Dari</td><td>:</td><td>{{ $document->content_data['from'] ?? '...' }}</td></tr>
                <tr><td>Lampiran</td><td>:</td><td>{{ $document->content_data['attachment'] ?? '...' }}</td></tr>
                <tr><td>Hal</td><td>:</td><td class="font-bold">{{ $document->content_data['subject'] ?? '...' }}</td></tr>
            </table>

            <div style="margin-bottom: 15px;">
                <p style="margin-bottom: 5px;">Berdasarkan:</p>
                <div class="text-justify">
                    @forelse($document->content_data['basis'] ?? [] as $index => $item)
                        @if(!empty($item['text']))
                            <div style="display: flex; margin-bottom: 4px;">
                                <div style="width: 25px; flex-shrink: 0; font-weight: bold;">{{ $numberingHelper($index, $document->content_data['basisStyle'] ?? '1.') }}</div>
                                <div style="flex-grow: 1;">
                                    {{ $item['text'] }}
                                    @if(!empty($item['sub']))
                                        <div style="margin-top: 2px;">
                                            @foreach($item['sub'] as $subIndex => $subText)
                                                @if(!empty($subText))
                                                    <div style="display: flex; margin-bottom: 2px;">
                                                        <div style="width: 20px; flex-shrink: 0;">{{ chr(97 + $subIndex) }}.</div>
                                                        <div>{{ $subText }}</div>
                                                    </div>
                                                @endif
                                            @endforeach
                                        </div>
                                    @endif
                                </div>
                            </div>
                        @endif
                    @empty
                        <p>...</p>
                    @endforelse
                </div>
            </div>

            <div class="text-justify" style="margin-bottom: 20px;">{!! $document->content_data['content'] ?? '...' !!}</div>

            <p style="margin-bottom: 30px;">Demikian disampaikan dan untuk dijadikan periksa.</p>

            <div class="signature-section">
                <p style="margin-bottom: 4px;">{{ $document->content_data['location'] ?? 'Jakarta' }}, {{ isset($document->content_data['date']) ? \Carbon\Carbon::parse($document->content_data['date'])->isoFormat('D MMMM Y') : '...' }}</p>
                <p class="font-bold uppercase" style="margin: 0;">{{ $document->content_data['signerPosition'] ?? '...' }}</p>
                <p class="font-bold uppercase" style="margin: 0;">{{ $document->content_data['division'] ?? '...' }}</p>
                
                <div style="height: 100px; display: flex; align-items: center; justify-content: center;">
                    @if(!empty($document->content_data['signature']))
                        <img src="{{ $document->content_data['signature'] }}" class="signature-image" alt="Tanda Tangan">
                    @endif
                </div>
                
                <p class="font-bold uppercase underline">{{ $document->content_data['signerName'] ?? '...' }}</p>
            </div>

            <div style="clear: both;"></div>
            
            <div style="margin-top: 20px;">
                @if(!empty($document->content_data['paraf']) && count($document->content_data['paraf']) > 0)
                    <div class="paraf-container" style="margin-bottom: 20px;">
                        <table class="paraf-table" style="margin-left: 0; width: auto; min-width: 300px;">
                            <tr>
                                <td rowspan="3" class="col-paraf-label">Paraf</td>
                                @foreach(array_reverse($document->content_data['paraf'] ?? []) as $paraf)
                                    <td class="cell-width">{{ $paraf['code'] ?? '...' }}</td>
                                @endforeach
                            </tr>
                            <tr class="row-name">
                                @foreach(array_reverse($document->content_data['paraf'] ?? []) as $paraf)
                                    <td>{{ $paraf['name'] ?? '...' }}</td>
                                @endforeach
                            </tr>
                            <tr class="row-signature">
                                @foreach(array_reverse($document->content_data['paraf'] ?? []) as $paraf)
                                    <td style="text-align: center; vertical-align: middle; height: 65px;">
                                        @if(!empty($paraf['signature']))
                                            <img src="{{ $paraf['signature'] }}" style="max-height: 60px; display: block; margin: 0 auto;">
                                        @endif
                                    </td>
                                @endforeach
                            </tr>
                        </table>
                    </div>
                @endif
            </div>

            <div style="margin-top: 30px; font-size: 10pt;">
                @if(!empty($document->content_data['ccs']) && count(array_filter($document->content_data['ccs'])) > 0)
                    <p class="font-bold underline" style="margin-bottom: 5px;">Tembusan:</p>
                    <div style="margin-left: 20px;">
                        @foreach(array_filter($document->content_data['ccs']) as $index => $item)
                            <div style="display: flex; margin-bottom: 4px;">
                                <div style="width: 25px; flex-shrink: 0; font-weight: bold;">{{ $index + 1 }}.</div>
                                <div style="flex-grow: 1;">{{ $item }}</div>
                            </div>
                        @endforeach
                    </div>
                @endif
            </div>

        @elseif($document->type === 'sppd')
            <!-- SPPD -->
            <div class="header" style="margin-bottom: 30px;">
                <h1>SURAT PERINTAH PERJALANAN DINAS</h1>
                <p>NOMOR {{ $document->content_data['docNumber'] ?? '...' }}</p>
            </div>

            <table>
                <tr>
                    <td class="sppd-label">Menimbang</td>
                    <td class="sppd-colon">:</td>
                    <td class="text-justify">{{ $document->content_data['weigh'] ?? '...' }}</td>
                </tr>
            </table>

            <table>
                <tr>
                    <td class="sppd-label">Mengingat</td>
                    <td class="sppd-colon">:</td>
                    <td>
                        <div class="text-justify">
                            @forelse($document->content_data['remembers'] ?? [] as $index => $item)
                                @if(!empty($item['text']))
                                    <div style="display: flex; margin-bottom: 4px;">
                                        <div style="width: 25px; flex-shrink: 0; font-weight: bold;">{{ $numberingHelper($index, $document->content_data['remembersStyle'] ?? '1.') }}</div>
                                        <div style="flex-grow: 1;">
                                            {{ $item['text'] }}
                                            @if(!empty($item['sub']))
                                                <div style="margin-top: 2px;">
                                                    @foreach($item['sub'] as $subIndex => $subText)
                                                        @if(!empty($subText))
                                                            <div style="display: flex; margin-bottom: 2px;">
                                                                <div style="width: 20px; flex-shrink: 0;">{{ chr(97 + $subIndex) }}.</div>
                                                                <div>{{ $subText }}</div>
                                                            </div>
                                                        @endif
                                                    @endforeach
                                                </div>
                                            @endif
                                        </div>
                                    </div>
                                @endif
                            @empty
                                <p>...</p>
                            @endforelse
                        </div>
                    </td>
                </tr>
            </table>

            <div class="text-center font-bold" style="margin: 20px 0;">Memberi Perintah</div>

            <table>
                <tr>
                    <td class="sppd-label">Kepada</td>
                    <td class="sppd-colon"></td>
                    <td class="font-bold">
                        @if(is_array($document->content_data['to'] ?? null))
                            {{ implode(', ', array_filter($document->content_data['to'])) ?: '...' }}
                        @else
                            {{ $document->content_data['to'] ?? '...' }}
                        @endif
                    </td>
                </tr>
            </table>

            <table>
                <tr>
                    <td class="sppd-label">Untuk</td>
                    <td class="sppd-colon">:</td>
                    <td>
                        <ol class="list-numbered" style="margin: 0; padding-left: 20px;">
                            <li style="margin-bottom: 10px;">{!! $document->content_data['task'] ?? '...' !!}</li>
                            
                            <li style="margin-bottom: 10px;">
                                Perjalanan dinas dilaksanakan, sebagai berikut:
                                <table style="width: 100%; margin-top: 5px;">
                                    <tr><td width="100">Tujuan</td><td width="10">:</td><td>{{ $document->content_data['destination'] ?? '...' }}</td></tr>
                                    <tr><td>Berangkat</td><td>:</td><td>{{ isset($document->content_data['dateGo']) ? \Carbon\Carbon::parse($document->content_data['dateGo'])->isoFormat('D MMMM Y') : '...' }}</td></tr>
                                    <tr><td>Kembali</td><td>:</td><td>{{ isset($document->content_data['dateBack']) ? \Carbon\Carbon::parse($document->content_data['dateBack'])->isoFormat('D MMMM Y') : '...' }}</td></tr>
                                    <tr><td>Transportasi</td><td>:</td><td>{{ $document->content_data['transport'] ?? '...' }}</td></tr>
                                </table>
                            </li>

                            <li class="text-justify" style="margin-bottom: 10px;">{!! $document->content_data['funding'] ?? '...' !!}</li>
                            <li class="text-justify" style="margin-bottom: 10px;">{!! $document->content_data['report'] ?? '...' !!}</li>
                            <li class="text-justify" style="margin-bottom: 10px;">{!! $document->content_data['closing'] ?? '...' !!}</li>
                        </ol>
                    </td>
                </tr>
            </table>

            <div class="signature-section">
                <p style="margin-bottom: 4px;">Dikeluarkan di {{ $document->content_data['location'] ?? '...' }}</p>
                <p style="margin-bottom: 4px;">pada tanggal {{ isset($document->content_data['signDate']) ? \Carbon\Carbon::parse($document->content_data['signDate'])->isoFormat('D MMMM Y') : '...' }}</p>
                <p class="font-bold uppercase" style="margin: 0;">DIREKSI,</p>
                <p class="font-bold uppercase" style="margin: 0;">{{ $document->content_data['signerPosition'] ?? '...' }}</p>

                <div style="height: 100px; display: flex; align-items: center; justify-content: center;">
                    @if(!empty($document->content_data['signature']))
                        <img src="{{ $document->content_data['signature'] }}" class="signature-image" alt="Tanda Tangan">
                    @endif
                </div>

                <p class="font-bold uppercase underline">{{ $document->content_data['signerName'] ?? '...' }}</p>
            </div>

            <div style="clear: both;"></div>

            <div style="margin-top: 20px;">
                @if(!empty($document->content_data['paraf']) && count($document->content_data['paraf']) > 0)
                    <div class="paraf-container" style="margin-bottom: 20px;">
                        <table class="paraf-table" style="margin-left: 0; width: auto; min-width: 300px;">
                            <tr>
                                <td rowspan="3" class="col-paraf-label">Paraf</td>
                                @foreach(array_reverse($document->content_data['paraf'] ?? []) as $paraf)
                                    <td class="cell-width">{{ $paraf['code'] ?? '...' }}</td>
                                @endforeach
                            </tr>
                            <tr class="row-name">
                                @foreach(array_reverse($document->content_data['paraf'] ?? []) as $paraf)
                                    <td>{{ $paraf['name'] ?? '...' }}</td>
                                @endforeach
                            </tr>
                            <tr class="row-signature">
                                @foreach(array_reverse($document->content_data['paraf'] ?? []) as $paraf)
                                    <td style="text-align: center; vertical-align: middle; height: 65px;">
                                        @if(!empty($paraf['signature']))
                                            <img src="{{ $paraf['signature'] }}" style="max-height: 60px; display: block; margin: 0 auto;">
                                        @endif
                                    </td>
                                @endforeach
                            </tr>
                        </table>
                    </div>
                @endif
            </div>
            
            <div style="margin-top: 30px; font-size: 10pt;">
                <p class="font-bold underline" style="margin-bottom: 5px;">Tembusan:</p>
                <div style="margin-left: 20px;">
                    @forelse($document->content_data['ccs'] ?? [] as $index => $item)
                        @if(!empty($item))
                            <div style="display: flex; margin-bottom: 4px;">
                                <div style="width: 25px; flex-shrink: 0; font-weight: bold;">{{ $numberingHelper($index, $document->content_data['ccsStyle'] ?? '1.') }}</div>
                                <div style="flex-grow: 1;">{{ $item }}</div>
                            </div>
                        @endif
                    @empty
                        <p>...</p>
                    @endforelse
                </div>
            </div>
        @elseif($document->type === 'perj')
            <!-- PERJANJIAN KERJA SAMA -->
            <div class="header" style="margin-bottom: 30px;">
                <h1>PERJANJIAN KERJA SAMA</h1>
                <p>ANTARA</p>
                <p>PT ASABRI (PERSERO)</p>
                <p>DENGAN</p>
                <p>{{ $document->content_data['party2Name'] ?? '...' }}</p>
                <p>TENTANG</p>
                <p>{{ $document->content_data['about'] ?? '...' }}</p>
                <p>NOMOR {{ $document->content_data['docNumber'] ?? '...' }}</p>
            </div>

            <div class="text-justify">
                <p style="margin-bottom: 15px;">
                    Pada hari ini <span class="font-bold">{{ $document->content_data['day'] ?? '...' }}</span>, 
                    tanggal <span class="font-bold">{{ $document->content_data['dateWritten'] ?? '...' }}</span> 
                    bertempat di {{ $document->content_data['location'] ?? 'Jakarta' }}, 
                    kami yang bertanda tangan di bawah ini:
                </p>

                <div style="display: flex; margin-bottom: 15px;">
                    <div style="width: 30px; flex-shrink: 0; font-bold;">1.</div>
                    <div style="flex-grow: 1;">
                        <span class="font-bold">PT ASABRI (Persero)</span>, 
                        suatu Perseroan Terbatas yang didirikan berdasarkan Hukum Negara Republik Indonesia, 
                        yang berkedudukan di Jalan Mayjen Sutoyo Nomor 11 Jakarta Timur, dalam hal ini diwakili oleh 
                        <span class="font-bold">{{ $document->content_data['party1Name'] ?? '...' }}</span> 
                        dalam jabatannya selaku <span class="font-bold">{{ $document->content_data['party1Pos'] ?? '...' }}</span> 
                        {{ $document->content_data['party1Auth'] ?? '...' }}, 
                        untuk selanjutnya disebut <span class="font-bold">"Pihak Kesatu"</span>; dan
                    </div>
                </div>

                <div style="display: flex; margin-bottom: 15px;">
                    <div style="width: 30px; flex-shrink: 0; font-bold;">2.</div>
                    <div style="flex-grow: 1;">
                        <span class="font-bold">{{ $document->content_data['party2Name'] ?? '...' }}</span>, 
                        {{ $document->content_data['party2Info'] ?? '...' }}, 
                        dan untuk selanjutnya disebut <span class="font-bold">"Pihak Kedua"</span>.
                    </div>
                </div>

                <p style="margin-bottom: 15px;">Pihak Kesatu dan Pihak Kedua selanjutnya secara bersama-sama disebut sebagai <span class="font-bold">"Para Pihak"</span> dan masing-masing disebut <span class="font-bold">"Pihak"</span>, serta dalam kedudukannya sebagaimana tersebut di atas, terlebih dulu menerangkan hal-hal sebagai berikut:</p>

                @foreach($document->content_data['points'] ?? [] as $index => $point)
                    @if(!empty($point))
                        <div style="display: flex; margin-top: 15px;">
                            <div style="width: 35px; flex-shrink: 0; font-bold;">{{ $numberingHelper($index, $document->content_data['pointsStyle'] ?? 'A.') }}</div>
                            <div style="flex-grow: 1;">{{ $point }}</div>
                        </div>
                    @endif
                @endforeach

                <!-- Paraf Table (Dinamis) -->
                <div class="paraf-container">
                    <table class="paraf-table" style="margin-left: auto; width: auto; min-width: 300px;">
                        <tr>
                            <td rowspan="3" class="col-paraf-label">Paraf</td>
                            @foreach(array_reverse($document->content_data['paraf'] ?? []) as $paraf)
                                <td class="cell-width">{{ $paraf['code'] ?? '...' }}</td>
                            @endforeach
                        </tr>
                        <tr class="row-name">
                            @foreach(array_reverse($document->content_data['paraf'] ?? []) as $paraf)
                                <td>{{ $paraf['name'] ?? '...' }}</td>
                            @endforeach
                        </tr>
                        <tr class="row-signature">
                            @foreach(array_reverse($document->content_data['paraf'] ?? []) as $paraf)
                                <td style="text-align: center; vertical-align: middle; height: 65px;">
                                    @if(!empty($paraf['signature']))
                                        <img src="{{ $paraf['signature'] }}" style="max-height: 60px; display: block; margin: 0 auto;">
                                    @endif
                                </td>
                            @endforeach
                        </tr>
                    </table>
                </div>
            </div>
        @endif

    </div>
</body>
</html>