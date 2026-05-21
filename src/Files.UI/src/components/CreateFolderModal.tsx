import { useState, useCallback } from 'react';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';

export function CreateFolderModal({ onClose, onCreateFolder }) {
    const [folderName, setFolderName] = useState("");

    const callbackRef = useCallback(inputElement => {
        if (inputElement) {
            setTimeout(() => inputElement.focus(), 100);
        }
    }, []);

    return (
        <Modal
            show={true}
            onHide={onClose}
            size="lg"
            aria-labelledby="contained-modal-title-vcenter"
            animation={false}
            centered>
            <form onSubmit={e => { e.preventDefault(); onCreateFolder(folderName) }}>
                <Modal.Header closeButton>
                    <Modal.Title id="contained-modal-title-vcenter">
                        Skapa en mapp
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body className="p-5">
                    <input autoFocus ref={callbackRef} value={folderName} onChange={ev => setFolderName(ev.target.value)} className="form-control" placeholder="Ange mappnamnet" />
                </Modal.Body>
                <Modal.Footer>
                    <Button disabled={!folderName} type="submit">Skapa</Button>
                </Modal.Footer>
            </form>
        </Modal>
    );
}