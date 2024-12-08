import React from 'react';
import axios from 'axios';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { FaStore, FaExclamationTriangle, FaClock, FaServer } from 'react-icons/fa';
import './Dashboard.css';
import LoadingScreen from './LoadingScreen';
import UpdateInfo from './UpdateInfo';
import { useAutoUpdate } from '../hooks/useAutoUpdate';
import { saveStoresData, saveMonitoringData, subscribeToStoresData, subscribeToMonitoringData } from '../services/dataService';

const API_URL = {
    stores: 'https://sistema.lavanderia60minutos.com.br/api/v1/stores/all',
    monitoring: 'https://sistema.lavanderia60minutos.com.br/api/v1/stores_monitoring/list'
};

const BLYNK_API = 'https://ny3.blynk.cloud/external/api/isHardwareConnected';
const X_TOKEN = '1be10a9c20528183b64e3c69564db6958eab7f434ee94350706adb4efc261869';

const ERROR_TYPES = {
    system: 'SISTEMA',
    dosage_432: 'D. 432',
    dosage_543: 'D. 543',
    dosage_654: 'D. 654',
    washer_432: 'L. 432',
    washer_543: 'L. 543',
    washer_654: 'L. 654',
    dryer_765: 'S. 765',
    dryer_876: 'S. 876',
    dryer_987: 'S. 987',
    reset: 'RESET',
    air: 'AR',
    invoice: 'NOTAS',
    duplicate_purchase: 'N. DUPLICADA'
};

