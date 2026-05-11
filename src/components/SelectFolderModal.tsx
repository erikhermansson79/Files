import { useState, useEffect, useCallback, useContext } from 'react';
import { useImmerReducer } from 'use-immer';
import classnames from 'classnames';

import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';

import { FileList } from './FileList';
import { FilesProviders } from './FilesProviders';
import { filesReducer, getDirectoryInfo } from './filesReducer';

import { UserContext } from '../UserContext';

const modalBodyStyle = {
    height: "50vh"
};

export function SelectFolderModal({ onClose, onSelectFolder, initialPath, selectedItems, title }) {
    return (
        <FilesProviders>
            <SelectFolderModalContent onClose={onClose} onSelectFolder={onSelectFolder} initialPath={initialPath} selectedItems={selectedItems} title={title} />
        </FilesProviders>
    );
}

function SelectFolderModalContent({ onClose, onSelectFolder, initialPath, selectedItems, title }) {
    const [path, setPath] = useState(initialPath);
    const [page, setPage] = useState(1);
    const [data, dispatch] = useImmerReducer(filesReducer, { selectedItems: [] });

    const { disablePagingInFiles } = useContext(UserContext) || {};
    const pageSize = disablePagingInFiles ? "0" : "20";

    const reload = useCallback(() => {
        getDirectoryInfo(path, page, pageSize, dispatch, undefined);
    }, [path, page, pageSize, dispatch]);

    useEffect(() => {
        reload();
    }, [path, page, pageSize, reload]);

    const strategy = {
        getItemScope: function (item) {
            return {
                item,
                disabled: selectedItems.some(si => si.fullName === item.fullName)
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
            setPath(item.path);
            setPage(1);
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
            size="lg"
            aria-labelledby="contained-modal-title-vcenter"
            animation={false}
            centered>
            <Modal.Header closeButton>
                <Modal.Title id="contained-modal-title-vcenter">
                    {title} {selectedItems.length} objekt
                </Modal.Title>
            </Modal.Header>
            <Modal.Body className="p-1 pb-3 overflow-auto" style={modalBodyStyle}>
                <FileList strategy={strategy} data={data} />
            </Modal.Body>
            <Modal.Footer>
                <Button disabled={path === initialPath} onClick={() => onSelectFolder(path)}>{title} hit</Button>
                <Button variant="secondary" onClick={onClose}>Avbryt</Button>
            </Modal.Footer>
        </Modal>
    );
}
