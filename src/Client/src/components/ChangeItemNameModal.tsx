import { useState, useCallback } from 'react';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';

export function ChangeItemNameModal({ item, onClose, onChangeItemName }) {
    const [name, setName] = useState(item.type === "file" ? item.nameWithoutExtension : item.type === "link" ? item.displayName : item.name);

    const callbackRef = useCallback(inputElement => {
        if (inputElement) {
            setTimeout(() => {
                inputElement.focus();
                inputElement.select();
            }, 100);
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
            <form onSubmit={e => { e.preventDefault(); onChangeItemName(item, item.type === "file" ? name + item.extension : name) }}>
                <Modal.Header closeButton>
                    <Modal.Title id="contained-modal-title-vcenter">
                        Byt namn
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body className="p-5 d-flex align-items-center">
                    <input autoFocus ref={callbackRef} value={name} onChange={ev => setName(ev.target.value)} className="form-control" />
                    {item.type === "file" &&
                        <span className="ms-1">{item.extension}</span>
                    }
                </Modal.Body>
                <Modal.Footer>
                    <Button disabled={!name} type="submit">Byt namn</Button>
                    <Button className="btn-secondary" onClick={onClose}>Avbryt</Button>
                </Modal.Footer>
            </form>
        </Modal>
    );
}