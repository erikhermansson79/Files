import { useEffect, useState } from 'react';
import { useParams, useSearchParams, useLocation, useNavigate, Link } from 'react-router-dom';
import { useImmerReducer } from 'use-immer';
import classnames from 'classnames';

import {
    filesReducer, getDirectoryInfo,
    SET_CURRENT_ITEM, SELECT_ITEM, TOGGLE_ITEM_SELECTION, TOGGLE_LIST_SELECTION, RETAIN_BY_NAME
} from './filesReducer';

import { FileCommands } from './FileCommands';
import { FileDisplay } from './FileDisplay';
import { FileList } from './FileList';
import { CheckBox } from './CheckBox';
import { FilesProviders } from './FilesProviders';

import { useKeyEvent } from '../useKeyEvent';

export default function Files({ isAdmin, disablePagingInFiles, customMenuItems = null }) {
    const navigate = useNavigate();
    const params = useParams();
    const location = useLocation();
    const [search, setSearch] = useSearchParams();

    const path = params['*'] || '';
    const rootRoute = `/${location.pathname.split('/')[1]}`;
    const page = search.get("page") || "1";

    const [data, dispatch] = useImmerReducer(filesReducer, { selectedItems: [], isLoading: false });
    const selectedItems = data?.selectedItems || [];
    const currentItem = data?.currentItem;
    const allSelected = selectedItems.length === data.items?.length;

    const [showMoveModal, setShowMoveModal] = useState(false);
    const [showCopyModal, setShowCopyModal] = useState(false);
    const [showCreateFolderModal, setShowCreateFolderModal] = useState(false);
    const [showCreateURLModal, setShowCreateURLModal] = useState(false);
    const [showChangeItemNameModal, setShowChangeItemNameModal] = useState(false);
    const isInModal = showMoveModal || showCopyModal || showCreateFolderModal || showCreateURLModal || showChangeItemNameModal;
    const modalProps = {
        showMoveModal, setShowMoveModal,
        showCopyModal, setShowCopyModal,
        showCreateFolderModal, setShowCreateFolderModal,
        showCreateURLModal, setShowCreateURLModal,
        showChangeItemNameModal, setShowChangeItemNameModal,
        isInModal
    };

    const pageSize = disablePagingInFiles ? "0" : "20";

    function reload() {
        getDirectoryInfo(path, page, pageSize, dispatch, undefined);
    }

    useEffect(() => {
        reload();
    }, [path, page, pageSize]);

    function setCurrentItem(item) {
        dispatch({ type: SET_CURRENT_ITEM, payload: item });
    }

    function selectItem(item) {
        dispatch({ type: SELECT_ITEM, payload: item });
    }

    function toggleItemSelection(item) {
        dispatch({ type: TOGGLE_ITEM_SELECTION, payload: item });
    }

    function toggleListSelection() {
        dispatch({ type: TOGGLE_LIST_SELECTION, payload: allSelected });
    }

    function retainNames(namesToRetainInSelection, nameToRetainAsCurrent) {
        dispatch({ type: RETAIN_BY_NAME, payload: { namesToRetainInSelection, nameToRetainAsCurrent } });
    }

    const conditionalPath = path ? `/${path}` : ""

    function gotoItem(item) {
        navigate(`${rootRoute}${conditionalPath}/${item.name}`);
    }

    function gotoPath(path) {
        const conditionalPath = path.startsWith('/') ? path : `/${path}`;

        navigate(`${rootRoute}${conditionalPath}`);
    }

    const strategy = {
        getItemScope: function (item) {
            return {
                item,
                isSelected: selectedItems.includes(item),
                isCurrentItem: currentItem === item
            };
        },
        HeaderRowComponent: function ({ children }) {
            return (
                <tr>
                    {/* @ts-expect-error */}
                    <th scope="col" width="40px" className="text-center">
                        <CheckBox isChecked={allSelected} className={classnames("fileCheck", { "d-none": true })} onClick={toggleListSelection} />
                    </th>
                    {children}
                </tr>
            );
        },
        ItemRowComponent: function ({ itemScope, children }) {
            return (
                <tr className={classnames("p-2 border-top", { "table-active": itemScope.isSelected, "currentItem": itemScope.isCurrentItem, "hidden-item": itemScope.item.isHidden })} onClick={() => { selectItem(itemScope.item); setCurrentItem(itemScope.item); }}>
                    <td width="40px" className="text-center">
                        <CheckBox isChecked={itemScope.isSelected} className={classnames("fileCheck", { "d-none": !itemScope.isSelected })} onClick={ev => { ev.stopPropagation(); toggleItemSelection(itemScope.item); setCurrentItem(itemScope.item); }} />
                    </td>
                    {children}
                </tr>
            );
        },
        gotoPath: gotoPath,
        onItemClick: function (item) {
            if (item.type === "link" && item.linkType === "URL") {
                window.open(item.linkTarget, "_blank");
            } else {
                gotoPath(item.path);
            }
        },
        gotoItem: gotoItem,
        gotoPage: function (page) {
            setSearch(page !== 1 ? { page } : {});
        }
    };

    function moveUp(shiftKey) {
        if (!currentItem) {
            return;
        }

        const currentIndex = data?.items.indexOf(currentItem);
        if (currentIndex > 0) {
            const nextItem = data.items[currentIndex - 1];
            if (shiftKey === true) {
                if (selectedItems.includes(nextItem)) {
                    toggleItemSelection(currentItem);
                } else {
                    toggleItemSelection(nextItem);
                }
            } else {
                selectItem(nextItem);
            }
            setCurrentItem(nextItem);
        }
    }

    function moveDown(shiftKey) {
        if (!currentItem) {
            return;
        }

        const currentIndex = data?.items.indexOf(currentItem);
        if (currentIndex < data.items.length - 1) {
            const nextItem = data.items[currentIndex + 1];
            if (shiftKey === true) {
                if (selectedItems.includes(nextItem)) {
                    toggleItemSelection(currentItem);
                } else {
                    toggleItemSelection(nextItem);
                }
            } else {
                selectItem(nextItem);
            }
            setCurrentItem(nextItem);
        }
    }

    useKeyEvent((event) => {
        if (isInModal) {
            return;
        }

        if (event.key.toLowerCase() === 'arrowup') {
            event.preventDefault();
            event.stopPropagation();
            moveUp(event.shiftKey);
        }
        if (event.key.toLowerCase() === 'arrowdown') {
            event.preventDefault();
            event.stopPropagation();
            moveDown(event.shiftKey);
        }
        if (event.key.toLowerCase() === ' ') {
            event.preventDefault();
            event.stopPropagation();
            toggleItemSelection(currentItem);
        }
        if (event.ctrlKey === true && event.key.toLowerCase() === 'a') {
            event.preventDefault();
            event.stopPropagation();
            toggleListSelection();
        }
        if (event.key.toLowerCase() === 'enter') {
            event.preventDefault();
            event.stopPropagation();
            if (currentItem.type === "directory") {
                gotoItem(currentItem);
            }
        }
        if (event.key.toLowerCase() === 'backspace') {
            event.preventDefault();
            event.stopPropagation();
            if (!data?.parentPath && data?.path) {
                gotoPath("");
            }
            else if (data?.parentPath) {
                gotoPath(data?.parentPath);
            }
        }
    }, this);

    return (
        <FilesProviders isAdmin={isAdmin} disablePagingInFiles={disablePagingInFiles}>
            <div className="files">
                <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/file-icon-vectors@1.0.0/dist/file-icon-square-o.min.css" />
                <FileCommands path={path} reload={reload} selectedItems={selectedItems} retainNames={retainNames} customMenuItems={customMenuItems} {...modalProps} />

                <FileList strategy={strategy} data={data} {...modalProps} />

                {data.filePath &&
                    <FileDisplay filePath={data.filePath} rootRoute={rootRoute} />
                }
            </div>
        </FilesProviders>
    );
}
