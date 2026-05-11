import { useState, useEffect, useCallback, useContext } from 'react';
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
    const effectiveValidExtensions = validExtensions ?? defaultValidExtensions;

    const { disablePagingInFiles } = useContext(UserContext) || {};
    const pageSize = disablePagingInFiles ? "0" : "20";

    const reload = useCallback(() => {
        getDirectoryInfo(path, page, pageSize, dispatch, undefined);
    }, [path, page, pageSize, dispatch]);

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
    }, [selectedItem]);

    const strategy = {
        getItemScope: function (item) {
            return {
                item,
                disabled: item.type === "file" && !effectiveValidExtensions.includes(item.extension)
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
                <div>
                    <FileList strategy={strategy} data={data} />
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
