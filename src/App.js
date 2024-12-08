import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Monitor from './Monitor';
import Monitoramento from './components/Monitoramento';
import Dashboard from './components/Dashboard';
import './App.css';

function App() {
    return (
        <Router>
            <div className="app">
                <Sidebar />
                <main className="main-content">
                    <Routes>
                        <Route path="/dashboard" element={<Dashboard />} />
                        <Route path="/reset" element={<Monitor />} />
                        <Route path="/monitoramento" element={<Monitoramento />} />
                        <Route path="/" element={<Navigate to="/dashboard" replace />} />
                        <Route path="*" element={<Navigate to="/dashboard" replace />} />
                    </Routes>
                </main>
            </div>
        </Router>
    );
}

export default App; 