import React, { useEffect } from 'react';
import { FaCheckCircle, FaTimesCircle, FaExclamationCircle, FaTimes } from 'react-icons/fa';
import './Toast.css';

const TOAST_TYPES = {
    success: {
        icon: FaCheckCircle,
        className: 'success'
    },
    error: {
        icon: FaTimesCircle,
        className: 'error'
    },
    warning: {
        icon: FaExclamationCircle,
        className: 'warning'
    }
};

const Toast = ({ message, type = 'success', onClose, duration = 3000 }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, duration);

        return () => clearTimeout(timer);
    }, [duration, onClose]);

    const ToastIcon = TOAST_TYPES[type]?.icon || TOAST_TYPES.success.icon;
    const toastClass = TOAST_TYPES[type]?.className || 'success';

    return (
        <div className={`toast-container ${toastClass}`}>
            <div className="toast-content">
                <ToastIcon className="toast-icon" />
                <span className="toast-message">{message}</span>
                <button 
                    className="toast-close"
                    onClick={onClose}
                    aria-label="Fechar notificação"
                >
                    <FaTimes />
                </button>
            </div>
        </div>
    );
};

export default Toast; 