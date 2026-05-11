import { useEffect, useRef, useState } from 'react';
import { getDocument, type PDFDocumentLoadingTask, type RenderTask } from 'pdfjs-dist';
import 'pdfjs-dist/webpack.mjs';

import { LoadingIndicator } from './LoadingIndicator';

interface PdfViewerProps {
    filePath: string;
}

export function PdfViewer({ filePath }: PdfViewerProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const canvasRefs = useRef<(HTMLCanvasElement | null)[]>([]);
    const [pageCount, setPageCount] = useState(0);
    const [containerWidth, setContainerWidth] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [hasError, setHasError] = useState(false);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) {
            return;
        }

        const updateWidth = () => {
            setContainerWidth(container.clientWidth);
        };

        updateWidth();

        if (typeof ResizeObserver !== "undefined") {
            const resizeObserver = new ResizeObserver(updateWidth);
            resizeObserver.observe(container);

            return () => {
                resizeObserver.disconnect();
            };
        }

        window.addEventListener("resize", updateWidth);

        return () => {
            window.removeEventListener("resize", updateWidth);
        };
    }, []);

    useEffect(() => {
        canvasRefs.current = canvasRefs.current.slice(0, pageCount);
    }, [pageCount]);

    useEffect(() => {
        if (!filePath || containerWidth <= 0) {
            return;
        }

        let isDisposed = false;
        let loadingTask: PDFDocumentLoadingTask | undefined;
        let renderTasks: RenderTask[] = [];

        async function renderPdf() {
            setIsLoading(true);
            setHasError(false);
            setPageCount(0);

            try {
                loadingTask = getDocument(`${window.location.origin}/api/files/${filePath}`);
                const pdfDocument = await loadingTask.promise;

                if (isDisposed) {
                    await pdfDocument.destroy();
                    return;
                }

                setPageCount(pdfDocument.numPages);
                await new Promise<void>(resolve => requestAnimationFrame(() => resolve()));

                for (let pageNumber = 1; pageNumber <= pdfDocument.numPages; pageNumber++) {
                    if (isDisposed) {
                        break;
                    }

                    const page = await pdfDocument.getPage(pageNumber);
                    const baseViewport = page.getViewport({ scale: 1 });
                    const scale = containerWidth / baseViewport.width;
                    const viewport = page.getViewport({ scale });
                    const canvas = canvasRefs.current[pageNumber - 1];
                    const context = canvas?.getContext("2d");

                    if (!canvas || !context) {
                        continue;
                    }

                    canvas.width = Math.ceil(viewport.width);
                    canvas.height = Math.ceil(viewport.height);
                    canvas.style.width = "100%";
                    canvas.style.height = "auto";

                    const renderTask = page.render({
                        canvas,
                        canvasContext: context,
                        viewport
                    });

                    renderTasks.push(renderTask);
                    await renderTask.promise;
                }

                await pdfDocument.cleanup();
                await pdfDocument.destroy();
            } catch {
                if (!isDisposed) {
                    setHasError(true);
                }
            } finally {
                if (!isDisposed) {
                    setIsLoading(false);
                }
            }
        }

        void renderPdf();

        return () => {
            isDisposed = true;
            loadingTask?.destroy();

            for (const renderTask of renderTasks) {
                renderTask.cancel();
            }

            renderTasks = [];
        };
    }, [containerWidth, filePath]);

    return (
        <div ref={containerRef} className="w-100 overflow-auto">
            {isLoading &&
                <div className="py-4">
                    <LoadingIndicator />
                </div>
            }

            {hasError &&
                <div className="alert alert-danger m-3 mb-0">
                    Failed to display PDF.
                </div>
            }

            {!hasError &&
                <div className="d-flex flex-column align-items-center gap-3 p-3">
                    {Array.from({ length: pageCount }, (_, index) => (
                        <canvas
                            key={index}
                            ref={element => {
                                canvasRefs.current[index] = element;
                            }}
                            className="bg-white shadow-sm mw-100"
                        />
                    ))}
                </div>
            }
        </div>
    );
}
