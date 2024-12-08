import React from 'react';
import './ConfirmationModal.css';

const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message }) => {
    if (!isOpen) return null;

    const handleConfirm = () => {
        onConfirm();
        onClose();
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Escape') onClose();
        if (e.key === 'Enter') handleConfirm();
    };

    return (
        <div 
            className="modal-overlay"
            onClick={onClose}
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
        >
            <div 
                className="modal-content"
                onClick={e => e.stopPropagation()}
                onKeyDown={handleKeyDown}
                tabIndex={-1}
            >
                <h2 id="modal-title" className="modal-title">{title}</h2>
                <p className="modal-message">{message}</p>
                <div className="modal-buttons">
                    <button 
                        className="modal-button cancel"
                        onClick={onClose}
                        aria-label="Cancelar ação"
                    >
                        Cancelar
                    </button>
                    <button 
                        className="modal-button confirm"
                        onClick={handleConfirm}
                        aria-label="Confirmar ação"
                        autoFocus
                    >
                        Confirmar
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmationModal; 