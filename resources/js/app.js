import './bootstrap';

import Alpine from 'alpinejs';
import html2pdf from 'html2pdf.js';

import './auth/login';
import './dashboard/index';
import './editor/index';
import './admin/index';

// Import Components
import './components/approval-workflow';
import './components/deadline-manager';
import './components/delivery-log-timeline';
import './components/folder-browser';
import './components/read-receipt-tracker';

window.Alpine = Alpine;
window.html2pdf = html2pdf;

Alpine.start();
import './document-generator';