import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Document, Page, pdfjs } from 'react-pdf';

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.min.mjs',
    import.meta.url
).toString();

interface PdfViewerProps {
    filePath: string;
}

interface PdfDocumentInfo {
    numPages: number;
}

function getEncodedFileUrl(filePath: string) {
    const encodedPath = filePath
        .split('/')
        .map(segment => encodeURIComponent(segment))
        .join('/');

    return new URL(`/api/files/${encodedPath}`, window.location.origin).toString();
}

export function PdfViewer({ filePath }: PdfViewerProps) {
    const { t } = useTranslation();
    const containerRef = useRef<HTMLDivElement>(null);
    const fileUrl = useMemo(() => getEncodedFileUrl(filePath), [filePath]);
    const [fileData, setFileData] = useState<Uint8Array>();
    const [error, setError] = useState<string>();
    const [numPages, setNumPages] = useState(0);
    const [pageWidth, setPageWidth] = useState<number>();
    const documentFile = useMemo(() => (
        fileData ? { data: fileData } : undefined
    ), [fileData]);

    useEffect(() => {
        const abortController = new AbortController();

        setFileData(undefined);
        setError(undefined);
        setNumPages(0);

        fetch(fileUrl, {
            credentials: 'include',
            signal: abortController.signal
        })
            .then(async response => {
                if (!response.ok) {
                    throw new Error(`Failed to load PDF file: ${response.status}`);
                }

                const arrayBuffer = await response.arrayBuffer();

                if (!abortController.signal.aborted) {
                    setFileData(new Uint8Array(arrayBuffer));
                }
            })
            .catch((fetchError: unknown) => {
                if (!abortController.signal.aborted) {
                    const message = fetchError instanceof Error ? fetchError.message : 'Failed to load PDF.';
                    setError(message);
                    console.error('Failed to fetch PDF file.', fetchError);
                }
            });

        return () => {
            abortController.abort();
        };
    }, [fileUrl]);

    useEffect(() => {
        const container = containerRef.current;

        if (!container) {
            return;
        }

        const updateWidth = () => {
            setPageWidth(Math.max(Math.floor(container.clientWidth - 32), 1));
        };

        updateWidth();

        const resizeObserver = new ResizeObserver(updateWidth);
        resizeObserver.observe(container);

        return () => {
            resizeObserver.disconnect();
        };
    }, []);

    return (
        <div ref={containerRef} className="flex-fill overflow-auto bg-body-tertiary">
            {error &&
                <div className="alert alert-danger m-3" role="alert">{error}</div>
            }
            {!error && !fileData &&
                <div className="d-flex h-100 align-items-center justify-content-center">
                    <div className="spinner-border" role="status" aria-label={t("loadingPdf")}>
                        <span className="visually-hidden">{t("loadingPdf")}</span>
                    </div>
                </div>
            }
            {documentFile &&
                <Document
                    file={documentFile}
                    onLoadSuccess={(document: PdfDocumentInfo) => {
                        setNumPages(document.numPages);
                        setError(undefined);
                    }}
                    onLoadError={(loadError: Error) => {
                        setError(loadError.message);
                        console.error('Failed to render PDF file.', loadError);
                    }}
                    loading={null}
                    error={null}
                    noData={null}
                >
                    <div className="d-flex flex-column align-items-center gap-3 p-3">
                        {Array.from({ length: numPages }, (_, index) => (
                            <div key={`page_${index + 1}`} className="bg-white shadow-sm">
                                <Page
                                    pageNumber={index + 1}
                                    width={pageWidth}
                                    renderAnnotationLayer={false}
                                    renderTextLayer={false}
                                />
                            </div>
                        ))}
                    </div>
                </Document>
            }
        </div>
    );
}
