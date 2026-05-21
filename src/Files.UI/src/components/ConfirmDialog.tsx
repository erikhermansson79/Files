import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import { confirmable, createConfirmation } from "react-confirm";

export default function ConfirmDialog({ show, title, body, handleCancel, handleConfirm, cancelButtonText, confirmButtonText }) {
    if (!cancelButtonText) {
        cancelButtonText = "Nej";
    }

    if (!confirmButtonText) {
        confirmButtonText = "Ja";
    }

    return (
        <Modal show={show} onHide={handleCancel} animation={false} centered>
            {title &&
                <Modal.Header closeButton>
                <Modal.Title>{title}</Modal.Title>
                </Modal.Header>
            }
            <Modal.Body>{body}</Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={handleCancel}>
                    {cancelButtonText}
                </Button>
                <Button variant="primary" onClick={handleConfirm}>
                    {confirmButtonText}
                </Button>
            </Modal.Footer>
        </Modal>
    );
}

const Confirmation = ({
    okLabel = "OK",
    cancelLabel = "Cancel",
    title = "Confirmation",
    confirmation,
    show,
    proceed,
    enableEscape = true
}) => {
    return (
        <div className="static-modal">
            <Modal
                animation={false}
                show={show}
                onHide={() => proceed(false)}
                backdrop={enableEscape ? true : "static"}
                keyboard={enableEscape}
                centered
            >
                <Modal.Header>
                    <Modal.Title>{title}</Modal.Title>
                </Modal.Header>
                <Modal.Body>{confirmation}</Modal.Body>
                <Modal.Footer>
                    <Button
                        variant="primary"
                        className="button-l"
                        onClick={() => proceed(true)}
                    >
                        {okLabel}
                    </Button>
                    <Button variant="secondary" onClick={() => proceed(false)}>{cancelLabel}</Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export function confirm(
    confirmation,
    okLabel = "OK",
    cancelLabel = "Avbryt",
    title = "Bekräfta",
    options = {}
) {
    return createConfirmation(confirmable(Confirmation))({
        okLabel: okLabel,
        cancelLabel: cancelLabel,
        confirmation: confirmation,
        title: title,
        show: undefined,
        proceed: undefined,
        ...options
    });
}
