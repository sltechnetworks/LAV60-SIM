import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Monitor.css';
import LoadingScreen from './components/LoadingScreen';
import ConfirmationModal from './components/ConfirmationModal';
import Toast from './components/Toast';
import { subscribeToStoresData, getStoresData } from './services/dataService';

const BLYNK_API = 'https://ny3.blynk.cloud/external/api/update';

function Monitor() {
    const [stores, setStores] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedState, setSelectedState] = useState('');
    const [storesByState, setStoresByState] = useState({});
    const [stateStats, setStateStats] = useState({});
    const [collapsedStates, setCollapsedStates] = useState({});
    const [modalConfig, setModalConfig] = useState({
        isOpen: false,
        title: '',
        message: '',
        onConfirm: null
    });
    const [toast, setToast] = useState({
        show: false,
        message: '',
        type: 'success'
    });

    useEffect(() => {
        // Carregar dados iniciais
        loadInitialData();

        // Inscrever para atualizações em tempo real
        const unsubscribe = subscribeToStoresData((data) => {
            if (data) processStoresData(data);
        });

        return () => unsubscribe();
    }, []);

    useEffect(() => {
        if (storesByState && Object.keys(storesByState).length > 0) {
            const initialCollapsedState = Object.keys(storesByState).reduce((acc, state) => {
                acc[state] = true; // true significa recolhido
                return acc;
            }, {});
            setCollapsedStates(initialCollapsedState);
        }
    }, [storesByState]);

    const loadInitialData = async () => {
        try {
            setLoading(true);
            const data = await getStoresData();
            if (data) {
                processStoresData(data);
            }
        } catch (err) {
            console.error('Erro ao carregar dados:', err);
            setError('Erro ao carregar dados das lojas: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    const processStoresData = (data) => {
        if (!data?.rawData) return;

        const storesArray = data.rawData.map(store => {
            const storeData = store.attributes || store;
            return {
                code: storeData.store_code || storeData.code,
                state: storeData.state,
                status: storeData.blynk_power_on ? 'Online' : 'Offline',
                powerOnUrl: `${BLYNK_API}?token=${extractTokenFromUrl(storeData.blynk_power_on)}&pin=V57&value=1`,
                powerOffUrl: `${BLYNK_API}?token=${extractTokenFromUrl(storeData.blynk_power_on)}&pin=V57&value=0`
            };
        });

        setStores(storesArray);
        organizeStoresByState(storesArray);
        calculateStateStats(storesArray);
    };

    const extractTokenFromUrl = (url) => {
        if (!url) return '';
        const tokenMatch = url.match(/token=([^&]+)/);
        return tokenMatch ? tokenMatch[1] : '';
    };

    const showToast = (message, type = 'success') => {
        setToast({
            show: true,
            message,
            type
        });
    };

    const hideToast = () => {
        setToast(prev => ({
            ...prev,
            show: false
        }));
    };

    const handlePowerControl = async (url, action, storeCode) => {
        setModalConfig({
            isOpen: true,
            title: `Confirmar ${action}`,
            message: `Deseja ${action.toLowerCase()} a loja ${storeCode}?`,
            onConfirm: async () => {
                try {
                    await axios.get(url);
                    showToast(`Comando ${action} enviado para loja ${storeCode}`, 'success');
                    // Atualizar dados após enviar comando
                    const data = await getStoresData();
                    if (data) processStoresData(data);
                } catch (err) {
                    showToast(`Erro ao enviar comando ${action} para loja ${storeCode}`, 'error');
                }
            }
        });
    };

    const handleBulkPowerControl = async (state, action) => {
        const stores = storesByState[state].filter(store => store.status === 'Online');
        if (stores.length === 0) {
            showToast('Nenhuma loja online disponível para esta ação', 'warning');
            return;
        }

        setModalConfig({
            isOpen: true,
            title: `Confirmar ${action} em Massa`,
            message: `Deseja ${action.toLowerCase()} todas as lojas online do estado ${state}? (${stores.length} lojas)`,
            onConfirm: async () => {
                try {
                    await Promise.all(stores.map(store => {
                        const url = action === 'LIGAR' ? store.powerOnUrl : store.powerOffUrl;
                        return axios.get(url);
                    }));
                    showToast(`Comando ${action} enviado para todas as lojas online do estado ${state}`, 'success');
                    // Atualizar dados após enviar comandos
                    const data = await getStoresData();
                    if (data) processStoresData(data);
                } catch (err) {
                    showToast(`Erro ao enviar comando ${action} em massa`, 'error');
                }
            }
        });
    };

    const toggleStateCollapse = (state) => {
        setCollapsedStates(prev => ({
            ...prev,
            [state]: !prev[state]
        }));
    };

    const organizeStoresByState = (storesArray) => {
        const organized = storesArray.reduce((acc, store) => {
            if (!acc[store.state]) {
                acc[store.state] = [];
            }
            acc[store.state].push(store);
            return acc;
        }, {});
        setStoresByState(organized);
    };

    const calculateStateStats = (storesArray) => {
        const stats = storesArray.reduce((acc, store) => {
            if (!acc[store.state]) {
                acc[store.state] = { total: 0, online: 0, offline: 0 };
            }
            acc[store.state].total++;
            if (store.status === 'Online') acc[store.state].online++;
            else acc[store.state].offline++;
            return acc;
        }, {});
        setStateStats(stats);
    };

    const renderStatusDetails = (stats) => {
        if (!stats) return null;
        return (
            <div className="status-details">
                <span className="status-item online">
                    <span className="status-dot"></span>
                    Online: {stats.online}
                </span>
                <span className="status-item offline">
                    <span className="status-dot"></span>
                    Offline: {stats.offline}
                </span>
                <span className="status-item total">
                    Total: {stats.total}
                </span>
            </div>
        );
    };

    const renderStoreCard = (store) => (
        <div key={store.code} className={`store-card ${store.status.toLowerCase()}`}>
            <div className="store-header">
                <h3>{store.code}</h3>
                <div className="store-info">
                    <span className={`status-badge ${store.status.toLowerCase()}`}>
                        {store.status}
                    </span>
                </div>
            </div>
            <div className="store-controls">
                <button
                    className="power-on"
                    onClick={() => handlePowerControl(store.powerOnUrl, 'LIGAR', store.code)}
                    disabled={store.status !== 'Online'}
                >
                    <span className="material-icons">power_settings_new</span>
                    LIGAR
                </button>
                <button
                    className="power-off"
                    onClick={() => handlePowerControl(store.powerOffUrl, 'DESLIGAR', store.code)}
                    disabled={store.status !== 'Online'}
                >
                    <span className="material-icons">power_settings_new</span>
                    DESLIGAR
                </button>
            </div>
        </div>
    );

    return (
        <>
            <div className="monitor-container">
                <div className="monitor-header">
                    <h1>Reset Geral</h1>
                    <div className="header-controls">
                        <select
                            value={selectedState}
                            onChange={(e) => setSelectedState(e.target.value)}
                            className="state-select"
                        >
                            <option value="">Todos os Estados</option>
                            {Object.keys(storesByState).sort().map(state => (
                                <option key={state} value={state}>
                                    {state}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {loading ? (
                    <LoadingScreen />
                ) : error ? (
                    <div className="error-message">{error}</div>
                ) : (
                    <div className="states-container">
                        {Object.entries(storesByState)
                            .filter(([state]) => !selectedState || state === selectedState)
                            .sort(([stateA], [stateB]) => stateA.localeCompare(stateB))
                            .map(([state, stateStores]) => {
                                const stats = stateStats[state];
                                const isCollapsed = collapsedStates[state];
                                return (
                                    <div key={state} className="state-section">
                                        <div className="state-header">
                                            <div className="state-header-left">
                                                <button 
                                                    className={`collapse-button ${isCollapsed ? 'collapsed' : ''}`}
                                                    onClick={() => toggleStateCollapse(state)}
                                                >
                                                    {isCollapsed ? '▶' : '▼'}
                                                </button>
                                                <h2 className="state-title">
                                                    {state}
                                                </h2>
                                            </div>
                                            <div className="state-header-right">
                                                {renderStatusDetails(stats)}
                                                <div className="state-actions">
                                                    <button
                                                        className="bulk-power-on"
                                                        onClick={() => handleBulkPowerControl(state, 'LIGAR')}
                                                        disabled={stats.online === 0}
                                                    >
                                                        <span className="material-icons">power</span>
                                                        LIGAR TODAS
                                                    </button>
                                                    <button
                                                        className="bulk-power-off"
                                                        onClick={() => handleBulkPowerControl(state, 'DESLIGAR')}
                                                        disabled={stats.online === 0}
                                                    >
                                                        <span className="material-icons">power_off</span>
                                                        DESLIGAR TODAS
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                        {!isCollapsed && (
                                            <div className="stores-grid">
                                                {stateStores.map(store => renderStoreCard(store))}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                    </div>
                )}
            </div>

            <ConfirmationModal
                isOpen={modalConfig.isOpen}
                onClose={() => setModalConfig({ ...modalConfig, isOpen: false })}
                onConfirm={modalConfig.onConfirm}
                title={modalConfig.title}
                message={modalConfig.message}
            />

            {toast.show && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={hideToast}
                />
            )}
        </>
    );
}

export default Monitor; 