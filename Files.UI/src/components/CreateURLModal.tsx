import { useState, useCallback } from 'react';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';

export function CreateURLModal({ onClose, onCreateURL }) {
    const [displayName, setDisplayName] = useState("");
    const [url, setURL] = useState("");

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
            <form onSubmit={e => { e.preventDefault(); onCreateURL(displayName, url) }}>
                <Modal.Header closeButton>
                    <Modal.Title id="contained-modal-title-vcenter">
                        Skapa en länk till en webbsida
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body className="p-5">
                    <input autoFocus ref={callbackRef} value={displayName} onChange={ev => setDisplayName(ev.target.value)} className="form-control" placeholder="Ange visningsnamn" />
                    <input value={url} onChange={ev => setURL(ev.target.value)} className="form-control mt-3" placeholder="Ange länk" />
                </Modal.Body>
                <Modal.Footer>
                    <Button disabled={!displayName || !url} type="submit">Skapa</Button>
                </Modal.Footer>
            </form>
        </Modal>
    );
}