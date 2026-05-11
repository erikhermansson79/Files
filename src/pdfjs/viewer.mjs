import { getDocument, GlobalWorkerOptions } from "../build/pdf.mjs";
import { EventBus, PDFLinkService, PDFViewer } from "./pdf_viewer.mjs";

GlobalWorkerOptions.workerSrc = "../build/pdf.worker.mjs";

const errorElement = document.getElementById("error");
const container = document.getElementById("viewerContainer");
const viewerElement = document.getElementById("viewer");
const search = new URLSearchParams(window.location.search);
const file = search.get("file");

function showError(message) {
    if (!errorElement) {
        return;
    }

    errorElement.textContent = message;
    errorElement.style.display = "block";
}

if (!(container instanceof HTMLDivElement) || !(viewerElement instanceof HTMLDivElement)) {
    showError("Failed to initialize PDF viewer.");
} else if (!file) {
    showError("Missing PDF file.");
} else {
    const eventBus = new EventBus();
    const linkService = new PDFLinkService({ eventBus });
    const pdfViewer = new PDFViewer({
        container,
        viewer: viewerElement,
        eventBus,
        linkService
    });

    linkService.setViewer(pdfViewer);
    eventBus.on("pagesinit", () => {
        pdfViewer.currentScaleValue = "page-width";
    });

    const loadingTask = getDocument(file);
    window.addEventListener("beforeunload", () => {
        void loadingTask.destroy();
    });

    loadingTask.promise.then(pdfDocument => {
        pdfViewer.setDocument(pdfDocument);
        linkService.setDocument(pdfDocument);
    }).catch(error => {
        console.error("Failed to load PDF in official viewer.", { file, error });
        showError(error instanceof Error ? error.message : "Failed to load PDF.");
    });
}
