import { useState, useEffect } from 'react';
import { getLastUpdate } from '../services/dataService';

const UPDATE_INTERVAL = 60 * 1000; // 1 minuto em milissegundos

export const useAutoUpdate = () => {
    const [lastUpdate, setLastUpdate] = useState(null);
    const [loading, setLoading] = useState(false);

    const shouldUpdate = async () => {
        try {
            const lastUpdateTime = await getLastUpdate();
            if (!lastUpdateTime) return true;

            const timeSinceLastUpdate = Date.now() - lastUpdateTime;
            return timeSinceLastUpdate >= UPDATE_INTERVAL;
        } catch (error) {
            console.error('Erro ao verificar última atualização:', error);
            return true;
        }
    };

    const getTimeUntilNextUpdate = () => {
        if (!lastUpdate) return null;
        const nextUpdate = new Date(lastUpdate + UPDATE_INTERVAL);
        const timeUntilUpdate = Math.max(0, nextUpdate - Date.now());
        return Math.ceil(timeUntilUpdate / (1000 * 60));
    };

    const formatLastUpdate = () => {
        if (!lastUpdate) return '';
        const minutesUntilUpdate = getTimeUntilNextUpdate();
        return {
            timestamp: new Date(lastUpdate),
            nextUpdateIn: minutesUntilUpdate
        };
    };

    useEffect(() => {
        const checkLastUpdate = async () => {
            try {
                const lastUpdateTime = await getLastUpdate();
                if (lastUpdateTime) {
                    setLastUpdate(lastUpdateTime);
                }
            } catch (error) {
                console.error('Erro ao buscar última atualização:', error);
            }
        };

        checkLastUpdate();
    }, []);

    return {
        lastUpdate,
        loading,
        setLoading,
        shouldUpdate,
        formatLastUpdate,
        UPDATE_INTERVAL
    };
}; 