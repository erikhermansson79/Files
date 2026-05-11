interface PdfViewerProps {
    filePath: string;
}

export function PdfViewer({ filePath }: PdfViewerProps) {
    const viewerUrl = new URL('../pdfjs/web/viewer.html', import.meta.url);
    viewerUrl.searchParams.set('file', `${window.location.origin}/api/files/${filePath}`);

    return (
        <iframe
            title="PDF.js viewer"
            src={viewerUrl.toString()}
            className="flex-fill w-100 h-100 bg-white border-0"
            style={{ minHeight: 0 }}
        />
    );
}
