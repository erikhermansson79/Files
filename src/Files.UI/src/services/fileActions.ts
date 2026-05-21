import { createSlice } from '@reduxjs/toolkit';

const initialState = {};

export const UPLOAD_FILE_ACTION = "fileActions.uploadFileAction";
export const DELETE_ITEM_ACTION = "fileActions.deleteItemAction";
export const MOVE_ITEM_ACTION = "fileActions.moveItemAction";
export const COPY_ITEM_ACTION = "fileActions.copyItemAction";

export const fileActionSlice = createSlice({
    name: "fileActions",
    initialState,
    reducers: {
        startAction: (state, action) => { },
        storeAction: (state, action) => {
            const { meta, action: subAction } = action.payload;

            state[`${subAction}_${meta.target}`] = {
                ...action.payload,
                progress: 0
            };
        },
        updateActionProgress: (state, action) => {
            const { meta, action: subAction, progress } = action.payload;

            const fileAction = state[`${subAction}_${meta.target}`];

            if (fileAction) {
                fileAction.progress = progress;
            }
        },
        reset: () => initialState,
    }
});

export const { startAction, storeAction, updateActionProgress, reset } = fileActionSlice.actions;

export default fileActionSlice.reducer;