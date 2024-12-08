import React from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { FaSync } from 'react-icons/fa';
import './UpdateInfo.css';

const UpdateInfo = ({ lastUpdate, loading, onRefresh }) => {
    if (!lastUpdate?.timestamp) return null;

    return (
        <div className="update-info">
            <div className="last-update">
                Última atualização: {format(lastUpdate.timestamp, "dd/MM/yyyy HH:mm:ss", { locale: ptBR })}
                {lastUpdate.nextUpdateIn > 0 && ` (próxima em ${lastUpdate.nextUpdateIn} min)`}
            </div>
            <button 
                className="refresh-button"
                onClick={onRefresh}
                disabled={loading}
                title="Atualizar agora"
            >
                <FaSync className={loading ? 'spinning' : ''} />
            </button>
        </div>
    );
};

export default UpdateInfo; 