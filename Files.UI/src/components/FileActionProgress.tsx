import { useSelector, useDispatch } from 'react-redux';
import { reset } from '../services/fileActions';
import Button from 'react-bootstrap/Button';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Popover from 'react-bootstrap/Popover';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCircleCheck, faUpload, faTrash, faFileExport, faCopy, faSpinner } from '@fortawesome/free-solid-svg-icons'
import { faClock} from '@fortawesome/free-regular-svg-icons'

import {
    UPLOAD_FILE_ACTION, DELETE_ITEM_ACTION, MOVE_ITEM_ACTION, COPY_ITEM_ACTION
} from '../services/fileActions';

function ActionIcon({ action }) {
    switch (action) {
        case UPLOAD_FILE_ACTION: return <FontAwesomeIcon icon={faUpload} fixedWidth={true}></FontAwesomeIcon>;
        case DELETE_ITEM_ACTION: return <FontAwesomeIcon icon={faTrash} fixedWidth={true}></FontAwesomeIcon>;
        case MOVE_ITEM_ACTION: return <FontAwesomeIcon icon={faFileExport} fixedWidth={true}></FontAwesomeIcon>;
        case COPY_ITEM_ACTION: return <FontAwesomeIcon icon={faCopy} fixedWidth={true}></FontAwesomeIcon>;
        default: return null;
    }
}

const popoverStyle = {
    "--bs-popover-max-width": "600px"
} as React.CSSProperties;

export function FileActionProgress() {
    const dispatch = useDispatch();
    const fileActions = useSelector((state: any) => state.fileActions);

    const keys = Object.keys(fileActions);
    if (keys.length === 0) {
        return null;
    }

    const allFileActions = keys.map(key => fileActions[key]);
    const finishedFileActions = allFileActions.filter(fa => fa.progress >= 1);

    return (
        <OverlayTrigger
            trigger="click"
            placement="bottom"
            overlay={
                <Popover id={`popover-positioned-bottom`} style={popoverStyle} className="box-shadow mx-2">
                    <Popover.Header as="h3">Status</Popover.Header>
                    <Popover.Body className="d-flex flex-column">
                        <table className="align-self-stretch w-100">
                            <tbody>
                                {keys.map(key => {
                                    const fileAction = fileActions[key];
                                    return (
                                        <tr key={key}>
                                            <td width="40px" className="align-top">
                                                {fileAction.progress === 0 &&
                                                    <FontAwesomeIcon icon={faClock}></FontAwesomeIcon>
                                                }
                                                {fileAction.progress > 0 && fileAction.progress < 1 &&
                                                    <progress className="w-100" value={fileAction.progress} />
                                                }
                                                {fileAction.progress >= 1 &&
                                                    <FontAwesomeIcon icon={faCircleCheck} className="text-success"></FontAwesomeIcon>
                                                }
                                            </td>
                                            <td width="40px" className="align-top"><ActionIcon action={fileAction.action} /></td>
                                            <td className="align-top pe-3">{fileAction.meta.name}</td>
                                            <td className="align-top pe-2"><span className="text-nowrap"><span className="fiv-sqo fiv-icon-folder me-1"></span> /{fileAction.meta.destination}</span></td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                        <Button className="mt-4 ms-auto" onClick={() => dispatch(reset())}>Rensa</Button>
                    </Popover.Body>
                </Popover>
            }
        >
            <button className="border rounded my-1 py-1 px-sm-3 box-shadow">
                {finishedFileActions.length < allFileActions.length &&
                    <FontAwesomeIcon icon={faSpinner} spinPulse={true}></FontAwesomeIcon>
                }
                {finishedFileActions.length === allFileActions.length &&
                    <FontAwesomeIcon icon={faCircleCheck}></FontAwesomeIcon>
                }
                <span className="ms-2 d-none d-sm-inline-block">({finishedFileActions.length}/{allFileActions.length})</span>
            </button>
        </OverlayTrigger>
    );
}