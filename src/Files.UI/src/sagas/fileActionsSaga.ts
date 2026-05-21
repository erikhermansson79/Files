import { channel } from 'redux-saga';
import { take, fork, put, call } from 'redux-saga/effects';
import {
    startAction, storeAction, updateActionProgress,
    UPLOAD_FILE_ACTION, DELETE_ITEM_ACTION, MOVE_ITEM_ACTION, COPY_ITEM_ACTION
} from '../services/fileActions';
import { uploadFileAsync, postDeleteItemAsync, postMoveItemAsync, postCopyItemAsync } from '../services/files';

function readBlobAsync(blob, reader) {
    return new Promise((resolve, reject) => {
        reader.onload = () => {
            resolve(reader.result);
        };

        reader.onerror = reject;

        reader.readAsDataURL(blob);
    })
}

//const delay = (ms) => new Promise(res => setTimeout(res, ms))

async function sendFile(data) {
    const response = await uploadFileAsync(data);
    if (!response.ok) {
        console.log(await response.text());
    }
}

function* fileUploadSaga(payload) {
    const { file, meta, action } = payload;

    const reader = new FileReader();
    const chunkSize = 1000 * 1024;

    const numberOfChunks = Math.floor(file.size / chunkSize) + 1;

    var start = 0;
    var end = start + chunkSize;

    var chunkNumber = 1;

    do {
        const blob = file.slice(start, end);
        const data = yield readBlobAsync(blob, reader);

        yield sendFile({
            fileData: data,
            contentType: file.type,
            target: meta.target,
            fileSize: file.size,
            chunkNumber: chunkNumber,
            chunkSize: blob.size,
            defaultChunkSize: chunkSize,
            numberOfChunks: numberOfChunks
        });

        const sizeDone = start + chunkSize;
        const progress = sizeDone / file.size;

        start = end;
        end = start + chunkSize;
        chunkNumber++;

        yield put({ type: updateActionProgress.type, payload: { meta, action, progress } });
    } while (start < file.size);

    meta.reload();
}

function* deleteItemSaga(payload) {
    const { item, meta, action } = payload;

    yield postDeleteItemAsync(meta.target, item.type);

    yield put({ type: updateActionProgress.type, payload: { meta, action, progress: 1 } });

    meta.reload();
}

function* moveItemSaga(payload) {
    const { item, meta, action } = payload;

    yield postMoveItemAsync(meta.target, meta.destination, item.type);

    yield put({ type: updateActionProgress.type, payload: { meta, action, progress: 1 } });

    meta.reload();
}

function* copyItemSaga(payload) {
    const { item, meta, action } = payload;

    yield postCopyItemAsync(meta.target, meta.destination, item.type);

    yield put({ type: updateActionProgress.type, payload: { meta, action, progress: 1 } });

    meta.reload();
}

function* fileActionSaga(chan) {
    while (true) {
        const payload = yield take(chan)

        switch (payload.action) {
            case UPLOAD_FILE_ACTION: {
                yield fileUploadSaga(payload);
                break;
            }
            case DELETE_ITEM_ACTION: {
                yield deleteItemSaga(payload);
                break;
            }
            case MOVE_ITEM_ACTION: {
                yield moveItemSaga(payload);
                break;
            }
            case COPY_ITEM_ACTION: {
                yield copyItemSaga(payload);
                break;
            }
        }
    }
}

export function* fileActionWatcherSaga() {
    // create a channel to queue incoming requests
    const chan = yield call(channel);

    // create 4 worker 'thread(s)'
    for (var i = 0; i < 4; i++) {
        yield fork(fileActionSaga, chan);
    }

    while (true) {
        const { payload } = yield take(startAction);
        yield put({ type: storeAction.type, payload });
        yield put(chan, payload);
    }
}