import React, { useState, useEffect } from 'react';
import { format, parseISO, differenceInHours } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import './Monitoramento.css';
import LoadingScreen from './LoadingScreen';
import { subscribeToMonitoringData, getMonitoringData } from '../services/dataService';

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

const COLUMN_ORDER = [
    'system',
    'dosage_432',
    'dosage_543',
    'dosage_654',
    'washer_432',
    'washer_543',
    'washer_654',
    'dryer_765',
    'dryer_876',
    'dryer_987',
    'reset',
    'air',
    'invoice',
    'duplicate_purchase'
];

const Monitoramento = () => {
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
    const [activeTooltip, setActiveTooltip] = useState(null);

    useEffect(() => {
        loadInitialData();
        const unsubscribe = subscribeToMonitoringData((data) => {
            if (data) processMonitoringData(data);
        });
        return () => unsubscribe();
    }, []);

    const loadInitialData = async () => {
        try {
            setLoading(true);
            const data = await getMonitoringData();
            if (data) {
                processMonitoringData(data);
            }
        } catch (err) {
            console.error('Erro ao carregar dados:', err);
            setError('Erro ao carregar dados de monitoramento');
        } finally {
            setLoading(false);
        }
    };

    const processMonitoringData = (data) => {
        if (!data?.rawData) return;

        const monitoring = data.rawData;
        const organizedErrors = {};
        Object.keys(ERROR_TYPES).forEach(type => {
            organizedErrors[type] = [];
        });

        monitoring.forEach(item => {
            try {
                const storeData = item.attributes;
                if (storeData) {
                    const type = storeData.error_type;
                    if (ERROR_TYPES[type]) {
                        if (type === 'reset') {
                            organizedErrors[type].push({
                                store_code: storeData.store_code,
                                created_at: storeData.created_at,
                                error_type: type
                            });
                        } 
                        else if (storeData.status === 'unresolved') {
                            organizedErrors[type].push({
                                store_code: storeData.store_code,
                                created_at: storeData.created_at,
                                error_type: type,
                                status: storeData.status
                            });
                        }
                    }
                }
            } catch (itemError) {
                console.error('Erro ao processar item:', item, itemError);
            }
        });

        setErrors(organizedErrors);
    };

    const formatTimeElapsed = (hours) => {
        if (hours >= 24) {
            const days = Math.floor(hours / 24);
            const remainingHours = hours % 24;
            if (remainingHours === 0) {
                return `${days}d`;
            }
            return `${days}d ${remainingHours}h`;
        }
        return `${hours}h`;
    };

    const getTooltipInfo = (item) => {
        const hours = differenceInHours(new Date(), parseISO(item.created_at));
        const formattedDate = format(parseISO(item.created_at), "dd/MM/yyyy HH:mm", { locale: ptBR });
        return `Loja: ${item.store_code}
Início: ${formattedDate}
Tempo: ${formatTimeElapsed(hours)}`;
    };

    const getUrgencyLevel = (createdAt) => {
        const hours = differenceInHours(new Date(), parseISO(createdAt));
        if (hours > 24) return 'critical';
        if (hours > 12) return 'high';
        if (hours > 6) return 'medium';
        return 'low';
    };

    const handleMouseEnter = (e, item) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = rect.left;
        const y = rect.top - 10;
        setTooltipPosition({ x, y });
        setActiveTooltip(item);
    };

    const handleMouseLeave = () => {
        setActiveTooltip(null);
    };

    const formatStoreCode = (code) => {
        if (!code) return '';
        return code.substring(0, 5);
    };

    const handleScroll = (e) => {
        const element = e.target;
        const isScrolled = element.scrollTop > 0;
        element.dataset.scrolled = isScrolled.toString();
    };

    if (loading) return <LoadingScreen />;
    if (error) return <div className="error-message">{error}</div>;

    return (
        <div className="monitoramento-container">
            <h1>Monitoramento de Erros</h1>
            
            {activeTooltip && (
                <div 
                    className="tooltip" 
                    style={{ 
                        top: tooltipPosition.y, 
                        left: tooltipPosition.x,
                        transform: 'translateY(-100%)'
                    }}
                >
                    {getTooltipInfo(activeTooltip)}
                </div>
            )}
            
            <div className="color-legend">
                <div className="legend-item">
                    <div className="legend-color critical"></div>
                    <span>Crítico (&gt;1d)</span>
                </div>
                <div className="legend-item">
                    <div className="legend-color high"></div>
                    <span>Alto (&gt;12h)</span>
                </div>
                <div className="legend-item">
                    <div className="legend-color medium"></div>
                    <span>Médio (&gt;6h)</span>
                </div>
                <div className="legend-item">
                    <div className="legend-color low"></div>
                    <span>Baixo (&lt;6h)</span>
                </div>
            </div>

            <div className="error-columns">
                {COLUMN_ORDER.map(type => (
                    <div key={type} className="error-column">
                        <h2 className="column-title">
                            {ERROR_TYPES[type]}
                            {errors[type]?.length > 0 && (
                                <span className="error-count">
                                    ({errors[type].length})
                                </span>
                            )}
                        </h2>
                        <div 
                            className="cards-container"
                            onScroll={handleScroll}
                            data-scrolled="false"
                        >
                            {errors[type]?.map((item, idx) => (
                                <div
                                    key={`${item.store_code}-${idx}`}
                                    className={`error-card ${type !== 'reset' ? getUrgencyLevel(item.created_at) : ''}`}
                                    onMouseEnter={(e) => handleMouseEnter(e, item)}
                                    onMouseLeave={handleMouseLeave}
                                >
                                    <h3 className="store-code">{formatStoreCode(item.store_code)}</h3>
                                </div>
                            ))}
                            {(!errors[type] || errors[type].length === 0) && (
                                <div className="empty-column">
                                    {type === 'reset' ? 'Sistema OK' : 'Nenhum erro pendente'}
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Monitoramento;