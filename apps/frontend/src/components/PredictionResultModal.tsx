import React from 'react';
import { Modal, Button } from 'react-bootstrap';

interface PredictionResultModalProps {
  show: boolean;
  onClose: () => void;
  onDownload: () => void;
  previewImg: string | null;
}

const PredictionResultModal: React.FC<PredictionResultModalProps> = ({ show, onClose, onDownload, previewImg }) => {
  return (
    <Modal show={show} onHide={onClose} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>PDF Preview</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {previewImg ? (
          <img src={previewImg} alt="PDF Preview" className="pdf-preview-img" />
        ) : (
          <div className="pdf-preview-loading">
            <span>Loading preview...</span>
          </div>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button variant="primary" onClick={onDownload} disabled={!previewImg}>
          Download PDF
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default PredictionResultModal;
