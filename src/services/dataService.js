import { ref, set, get, onValue } from 'firebase/database';
import { database } from './firebase';

const STORES_REF = 'stores';
const MONITORING_REF = 'monitoring';
const LAST_UPDATE_REF = 'lastUpdate';

export const saveStoresData = async (data) => {
    try {
        await set(ref(database, STORES_REF), data);
        await set(ref(database, LAST_UPDATE_REF), Date.now());
    } catch (error) {
        console.error('Erro ao salvar dados das lojas:', error);
        throw error;
    }
};

export const saveMonitoringData = async (data) => {
    try {
        await set(ref(database, MONITORING_REF), data);
    } catch (error) {
        console.error('Erro ao salvar dados de monitoramento:', error);
        throw error;
    }
};

export const getStoresData = async () => {
    try {
        const snapshot = await get(ref(database, STORES_REF));
        return snapshot.val();
    } catch (error) {
        console.error('Erro ao buscar dados das lojas:', error);
        throw error;
    }
};

export const getMonitoringData = async () => {
    try {
        const snapshot = await get(ref(database, MONITORING_REF));
        return snapshot.val();
    } catch (error) {
        console.error('Erro ao buscar dados de monitoramento:', error);
        throw error;
    }
};

export const subscribeToStoresData = (callback) => {
    const storesRef = ref(database, STORES_REF);
    return onValue(storesRef, (snapshot) => {
        callback(snapshot.val());
    });
};

export const subscribeToMonitoringData = (callback) => {
    const monitoringRef = ref(database, MONITORING_REF);
    return onValue(monitoringRef, (snapshot) => {
        callback(snapshot.val());
    });
};

export const getLastUpdate = async () => {
    try {
        const snapshot = await get(ref(database, LAST_UPDATE_REF));
        return snapshot.val();
    } catch (error) {
        console.error('Erro ao buscar última atualização:', error);
        throw error;
    }
}; 