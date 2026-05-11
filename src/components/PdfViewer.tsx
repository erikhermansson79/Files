import { useEffect, useMemo, useState } from 'react';

interface PdfViewerProps {
    filePath: string;
}

function getViewerTemplate() {
    return new URL('../pdfjs/web/embedded-viewer.html', import.meta.url).toString();
}

function getViewerCssUrl() {
    return new URL('../pdfjs/web/viewer.css', import.meta.url).toString();
}

function getEmbeddedViewerCssUrl() {
    return new URL('../pdfjs/web/viewer-embedded.css', import.meta.url).toString();
}

function getPdfScriptUrl() {
    return new URL('../pdfjs/build/pdf.mjs', import.meta.url).toString();
}

function getViewerScriptUrl() {
    return new URL('../pdfjs/web/viewer.mjs', import.meta.url).toString();
}

function getLocaleUrl() {
    return new URL('../pdfjs/web/locale/locale.json', import.meta.url).toString();
}

function buildViewerHtml(template: string, options: {
    localeUrl: string;
    pdfScriptUrl: string;
    viewerCssUrl: string;
    embeddedViewerCssUrl: string;
    viewerScriptUrl: string;
}) {
    return template
        .replace('href="locale/locale.json"', `href="${options.localeUrl}"`)
        .replace('src="../build/pdf.mjs"', `src="${options.pdfScriptUrl}"`)
        .replace('href="viewer.css"', `href="${options.viewerCssUrl}"`)
        .replace('href="viewer-embedded.css"', `href="${options.embeddedViewerCssUrl}"`)
        .replace('src="viewer.mjs"', `src="${options.viewerScriptUrl}"`);
}

export function PdfViewer({ filePath }: PdfViewerProps) {
    const [viewerSrc, setViewerSrc] = useState<string>();
    const fileUrl = useMemo(() => `${window.location.origin}/api/files/${filePath}`, [filePath]);
    const viewerTemplateUrl = useMemo(() => getViewerTemplate(), []);
    const viewerCssUrl = useMemo(() => getViewerCssUrl(), []);
    const embeddedViewerCssUrl = useMemo(() => getEmbeddedViewerCssUrl(), []);
    const pdfScriptUrl = useMemo(() => getPdfScriptUrl(), []);
    const viewerScriptUrl = useMemo(() => getViewerScriptUrl(), []);
    const localeUrl = useMemo(() => getLocaleUrl(), []);

    useEffect(() => {
        let isDisposed = false;
        let blobUrl: string | undefined;

        async function createViewerUrl() {
            const response = await fetch(viewerTemplateUrl);

            if (!response.ok) {
                throw new Error(`Failed to load PDF viewer template: ${response.status}`);
            }

            const template = await response.text();
            const html = buildViewerHtml(template, {
                localeUrl,
                pdfScriptUrl,
                viewerCssUrl,
                embeddedViewerCssUrl,
                viewerScriptUrl
            });

            blobUrl = URL.createObjectURL(new Blob([html], { type: 'text/html' }));

            if (isDisposed) {
                URL.revokeObjectURL(blobUrl);
                return;
            }

            const resolvedViewerUrl = new URL(blobUrl);
            resolvedViewerUrl.searchParams.set('file', fileUrl);
            resolvedViewerUrl.searchParams.set('embedded', '1');
            resolvedViewerUrl.hash = 'pagemode=none&zoom=page-width';

            setViewerSrc(resolvedViewerUrl.toString());
        }

        createViewerUrl().catch((error: unknown) => {
            console.error('Failed to initialize PDF viewer.', error);
        });

        return () => {
            isDisposed = true;

            if (blobUrl) {
                URL.revokeObjectURL(blobUrl);
            }
        };
    }, [embeddedViewerCssUrl, fileUrl, localeUrl, pdfScriptUrl, viewerCssUrl, viewerScriptUrl, viewerTemplateUrl]);

    return (
        <iframe
            title="PDF.js viewer"
            src={viewerSrc}
            className="flex-fill w-100 h-100 bg-white border-0"
            style={{ minHeight: 0 }}
        />
    );
}
