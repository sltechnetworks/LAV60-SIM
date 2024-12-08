import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { FaChartBar, FaPowerOff, FaDesktop, FaSignOutAlt, FaUser } from 'react-icons/fa';
import './Sidebar.css';

const Sidebar = () => {
    const navigate = useNavigate();
    
    const user = {
        name: 'Aylton Almeida',
        email: 'aylton@lavanderia60minutos.com.br',
        role: 'Desenvolvedor',
        avatar: null
    };

    const handleLogout = () => {
        navigate('/login');
    };

    return (
        <div className="sidebar">
            <div className="sidebar-content">
                <div className="sidebar-header">
                    <h2>60 Minutos</h2>
                </div>

                <div className="user-profile-section">
                    <div className="user-avatar">
                        {user.avatar ? (
                            <img src={user.avatar} alt="Avatar" />
                        ) : (
                            <FaUser className="default-avatar" />
                        )}
                    </div>
                    <div className="user-info">
                        <div className="user-name">{user.name}</div>
                        <div className="user-email">{user.email}</div>
                        <div className="user-role">{user.role}</div>
                    </div>
                </div>
                
                <nav className="sidebar-nav">
                    <NavLink to="/dashboard" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
                        <FaChartBar className="nav-icon" />
                        <span>Dashboard</span>
                    </NavLink>
                    <NavLink to="/reset" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
                        <FaPowerOff className="nav-icon" />
                        <span>Reset Geral</span>
                    </NavLink>
                    <NavLink to="/monitoramento" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
                        <FaDesktop className="nav-icon" />
                        <span>Monitoramento</span>
                    </NavLink>
                </nav>
            </div>

            <div className="sidebar-footer">
                <button className="logout-button" onClick={handleLogout}>
                    <FaSignOutAlt className="logout-icon" />
                    <span>Sair</span>
                </button>
            </div>
        </div>
    );
};

export default Sidebar; 