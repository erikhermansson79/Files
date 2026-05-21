import { useRef, useContext } from 'react';
import { useDispatch } from 'react-redux';
import classnames from 'classnames';
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import NavDropdown from 'react-bootstrap/NavDropdown';
import Dropdown from 'react-bootstrap/Dropdown';
import DropdownButton from 'react-bootstrap/DropdownButton';
import { CreateFolderModal } from './CreateFolderModal';
import { CreateURLModal } from './CreateURLModal';
import { SelectFolderModal } from './SelectFolderModal';
import { ChangeItemNameModal } from './ChangeItemNameModal';
//import { Settings } from './Settings';
import { startAction, UPLOAD_FILE_ACTION, DELETE_ITEM_ACTION, MOVE_ITEM_ACTION, COPY_ITEM_ACTION } from '../services/fileActions';
import { postDownloadAsync, postCreateFolderAsync, postCreateURLAsync, postChangeItemNameAsync, postToggleItemHiddenAsync } from '../services/files';
import { confirm } from './ConfirmDialog';
import { UserContext } from '../UserContext';

import { useKeyEvent } from '../useKeyEvent';

export function FileCommands({ path, reload, selectedItems, retainNames, customMenuItems, ...rest }) {
    const dispatch = useDispatch();
    const filesRef = useRef<HTMLInputElement>(null);
    const folderRef = useRef<HTMLInputElement>(null);

    const { isAdmin } = useContext(UserContext) || {};

    const {
        showMoveModal, setShowMoveModal,
        showCopyModal, setShowCopyModal,
        showCreateFolderModal, setShowCreateFolderModal,
        showCreateURLModal, setShowCreateURLModal,
        showChangeItemNameModal, setShowChangeItemNameModal
    } = rest;

    useKeyEvent((event) => {
        if (!showCreateFolderModal && !showCreateURLModal && !showMoveModal && !showCopyModal && !showChangeItemNameModal) {
            if (event.shiftKey === true && event.key.toLowerCase() === 'm') {
                event.preventDefault();
                event.stopPropagation();
                setShowCreateFolderModal(true);
            }
            if (event.ctrlKey === true && event.key.toLowerCase() === 'f') {
                event.preventDefault();
                event.stopPropagation();
                if (filesRef.current) {
                    filesRef.current.value = "";
                    filesRef.current.click();
                }
            }
            if (event.ctrlKey === true && event.key.toLowerCase() === 'm') {
                event.preventDefault();
                event.stopPropagation();
                if (folderRef.current) {
                    folderRef.current.value = "";
                    folderRef.current.click();
                }
            }
            if (event.key.toLowerCase() === 'f2') {
                event.preventDefault();
                event.stopPropagation();
                if (selectedItems.length === 1) {
                    setShowChangeItemNameModal(true);
                }
            }
            if (event.key.toLowerCase() === 'delete') {
                event.preventDefault();
                event.stopPropagation();
                if (selectedItems.length > 0) {
                    deleteItems();
                }
            }
        }
    }, this);

    function onCreateFolder(folderName) {
        async function createFolder(name) {
            const response = await postCreateFolderAsync(path, name);
            if (response.ok) {
                reload();
            }
        }

        createFolder(folderName);

        setShowCreateFolderModal(false)
    }

    function onCreateURL(displayName, url) {
        async function createURL(name, link) {
            const response = await postCreateURLAsync(path, name, link);
            if (response.ok) {
                reload();
            }
        }

        createURL(displayName, url);

        setShowCreateURLModal(false)
    }

    function onChangeItemName(item, name) {
        async function changeItemName(path, name, type) {
            const response = await postChangeItemNameAsync(path, name, type);
            if (response.ok) {
                reload();
            }
        }

        if (name !== item.name) {
            const namesToRetainInSelection = [...selectedItems.filter(si => si.name !== item.name).map(i => i.name), name];
            retainNames(namesToRetainInSelection, name);

            changeItemName(
                `${path}/${item.name}`,
                name,
                item.type
            );
        }

        setShowChangeItemNameModal(false);
    }

    async function onToggleItemHidden(item) {
        const response = await postToggleItemHiddenAsync(item.path, item.type);
        if (response.ok) {
            reload();
        }
    }

    function moveItems(destination) {
        setShowMoveModal(false);

        setTimeout(() => {
            const really = window.confirm(`Vill du verkligen flytta ${selectedItems.length} objekt till /${destination}?`);
            if (really) {
                for (const item of selectedItems) {
                    const targetPath = path.endsWith('/')
                        ? path.slice(0, -1)
                        : path;
                    const target = `${targetPath}/${item.name}`;

                    dispatch(startAction({ action: MOVE_ITEM_ACTION, item, meta: { target, destination, reload, name: item.name } }));
                }
            }
        }, 100);
    }

    function copyItems(destination) {
        setShowCopyModal(false);

        setTimeout(() => {
            const really = window.confirm(`Vill du verkligen kopiera ${selectedItems.length} objekt till /${destination}?`);
            if (really) {
                for (const item of selectedItems) {
                    const targetPath = path.endsWith('/')
                        ? path.slice(0, -1)
                        : path;
                    const target = `${targetPath}/${item.name}`;

                    dispatch(startAction({ action: COPY_ITEM_ACTION, item, meta: { target, destination, reload, name: item.name } }));
                }
            }
        }, 100);
    }

    function addFiles(fileList) {
        for (const file of fileList) {
            const fileName = file?.webkitRelativePath || file?.name;
            const destination = path.endsWith('/')
                ? path.slice(0, -1)
                : path;
            const target = `${destination}/${fileName}`;

            dispatch(startAction({ action: UPLOAD_FILE_ACTION, file, meta: { target, reload, name: fileName, destination } }));
        }
    }

    async function downloadItems() {
        await postDownloadAsync(selectedItems.map(si => si.path));
    }

    function deleteItems() {
        const really = window.confirm(`Vill du verkligen ta bort ${selectedItems.length} objekt?`);
        if (really) {
            for (const item of selectedItems) {
                const destination = path.endsWith('/')
                    ? path.slice(0, -1)
                    : path;
                const target = `${destination}/${item.name}`;

                dispatch(startAction({ action: DELETE_ITEM_ACTION, item, meta: { target, reload, name: item.name, destination } }));
            }
        }
    }

    return (
        <>
            {showCreateFolderModal &&
                <CreateFolderModal onClose={() => setShowCreateFolderModal(false)} onCreateFolder={onCreateFolder} />
            }

            {showCreateURLModal &&
                <CreateURLModal onClose={() => setShowCreateURLModal(false)} onCreateURL={onCreateURL} />
            }

            {showMoveModal &&
                <SelectFolderModal onClose={() => setShowMoveModal(false)} onSelectFolder={moveItems} initialPath={path} selectedItems={selectedItems} title="Flytta" />
            }

            {showCopyModal &&
                <SelectFolderModal onClose={() => setShowCopyModal(false)} onSelectFolder={copyItems} initialPath={path} selectedItems={selectedItems} title="Kopiera" />
            }

            {showChangeItemNameModal &&
                <ChangeItemNameModal item={selectedItems[0]} onClose={() => setShowChangeItemNameModal(false)} onChangeItemName={onChangeItemName} />
            }

            <Navbar className={classnames("m-2", {
                "box-shadow rounded-3": selectedItems.length > 0
            })}>
                <Container fluid className="">
                    <Navbar.Toggle aria-controls="navbar-dark-example" />
                    <Navbar.Collapse id="navbar-dark-example" className="w-100">
                        <input ref={filesRef} type="file" multiple className="d-none" onChange={ev => addFiles(ev.target.files)} />
                        {/* @ts-expect-error */}
                        <input ref={folderRef} type="file" multiple webkitdirectory="true" className="d-none" onChange={ev => addFiles(ev.target.files)} />
                        <Nav className="align-items-center gap-2 w-100 flex-wrap">
                            {isAdmin && selectedItems.length === 0 &&
                                <>
                                    <DropdownButton title={<><i className="fa-solid fa-fw fa-plus"></i> Ny</>} >
                                        <Dropdown.Item className="d-flex" onClick={() => setShowCreateFolderModal(true)}><span className="me-3"><i className="fa-solid fa-folder fa-fw fs-6"></i> Mapp</span> <span className="fs-6 ms-auto text-muted">(Shift + M)</span></Dropdown.Item>
                                        <Dropdown.Item className="d-flex" onClick={() => setShowCreateURLModal(true)}><span className="me-3"><i className="fa-solid fa-link fa-fw fs-6"></i> Webblänk</span></Dropdown.Item>
                                    </DropdownButton>
                                    <NavDropdown title={<><i className="fa-solid fa-fw fa-upload"></i> Ladda upp</>}>
                                        <NavDropdown.Item className="d-flex" onClick={() => { filesRef.current.value = ""; filesRef.current.click(); }}><span className="me-3">Filer</span> <span className="fs-6 ms-auto text-muted">(Ctrl + F)</span></NavDropdown.Item>
                                        <NavDropdown.Item className="d-flex" onClick={() => { folderRef.current.value = ""; folderRef.current.click(); }}><span className="me-3">Mapp</span> <span className="fs-6 ms-auto text-muted">(Ctrl + M)</span></NavDropdown.Item>
                                    </NavDropdown>
                                </>
                            }
                            {selectedItems.length > 0 &&
                                <>
                                    <Nav.Link onClick={downloadItems}><i className="fa-solid fa-fw fa-download"></i> Ladda ner</Nav.Link>

                                    {isAdmin &&
                                        <>
                                            <Nav.Link onClick={deleteItems} title="Delete"><i className="fa-solid fa-fw fa-trash"></i> Ta bort</Nav.Link>
                                            <Nav.Link onClick={() => setShowMoveModal(true)}><i className="fa-solid fa-fw fa-file-export"></i> Flytta till</Nav.Link>
                                            <Nav.Link onClick={() => setShowCopyModal(true)}><i className="fa-solid fa-fw fa-copy"></i> Kopiera till</Nav.Link>
                                        </>
                                    }
                                    {isAdmin && selectedItems.length === 1 &&
                                        <>
                                            <Nav.Link onClick={() => setShowChangeItemNameModal(true)} title="F2"><i className="fa-solid fa-fw fa-pen"></i> Byt namn</Nav.Link>
                                            <Nav.Link onClick={() => onToggleItemHidden(selectedItems[0])}>
                                                {selectedItems[0].isHidden &&
                                                    <>
                                                        <i className="fa-regular fa-eye"></i> Visa
                                                    </>
                                                }
                                                {!selectedItems[0].isHidden &&
                                                    <>
                                                        <i className="fa-regular fa-eye-slash"></i> Dölj
                                                    </>
                                                }
                                            </Nav.Link>
                                        </>
                                    }
                                    <Nav.Item className="ms-auto rounded-4 border border-dark py-2 px-3">{selectedItems.length} markeras</Nav.Item>
                                </>
                            }
                            {customMenuItems &&
                                <Nav.Item className={classnames("py-2 px-3 flex-shrink-1 link", {
                                    "ms-0": selectedItems.length > 0,
                                    "ms-auto": selectedItems.length === 0,
                                })}>
                                    {customMenuItems}
                                </Nav.Item>
                            }
                        </Nav>
                    </Navbar.Collapse>
                </Container>
            </Navbar>
        </>
    );
}