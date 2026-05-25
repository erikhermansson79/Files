import { useState, useEffect, useCallback, useContext, useMemo, useRef } from 'react';
import { useImmerReducer } from 'use-immer';
import classnames from 'classnames';

import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';

import { useTranslation } from 'react-i18next';

import { FileList } from './FileList';
import { FilesProviders } from './FilesProviders';
import { filesReducer, getDirectoryInfo } from './filesReducer';
import { getFolderContentAsync, getThumbnailAsync } from '../services/files';
import { Breadcrumbs } from './Breadcrumbs';
import { Pagination } from './Pagination';

import { UserContext } from '../UserContext';

const modalBodyStyle = {
    height: "50vh"
};

const previewPaneStyle = {
    width: "35%",
    minWidth: 280,
    maxWidth: 420
};

const defaultValidExtensions = [".png", ".jpg", ".bmp", ".gif"];

export interface SelectImageModalProps {
    onClose: () => void;
    onSelectImage: (image: {
        name?: string;
        path?: string;
        data?: string | ArrayBuffer | null;
    }) => void;
    initialPath: string;
    validExtensions?: readonly string[];
}

export function SelectImageModal(props: SelectImageModalProps) {
    return (
        <FilesProviders>
            <SelectImageModalContent {...props} />
        </FilesProviders>
    );
}