const Dashboard = () => {
    const [error, setError] = React.useState(null);
    const [loading, setLoading] = React.useState(true);
    const [storesData, setStoresData] = React.useState({
        total: 0,
        online: 0,
        offline: 0,
        byState: {}
    });
    const [monitoringData, setMonitoringData] = React.useState({
        totalErrors: 0,
        criticalErrors: 0,
        byType: {},
        recentErrors: []
    });

    const {
        lastUpdate,
        loading: autoUpdateLoading,
        setLoading: setAutoUpdateLoading,
        shouldUpdate,
        formatLastUpdate,
        UPDATE_INTERVAL
    } = useAutoUpdate();

    const extractTokenFromUrl = (url) => {
        if (!url) return '';
        const tokenMatch = url.match(/token=([^&]+)/);
        return tokenMatch ? tokenMatch[1] : '';
    };

    const checkBlynkStatus = async (token, storeCode) => {
        if (!token) {
            console.log(`[Blynk Check] Loja ${storeCode}: Token não encontrado`);
            return false;
        }

        try {
            console.log(`[Blynk Check] Verificando loja ${storeCode} - Token: ${token}`);
            const response = await axios.get(`${BLYNK_API}?token=${token}`);
            const isOnline = response.data === true;
            console.log(`[Blynk Check] Status da loja ${storeCode}: ${isOnline ? 'Online' : 'Offline'}`);
            return isOnline;
        } catch (err) {
            console.error(`[Blynk Check] Erro na loja ${storeCode}:`, err.message);
            return false;
        }
    };

    const processStoreData = (stores = []) => {
        if (!Array.isArray(stores)) {
            console.error('Dados de lojas inválidos:', stores);
            return {
                total: 0,
                online: 0,
                offline: 0,
                byState: {}
            };
        }

        let onlineCount = 0;
        let offlineCount = 0;
        const stateStats = {};

        stores.forEach(store => {
            const storeData = store?.attributes || store || {};
            const state = storeData.state || 'Desconhecido';
            const isOnline = storeData.status === 'online';

            if (isOnline) onlineCount++;
            else offlineCount++;

            stateStats[state] = (stateStats[state] || 0) + 1;
        });

        return {
            total: stores.length,
            online: onlineCount,
            offline: offlineCount,
            byState: stateStats
        };
    };

    const processMonitoringData = (data = {}) => {
        if (!data || typeof data !== 'object') {
            return {
                totalErrors: 0,
                criticalErrors: 0,
                byType: {},
                recentErrors: []
            };
        }

        const byType = {};
        let criticalCount = 0;

        (data.errors || []).forEach(error => {
            const type = error?.type || 'unknown';
            byType[type] = (byType[type] || 0) + 1;
            if (error?.critical) criticalCount++;
        });

        return {
            totalErrors: (data.errors || []).length,
            criticalErrors: criticalCount,
            byType: byType,
            recentErrors: data.recentErrors || []
        };
    };

    const fetchData = async (forceUpdate = false) => {
        try {
            setLoading(true);
            
            // Buscar dados das lojas com token de autenticação
            const storesResponse = await axios.get(API_URL.stores, {
                headers: { 'X-Token': X_TOKEN }
            });
            
            const monitoringResponse = await axios.get(API_URL.monitoring, {
                headers: { 'X-Token': X_TOKEN }
            });

            console.log('Resposta da API de lojas:', storesResponse.data);
            console.log('Resposta da API de monitoramento:', monitoringResponse.data);

            // Processar dados das lojas
            let stores = [];
            if (storesResponse.data && storesResponse.data.stores) {
                stores = storesResponse.data.stores;
            } else if (storesResponse.data && storesResponse.data.data) {
                stores = storesResponse.data.data;
            } else if (Array.isArray(storesResponse.data)) {
                stores = storesResponse.data;
            }

            // Processar dados com segurança
            const processedStores = processStoreData(stores);
            const processedMonitoring = processMonitoringData(monitoringResponse?.data?.data || []);

            // Atualizar estado
            setStoresData(processedStores);
            setMonitoringData(processedMonitoring);
            setError(null);

        } catch (err) {
            console.error('Erro ao buscar dados:', err);
            console.error('Detalhes do erro:', {
                message: err.message,
                response: err.response?.data,
                status: err.response?.status
            });
            setError(`Erro ao carregar dados: ${err.response?.data?.message || err.message}`);
        } finally {
            setLoading(false);
        }
    };

    const processData = (data) => {
        if (!data) return null;
        try {
            return {
                ...data,
                byState: data.byState || {},
                byType: data.byType || {},
                recentErrors: data.recentErrors || []
            };
        } catch (err) {
            console.error('Erro ao processar dados:', err);
            return null;
        }
    };

    React.useEffect(() => {
        const fetchInitialData = async () => {
            try {
                setLoading(true);
                const stores = await axios.get(API_URL.stores, {
                    headers: { 'X-Token': X_TOKEN }
                });
                
                const monitoring = await axios.get(API_URL.monitoring, {
                    headers: { 'X-Token': X_TOKEN }
                });
                
                console.log('Dados iniciais das lojas:', stores.data);
                console.log('Dados iniciais de monitoramento:', monitoring.data);

                // Processar dados das lojas
                let storesData = [];
                if (stores.data && stores.data.stores) {
                    storesData = stores.data.stores;
                } else if (stores.data && stores.data.data) {
                    storesData = stores.data.data;
                } else if (Array.isArray(stores.data)) {
                    storesData = stores.data;
                }

                const processedStores = processStoreData(storesData);
                const processedMonitoring = processMonitoringData(monitoring?.data?.data || []);
                
                setStoresData(processedStores);
                setMonitoringData(processedMonitoring);
                setError(null);
            } catch (err) {
                console.error('Erro ao carregar dados:', err);
                console.error('Detalhes do erro:', {
                    message: err.message,
                    response: err.response?.data,
                    status: err.response?.status
                });
                setError(`Erro ao carregar dados: ${err.response?.data?.message || err.message}`);
            } finally {
                setLoading(false);
            }
        };

        fetchInitialData();
    }, []);

    if (loading) return <LoadingScreen />;
    if (error) return <div className="error-message">{error}</div>;

    return (
        <div className="dashboard-container">
            <div className="dashboard-header">
                <h1>Dashboard</h1>
                <UpdateInfo
                    lastUpdate={formatLastUpdate()}
                    loading={loading}
                    onRefresh={() => fetchData(true)}
                />
            </div>
            
            {/* Status da Controladora Blynk */}
            <div className="dashboard-section">
                <h2>Controladora Blynk</h2>
                <div className="stats-grid">
                    <div className="stat-card">
                        <FaStore className="stat-icon" />
                        <div className="stat-info">
                            <span className="stat-value">{storesData.total}</span>
                            <span className="stat-label">Total de Controladoras</span>
                        </div>
                    </div>
                    <div className="stat-card online">
                        <FaServer className="stat-icon" />
                        <div className="stat-info">
                            <span className="stat-value">{storesData.online}</span>
                            <span className="stat-label">Controladoras Online</span>
                        </div>
                    </div>
                    <div className="stat-card offline">
                        <FaExclamationTriangle className="stat-icon" />
                        <div className="stat-info">
                            <span className="stat-value">{storesData.offline}</span>
                            <span className="stat-label">Controladoras Offline</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Status de Monitoramento */}
            <div className="dashboard-section">
                <h2>Monitoramento de Erros</h2>
                <div className="stats-grid">
                    <div className="stat-card warning">
                        <FaExclamationTriangle className="stat-icon" />
                        <div className="stat-info">
                            <span className="stat-value">{monitoringData.totalErrors}</span>
                            <span className="stat-label">Total de Erros</span>
                        </div>
                    </div>
                </div>

                {/* Erros por Tipo */}
                {Object.keys(monitoringData.byType).length > 0 && (
                    <div className="error-types-section">
                        <h3>Erros por Tipo</h3>
                        <div className="error-types-grid">
                            {Object.entries(monitoringData.byType).map(([type, count]) => (
                                <div key={type} className="error-type-card">
                                    <span className="error-type-name">{ERROR_TYPES[type] || type}</span>
                                    <span className="error-type-count">{count}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Erros Recentes */}
                {monitoringData.recentErrors.length > 0 && (
                    <div className="recent-errors-section">
                        <h3>Erros Recentes</h3>
                        <div className="recent-errors-list">
                            {monitoringData.recentErrors.map((error, index) => (
                                <div key={index} className="recent-error-item">
                                    <span className="store-code">{error.store_code}</span>
                                    <span className="error-type">{ERROR_TYPES[error.error_type] || error.error_type}</span>
                                    <span className="error-time">
                                        {format(parseISO(error.created_at), "dd/MM HH:mm", { locale: ptBR })}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Dashboard; 