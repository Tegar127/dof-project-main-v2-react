import React, { useEffect, useRef } from 'react';
import Quill from 'quill';
import 'quill/dist/quill.snow.css';

/**
 * QuillEditor — wrapper vanilla Quill yang kompatibel dengan React 19.
 *
 * Props:
 *   value        : string HTML konten
 *   onChange     : (htmlString) => void
 *   placeholder  : string
 *   toolbar      : array toolbar modules (optional)
 *   minHeight    : string CSS height (default: '120px')
 *   readOnly     : boolean
 */
const QuillEditor = ({
    value = '',
    onChange,
    placeholder = 'Tulis di sini...',
    toolbar,
    minHeight = '120px',
    readOnly = false,
}) => {
    const containerRef = useRef(null);
    const quillRef = useRef(null);
    const onChangeRef = useRef(onChange);
    const isInternal = useRef(false);

    // Always keep ref to latest onChange so effect closure stays fresh
    useEffect(() => {
        onChangeRef.current = onChange;
    }, [onChange]);

    // Init Quill once
    useEffect(() => {
        if (quillRef.current) return;

        const defaultToolbar = [
            [{ header: [1, 2, 3, false] }],
            ['bold', 'italic', 'underline', 'strike'],
            [{ list: 'ordered' }, { list: 'bullet' }],
            [{ indent: '-1' }, { indent: '+1' }],
            ['link'],
            ['clean'],
        ];

        const quill = new Quill(containerRef.current, {
            theme: 'snow',
            placeholder,
            readOnly,
            modules: {
                toolbar: toolbar || defaultToolbar,
                // Keyboard bindings: Tab = indent, Shift+Tab = outdent (khusus di dalam list)
                keyboard: {
                    bindings: {
                        listIndent: {
                            key: 9,       // Tab
                            shiftKey: false,
                            handler(range) {
                                const format = this.quill.getFormat(range.index);
                                if (format.list) {
                                    this.quill.format('indent', '+1', Quill.sources.USER);
                                    return false;
                                }
                                // Di luar list: sisipkan tab/spasi
                                this.quill.insertText(range.index, '    ', Quill.sources.USER);
                                this.quill.setSelection(range.index + 4, Quill.sources.SILENT);
                                return false;
                            },
                        },
                        listOutdent: {
                            key: 9,       // Shift+Tab
                            shiftKey: true,
                            handler(range) {
                                const format = this.quill.getFormat(range.index);
                                if (format.list) {
                                    this.quill.format('indent', '-1', Quill.sources.USER);
                                    return false;
                                }
                                return true;
                            },
                        },
                    },
                },
            },
        });

        quillRef.current = quill;

        // Set initial content
        if (value) {
            quill.clipboard.dangerouslyPasteHTML(value);
        }

        quill.on('text-change', () => {
            if (onChangeRef.current) {
                isInternal.current = true;
                onChangeRef.current(quill.getSemanticHTML());
            }
        });
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Sync external value changes (avoid re-setting when change originated internally)
    useEffect(() => {
        const quill = quillRef.current;
        if (!quill) return;

        if (isInternal.current) {
            isInternal.current = false;
            return;
        }

        const current = quill.getSemanticHTML();
        if (current !== value) {
            const selection = quill.getSelection();
            quill.clipboard.dangerouslyPasteHTML(value || '');
            if (selection) {
                try { quill.setSelection(selection); } catch (_) {}
            }
        }
    }, [value]);

    // Toggle readOnly
    useEffect(() => {
        if (quillRef.current) {
            quillRef.current.enable(!readOnly);
        }
    }, [readOnly]);

    return (
        <div
            className={`quill-wrapper${readOnly ? ' ql-readonly' : ''}`}
            style={{ '--quill-min-height': minHeight }}
        >
            <div ref={containerRef} />
        </div>
    );
};

export default QuillEditor;