function SelectImageModalContent({ onClose, onSelectImage, initialPath, validExtensions }: SelectImageModalProps) {
    const [path, setPath] = useState(initialPath);
    const [page, setPage] = useState(1);
    const [data, dispatch] = useImmerReducer(filesReducer, { selectedItems: [] });
    const [selectedItem, setSelectedItem] = useState<any>();
    const [selectedImageData, setSelectedImageData] = useState<any>();
    const effectiveValidExtensions = useMemo(
        () => new Set((validExtensions ?? defaultValidExtensions).map(extension => extension.toLowerCase())),
        [validExtensions]
    );

    const { t } = useTranslation();

    const { disablePagingInFiles } = useContext(UserContext) || {};
    const pageSize = disablePagingInFiles ? "0" : "20";

    const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
    // thumbnailSize is an integer number of pixels; default 128
    const [thumbnailSize, setThumbnailSize] = useState<number>(128);

    // Map of item.path + size -> object URL for fetched thumbnails
    const [thumbnailsMap, setThumbnailsMap] = useState<Record<string, string>>({});
    const createdUrlsRef = useRef<string[]>([]);

    function getThumbnailCacheKey(path: string, size: number) {
        return `${size}:${path}`;
    }

    const reload = useCallback(() => {
        const thumbnails = viewMode === 'grid';
        getDirectoryInfo(path, page, pageSize, dispatch, undefined, thumbnails, thumbnails ? thumbnailSize : undefined);
    }, [path, page, pageSize, dispatch, viewMode, thumbnailSize]);

    useEffect(() => {
        reload();
    }, [path, page, pageSize, reload]);

    useEffect(() => {
        async function getImageData(item) {
            const response = await getFolderContentAsync(item.path, 1, pageSize);
            const data = await response.blob();

            const reader = new FileReader();
            reader.onloadend = () => {
                setSelectedImageData(reader.result);
            };
            reader.readAsDataURL(data);
        }

        if (selectedItem) {
            getImageData(selectedItem);
        }
        else {
            setSelectedImageData(undefined);
        }
    }, [selectedItem, pageSize]);

    // Fetch thumbnails asynchronously for grid view
    useEffect(() => {
        if (viewMode !== 'grid' || !data?.items) return;

        const abortController = new AbortController();

        data.items.forEach(item => {
            if (item.type === 'file' && effectiveValidExtensions.has(item.extension.toLowerCase())) {
                const key = getThumbnailCacheKey(item.path, thumbnailSize);
                if (!thumbnailsMap[key]) {
                    getThumbnailAsync(item.path, thumbnailSize).then(blob => {
                        if (abortController.signal.aborted) return;
                        const url = URL.createObjectURL(blob);
                        createdUrlsRef.current.push(url);
                        setThumbnailsMap(prev => {
                            if (prev[key]) {
                                try { URL.revokeObjectURL(prev[key]); } catch { }
                            }
                            return { ...prev, [key]: url };
                        });
                    }).catch(() => { /* ignore */ });
                }
            }
        });

        return () => {
            abortController.abort();
        };
    }, [viewMode, data?.items, thumbnailSize, effectiveValidExtensions]);

    // Revoke object URLs when component unmounts
    useEffect(() => {
        return () => {
            createdUrlsRef.current.forEach(u => { try { URL.revokeObjectURL(u); } catch { } });
        };
    }, []);

    const strategy = {
        getItemScope: function (item) {
            return {
                item,
                disabled: item.type === "file" && !effectiveValidExtensions.has(item.extension.toLowerCase())
            };
        },
        HeaderRowComponent: function ({ children }) {
            return (
                <tr>
                    {/* @ts-expect-error */}
                    <th scope="col" width="0px"></th>
                    {children}
                </tr>
            );
        },
        ItemRowComponent: function ({ itemScope, children }) {
            return (
                <tr className={classnames("p-2 border-top", { "disabled": itemScope.disabled, "hidden-item": itemScope.item.isHidden })}>
                    <td width="10px"></td>
                    {children}
                </tr>
            );
        },
        gotoPath: function (path) {
            setPath(path);
            setPage(1);
        },
        onItemClick: function (item) {
            if (item.type === "directory") {
                setPath(item.path);
                setPage(1);
            } else {
                setSelectedItem(item);
            }
        },
        gotoFolder: function (item) {
            setPath(path ? `${path}/${item.name}` : item.name);
            setPage(1);
        },
        gotoPage: function (page) {
            setPage(page);
        }
    };

    function getThumbnailSrc(item) {
        if (!item) return undefined;
        // prefer fetched thumbnails
        if (item.path) {
            const key = getThumbnailCacheKey(item.path, thumbnailSize);
            if (thumbnailsMap[key]) return thumbnailsMap[key];
        }
        const raw = item.thumbnail || item.thumbnailData || item.thumbnailBase64 || item.thumbnailUrl || item.iconData;
        if (!raw) return undefined;
        if (typeof raw !== 'string') return undefined;
        if (raw.startsWith('data:')) return raw;
        if (raw.startsWith('http') || raw.startsWith('/')) return raw;
        return `data:image/png;base64,${raw}`;
    }

    return (
        <Modal
            show={true}
            onHide={onClose}
            size="xl"
            aria-labelledby="contained-modal-title-vcenter"
            animation={false}
            centered>
            <Modal.Header closeButton>
                <Modal.Title id="contained-modal-title-vcenter">
                    Välj bild
                </Modal.Title>
            </Modal.Header>
            <Modal.Body className="d-flex overflow-hidden p-0" style={modalBodyStyle}>
                <div style={{ minWidth: 400 }} className="flex-fill overflow-auto p-3">
                    <div className="d-flex align-items-center mb-2">
                        <Button size="sm" variant={viewMode === 'list' ? 'primary' : 'outline-secondary'} className="me-2" onClick={() => setViewMode('list')}>{t('list')}</Button>
                        <Button size="sm" variant={viewMode === 'grid' && thumbnailSize === 128 ? 'primary' : 'outline-secondary'} className="me-1" onClick={() => { setViewMode('grid'); setThumbnailSize(128); }}>{t('grid_small')}</Button>
                        <Button size="sm" variant={viewMode === 'grid' && thumbnailSize === 256 ? 'primary' : 'outline-secondary'} onClick={() => { setViewMode('grid'); setThumbnailSize(256); }}>{t('grid_large')}</Button>
                    </div>

                    {viewMode === 'list' &&
                        <FileList strategy={strategy} data={data} isInModal={true} />
                    }

                    {viewMode === 'grid' && data && data.items &&
                        <>
                            {data.breadcrumbs && <Breadcrumbs strategy={strategy} breadcrumbs={data.breadcrumbs} className="mb-3" />}
                            <div className="d-flex flex-wrap">
                                {data.items.map(item => {
                                    const disabled = item.type === 'file' && !effectiveValidExtensions.has(item.extension.toLowerCase());
                                    const thumbSrc = getThumbnailSrc(item);
                                    const width = thumbnailSize + 24;
                                    const innerHeight = Math.round(thumbnailSize * 0.9);
                                    const iconSize = Math.round(thumbnailSize * 0.4);

                                    return (
                                        <div key={item.name} onClick={() => strategy.onItemClick(item)} style={{ width, border: selectedItem?.name === item.name ? '2px solid #0d6efd' : '1px solid #dee2e6', borderRadius: 6, padding: 8, marginRight: 8, marginBottom: 8, cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.6 : 1 }}>
                                            <div style={{ height: innerHeight, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                                                {item.type === 'directory' && <span className="fiv-sqo fiv-icon-folder" style={{ fontSize: iconSize }}></span>}
                                                {item.type === 'file' && thumbSrc && <img src={thumbSrc} style={{ maxWidth: '100%', maxHeight: '100%' }} />}
                                                {item.type === 'file' && !thumbSrc && <span className={`fiv-sqo fiv-icon-${item.extension?.slice(1)}`}></span>}
                                                {item.type === 'link' && <img src={`data:image/png;base64,${item.iconData}`} />}
                                            </div>
                                            <div className="mt-2 text-truncate" style={{ maxWidth: '100%' }}>{item.type === 'link' ? item.displayName : item.name}</div>
                                        </div>
                                    );
                                })}
                            </div>
                            {data.pagination && <div className="mt-2"><Pagination paginationData={data.pagination} gotoPage={strategy.gotoPage} isInModal={true} className="m-0 pb-1" /></div>}
                        </>
                    }
                </div>
                <div style={previewPaneStyle} className="border-start overflow-auto p-3">
                    {selectedImageData &&
                        <>
                            <div className="fs-4">Förhandsgranskning</div>
                            <div className="mt-3 text-break">{selectedItem?.path}</div>
                            <img src={selectedImageData} className="w-100 mt-3" />
                        </>
                    }
                </div>
            </Modal.Body>
            <Modal.Footer>
                <Button disabled={!selectedItem} onClick={() => onSelectImage({ name: selectedItem?.name, path: selectedItem?.path, data: selectedImageData })}>Välj bild</Button>
                <Button variant="secondary" onClick={onClose}>Avbryt</Button>
            </Modal.Footer>
        </Modal>
    );
}
