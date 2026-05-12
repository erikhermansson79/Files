interface PdfViewerProps {
    filePath: string;
}

function getViewerHtmlUrl() {
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

function getEncodedFileUrl(filePath: string) {
    const encodedPath = filePath
        .split('/')
        .map(segment => encodeURIComponent(segment))
        .join('/');

    return new URL(`/api/files/${encodedPath}`, window.location.origin).toString();
}

export function PdfViewer({ filePath }: PdfViewerProps) {
    const viewerUrl = new URL(getViewerHtmlUrl());
    viewerUrl.searchParams.set('file', getEncodedFileUrl(filePath));
    viewerUrl.searchParams.set('embedded', '1');
    viewerUrl.searchParams.set('locale', getLocaleUrl());
    viewerUrl.searchParams.set('pdfjs', getPdfScriptUrl());
    viewerUrl.searchParams.set('viewercss', getViewerCssUrl());
    viewerUrl.searchParams.set('embeddedcss', getEmbeddedViewerCssUrl());
    viewerUrl.searchParams.set('viewerjs', getViewerScriptUrl());
    viewerUrl.hash = 'pagemode=none&zoom=page-width';

    return (
        <iframe
            title="PDF.js viewer"
            src={viewerUrl.toString()}
            className="flex-fill w-100 h-100 bg-white border-0"
            style={{ minHeight: 0 }}
        />
    );
}
