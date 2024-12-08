import React, { useState, useEffect } from 'react';
import './LoadingScreen.css';

const LoadingScreen = () => {
    const [loadingText, setLoadingText] = useState('Iniciando...');
    
    useEffect(() => {
        const texts = [
            'Iniciando...',
            'Conectando ao servidor...',
            'Carregando dados das lojas...',
            'Verificando status...',
            'Finalizando...'
        ];
        
        let currentIndex = 0;
        const interval = setInterval(() => {
            currentIndex = (currentIndex + 1) % texts.length;
            setLoadingText(texts[currentIndex]);
        }, 2000);
        
        return () => clearInterval(interval);
    }, []);
    
    return (
        <div className="loading-screen">
            <div className="loading-spinner"></div>
            <p className="loading-text">{loadingText}</p>
        </div>
    );
};

export default LoadingScreen; 