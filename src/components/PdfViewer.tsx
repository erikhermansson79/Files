interface PdfViewerProps {
    filePath: string;
}

export function PdfViewer({ filePath }: PdfViewerProps) {
    const viewerUrl = new URL('../pdfjs/web/embedded-viewer.html', import.meta.url);
    viewerUrl.searchParams.set('file', `${window.location.origin}/api/files/${filePath}`);
    viewerUrl.searchParams.set('embedded', '1');
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
