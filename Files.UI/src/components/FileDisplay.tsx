import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from "react-i18next";
import DocViewer, { DocViewerRenderers } from "@cyntler/react-doc-viewer";
import Modal from 'react-bootstrap/Modal';

import { getFileUrl } from '../services/files';
import { PdfViewer } from './PdfViewer';

interface NavigatorWithPdfViewer {
    pdfViewerEnabled?: boolean;
}

function isMobilePdfEnvironment() {
    if (typeof navigator === "undefined") {
        return false;
    }

    const userAgent = navigator.userAgent ?? "";

    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobi/i.test(userAgent);
}

const viewerSupportedFileExtensions = [
    ".bmp",
    //".doc", ".docx",
    //".htm", ".html", ".jpg", ".jpeg",
    //".pdf",
    //".png", ".ppt", ".pptx", ".tiff", ".txt", ".xls", ".xlsx"
];

const iframeSupportedFileExtensions = [
    ".htm", ".html", ".jpg", ".jpeg",
    ".png", ".gif", ".txt", ".mp3"
];

export function FileDisplay({ filePath, rootRoute }) {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const isMobileBrowser = isMobilePdfEnvironment();
    const supportsNativePdfViewer = typeof navigator !== "undefined"
        ? (navigator as NavigatorWithPdfViewer).pdfViewerEnabled !== false && !isMobileBrowser
        : true;
    const usePdfViewer = !supportsNativePdfViewer;

    const lastSlashIndex = filePath.lastIndexOf('/');
    const folderPath = lastSlashIndex >= 0 ? filePath.slice(0, lastSlashIndex) : "";
    const fileName = lastSlashIndex >= 0 ? filePath.slice(lastSlashIndex + 1) : filePath;
    const extension = fileName.slice(fileName.lastIndexOf('.')).toLowerCase();
    const isPdf = extension === ".pdf";
    const isIframePdf = isPdf && !usePdfViewer;
    const isPdfViewerPdf = isPdf && usePdfViewer;
    const isViewerSupportedForType = viewerSupportedFileExtensions.includes(extension);
    const isIframeSupportedForType = isIframePdf || iframeSupportedFileExtensions.includes(extension);

    useEffect(() => {
        if (filePath && !isPdf && !isViewerSupportedForType && !isIframeSupportedForType) {
            const conditionalPath = folderPath.startsWith('/') ? folderPath : `/${folderPath}`;
            navigate(`${rootRoute}${conditionalPath}`);
            window.location.href = getFileUrl(filePath, "download");
        }
    }, [filePath, isPdf, isViewerSupportedForType, isIframeSupportedForType]);


    function closeFile() {
        const conditionalPath = folderPath.startsWith('/') ? folderPath : `/${folderPath}`;

        navigate(`${rootRoute}${conditionalPath}`);
    }

    return (
        <>
            {filePath && (isPdf || isViewerSupportedForType || isIframeSupportedForType/* || extension === ".mid"*/) &&
                <Modal show={true} fullscreen={true} onHide={closeFile}>
                    <Modal.Header closeButton>
                        <Modal.Title>{fileName}</Modal.Title>
                    </Modal.Header>
                    <Modal.Body className="d-flex p-0">
                        {isPdfViewerPdf &&
                            <PdfViewer filePath={filePath} />
                        }
                        {isViewerSupportedForType &&
                            <DocViewer documents={[{ uri: getFileUrl(filePath) }]} pluginRenderers={DocViewerRenderers} />
                        }
                        {isIframeSupportedForType &&
                            <iframe title={fileName} src={`${getFileUrl(filePath)}#toolbar=1&view=Fit`} className={`w-100 h-100 bg-white`}></iframe>
                        }
                        {/*{extension === ".mid" &&*/}
                        {/*    <MidiPlayer url={`${window.apiBaseUrl}/Files/${filePath}`} />*/}
                        {/*}*/}
                    </Modal.Body>
                    <Modal.Footer>
                        <button type="button" className="btn btn-primary" onClick={closeFile}>{t("close")}</button>
                    </Modal.Footer>
                </Modal>
            }
        </>
    );
}
