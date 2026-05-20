import { useState, useEffect, useCallback, useContext, useMemo } from 'react';
import { useImmerReducer } from 'use-immer';
import classnames from 'classnames';

import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';

import { FileList } from './FileList';
import { FilesProviders } from './FilesProviders';
import { filesReducer, getDirectoryInfo } from './filesReducer';
import { getFolderContentAsync } from '../services/files';

import { UserContext } from '../UserContext';

const modalBodyStyle = {
    height: "50vh"
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

    const { disablePagingInFiles } = useContext(UserContext) || {};
    const pageSize = disablePagingInFiles ? "0" : "20";

    const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
    const [thumbnailSize, setThumbnailSize] = useState<'small' | 'large'>('small');

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
            <Modal.Body className="p-1 d-flex overflow-auto" style={modalBodyStyle}>
                <div style={{ minWidth: 400 }} className="p-3">
                    <div className="d-flex align-items-center mb-2">
                        <Button size="sm" variant={viewMode === 'list' ? 'primary' : 'outline-secondary'} className="me-2" onClick={() => setViewMode('list')}>Lista</Button>
                        <Button size="sm" variant={viewMode === 'grid' && thumbnailSize === 'small' ? 'primary' : 'outline-secondary'} className="me-1" onClick={() => { setViewMode('grid'); setThumbnailSize('small'); }}>Grid small</Button>
                        <Button size="sm" variant={viewMode === 'grid' && thumbnailSize === 'large' ? 'primary' : 'outline-secondary'} onClick={() => { setViewMode('grid'); setThumbnailSize('large'); }}>Grid large</Button>
                    </div>

                    {viewMode === 'list' &&
                        <FileList strategy={strategy} data={data} isInModal={true} />
                    }

                    {viewMode === 'grid' && data && data.items &&
                        <div className="d-flex flex-wrap">
                            {data.items.map(item => {
                                const disabled = item.type === 'file' && !effectiveValidExtensions.has(item.extension.toLowerCase());
                                const thumbSrc = getThumbnailSrc(item);
                                const width = thumbnailSize === 'small' ? 120 : 200;

                                return (
                                    <div key={item.name} onClick={() => strategy.onItemClick(item)} style={{ width, border: selectedItem?.name === item.name ? '2px solid #0d6efd' : '1px solid #dee2e6', borderRadius: 6, padding: 8, marginRight: 8, marginBottom: 8, cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.6 : 1 }}>
                                        <div style={{ height: thumbnailSize === 'small' ? 80 : 140, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                                            {item.type === 'directory' && <span className="fiv-sqo fiv-icon-folder" style={{ fontSize: thumbnailSize === 'small' ? 32 : 48 }}></span>}
                                            {item.type === 'file' && thumbSrc && <img src={thumbSrc} style={{ maxWidth: '100%', maxHeight: '100%' }} />}
                                            {item.type === 'file' && !thumbSrc && <span className={`fiv-sqo fiv-icon-${item.extension?.slice(1)}`}></span>}
                                            {item.type === 'link' && <img src={`data:image/png;base64,${item.iconData}`} />}
                                        </div>
                                        <div className="mt-2 text-truncate" style={{ maxWidth: '100%' }}>{item.type === 'link' ? item.displayName : item.name}</div>
                                    </div>
                                );
                            })}
                        </div>
                    }
                </div>
                <div className="p-3">
                {selectedImageData &&
                    <>
                        <div className="fs-4">Förhandsgranskning</div>
                        <div className="mt-3">{selectedItem?.path}</div>
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
