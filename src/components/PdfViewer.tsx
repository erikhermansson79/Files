import { useEffect, useMemo, useRef } from 'react';

interface PdfViewerProps {
    filePath: string;
}

interface PdfViewerApplication {
    initializedPromise?: Promise<void>;
    open: (args: { data: Uint8Array; originalUrl?: string; }) => Promise<void> | void;
    close?: () => Promise<void> | void;
}

interface PdfViewerFrameWindow extends Window {
    PDFViewerApplication?: PdfViewerApplication;
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

function buildViewerSrcDoc(options: {
    localeUrl: string;
    pdfScriptUrl: string;
    viewerCssUrl: string;
    embeddedViewerCssUrl: string;
    viewerScriptUrl: string;
}) {
    return `<!DOCTYPE html>
<html dir="ltr" mozdisallowselectionprint>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1">
    <meta name="google" content="notranslate">
    <title>PDF.js viewer</title>
    <link rel="resource" type="application/l10n" href="${options.localeUrl}">
    <link rel="stylesheet" href="${options.viewerCssUrl}">
    <link rel="stylesheet" href="${options.embeddedViewerCssUrl}">
    <script src="${options.pdfScriptUrl}" type="module"></script>
    <script src="${options.viewerScriptUrl}" type="module"></script>
  </head>
  <body class="embedded-pdf-viewer" tabindex="1">
    <div id="outerContainer">
      <div id="sidebarContainer">
        <div id="toolbarSidebar">
          <div id="toolbarSidebarLeft">
            <div id="sidebarViewButtons" class="splitToolbarButton toggled" role="radiogroup">
              <button id="viewThumbnail" class="toolbarButton toggled" title="Show Thumbnails" tabindex="2" data-l10n-id="pdfjs-thumbs-button" role="radio" aria-checked="true" aria-controls="thumbnailView"><span data-l10n-id="pdfjs-thumbs-button-label">Thumbnails</span></button>
              <button id="viewOutline" class="toolbarButton" title="Show Document Outline" tabindex="3" data-l10n-id="pdfjs-document-outline-button" role="radio" aria-checked="false" aria-controls="outlineView"><span data-l10n-id="pdfjs-document-outline-button-label">Document Outline</span></button>
              <button id="viewAttachments" class="toolbarButton" title="Show Attachments" tabindex="4" data-l10n-id="pdfjs-attachments-button" role="radio" aria-checked="false" aria-controls="attachmentsView"><span data-l10n-id="pdfjs-attachments-button-label">Attachments</span></button>
              <button id="viewLayers" class="toolbarButton" title="Show Layers" tabindex="5" data-l10n-id="pdfjs-layers-button" role="radio" aria-checked="false" aria-controls="layersView"><span data-l10n-id="pdfjs-layers-button-label">Layers</span></button>
            </div>
          </div>
          <div id="toolbarSidebarRight">
            <div id="outlineOptionsContainer">
              <div class="verticalToolbarSeparator"></div>
              <button id="currentOutlineItem" class="toolbarButton" disabled="disabled" title="Find Current Outline Item" tabindex="6" data-l10n-id="pdfjs-current-outline-item-button"><span data-l10n-id="pdfjs-current-outline-item-button-label">Current Outline Item</span></button>
            </div>
          </div>
        </div>
        <div id="sidebarContent">
          <div id="thumbnailView"></div>
          <div id="outlineView" class="hidden"></div>
          <div id="attachmentsView" class="hidden"></div>
          <div id="layersView" class="hidden"></div>
        </div>
        <div id="sidebarResizer"></div>
      </div>
      <div id="mainContainer">
        <div class="findbar hidden doorHanger" id="findbar">
          <div id="findbarInputContainer">
            <span class="loadingInput end"><input id="findInput" class="toolbarField" title="Find" placeholder="Find in document…" tabindex="91" data-l10n-id="pdfjs-find-input" aria-invalid="false"></span>
            <div class="splitToolbarButton">
              <button id="findPrevious" class="toolbarButton" title="Find the previous occurrence of the phrase" tabindex="92" data-l10n-id="pdfjs-find-previous-button"><span data-l10n-id="pdfjs-find-previous-button-label">Previous</span></button>
              <div class="splitToolbarButtonSeparator"></div>
              <button id="findNext" class="toolbarButton" title="Find the next occurrence of the phrase" tabindex="93" data-l10n-id="pdfjs-find-next-button"><span data-l10n-id="pdfjs-find-next-button-label">Next</span></button>
            </div>
          </div>
          <div id="findbarOptionsOneContainer">
            <input type="checkbox" id="findHighlightAll" class="toolbarField" tabindex="94">
            <label for="findHighlightAll" class="toolbarLabel" data-l10n-id="pdfjs-find-highlight-checkbox">Highlight All</label>
            <input type="checkbox" id="findMatchCase" class="toolbarField" tabindex="95">
            <label for="findMatchCase" class="toolbarLabel" data-l10n-id="pdfjs-find-match-case-checkbox-label">Match Case</label>
          </div>
          <div id="findbarOptionsTwoContainer">
            <input type="checkbox" id="findMatchDiacritics" class="toolbarField" tabindex="96">
            <label for="findMatchDiacritics" class="toolbarLabel" data-l10n-id="pdfjs-find-match-diacritics-checkbox-label">Match Diacritics</label>
            <input type="checkbox" id="findEntireWord" class="toolbarField" tabindex="97">
            <label for="findEntireWord" class="toolbarLabel" data-l10n-id="pdfjs-find-entire-word-checkbox-label">Whole Words</label>
          </div>
          <div id="findbarMessageContainer" aria-live="polite">
            <span id="findResultsCount" class="toolbarLabel"></span>
            <span id="findMsg" class="toolbarLabel"></span>
          </div>
        </div>
        <div class="editorParamsToolbar hidden doorHangerRight" id="editorHighlightParamsToolbar">
          <div id="highlightParamsToolbarContainer" class="editorParamsToolbarContainer">
            <div id="editorHighlightColorPicker" class="colorPicker">
              <span id="highlightColorPickerLabel" class="editorParamsLabel" data-l10n-id="pdfjs-editor-highlight-colorpicker-label">Highlight color</span>
            </div>
            <div id="editorHighlightThickness">
              <label for="editorFreeHighlightThickness" class="editorParamsLabel" data-l10n-id="pdfjs-editor-free-highlight-thickness-input">Thickness</label>
              <div class="thicknessPicker">
                <input type="range" id="editorFreeHighlightThickness" class="editorParamsSlider" value="12" min="8" max="24" step="1" tabindex="101">
              </div>
            </div>
            <div id="editorHighlightVisibility">
              <div class="divider"></div>
              <div class="toggler">
                <label for="editorHighlightShowAll" class="editorParamsLabel" data-l10n-id="pdfjs-editor-highlight-show-all-button-label">Show all</label>
                <button id="editorHighlightShowAll" class="toggle-button" aria-pressed="true" tabindex="102"></button>
              </div>
            </div>
          </div>
        </div>
        <div class="editorParamsToolbar hidden doorHangerRight" id="editorFreeTextParamsToolbar">
          <div class="editorParamsToolbarContainer">
            <div class="editorParamsSetter">
              <label for="editorFreeTextColor" class="editorParamsLabel" data-l10n-id="pdfjs-editor-free-text-color-input">Color</label>
              <input type="color" id="editorFreeTextColor" class="editorParamsColor" tabindex="103">
            </div>
            <div class="editorParamsSetter">
              <label for="editorFreeTextFontSize" class="editorParamsLabel" data-l10n-id="pdfjs-editor-free-text-size-input">Size</label>
              <input type="range" id="editorFreeTextFontSize" class="editorParamsSlider" value="10" min="5" max="100" step="1" tabindex="104">
            </div>
          </div>
        </div>
        <div class="editorParamsToolbar hidden doorHangerRight" id="editorInkParamsToolbar">
          <div class="editorParamsToolbarContainer">
            <div class="editorParamsSetter">
              <label for="editorInkColor" class="editorParamsLabel" data-l10n-id="pdfjs-editor-ink-color-input">Color</label>
              <input type="color" id="editorInkColor" class="editorParamsColor" tabindex="105">
            </div>
            <div class="editorParamsSetter">
              <label for="editorInkThickness" class="editorParamsLabel" data-l10n-id="pdfjs-editor-ink-thickness-input">Thickness</label>
              <input type="range" id="editorInkThickness" class="editorParamsSlider" value="1" min="1" max="20" step="1" tabindex="106">
            </div>
            <div class="editorParamsSetter">
              <label for="editorInkOpacity" class="editorParamsLabel" data-l10n-id="pdfjs-editor-ink-opacity-input">Opacity</label>
              <input type="range" id="editorInkOpacity" class="editorParamsSlider" value="100" min="1" max="100" step="1" tabindex="107">
            </div>
          </div>
        </div>
        <div class="editorParamsToolbar hidden doorHangerRight" id="editorStampParamsToolbar">
          <div class="editorParamsToolbarContainer">
            <button id="editorStampAddImage" class="secondaryToolbarButton" title="Add image" tabindex="108" data-l10n-id="pdfjs-editor-stamp-add-image-button">
              <span class="editorParamsLabel" data-l10n-id="pdfjs-editor-stamp-add-image-button-label">Add image</span>
            </button>
          </div>
        </div>
        <div id="secondaryToolbar" class="secondaryToolbar hidden doorHangerRight"><div id="secondaryToolbarButtonContainer"></div></div>
        <div class="toolbar">
          <div id="toolbarContainer">
            <div id="toolbarViewer">
              <div id="toolbarViewerLeft">
                <button id="sidebarToggle" class="toolbarButton" title="Toggle Sidebar" tabindex="11" data-l10n-id="pdfjs-toggle-sidebar-button" aria-expanded="false" aria-controls="sidebarContainer"><span data-l10n-id="pdfjs-toggle-sidebar-button-label">Toggle Sidebar</span></button>
                <div class="toolbarButtonSpacer"></div>
                <button id="viewFind" class="toolbarButton" title="Find in Document" tabindex="12" data-l10n-id="pdfjs-findbar-button" aria-expanded="false" aria-controls="findbar"><span data-l10n-id="pdfjs-findbar-button-label">Find</span></button>
                <div class="splitToolbarButton hiddenSmallView">
                  <button class="toolbarButton" title="Previous Page" id="previous" tabindex="13" data-l10n-id="pdfjs-previous-button"><span data-l10n-id="pdfjs-previous-button-label">Previous</span></button>
                  <div class="splitToolbarButtonSeparator"></div>
                  <button class="toolbarButton" title="Next Page" id="next" tabindex="14" data-l10n-id="pdfjs-next-button"><span data-l10n-id="pdfjs-next-button-label">Next</span></button>
                </div>
                <span class="loadingInput start"><input type="number" id="pageNumber" class="toolbarField" title="Page" value="1" min="1" tabindex="15" data-l10n-id="pdfjs-page-input" autocomplete="off"></span>
                <span id="numPages" class="toolbarLabel"></span>
              </div>
              <div id="toolbarViewerRight">
                <div id="editorModeButtons" class="splitToolbarButton toggled" role="radiogroup">
                  <button id="editorHighlight" class="toolbarButton" hidden="true" disabled="disabled" title="Highlight" role="radio" aria-checked="false" aria-controls="editorHighlightParamsToolbar" tabindex="31" data-l10n-id="pdfjs-editor-highlight-button"><span data-l10n-id="pdfjs-editor-highlight-button-label">Highlight</span></button>
                  <button id="editorFreeText" class="toolbarButton" disabled="disabled" title="Text" role="radio" aria-checked="false" aria-controls="editorFreeTextParamsToolbar" tabindex="32" data-l10n-id="pdfjs-editor-free-text-button"><span data-l10n-id="pdfjs-editor-free-text-button-label">Text</span></button>
                  <button id="editorInk" class="toolbarButton" disabled="disabled" title="Draw" role="radio" aria-checked="false" aria-controls="editorInkParamsToolbar" tabindex="33" data-l10n-id="pdfjs-editor-ink-button"><span data-l10n-id="pdfjs-editor-ink-button-label">Draw</span></button>
                  <button id="editorStamp" class="toolbarButton" disabled="disabled" title="Add or edit images" role="radio" aria-checked="false" aria-controls="editorStampParamsToolbar" tabindex="34" data-l10n-id="pdfjs-editor-stamp-button"><span data-l10n-id="pdfjs-editor-stamp-button-label">Add or edit images</span></button>
                </div>
                <div id="editorModeSeparator" class="verticalToolbarSeparator"></div>
                <button id="print" class="toolbarButton hiddenMediumView" title="Print" tabindex="41" data-l10n-id="pdfjs-print-button"><span data-l10n-id="pdfjs-print-button-label">Print</span></button>
                <button id="download" class="toolbarButton hiddenMediumView" title="Save" tabindex="42" data-l10n-id="pdfjs-save-button"><span data-l10n-id="pdfjs-save-button-label">Save</span></button>
                <div class="verticalToolbarSeparator hiddenMediumView"></div>
                <button id="secondaryToolbarToggle" class="toolbarButton" title="Tools" tabindex="43" data-l10n-id="pdfjs-tools-button" aria-expanded="false" aria-controls="secondaryToolbar"><span data-l10n-id="pdfjs-tools-button-label">Tools</span></button>
              </div>
              <div id="toolbarViewerMiddle">
                <div class="splitToolbarButton">
                  <button id="zoomOut" class="toolbarButton" title="Zoom Out" tabindex="21" data-l10n-id="pdfjs-zoom-out-button"><span data-l10n-id="pdfjs-zoom-out-button-label">Zoom Out</span></button>
                  <div class="splitToolbarButtonSeparator"></div>
                  <button id="zoomIn" class="toolbarButton" title="Zoom In" tabindex="22" data-l10n-id="pdfjs-zoom-in-button"><span data-l10n-id="pdfjs-zoom-in-button-label">Zoom In</span></button>
                </div>
                <span id="scaleSelectContainer" class="dropdownToolbarButton">
                  <select id="scaleSelect" title="Zoom" tabindex="23" data-l10n-id="pdfjs-zoom-select">
                    <option id="pageAutoOption" value="auto" selected="selected" data-l10n-id="pdfjs-page-scale-auto">Automatic Zoom</option>
                    <option id="pageActualOption" value="page-actual" data-l10n-id="pdfjs-page-scale-actual">Actual Size</option>
                    <option id="pageFitOption" value="page-fit" data-l10n-id="pdfjs-page-scale-fit">Page Fit</option>
                    <option id="pageWidthOption" value="page-width" data-l10n-id="pdfjs-page-scale-width">Page Width</option>
                    <option id="customScaleOption" value="custom" disabled="disabled" hidden="true" data-l10n-id="pdfjs-page-scale-percent">0%</option>
                  </select>
                </span>
              </div>
            </div>
            <div id="loadingBar"><div class="progress"><div class="glimmer"></div></div></div>
          </div>
        </div>
        <div id="viewerContainer" tabindex="0"><div id="viewer" class="pdfViewer"></div></div>
      </div>
      <div id="dialogContainer">
        <dialog class="dialog altText" id="altTextDialog" aria-labelledby="dialogLabel" aria-describedby="dialogDescription">
          <div id="altTextContainer" class="mainContainer">
            <div id="overallDescription">
              <span id="dialogLabel" class="title" data-l10n-id="pdfjs-editor-alt-text-dialog-label">Choose an option</span>
              <span id="dialogDescription" data-l10n-id="pdfjs-editor-alt-text-dialog-description">Alt text (alternative text) helps when people can’t see the image or when it doesn’t load.</span>
            </div>
            <div id="addDescription">
              <div class="radio">
                <div class="radioButton">
                  <input type="radio" id="descriptionButton" name="altTextOption" tabindex="0" aria-describedby="descriptionAreaLabel" checked>
                  <label for="descriptionButton" data-l10n-id="pdfjs-editor-alt-text-add-description-label">Add a description</label>
                </div>
                <div class="radioLabel">
                  <span id="descriptionAreaLabel" data-l10n-id="pdfjs-editor-alt-text-add-description-description">Aim for 1-2 sentences that describe the subject, setting, or actions.</span>
                </div>
              </div>
              <div class="descriptionArea">
                <textarea id="descriptionTextarea" aria-labelledby="descriptionAreaLabel" data-l10n-id="pdfjs-editor-alt-text-textarea" tabindex="0"></textarea>
              </div>
            </div>
            <div id="markAsDecorative">
              <div class="radio">
                <div class="radioButton">
                  <input type="radio" id="decorativeButton" name="altTextOption" aria-describedby="decorativeLabel">
                  <label for="decorativeButton" data-l10n-id="pdfjs-editor-alt-text-mark-decorative-label">Mark as decorative</label>
                </div>
                <div class="radioLabel">
                  <span id="decorativeLabel" data-l10n-id="pdfjs-editor-alt-text-mark-decorative-description">This is used for ornamental images, like borders or watermarks.</span>
                </div>
              </div>
            </div>
            <div id="buttons">
              <button id="altTextCancel" class="secondaryButton" tabindex="0"><span data-l10n-id="pdfjs-editor-alt-text-cancel-button">Cancel</span></button>
              <button id="altTextSave" class="primaryButton" tabindex="0"><span data-l10n-id="pdfjs-editor-alt-text-save-button">Save</span></button>
            </div>
          </div>
        </dialog>
        <dialog id="passwordDialog">
          <div class="row"><label for="password" id="passwordText" data-l10n-id="pdfjs-password-label">Enter the password to open this PDF file:</label></div>
          <div class="row"><input type="password" id="password" class="toolbarField"></div>
          <div class="buttonRow"><button id="passwordCancel" class="dialogButton"><span data-l10n-id="pdfjs-password-cancel-button">Cancel</span></button><button id="passwordSubmit" class="dialogButton"><span data-l10n-id="pdfjs-password-ok-button">OK</span></button></div>
        </dialog>
      </div>
      <div id="printContainer"></div>
    </div>
  </body>
</html>`;
}

function getFileName(filePath: string) {
    const lastSlashIndex = filePath.lastIndexOf('/');

    return lastSlashIndex >= 0 ? filePath.slice(lastSlashIndex + 1) : filePath;
}

async function waitForPdfViewerApplication(iframe: HTMLIFrameElement, signal: AbortSignal) {
    while (!signal.aborted) {
        const viewerWindow = iframe.contentWindow as PdfViewerFrameWindow | null;
        const application = viewerWindow?.PDFViewerApplication;

        if (application?.open) {
            await application.initializedPromise;
            return application;
        }

        await new Promise(resolve => window.setTimeout(resolve, 50));
    }

    throw new DOMException('PDF viewer initialization aborted.', 'AbortError');
}

export function PdfViewer({ filePath }: PdfViewerProps) {
    const iframeRef = useRef<HTMLIFrameElement>(null);
    const fileUrl = useMemo(() => getEncodedFileUrl(filePath), [filePath]);
    const fileName = useMemo(() => getFileName(filePath), [filePath]);
    const srcDoc = useMemo(() => buildViewerSrcDoc({
        localeUrl: getLocaleUrl(),
        pdfScriptUrl: getPdfScriptUrl(),
        viewerCssUrl: getViewerCssUrl(),
        embeddedViewerCssUrl: getEmbeddedViewerCssUrl(),
        viewerScriptUrl: getViewerScriptUrl()
    }), []);

    useEffect(() => {
        const iframe = iframeRef.current;

        if (!iframe) {
            return;
        }

        const abortController = new AbortController();

        async function loadPdf() {
            const response = await fetch(fileUrl, {
                credentials: 'include',
                signal: abortController.signal
            });

            if (!response.ok) {
                throw new Error(`Failed to load PDF file: ${response.status}`);
            }

            const [application, arrayBuffer] = await Promise.all([
                waitForPdfViewerApplication(iframe, abortController.signal),
                response.arrayBuffer()
            ]);

            if (abortController.signal.aborted) {
                return;
            }

            const data = new Uint8Array(arrayBuffer);

            await application.close?.();
            await application.open({
                data,
                originalUrl: fileName
            });
        }

        loadPdf().catch((error: unknown) => {
            if (!abortController.signal.aborted) {
                console.error('Failed to load PDF in embedded viewer.', error);
            }
        });

        return () => {
            abortController.abort();
        };
    }, [fileName, fileUrl]);

    return (
        <iframe
            ref={iframeRef}
            title="PDF.js viewer"
            srcDoc={srcDoc}
            className="flex-fill w-100 h-100 bg-white border-0"
            style={{ minHeight: 0 }}
        />
    );
}
