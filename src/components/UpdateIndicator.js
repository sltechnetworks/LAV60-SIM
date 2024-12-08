import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { FaSync, FaCheck, FaExclamationTriangle } from 'react-icons/fa';
import './UpdateIndicator.css';

const INTERVAL = 5 * 60; // 5 minutos em segundos

const UpdateIndicator = ({ status, lastUpdate }) => {
    const [timeLeft, setTimeLeft] = useState(INTERVAL);

    useEffect(() => {
        const calculateTimeLeft = () => {
            if (!lastUpdate) return INTERVAL;
            const nextUpdate = new Date(lastUpdate).getTime() + (INTERVAL * 1000);
            const now = new Date().getTime();
            return Math.max(0, Math.ceil((nextUpdate - now) / 1000));
        };

        setTimeLeft(calculateTimeLeft());
        const timer = setInterval(() => {
            setTimeLeft(calculateTimeLeft());
        }, 1000);

        return () => clearInterval(timer);
    }, [lastUpdate]);

    const getUpdateIcon = () => {
        switch (status) {
            case 'updating':
                return <FaSync className="update-icon rotating" />;
            case 'error':
                return <FaExclamationTriangle className="update-icon error" />;
            default:
                return <FaCheck className="update-icon connected" />;
        }
    };

    const formatTime = (seconds) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    };

    const getUpdateTooltip = () => {
        const baseText = `Última atualização: ${format(lastUpdate, "HH:mm", { locale: ptBR })}`;
        const timeRemaining = `\nPróxima atualização em: ${formatTime(timeLeft)}`;
        
        switch (status) {
            case 'updating':
                return `${baseText}\nAtualizando...`;
            case 'error':
                return `${baseText}\nErro na atualização`;
            default:
                return `${baseText}${timeRemaining}`;
        }
    };

    return (
        <div className="update-status" title={getUpdateTooltip()}>
            {getUpdateIcon()}
            <span className="countdown-tooltip">{formatTime(timeLeft)}</span>
        </div>
    );
};

export default UpdateIndicator; 