import React from 'react';
import { ResponsivePie } from '@nivo/pie';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import './DashboardCharts.css';

export const StateDistributionChart = ({ data }) => {
    const chartData = data.stateDistribution || [];

    return (
        <div className="chart-container">
            <div className="chart-wrapper">
                <ResponsivePie
                    data={chartData}
                    margin={{ top: 40, right: 120, bottom: 40, left: 40 }}
                    innerRadius={0.5}
                    padAngle={0.7}
                    cornerRadius={3}
                    activeOuterRadiusOffset={8}
                    colors={{ scheme: 'paired' }}
                    borderWidth={1}
                    borderColor={{ from: 'color', modifiers: [['darker', 0.2]] }}
                    arcLinkLabelsSkipAngle={10}
                    arcLinkLabelsTextColor="#333333"
                    arcLinkLabelsThickness={2}
                    arcLinkLabelsColor={{ from: 'color' }}
                    arcLabelsSkipAngle={10}
                    arcLabelsTextColor="#ffffff"
                    legends={[
                        {
                            anchor: 'right',
                            direction: 'column',
                            justify: false,
                            translateX: 100,
                            translateY: 0,
                            itemWidth: 100,
                            itemHeight: 20,
                            itemsSpacing: 10,
                            symbolSize: 20,
                            itemDirection: 'left-to-right'
                        }
                    ]}
                    tooltip={({ datum }) => (
                        <div style={{
                            background: 'white',
                            padding: '9px 12px',
                            border: '1px solid #ccc',
                            borderRadius: '4px'
                        }}>
                            <strong>{datum.label}</strong>
                            <div>Total: {datum.value}</div>
                            <div style={{ color: '#2ecc71' }}>Online: {datum.data.online}</div>
                            <div style={{ color: '#e74c3c' }}>Offline: {datum.data.offline}</div>
                        </div>
                    )}
                />
            </div>
        </div>
    );
};

export const KPICards = ({ data }) => {
    return (
        <div className="kpi-container">
            <div className="kpi-card">
                <h4>Taxa de Resolução</h4>
                <div className="kpi-value">{data.resolutionRate}%</div>
                <div className="kpi-label">Problemas Resolvidos</div>
            </div>
            <div className="kpi-card">
                <h4>Tempo Médio</h4>
                <div className="kpi-value">{data.averageResolutionTime}h</div>
                <div className="kpi-label">Resolução</div>
            </div>
            <div className="kpi-card">
                <h4>Uptime Médio</h4>
                <div className="kpi-value">{data.averageUptime}%</div>
                <div className="kpi-label">Disponibilidade</div>
            </div>
        </div>
    );
};

export const TopIssuesTable = ({ data }) => {
    return (
        <div className="top-issues-container">
            <h3>Lojas Mais Afetadas</h3>
            <div className="top-issues-table">
                <table>
                    <thead>
                        <tr>
                            <th>Loja</th>
                            <th>Problemas</th>
                            <th>Último Incidente</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.topIssues?.map((issue, index) => (
                            <tr key={index}>
                                <td>{issue.store}</td>
                                <td>{issue.count}</td>
                                <td>{format(parseISO(issue.lastIncident), "dd/MM HH:mm", { locale: ptBR })}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export const AlertsList = ({ alerts }) => {
    return (
        <div className="alerts-container">
            <h3>Alertas Importantes</h3>
            <div className="alerts-list">
                {alerts.map((alert, index) => (
                    <div key={index} className={`alert-item ${alert.type}`}>
                        <div className="alert-icon">⚠️</div>
                        <div className="alert-content">
                            <div className="alert-title">{alert.title}</div>
                            <div className="alert-description">{alert.description}</div>
                        </div>
                        <div className="alert-time">{alert.time}</div>
                    </div>
                ))}
                {alerts.length === 0 && (
                    <div className="no-alerts">Nenhum alerta no momento</div>
                )}
            </div>
        </div>
    );
}; 