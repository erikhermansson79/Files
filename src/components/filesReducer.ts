import { getFolderContentAsync } from '../services/files';

export const SET_DATA = "setData";
export const SET_ISLOADING = "setIsLoading";
export const SET_FILE = "setFile";
export const SET_CURRENT_ITEM = "setCurrentItem";
export const SELECT_ITEM = "selectItem";
export const TOGGLE_ITEM_SELECTION = "toggleItemSelection";
export const TOGGLE_LIST_SELECTION = "toggleListSelection";
export const RETAIN_BY_NAME = "retainSelectionByName";

export async function getDirectoryInfo(path, page, pageSize, dispatch, filePath, thumbnails?, thumbnailSize?) {
    dispatch({ type: SET_ISLOADING, payload: true });
    const response = await getFolderContentAsync(path, page, pageSize, thumbnails, thumbnailSize);
    dispatch({ type: SET_ISLOADING, payload: false });
    if (response.headers.get("Content-Type").startsWith("application/json")) {
        const data = await response.json();
        dispatch({ type: SET_DATA, payload: data });
        if (filePath) {
            dispatch({ type: SET_FILE, payload: filePath });
        }
    } else {
        var lastSlashIndex = path.lastIndexOf('/');
        const folderPath = lastSlashIndex >= 0 ? path.slice(0, lastSlashIndex) : "";

        await getDirectoryInfo(folderPath, page, pageSize, dispatch, path, thumbnails, thumbnailSize);
    }
}

export function filesReducer(draft, action) {
    switch (action.type) {
        case SET_ISLOADING: {
            return { ...draft, isLoading: action.payload };
        }
        case SET_DATA: {
            const namesToRetainInSelection = draft.namesToRetainInSelection;
            const nameToRetainAsCurrent = draft.nameToRetainAsCurrent;

            const newState = { ...action.payload };

            if (draft.path === action.payload.path && namesToRetainInSelection) {
                newState.selectedItems = newState.items.filter(i => namesToRetainInSelection.includes(i.name));
            }

            if (draft.path === action.payload.path && nameToRetainAsCurrent) {
                newState.currentItem = newState.items.find(i => nameToRetainAsCurrent === i.name);
            } else if (action.payload.items?.length > 0) {
                newState.currentItem = newState.items[0];
            }

            return newState;
        }
        case SET_FILE: {
            return { ...draft, filePath: action.payload };
        }
        case SET_CURRENT_ITEM: {
            draft.currentItem = action.payload;
            break;
        }
        case SELECT_ITEM: {
            draft.selectedItems = [action.payload];
            break;
        }
        case TOGGLE_ITEM_SELECTION: {
            const selectedItems = draft.selectedItems || [];
            const index = selectedItems.findIndex(si => si.name === action.payload.name);

            if (index >= 0) {
                draft.selectedItems = selectedItems.filter(si => si.name !== action.payload.name);
            } else {
                if (draft.selectedItems) {
                    draft.selectedItems.push(action.payload);
                } else {
                    draft.selectedItems = [action.payload];
                }
            }
            break;
        }
        case TOGGLE_LIST_SELECTION: {
            const allSelected = action.payload;

            if (allSelected) {
                draft.selectedItems = [];
            } else {
                draft.selectedItems = [...draft.items];
            }
            break;
        }
        case RETAIN_BY_NAME: {
            draft.namesToRetainInSelection = action.payload.namesToRetainInSelection;
            draft.nameToRetainAsCurrent = action.payload.nameToRetainAsCurrent;
        }
    }
}